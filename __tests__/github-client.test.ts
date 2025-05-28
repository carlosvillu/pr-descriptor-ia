/**
 * Unit tests for src/github-client.ts
 */
import { jest } from '@jest/globals'
import * as github from '../__fixtures__/github.js'
import { mockDiff, mockPRInfo } from '../__fixtures__/test-data.js'

// Mock @actions/github
jest.unstable_mockModule('@actions/github', () => github)

// Import after mocking
const { GitHubClient } = await import('../src/github-client.js')

describe('GitHubClient', () => {
  let client: GitHubClient

  beforeEach(() => {
    jest.clearAllMocks()
    client = new GitHubClient('test-token')
  })

  describe('getPRDiff', () => {
    it('should fetch PR diff successfully', async () => {
      github.mockOctokit.rest.pulls.get.mockResolvedValue({
        data: mockDiff
      })

      const result = await client.getPRDiff(123)

      expect(result).toBe(mockDiff)
      expect(github.mockOctokit.rest.pulls.get).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123,
        mediaType: {
          format: 'diff'
        }
      })
    })

    it('should handle API errors', async () => {
      github.mockOctokit.rest.pulls.get.mockRejectedValue(
        new Error('API Error')
      )

      await expect(client.getPRDiff(123)).rejects.toThrow(
        'Failed to fetch PR diff: API Error'
      )
    })
  })

  describe('getPRInfo', () => {
    it('should fetch PR info successfully', async () => {
      github.mockOctokit.rest.pulls.get.mockResolvedValue({
        data: {
          number: 123,
          title: 'Add new feature',
          base: { ref: 'main' },
          head: { ref: 'feature-branch' },
          user: { login: 'test-user' },
          created_at: '2024-01-01T00:00:00Z'
        }
      })

      const result = await client.getPRInfo(123)

      expect(result).toEqual(mockPRInfo)
    })
  })

  describe('getPRLabels', () => {
    it('should fetch PR labels successfully', async () => {
      github.mockOctokit.rest.issues.listLabelsOnIssue.mockResolvedValue({
        data: [{ name: 'bug' }, { name: 'enhancement' }]
      })

      const result = await client.getPRLabels(123)

      expect(result).toEqual([{ name: 'bug' }, { name: 'enhancement' }])
    })
  })

  describe('updatePRDescription', () => {
    it('should update PR description successfully', async () => {
      github.mockOctokit.rest.pulls.update.mockResolvedValue({})

      await client.updatePRDescription(123, 'New description')

      expect(github.mockOctokit.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123,
        body: 'New description'
      })
    })
  })

  describe('getOpenPullRequests', () => {
    it('should fetch open PRs successfully', async () => {
      github.mockOctokit.rest.pulls.list.mockResolvedValue({
        data: [{ number: 123 }, { number: 456 }]
      })

      const result = await client.getOpenPullRequests()

      expect(result).toEqual([{ number: 123 }, { number: 456 }])
    })
  })
})
