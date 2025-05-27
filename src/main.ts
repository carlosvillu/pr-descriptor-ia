import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHubClient } from './github-client.js'
import { ClaudeClient } from './claude-client.js'
import { DiffCleaner } from './diff-cleaner.js'
import { loadConfig } from './config.js'
import { NO_IA_LABEL, DEFAULT_MAX_DIFF_SIZE } from './constants.js'

/**
 * The main function for the action.
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token', { required: true })
    const claudeApiKey = core.getInput('claude-api-key', { required: true })
    const configPath = core.getInput('config-path')
    const claudeModel = core.getInput('claude-model')
    const maxDiffSize = parseInt(
      core.getInput('max-diff-size') || DEFAULT_MAX_DIFF_SIZE.toString()
    )

    // Check if we're in a PR context
    const context = github.context
    if (
      context.eventName !== 'pull_request' &&
      context.eventName !== 'pull_request_target' &&
      context.eventName !== 'workflow_dispatch'
    ) {
      core.info('Not running in a pull request context, skipping...')
      core.setOutput('status', 'skipped')
      return
    }

    // Initialize clients
    const githubClient = new GitHubClient(githubToken)
    const claudeClient = new ClaudeClient(claudeApiKey, claudeModel)
    const diffCleaner = new DiffCleaner()

    // Get PR number
    let prNumber: number | undefined
    if (context.eventName === 'workflow_dispatch') {
      // For manual triggers, we need to find the PR number
      const pullRequests = await githubClient.getOpenPullRequests()
      if (pullRequests.length === 0) {
        throw new Error('No open pull requests found')
      }
      // Use the most recent PR
      prNumber = pullRequests[0].number
      core.info(`Found PR #${prNumber} for manual trigger`)
    } else {
      prNumber = context.payload.pull_request?.number
      if (!prNumber) {
        throw new Error('Could not determine PR number from context')
      }
    }

    // Check for NO-IA-DESCRIPTION label
    const labels = await githubClient.getPRLabels(prNumber)
    if (labels.some((label) => label.name === NO_IA_LABEL)) {
      core.info(`PR has ${NO_IA_LABEL} label, skipping description generation`)
      core.setOutput('status', 'skipped')
      return
    }

    // Load configuration
    const config = await loadConfig(configPath)
    core.debug(`Loaded config: ${JSON.stringify(config)}`)

    // Get PR diff
    core.info(`Fetching diff for PR #${prNumber}...`)
    const rawDiff = await githubClient.getPRDiff(prNumber)

    // Clean the diff
    core.info('Cleaning diff...')
    const cleanedDiff = diffCleaner.clean(rawDiff, config)
    core.info(
      `Diff size: ${rawDiff.length} -> ${cleanedDiff.length} characters`
    )

    // Check diff size
    const effectiveMaxSize = config.max_diff_size || maxDiffSize
    if (cleanedDiff.length > effectiveMaxSize) {
      throw new Error(
        `Cleaned diff size (${cleanedDiff.length}) exceeds maximum allowed size (${effectiveMaxSize})`
      )
    }

    // Get PR info for context
    const prInfo = await githubClient.getPRInfo(prNumber)

    // Generate description
    core.info('Generating PR description with Claude...')
    const description = await claudeClient.generateDescription(
      cleanedDiff,
      prInfo,
      config
    )

    // Update PR description
    core.info('Updating PR description...')
    await githubClient.updatePRDescription(prNumber, description)

    // Set outputs
    core.setOutput('description', description)
    core.setOutput('status', 'success')
    core.info('✅ PR description updated successfully!')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
      core.setOutput('status', 'failed')
    } else {
      core.setFailed('An unknown error occurred')
      core.setOutput('status', 'failed')
    }
  }
}
