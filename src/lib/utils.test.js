import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('c-1', 'c-2')).toBe('c-1 c-2')
    })

    it('should handle conditional classes', () => {
      const showC2 = true
      const showC3 = false
      expect(cn('c-1', showC2 && 'c-2', showC3 && 'c-3')).toBe('c-1 c-2')
    })
  })
})
