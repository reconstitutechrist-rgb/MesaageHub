import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { MessageSquare, Plus } from 'lucide-react'

export default function ConversationsPage() {
  const conversations = [] // This would come from your API

  return (
    <PageContainer>
      <PageHeader
        title="Conversations"
        description="Manage your message threads"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </PageHeader>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Start a new conversation to begin messaging with your contacts."
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Start Conversation
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Conversation list would go here */}
        </div>
      )}
    </PageContainer>
  )
}
