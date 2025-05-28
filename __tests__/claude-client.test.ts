/**
 * Unit tests for src/claude-client.ts
 */
import { jest } from '@jest/globals'
import { mockAnthropicClient } from '../__fixtures__/anthropic.js'
import {
  mockDiff,
  mockPRInfo,
  mockConfig,
  mockGeneratedDescription
} from '../__fixtures__/test-data.js'

// Mock @anthropic-ai/sdk
jest.unstable_mockModule('@anthropic-ai/sdk', () => ({
  default: jest.fn(() => mockAnthropicClient)
}))

// Import after mocking
const { ClaudeClient } = await import('../src/claude-client.js')

describe('ClaudeClient', () => {
  let client: InstanceType<typeof ClaudeClient>

  beforeEach(() => {
    jest.clearAllMocks()
    client = new ClaudeClient('test-api-key')
  })

  describe('generateDescription', () => {
    it('should generate description successfully', async () => {
      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: mockGeneratedDescription
          }
        ]
      })

      const result = await client.generateDescription(
        mockDiff,
        mockPRInfo,
        mockConfig
      )

      expect(result).toBe(mockGeneratedDescription)
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.3,
        system: expect.stringContaining('Eres un asistente experto'),
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('Genera una descripción de PR')
          }
        ]
      })
    })

    it('should use custom model when provided', async () => {
      const customClient = new ClaudeClient(
        'test-api-key',
        'claude-3-5-sonnet-20241022'
      )

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'test response' }]
      })

      await customClient.generateDescription(mockDiff, mockPRInfo, mockConfig)

      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022'
        })
      )
    })

    it('should handle API errors', async () => {
      mockAnthropicClient.messages.create.mockRejectedValue(
        new Error('Claude API error')
      )

      await expect(
        client.generateDescription(mockDiff, mockPRInfo, mockConfig)
      ).rejects.toThrow(
        'Failed to generate description with Claude: Claude API error'
      )
    })

    it('should handle unexpected response type', async () => {
      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [
          {
            type: 'image' as any,
            data: 'invalid'
          } as any
        ]
      })

      await expect(
        client.generateDescription(mockDiff, mockPRInfo, mockConfig)
      ).rejects.toThrow('Unexpected response type from Claude')
    })
  })
})
