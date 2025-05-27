import * as core from '@actions/core'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

export interface Config {
  sections?: string[]
  exclude_files?: string[]
  custom_prompt?: string
  max_diff_size?: number
}

/**
 * Load configuration from YAML file
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  const defaultConfig: Config = {
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
  }

  if (!configPath) {
    configPath = '.github/pr-description.yml'
  }

  // Check if config file exists
  const fullPath = path.join(process.cwd(), configPath)

  try {
    if (fs.existsSync(fullPath)) {
      core.info(`Loading configuration from ${configPath}`)
      const fileContent = fs.readFileSync(fullPath, 'utf8')
      const userConfig = yaml.load(fileContent) as Config

      // Merge user config with defaults
      const mergedConfig: Config = {
        ...defaultConfig,
        ...userConfig
      }

      // If user provides sections, use them (don't merge with defaults)
      if (userConfig.sections) {
        mergedConfig.sections = userConfig.sections
      }

      // If user provides exclude_files, merge with defaults
      if (userConfig.exclude_files) {
        mergedConfig.exclude_files = [
          ...new Set([
            ...defaultConfig.exclude_files!,
            ...userConfig.exclude_files
          ])
        ]
      }

      validateConfig(mergedConfig)
      return mergedConfig
    } else {
      core.info(`No configuration file found at ${configPath}, using defaults`)
      return defaultConfig
    }
  } catch (error) {
    core.warning(
      `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    core.info('Using default configuration')
    return defaultConfig
  }
}

/**
 * Validate configuration
 */
function validateConfig(config: Config): void {
  // Validate sections
  if (config.sections && !Array.isArray(config.sections)) {
    throw new Error('Configuration error: sections must be an array')
  }

  if (config.sections && config.sections.length === 0) {
    throw new Error('Configuration error: sections array cannot be empty')
  }

  // Validate exclude_files
  if (config.exclude_files && !Array.isArray(config.exclude_files)) {
    throw new Error('Configuration error: exclude_files must be an array')
  }

  // Validate max_diff_size
  if (
    config.max_diff_size &&
    (typeof config.max_diff_size !== 'number' || config.max_diff_size <= 0)
  ) {
    throw new Error(
      'Configuration error: max_diff_size must be a positive number'
    )
  }

  // Validate custom_prompt
  if (config.custom_prompt && typeof config.custom_prompt !== 'string') {
    throw new Error('Configuration error: custom_prompt must be a string')
  }
}
