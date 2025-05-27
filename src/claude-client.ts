import Anthropic from '@anthropic-ai/sdk'
import { PRInfo } from './github-client.js'
import { Config } from './config.js'
import { DEFAULT_CLAUDE_MODEL } from './constants.js'

/**
 * Client for interacting with Claude API
 */
export class ClaudeClient {
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({
      apiKey: apiKey
    })
    this.model = model || DEFAULT_CLAUDE_MODEL
  }

  /**
   * Generate PR description using Claude
   */
  async generateDescription(
    diff: string,
    prInfo: PRInfo,
    config: Config
  ): Promise<string> {
    const sections = config.sections || [
      'description',
      'main_changes',
      'modified_files',
      'testing',
      'compatibility',
      'technical_notes',
      'next_steps'
    ]

    const systemPrompt = `Eres un asistente experto en desarrollo de software. Tu tarea es generar descripciones detalladas y bien estructuradas para Pull Requests basándote en el diff proporcionado.

IMPORTANTE: 
- Usa español para toda la descripción
- Incluye emojis relevantes para hacer la descripción más visual y fácil de leer
- Sé específico y técnico pero claro
- Enfócate en el valor de negocio y los cambios técnicos importantes
- No menciones archivos excluidos como package-lock.json

La descripción debe incluir las siguientes secciones:
${sections.map((section) => `- ${this.getSectionName(section)}`).join('\n')}

${config.custom_prompt || ''}`

    const userPrompt = `Genera una descripción de PR para los siguientes cambios:

Información de la PR:
- Título: ${prInfo.title}
- Rama base: ${prInfo.base}
- Rama de cambios: ${prInfo.head}
- Autor: ${prInfo.author}

Diff de cambios:
\`\`\`diff
${diff}
\`\`\`

Por favor genera una descripción completa y detallada siguiendo el formato especificado.`

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        return content.text
      } else {
        throw new Error('Unexpected response type from Claude')
      }
    } catch (error) {
      throw new Error(
        `Failed to generate description with Claude: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get section name in Spanish with emoji
   */
  private getSectionName(section: string): string {
    const sectionMap: Record<string, string> = {
      description: '📋 Descripción',
      main_changes: '🚀 Cambios Principales',
      modified_files: '📁 Archivos Modificados',
      testing: '🧪 Testing',
      compatibility: '🔄 Compatibilidad',
      technical_notes: '📝 Notas Técnicas',
      next_steps: '🔮 Próximos Pasos / Mejoras Potenciales'
    }
    return sectionMap[section] || section
  }
}
