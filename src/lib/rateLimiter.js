/**
 * RateLimiter - Client-side rate limiting utility
 * Prevents abuse by limiting the number of actions within a time window
 */
export class RateLimiter {
  /**
   * Create a new RateLimiter
   * @param {number} maxAttempts - Maximum attempts allowed in the window
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.attempts = new Map()
  }

  /**
   * Check if an action is allowed for a given key
   * @param {string} key - Unique identifier (e.g., 'login', 'api-call', user email)
   * @returns {boolean} - Whether the action is allowed
   */
  isAllowed(key) {
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []

    // Filter out attempts outside the current window
    const recentAttempts = userAttempts.filter((t) => now - t < this.windowMs)

    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }

    // Record this attempt
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    return true
  }

  /**
   * Get remaining attempts for a key
   * @param {string} key - Unique identifier
   * @returns {number} - Number of remaining attempts
   */
  getRemainingAttempts(key) {
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []
    const recentAttempts = userAttempts.filter((t) => now - t < this.windowMs)
    return Math.max(0, this.maxAttempts - recentAttempts.length)
  }

  /**
   * Get time until rate limit resets for a key
   * @param {string} key - Unique identifier
   * @returns {number} - Milliseconds until reset, or 0 if not rate limited
   */
  getTimeUntilReset(key) {
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []
    const recentAttempts = userAttempts.filter((t) => now - t < this.windowMs)

    if (recentAttempts.length < this.maxAttempts) {
      return 0
    }

    // Find the oldest attempt in the window
    const oldestAttempt = Math.min(...recentAttempts)
    return Math.max(0, this.windowMs - (now - oldestAttempt))
  }

  /**
   * Reset attempts for a key
   * @param {string} key - Unique identifier
   */
  reset(key) {
    this.attempts.delete(key)
  }

  /**
   * Clear all rate limit data
   */
  clear() {
    this.attempts.clear()
  }
}

// Pre-configured rate limiters for common use cases
export const loginRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute
export const apiRateLimiter = new RateLimiter(100, 60000) // 100 requests per minute
export const messageRateLimiter = new RateLimiter(30, 60000) // 30 messages per minute

export default RateLimiter
