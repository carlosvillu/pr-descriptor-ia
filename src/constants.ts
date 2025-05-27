/**
 * Constants used throughout the action
 */

// Label to skip AI description generation
export const NO_IA_LABEL = 'NO-IA-DESCRIPTION'

// Default Claude model
export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-20250514'

// Default maximum diff size (250K characters)
export const DEFAULT_MAX_DIFF_SIZE = 250000

// File patterns that are commonly excluded
export const COMMON_LOCK_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'Gemfile.lock',
  'poetry.lock',
  'Cargo.lock'
]

// Binary file extensions that should be ignored in diffs
export const BINARY_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot'
]

// Maximum retries for API calls
export const MAX_RETRIES = 3

// Retry delay in milliseconds
export const RETRY_DELAY = 1000
