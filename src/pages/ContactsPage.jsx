import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Users, Plus } from 'lucide-react'

export default function ContactsPage() {
  const contacts = [] // This would come from your API

  return (
    <PageContainer>
      <PageHeader
        title="Contacts"
        description="Manage your contact list"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </PageHeader>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={Users}
              title="No contacts yet"
              description="Add contacts to start messaging with people."
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Contact cards would go here */}
        </div>
      )}
    </PageContainer>
  )
}
