import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar, OnlineStatus, EmptyState } from '@/components/common'
import { formatRelativeTime, truncate } from '@/lib/utils'
import {
  MessageSquare,
  Users,
  Bell,
  TrendingUp,
  Plus,
  UserPlus,
  Settings,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

// Mock data - would come from API/context in real app
const mockData = {
  stats: {
    totalConversations: 24,
    conversationsChange: 3,
    activeContacts: 156,
    newContacts: 12,
    unreadMessages: 8,
    urgentMessages: 3,
    messagesSent: 1284,
    messagesChange: 20,
  },
  recentActivity: [
    {
      id: '1',
      type: 'message',
      user: { id: 'u1', name: 'Alice Johnson', avatar: null, status: 'online' },
      content: 'Hey! Are you free for a quick call?',
      timestamp: new Date(Date.now() - 300000), // 5 min ago
      conversationId: '1',
    },
    {
      id: '2',
      type: 'message',
      user: { id: 'u2', name: 'Bob Smith', avatar: null, status: 'offline' },
      content: 'Did you see the game last night?',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      conversationId: '2',
    },
    {
      id: '3',
      type: 'contact_added',
      user: { id: 'u3', name: 'Carol Williams', avatar: null, status: 'online' },
      content: null,
      timestamp: new Date(Date.now() - 86400000), // Yesterday
      conversationId: null,
    },
    {
      id: '4',
      type: 'message',
      user: { id: 'u4', name: 'David Brown', avatar: null, status: 'away' },
      content: 'The project looks great! Let me review it.',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      conversationId: '3',
    },
  ],
  onlineContacts: [
    { id: 'u1', name: 'Alice Johnson', avatar: null, status: 'online', lastSeen: null },
    { id: 'u3', name: 'Carol Williams', avatar: null, status: 'online', lastSeen: null },
    { id: 'u5', name: 'Emma Davis', avatar: null, status: 'online', lastSeen: null },
    { id: 'u6', name: 'Frank Miller', avatar: null, status: 'online', lastSeen: null },
  ],
}

function StatCard({ title, value, description, icon: Icon, trend }) {
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : ''

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className={`text-xs text-muted-foreground ${trendColor}`}>{description}</p>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity, onClick }) {
  const getActivityText = () => {
    switch (activity.type) {
      case 'message':
        return truncate(activity.content, 50)
      case 'contact_added':
        return 'Added as a new contact'
      default:
        return 'Activity'
    }
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
    >
      <UserAvatar user={activity.user} size="sm" />
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-medium">{activity.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{getActivityText()}</p>
      </div>
      {activity.conversationId && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  )
}

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={onClick}>
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const stats = useMemo(
    () => [
      {
        title: 'Total Conversations',
        value: mockData.stats.totalConversations,
        description: `+${mockData.stats.conversationsChange} from last week`,
        icon: MessageSquare,
        trend: mockData.stats.conversationsChange,
      },
      {
        title: 'Active Contacts',
        value: mockData.stats.activeContacts,
        description: `+${mockData.stats.newContacts} new contacts`,
        icon: Users,
        trend: mockData.stats.newContacts,
      },
      {
        title: 'Unread Messages',
        value: mockData.stats.unreadMessages,
        description: `${mockData.stats.urgentMessages} urgent`,
        icon: Bell,
        trend: 0,
      },
      {
        title: 'Messages Sent',
        value: mockData.stats.messagesSent,
        description: `+${mockData.stats.messagesChange}% this month`,
        icon: TrendingUp,
        trend: mockData.stats.messagesChange,
      },
    ],
    []
  )

  const handleActivityClick = (activity) => {
    if (activity.conversationId) {
      navigate(`/chat/${activity.conversationId}`)
    } else if (activity.type === 'contact_added') {
      navigate('/contacts')
    }
  }

  const handleContactClick = (contact) => {
    // In a real app, you'd find or create a conversation with this contact
    navigate('/conversations')
  }

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Welcome back! Here's your messaging overview." />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/conversations')}>
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {mockData.recentActivity.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No recent activity"
                description="Your recent messages and updates will appear here"
              />
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-1">
                  {mockData.recentActivity.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      onClick={() => handleActivityClick(activity)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <QuickActionButton
                  icon={Plus}
                  label="New Chat"
                  onClick={() => navigate('/conversations')}
                />
                <QuickActionButton
                  icon={UserPlus}
                  label="Add Contact"
                  onClick={() => navigate('/contacts')}
                />
                <QuickActionButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => navigate('/settings')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Online Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Online Now
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
                All
              </Button>
            </CardHeader>
            <CardContent>
              {mockData.onlineContacts.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No contacts online</p>
              ) : (
                <div className="space-y-2">
                  {mockData.onlineContacts.slice(0, 4).map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleContactClick(contact)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <UserAvatar user={contact} size="sm" showStatus status="online" />
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium">{contact.name}</span>
                        <OnlineStatus isOnline className="text-xs" />
                      </div>
                    </button>
                  ))}
                  {mockData.onlineContacts.length > 4 && (
                    <p className="pt-2 text-center text-xs text-muted-foreground">
                      +{mockData.onlineContacts.length - 4} more online
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
