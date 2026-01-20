import { useRef, useState, useMemo } from 'react'

export function VirtualList({ items, height, itemHeight, renderItem, className }) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    // Render a few extra items as buffer
    const end = Math.min(items.length, Math.floor((scrollTop + height) / itemHeight) + 5)
    return { startIndex: start, endIndex: end }
  }, [scrollTop, height, itemHeight, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        left: 0,
        width: '100%',
        height: itemHeight,
      },
    }))
  }, [items, startIndex, endIndex, itemHeight])

  const onScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={className}
      style={{
        height,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={item.id || index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}
