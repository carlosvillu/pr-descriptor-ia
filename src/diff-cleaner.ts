import { Config } from './config.js'

/**
 * Cleans and filters PR diffs
 */
export class DiffCleaner {
  /**
   * Clean the diff by removing excluded files and reducing noise
   */
  clean(diff: string, config: Config): string {
    let cleanedDiff = diff

    // Get files to exclude from config
    const excludeFiles = config.exclude_files || ['package-lock.json']

    // Remove excluded files from diff
    for (const file of excludeFiles) {
      cleanedDiff = this.removeFileFromDiff(cleanedDiff, file)
    }

    // Remove empty diff sections
    cleanedDiff = this.removeEmptyDiffSections(cleanedDiff)

    // Trim excessive whitespace
    cleanedDiff = cleanedDiff.trim()

    return cleanedDiff
  }

  /**
   * Remove a specific file from the diff
   */
  private removeFileFromDiff(diff: string, filename: string): string {
    // Escape special regex characters in filename
    const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Pattern to match from "diff --git a/filename b/filename" to the next "diff --git" or end of string
    // This handles cases where the file might be in different directories
    const pattern = new RegExp(
      `diff --git a\\/.*${escapedFilename} b\\/.*${escapedFilename}[\\s\\S]*?(?=diff --git|$)`,
      'g'
    )

    return diff.replace(pattern, '')
  }

  /**
   * Remove empty diff sections and clean up extra newlines
   */
  private removeEmptyDiffSections(diff: string): string {
    // Remove multiple consecutive newlines
    let cleaned = diff.replace(/\n{3,}/g, '\n\n')

    // Remove empty diff headers (diff --git followed immediately by another diff --git)
    cleaned = cleaned.replace(/diff --git[^\n]*\n(?=diff --git)/g, '')

    // Remove trailing whitespace on each line
    cleaned = cleaned
      .split('\n')
      .map((line) => line.trimRight())
      .join('\n')

    return cleaned
  }

  /**
   * Check if diff is too large (helper method)
   */
  isTooLarge(diff: string, maxSize: number): boolean {
    return diff.length > maxSize
  }

  /**
   * Get statistics about the diff (helper method)
   */
  getStats(diff: string): {
    files: number
    additions: number
    deletions: number
  } {
    const files = (diff.match(/diff --git/g) || []).length
    const additions = (diff.match(/^\+[^+]/gm) || []).length
    const deletions = (diff.match(/^-[^-]/gm) || []).length

    return { files, additions, deletions }
  }
}
