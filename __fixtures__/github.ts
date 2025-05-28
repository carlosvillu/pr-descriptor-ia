import { jest } from '@jest/globals'

export const context = {
  eventName: 'pull_request',
  sha: 'test-sha',
  ref: 'refs/pull/123/merge',
  workflow: 'test-workflow',
  action: 'test-action',
  actor: 'test-user',
  payload: {
    pull_request: {
      number: 123,
      title: 'Test PR',
      body: 'Test description',
      head: { ref: 'feature-branch' },
      base: { ref: 'main' }
    }
  },
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  }
}

export const mockOctokit = {
  rest: {
    pulls: {
      get: jest.fn(),
      update: jest.fn(),
      list: jest.fn()
    },
    issues: {
      listLabelsOnIssue: jest.fn()
    }
  }
}

export const getOctokit = jest.fn(() => mockOctokit)

export const mockGitHubClient = {
  getPRDiff: jest.fn(),
  getPRInfo: jest.fn(),
  getPRLabels: jest.fn(),
  updatePRDescription: jest.fn(),
  getOpenPullRequests: jest.fn()
}
