/**
 * Unit tests for src/config.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { mockFs } from '../__fixtures__/fs.js'

// Mock dependencies
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('fs', () => mockFs)
jest.unstable_mockModule('js-yaml', () => ({
  load: jest.fn()
}))

// Import after mocking
const { loadConfig } = await import('../src/config.js')
const yaml = await import('js-yaml')

describe('config', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset process.cwd mock
    jest.spyOn(process, 'cwd').mockReturnValue('/test/project')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('loadConfig', () => {
    it('should load valid config from file', async () => {
      const mockConfig = {
        sections: ['description', 'main_changes'],
        exclude_files: ['package-lock.json', 'yarn.lock'],
        custom_prompt: 'Custom prompt',
        max_diff_size: 500000
      }

      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('mock yaml content')
      ;(yaml.load as jest.Mock).mockReturnValue(mockConfig)

      const result = await loadConfig('.github/pr-description.yml')

      expect(result).toEqual({
        sections: ['description', 'main_changes'],
        exclude_files: ['package-lock.json', 'yarn.lock'],
        custom_prompt: 'Custom prompt',
        max_diff_size: 500000
      })
      expect(core.info).toHaveBeenCalledWith(
        'Loading configuration from .github/pr-description.yml'
      )
    })

    it('should use defaults when config file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const result = await loadConfig()

      expect(result).toEqual({
        sections: [
          'description',
          'main_changes',
          'modified_files',
          'testing',
          'compatibility',
          'technical_notes',
          'next_steps'
        ],
        exclude_files: ['package-lock.json'],
        max_diff_size: 250000
      })
      expect(core.info).toHaveBeenCalledWith(
        'No configuration file found at .github/pr-description.yml, using defaults'
      )
    })

    it('should merge user config with defaults', async () => {
      const partialConfig = {
        sections: ['description', 'main_changes'],
        custom_prompt: 'Custom prompt'
      }

      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('mock yaml content')
      ;(yaml.load as jest.Mock).mockReturnValue(partialConfig)

      const result = await loadConfig()

      expect(result).toEqual({
        sections: ['description', 'main_changes'], // User's sections override defaults
        exclude_files: ['package-lock.json'], // Default preserved
        custom_prompt: 'Custom prompt', // User's custom prompt
        max_diff_size: 250000 // Default preserved
      })
    })

    it('should handle invalid YAML and use defaults', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('invalid yaml')
      ;(yaml.load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML')
      })

      const result = await loadConfig()

      expect(result).toEqual({
        sections: [
          'description',
          'main_changes',
          'modified_files',
          'testing',
          'compatibility',
          'technical_notes',
          'next_steps'
        ],
        exclude_files: ['package-lock.json'],
        max_diff_size: 250000
      })
      expect(core.warning).toHaveBeenCalledWith(
        'Failed to load configuration: Invalid YAML'
      )
      expect(core.info).toHaveBeenCalledWith('Using default configuration')
    })

    it('should merge exclude_files arrays', async () => {
      const userConfig = {
        exclude_files: ['yarn.lock', 'composer.lock']
      }

      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('mock yaml content')
      ;(yaml.load as jest.Mock).mockReturnValue(userConfig)

      const result = await loadConfig()

      expect(result.exclude_files).toEqual([
        'package-lock.json', // Default
        'yarn.lock', // User's
        'composer.lock' // User's
      ])
    })
  })
})
