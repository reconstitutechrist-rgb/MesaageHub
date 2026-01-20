import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Users, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Local helper to avoid import resolution issues
function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function RecipientSelector({ open, onOpenChange, contacts, onConfirm }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState(null)

  // Extract all unique interests from contacts for filter chips
  const allInterests = useMemo(() => {
    const interests = new Set()
    contacts.forEach((c) => {
      c.interests?.forEach((i) => interests.add(i.toLowerCase()))
    })
    return Array.from(interests).sort()
  }, [contacts])

  // Filter contacts based on search and active interest filter
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = activeFilter
        ? contact.interests?.some((i) => i.toLowerCase() === activeFilter)
        : true
      return matchesSearch && matchesFilter
    })
  }, [contacts, searchQuery, activeFilter])

  // Reset selection when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setSearchQuery('')
      setActiveFilter(null)
    }
  }, [open])

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length && filteredContacts.length > 0) {
      // Deselect all visible
      const newSelected = new Set(selectedIds)
      filteredContacts.forEach((c) => newSelected.delete(c.id))
      setSelectedIds(newSelected)
    } else {
      // Select all visible
      const newSelected = new Set(selectedIds)
      filteredContacts.forEach((c) => newSelected.add(c.id))
      setSelectedIds(newSelected)
    }
  }

  const handleConfirm = () => {
    const selectedContacts = contacts.filter((c) => selectedIds.has(c.id))
    onConfirm(selectedContacts)
    onOpenChange(false)
  }

  const isAllSelected =
    filteredContacts.length > 0 && filteredContacts.every((c) => selectedIds.has(c.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Select Recipients</DialogTitle>
          <DialogDescription>
            Target specific contacts or filter by interest groups.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Interest Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <Button
              variant={activeFilter === null ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(null)}
              className="h-7 text-xs whitespace-nowrap"
            >
              All
            </Button>
            {allInterests.map((interest) => (
              <Button
                key={interest}
                variant={activeFilter === interest ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(activeFilter === interest ? null : interest)}
                className="h-7 text-xs whitespace-nowrap capitalize"
              >
                {interest}
              </Button>
            ))}
          </div>

          {/* Stats & Select All */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredContacts.length} contacts found
              {activeFilter && ` for "${activeFilter}"`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-auto p-0 hover:bg-transparent text-primary"
            >
              {isAllSelected ? 'Deselect All' : 'Select All Visible'}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 border-t">
          <div className="p-2 space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mb-2 opacity-20" />
                <p>No contacts found matching your filters.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    selectedIds.has(contact.id) ? 'bg-primary/10' : 'hover:bg-muted'
                  )}
                  onClick={() => toggleSelection(contact.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={() => toggleSelection(contact.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="h-8 w-8 text-sm">
                    <AvatarImage src={contact?.avatar} alt={contact?.name} />
                    <AvatarFallback>{getInitials(contact?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.email || contact.phone}
                    </p>
                  </div>
                  {contact.interests && (
                    <div className="hidden sm:flex gap-1">
                      {contact.interests.slice(0, 2).map((i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px] h-5 px-1 bg-background"
                        >
                          {i}
                        </Badge>
                      ))}
                      {contact.interests.length > 2 && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1 bg-background">
                          +{contact.interests.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">
              {selectedIds.size} recipient{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={selectedIds.size === 0} className="gap-2">
                <Check className="h-4 w-4" />
                Continue
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
