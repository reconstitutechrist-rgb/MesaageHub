/**
 * Skeleton loading components
 *
 * Two variants:
 * - PhoneSkeleton: inline-style based, uses CSS vars from phone theme
 * - Skeleton: Tailwind-based for shared UI components
 */

/**
 * Tailwind-based skeleton for shared UI components
 */
export function Skeleton({ className = '', style }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} style={style} />
}

/**
 * Phone-themed skeleton for phone pages (uses CSS variables)
 */
export function PhoneSkeleton({ width, height, borderRadius = 8, style }) {
  return (
    <div
      className="shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  )
}

/**
 * Circle skeleton (avatar placeholder)
 */
export function SkeletonCircle({ size = 48 }) {
  return <PhoneSkeleton width={size} height={size} borderRadius="50%" />
}

/**
 * Text line skeleton
 */
export function SkeletonLine({ width = '100%', height = 14 }) {
  return <PhoneSkeleton width={width} height={height} borderRadius={4} />
}
