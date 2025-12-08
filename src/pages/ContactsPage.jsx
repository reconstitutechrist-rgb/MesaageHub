import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState, ContactCard, ConfirmDialog, SearchInput } from '@/components/common'
import { useDebounce } from '@/hooks'
import { isValidEmail } from '@/lib/utils'
import { Users, Plus, Search, UserX } from 'lucide-react'
import { toast } from 'sonner'

// Mock contacts data - would come from API
const mockContacts = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 (555) 123-4567',
    avatar: null,
    status: 'online',
    lastSeen: null,
    isBlocked: false,
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1 (555) 234-5678',
    avatar: null,
    status: 'offline',
    lastSeen: new Date(Date.now() - 1800000),
    isBlocked: false,
  },
  {
    id: 'c3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    phone: '+1 (555) 345-6789',
    avatar: null,
    status: 'online',
    lastSeen: null,
    isBlocked: false,
  },
  {
    id: 'c4',
    name: 'David Brown',
    email: 'david@example.com',
    phone: '+1 (555) 456-7890',
    avatar: null,
    status: 'away',
    lastSeen: new Date(Date.now() - 600000),
    isBlocked: false,
  },
  {
    id: 'c5',
    name: 'Emma Davis',
    email: 'emma@example.com',
    phone: '+1 (555) 567-8901',
    avatar: null,
    status: 'online',
    lastSeen: null,
    isBlocked: false,
  },
  {
    id: 'c6',
    name: 'Frank Miller',
    email: 'frank@example.com',
    phone: '+1 (555) 678-9012',
    avatar: null,
    status: 'offline',
    lastSeen: new Date(Date.now() - 86400000),
    isBlocked: true,
  },
]

export default function ContactsPage() {
  const navigate = useNavigate()

  // State
  const [contacts, setContacts] = useState(mockContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Filter contacts based on search and tab
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone?.includes(query)
      )
    }

    // Filter by tab
    switch (activeTab) {
      case 'online':
        filtered = filtered.filter((c) => c.status === 'online' && !c.isBlocked)
        break
      case 'blocked':
        filtered = filtered.filter((c) => c.isBlocked)
        break
      default:
        filtered = filtered.filter((c) => !c.isBlocked)
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [contacts, debouncedSearch, activeTab])

  // Handlers
  const handleAddContact = useCallback(async () => {
    if (!newContact.name.trim()) {
      toast.error('Please enter a name')
      return
    }
    if (newContact.email && !isValidEmail(newContact.email)) {
      toast.error('Please enter a valid email')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 500))

    const contact = {
      id: `c${Date.now()}`,
      name: newContact.name.trim(),
      email: newContact.email.trim(),
      phone: newContact.phone.trim(),
      avatar: null,
      status: 'offline',
      lastSeen: null,
      isBlocked: false,
    }

    setContacts((prev) => [...prev, contact])
    setShowAddDialog(false)
    setNewContact({ name: '', email: '', phone: '' })
    setIsSubmitting(false)
    toast.success(`${contact.name} added to contacts`)
  }, [newContact])

  const handleDeleteContact = useCallback(() => {
    if (!selectedContact) return

    setContacts((prev) => prev.filter((c) => c.id !== selectedContact.id))
    setShowDeleteDialog(false)
    toast.success(`${selectedContact.name} removed from contacts`)
    setSelectedContact(null)
  }, [selectedContact])

  const handleBlockContact = useCallback(() => {
    if (!selectedContact) return

    setContacts((prev) =>
      prev.map((c) => (c.id === selectedContact.id ? { ...c, isBlocked: !c.isBlocked } : c))
    )
    setShowBlockDialog(false)
    toast.success(
      selectedContact.isBlocked
        ? `${selectedContact.name} unblocked`
        : `${selectedContact.name} blocked`
    )
    setSelectedContact(null)
  }, [selectedContact])

  const handleStartConversation = useCallback(
    (contact) => {
      // In a real app, you'd create or find existing conversation
      navigate('/conversations')
      toast.info(`Starting conversation with ${contact.name}`)
    },
    [navigate]
  )

  const handleViewProfile = useCallback((contact) => {
    // Could open a profile modal or navigate to profile page
    toast.info(`Viewing ${contact.name}'s profile`)
  }, [])

  const onlineCount = contacts.filter((c) => c.status === 'online' && !c.isBlocked).length
  const blockedCount = contacts.filter((c) => c.isBlocked).length
  const allCount = contacts.filter((c) => !c.isBlocked).length

  return (
    <PageContainer>
      <PageHeader title="Contacts" description="Manage your contact list">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </PageHeader>

      {/* Search and Tabs */}
      <div className="mb-6 space-y-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts by name, email, or phone..."
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({allCount})</TabsTrigger>
            <TabsTrigger value="online">Online ({onlineCount})</TabsTrigger>
            <TabsTrigger value="blocked">Blocked ({blockedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  {searchQuery ? (
                    <EmptyState
                      icon={Search}
                      title="No contacts found"
                      description={`No contacts match "${searchQuery}"`}
                      action={
                        <Button variant="outline" onClick={() => setSearchQuery('')}>
                          Clear search
                        </Button>
                      }
                    />
                  ) : activeTab === 'blocked' ? (
                    <EmptyState
                      icon={UserX}
                      title="No blocked contacts"
                      description="You haven't blocked anyone yet."
                    />
                  ) : activeTab === 'online' ? (
                    <EmptyState
                      icon={Users}
                      title="No contacts online"
                      description="None of your contacts are currently online."
                    />
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="No contacts yet"
                      description="Add contacts to start messaging with people."
                      action={
                        <Button onClick={() => setShowAddDialog(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Contact
                        </Button>
                      }
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onMessage={() => handleStartConversation(contact)}
                    onViewProfile={() => handleViewProfile(contact)}
                    onBlock={() => {
                      setSelectedContact(contact)
                      setShowBlockDialog(true)
                    }}
                    onDelete={() => {
                      setSelectedContact(contact)
                      setShowDeleteDialog(true)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the contact details below. Name is required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Contact"
        description={`Are you sure you want to remove ${selectedContact?.name} from your contacts? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteContact}
        variant="destructive"
      />

      {/* Block Confirmation */}
      <ConfirmDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        title={selectedContact?.isBlocked ? 'Unblock Contact' : 'Block Contact'}
        description={
          selectedContact?.isBlocked
            ? `Are you sure you want to unblock ${selectedContact?.name}? They will be able to message you again.`
            : `Are you sure you want to block ${selectedContact?.name}? You won't receive messages from them anymore.`
        }
        confirmText={selectedContact?.isBlocked ? 'Unblock' : 'Block'}
        onConfirm={handleBlockContact}
        variant={selectedContact?.isBlocked ? 'default' : 'destructive'}
      />
    </PageContainer>
  )
}
