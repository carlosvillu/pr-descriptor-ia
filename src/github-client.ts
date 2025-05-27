import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils.js'

export interface PRInfo {
  number: number
  title: string
  base: string
  head: string
  author: string
  created_at: string
}

export interface Label {
  name: string
}

/**
 * Client for interacting with GitHub API
 */
export class GitHubClient {
  private octokit: InstanceType<typeof GitHub>
  private owner: string
  private repo: string

  constructor(token: string) {
    this.octokit = github.getOctokit(token)
    const context = github.context
    this.owner = context.repo.owner
    this.repo = context.repo.repo
  }

  /**
   * Get pull request diff
   */
  async getPRDiff(prNumber: number): Promise<string> {
    try {
      // Use the GitHub API to get the diff
      const response = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff'
        }
      })

      // The diff is returned as a string when using the diff media type
      return response.data as unknown as string
    } catch (error) {
      throw new Error(
        `Failed to fetch PR diff: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get pull request information
   */
  async getPRInfo(prNumber: number): Promise<PRInfo> {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      })

      return {
        number: pr.number,
        title: pr.title,
        base: pr.base.ref,
        head: pr.head.ref,
        author: pr.user?.login || 'unknown',
        created_at: pr.created_at
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch PR info: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get pull request labels
   */
  async getPRLabels(prNumber: number): Promise<Label[]> {
    try {
      const { data: labels } = await this.octokit.rest.issues.listLabelsOnIssue(
        {
          owner: this.owner,
          repo: this.repo,
          issue_number: prNumber
        }
      )

      return labels.map((label) => ({ name: label.name }))
    } catch (error) {
      throw new Error(
        `Failed to fetch PR labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Update pull request description
   */
  async updatePRDescription(
    prNumber: number,
    description: string
  ): Promise<void> {
    try {
      await this.octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: description
      })
    } catch (error) {
      throw new Error(
        `Failed to update PR description: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get open pull requests (for manual triggers)
   */
  async getOpenPullRequests(): Promise<Array<{ number: number }>> {
    try {
      const { data: prs } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        sort: 'updated',
        direction: 'desc',
        per_page: 10
      })

      return prs.map((pr) => ({ number: pr.number }))
    } catch (error) {
      throw new Error(
        `Failed to fetch open PRs: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
