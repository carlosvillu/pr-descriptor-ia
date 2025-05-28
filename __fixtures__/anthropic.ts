import { jest } from '@jest/globals'
import type { Anthropic } from '@anthropic-ai/sdk'

// Definir tipos para el mock de respuesta
type MockMessageResponse = {
  content: Array<{
    type: 'text'
    text: string
  }>
}

// Crear el mock del cliente con tipos
export const mockAnthropicClient = {
  messages: {
    create: jest.fn<() => Promise<MockMessageResponse>>()
  }
} as unknown as Anthropic

export const mockAnthropic = jest.fn(() => mockAnthropicClient)

export default mockAnthropic

export const mockClaudeClient = {
  generateDescription: jest.fn<() => Promise<string>>()
}
