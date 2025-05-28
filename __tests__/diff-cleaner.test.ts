/**
 * Unit tests for src/diff-cleaner.ts
 */
import { DiffCleaner } from '../src/diff-cleaner.js'
import { mockDiff, mockConfig } from '../__fixtures__/test-data.js'

describe('DiffCleaner', () => {
  let cleaner: DiffCleaner

  beforeEach(() => {
    cleaner = new DiffCleaner()
  })

  describe('clean', () => {
    it('should remove excluded files from diff', () => {
      const result = cleaner.clean(mockDiff, mockConfig)

      // Should remove package-lock.json section
      expect(result).not.toContain('package-lock.json')
      // Should keep other files
      expect(result).toContain('src/index.ts')
      expect(result).toContain('README.md')
    })

    it('should handle empty diff', () => {
      const result = cleaner.clean('', mockConfig)
      expect(result).toBe('')
    })

    it('should handle diff with only excluded files', () => {
      const onlyExcludedDiff = `diff --git a/package-lock.json b/package-lock.json
index 1234567..abcdefg 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,100 +1,100 @@
[... package lock content ...]`

      const result = cleaner.clean(onlyExcludedDiff, mockConfig)
      expect(result.trim()).toBe('')
    })

    it('should remove multiple excluded files', () => {
      const configWithMultipleExcludes = {
        ...mockConfig,
        exclude_files: ['package-lock.json', 'yarn.lock']
      }

      const diffWithMultiple = `${mockDiff}
diff --git a/yarn.lock b/yarn.lock
index 1234567..abcdefg 100644
--- a/yarn.lock
+++ b/yarn.lock
@@ -1,100 +1,100 @@
[... yarn lock content ...]`

      const result = cleaner.clean(diffWithMultiple, configWithMultipleExcludes)

      expect(result).not.toContain('package-lock.json')
      expect(result).not.toContain('yarn.lock')
      expect(result).toContain('src/index.ts')
    })
  })

  describe('isTooLarge', () => {
    it('should return false for small diff', () => {
      const smallDiff = 'small diff content'
      const result = cleaner.isTooLarge(smallDiff, 1000)
      expect(result).toBe(false)
    })

    it('should return true for large diff', () => {
      const largeDiff = 'a'.repeat(1000)
      const result = cleaner.isTooLarge(largeDiff, 500)
      expect(result).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should count files, additions and deletions correctly', () => {
      const stats = cleaner.getStats(mockDiff)

      expect(stats.files).toBe(3) // src/index.ts, package-lock.json, README.md
      expect(stats.additions).toBeGreaterThan(0)
      expect(stats.deletions).toBe(0) // No deletions in mock diff
    })

    it('should handle empty diff', () => {
      const stats = cleaner.getStats('')

      expect(stats.files).toBe(0)
      expect(stats.additions).toBe(0)
      expect(stats.deletions).toBe(0)
    })
  })
})
