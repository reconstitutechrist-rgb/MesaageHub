import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  isLoading = false,
  debounceMs = 300,
  className,
  showClear = true,
}) {
  const [localValue, setLocalValue] = useState(value || '')
  const debouncedValue = useDebounce(localValue, debounceMs)

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      onChange?.(newValue)
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange?.('')
    onSearch?.('')
  }, [onChange, onSearch])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        onSearch?.(localValue)
      }
      if (e.key === 'Escape') {
        handleClear()
      }
    },
    [localValue, onSearch, handleClear]
  )

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-9"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {showClear && localValue && !isLoading && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
