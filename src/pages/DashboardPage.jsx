import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Bell, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Total Conversations',
    value: '24',
    description: '+3 from last week',
    icon: MessageSquare,
  },
  {
    title: 'Active Contacts',
    value: '156',
    description: '+12 new contacts',
    icon: Users,
  },
  {
    title: 'Unread Messages',
    value: '8',
    description: '3 urgent',
    icon: Bell,
  },
  {
    title: 'Messages Sent',
    value: '1,284',
    description: '+20% this month',
    icon: TrendingUp,
  },
]

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your messaging overview."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your recent conversations and messages will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start a new conversation or manage your contacts.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
