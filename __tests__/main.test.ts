/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as github from '../__fixtures__/github.js'
import { mockGitHubClient } from '../__fixtures__/github.js'
import { mockClaudeClient } from '../__fixtures__/anthropic.js'
import { mockFs } from '../__fixtures__/fs.js'
import { mockDiff, mockPRInfo, mockConfig } from '../__fixtures__/test-data.js'

// Mock all dependencies before importing
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('../src/github-client.js', () => ({
  GitHubClient: jest.fn(() => mockGitHubClient)
}))
jest.unstable_mockModule('../src/claude-client.js', () => ({
  ClaudeClient: jest.fn(() => mockClaudeClient)
}))
jest.unstable_mockModule('../src/diff-cleaner.js', () => ({
  DiffCleaner: jest.fn(() => ({
    clean: jest.fn((diff: string) =>
      diff.replace(/package-lock\.json[\s\S]*?(?=diff --git|$)/g, '')
    )
  }))
}))
jest.unstable_mockModule('../src/config.js', () => ({
  loadConfig: jest.fn(() => Promise.resolve(mockConfig))
}))
jest.unstable_mockModule('fs', () => mockFs)

// Import after mocking
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Reset core mocks
    core.getInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'github-token': 'test-github-token',
        'claude-api-key': 'test-claude-key',
        'config-path': '.github/pr-description.yml',
        'claude-model': 'claude-3-5-sonnet-20241022',
        'max-diff-size': '250000'
      }
      return inputs[name] || ''
    })

    // Reset GitHub context
    github.context.eventName = 'pull_request'
    github.context.payload = {
      pull_request: {
        number: 123
      }
    }

    // Reset mock responses
    mockGitHubClient.getPRLabels.mockResolvedValue([])
    mockGitHubClient.getPRDiff.mockResolvedValue(mockDiff)
    mockGitHubClient.getPRInfo.mockResolvedValue(mockPRInfo)
    mockGitHubClient.updatePRDescription.mockResolvedValue(undefined)
    mockClaudeClient.generateDescription.mockResolvedValue(
      '# Generated PR Description\n\n## Changes\n...'
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Successful execution', () => {
    it('generates and updates PR description successfully', async () => {
      await run()

      // Verify inputs were read
      expect(core.getInput).toHaveBeenCalledWith('github-token', {
        required: true
      })
      expect(core.getInput).toHaveBeenCalledWith('claude-api-key', {
        required: true
      })

      // Verify PR information was fetched
      expect(mockGitHubClient.getPRLabels).toHaveBeenCalledWith(123)
      expect(mockGitHubClient.getPRDiff).toHaveBeenCalledWith(123)
      expect(mockGitHubClient.getPRInfo).toHaveBeenCalledWith(123)

      // Verify description was generated and updated
      expect(mockClaudeClient.generateDescription).toHaveBeenCalled()
      expect(mockGitHubClient.updatePRDescription).toHaveBeenCalledWith(
        123,
        expect.stringContaining('Generated PR Description')
      )

      // Verify outputs
      expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
      expect(core.setOutput).toHaveBeenCalledWith(
        'description',
        expect.any(String)
      )
      expect(core.info).toHaveBeenCalledWith(
        '✅ PR description updated successfully!'
      )
    })

    it('handles workflow_dispatch event correctly', async () => {
      github.context.eventName = 'workflow_dispatch'
      github.context.payload = {}
      mockGitHubClient.getOpenPullRequests.mockResolvedValue([
        { number: 456 },
        { number: 789 }
      ])

      await run()

      expect(mockGitHubClient.getOpenPullRequests).toHaveBeenCalled()
      expect(core.info).toHaveBeenCalledWith('Found PR #456 for manual trigger')
      expect(mockGitHubClient.getPRDiff).toHaveBeenCalledWith(456)
    })
  })

  describe('Skip conditions', () => {
    it('skips when not in PR context', async () => {
      github.context.eventName = 'push'

      await run()

      expect(core.info).toHaveBeenCalledWith(
        'Not running in a pull request context, skipping...'
      )
      expect(core.setOutput).toHaveBeenCalledWith('status', 'skipped')
      expect(mockGitHubClient.getPRDiff).not.toHaveBeenCalled()
    })

    it('skips when PR has NO-IA-DESCRIPTION label', async () => {
      mockGitHubClient.getPRLabels.mockResolvedValue([
        { name: 'bug' },
        { name: 'NO-IA-DESCRIPTION' }
      ])

      await run()

      expect(core.info).toHaveBeenCalledWith(
        'PR has NO-IA-DESCRIPTION label, skipping description generation'
      )
      expect(core.setOutput).toHaveBeenCalledWith('status', 'skipped')
      expect(mockClaudeClient.generateDescription).not.toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('fails when no PR number can be determined', async () => {
      github.context.payload = {}

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        'Could not determine PR number from context'
      )
      expect(core.setOutput).toHaveBeenCalledWith('status', 'failed')
    })

    it('fails when diff exceeds maximum size', async () => {
      const hugeDiff = 'a'.repeat(300000)
      mockGitHubClient.getPRDiff.mockResolvedValue(hugeDiff)

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining('exceeds maximum allowed size')
      )
      expect(core.setOutput).toHaveBeenCalledWith('status', 'failed')
    })

    it('fails when GitHub API throws error', async () => {
      mockGitHubClient.getPRDiff.mockRejectedValue(
        new Error('GitHub API error')
      )

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        'Failed to fetch PR diff: GitHub API error'
      )
      expect(core.setOutput).toHaveBeenCalledWith('status', 'failed')
    })

    it('fails when Claude API throws error', async () => {
      mockClaudeClient.generateDescription.mockRejectedValue(
        new Error('Claude API error')
      )

      await run()

      expect(core.setFailed).toHaveBeenCalledWith(
        'Failed to generate description with Claude: Claude API error'
      )
      expect(core.setOutput).toHaveBeenCalledWith('status', 'failed')
    })

    it('fails when no open PRs found for workflow_dispatch', async () => {
      github.context.eventName = 'workflow_dispatch'
      github.context.payload = {}
      mockGitHubClient.getOpenPullRequests.mockResolvedValue([])

      await run()

      expect(core.setFailed).toHaveBeenCalledWith('No open pull requests found')
      expect(core.setOutput).toHaveBeenCalledWith('status', 'failed')
    })
  })

  describe('Configuration handling', () => {
    it('loads and uses custom configuration', async () => {
      const customConfig = {
        sections: ['description', 'main_changes'],
        exclude_files: ['package-lock.json', 'yarn.lock'],
        max_diff_size: 500000
      }

      const { loadConfig } = await import('../src/config.js')
      ;(loadConfig as jest.Mock).mockResolvedValue(customConfig)

      await run()

      expect(loadConfig).toHaveBeenCalledWith('.github/pr-description.yml')
      expect(core.debug).toHaveBeenCalledWith(
        `Loaded config: ${JSON.stringify(customConfig)}`
      )
    })
  })
})
