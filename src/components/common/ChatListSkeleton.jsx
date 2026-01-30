/**
 * ChatListSkeleton - Skeleton loading state for chat/conversation lists
 *
 * Shows N rows of avatar circles + text bars to simulate loading conversations.
 */
import { SkeletonCircle, SkeletonLine } from './Skeleton'

export function ChatListSkeleton({ rows = 8 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 16px' }}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
          }}
        >
          <SkeletonCircle size={52} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonLine width="60%" height={14} />
            <SkeletonLine width="85%" height={12} />
          </div>
          <SkeletonLine width={36} height={10} />
        </div>
      ))}
    </div>
  )
}

export default ChatListSkeleton
