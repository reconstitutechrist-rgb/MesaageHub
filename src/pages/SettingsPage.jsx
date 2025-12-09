import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/common'
import { useLocalStorage } from '@/hooks'
import { useTheme } from 'next-themes'
import { useAuth } from '@/components/providers/AuthProvider'
import { Download, Trash2, Bell, Volume2, Shield, Monitor, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Color theme options with their display colors
const colorThemes = [
  { value: 'default', label: 'Default', color: 'bg-foreground' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
  { value: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
]

const DEFAULT_SETTINGS = {
  notifications: {
    push: true,
    email: true,
    sound: true,
    messagePreview: true,
  },
  privacy: {
    showOnlineStatus: true,
    showReadReceipts: true,
    showTypingIndicator: true,
  },
  appearance: {
    fontSize: 'medium',
    compactMode: false,
    colorTheme: 'default',
  },
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-[56px] py-2">
      <div className="space-y-0.5 flex-1 min-w-0">
        <Label className="text-base sm:text-sm">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Load settings from localStorage
  const [savedSettings, setSavedSettings] = useLocalStorage('app-settings', DEFAULT_SETTINGS)

  // Local state for settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    if (savedSettings) {
      setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...savedSettings }))
    }
  }, [savedSettings])

  // Apply color theme, font size, and compact mode
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove(
      'theme-blue',
      'theme-green',
      'theme-purple',
      'theme-orange',
      'theme-pink',
      'theme-cyan',
      'theme-red'
    )
    // Add current theme class if not default
    if (settings.appearance?.colorTheme && settings.appearance.colorTheme !== 'default') {
      document.body.classList.add(`theme-${settings.appearance.colorTheme}`)
    }

    // Apply font size
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large')
    document.body.classList.add(`font-size-${settings.appearance?.fontSize || 'medium'}`)

    // Apply compact mode
    if (settings.appearance?.compactMode) {
      document.body.classList.add('compact-mode')
    } else {
      document.body.classList.remove('compact-mode')
    }
  }, [
    settings.appearance?.colorTheme,
    settings.appearance?.fontSize,
    settings.appearance?.compactMode,
  ])

  // Save settings whenever they change
  const updateSetting = useCallback(
    (category, key, value) => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value,
          },
        }
        setSavedSettings(updated)
        return updated
      })
      toast.success('Setting saved')
    },
    [setSavedSettings]
  )

  // Export data
  const handleExportData = useCallback(async () => {
    setIsExporting(true)

    // Simulate gathering data
    await new Promise((r) => setTimeout(r, 1500))

    // Create mock export data
    const exportData = {
      profile: JSON.parse(localStorage.getItem('user-profile') || '{}'),
      settings: settings,
      exportedAt: new Date().toISOString(),
    }

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `messagehub-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsExporting(false)
    toast.success('Data exported successfully')
  }, [settings])

  // Delete account
  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000))

    // Clear all local data
    localStorage.clear()

    setIsDeleting(false)
    setShowDeleteDialog(false)

    toast.success('Account deleted')
    logout()
    navigate('/login')
  }, [logout, navigate])

  // Logout
  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }, [logout, navigate])

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how MessageHub looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow label="Dark Mode" description="Toggle dark mode on or off">
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </SettingRow>

            <Separator />

            <SettingRow label="Theme Color" description="Choose your preferred accent color">
              <Select
                value={settings.appearance.colorTheme}
                onValueChange={(value) => updateSetting('appearance', 'colorTheme', value)}
              >
                <SelectTrigger className="w-36">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        colorThemes.find((t) => t.value === settings.appearance.colorTheme)
                          ?.color || 'bg-foreground'
                      )}
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {colorThemes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', theme.color)} />
                        {theme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow label="Font Size" description="Adjust the text size">
              <Select
                value={settings.appearance.fontSize}
                onValueChange={(value) => updateSetting('appearance', 'fontSize', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            <SettingRow label="Compact Mode" description="Show more content with smaller spacing">
              <Switch
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              label="Push Notifications"
              description="Receive push notifications for new messages"
            >
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              label="Email Notifications"
              description="Receive email for important updates"
            >
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
              />
            </SettingRow>

            <Separator />

            <SettingRow label="Message Preview" description="Show message content in notifications">
              <Switch
                checked={settings.notifications.messagePreview}
                onCheckedChange={(checked) =>
                  updateSetting('notifications', 'messagePreview', checked)
                }
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Sounds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Sounds
            </CardTitle>
            <CardDescription>Manage notification sounds</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow
              label="Notification Sound"
              description="Play a sound when receiving messages"
            >
              <Switch
                checked={settings.notifications.sound}
                onCheckedChange={(checked) => updateSetting('notifications', 'sound', checked)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow label="Online Status" description="Let others see when you're online">
              <Switch
                checked={settings.privacy.showOnlineStatus}
                onCheckedChange={(checked) => updateSetting('privacy', 'showOnlineStatus', checked)}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              label="Read Receipts"
              description="Let others see when you've read their messages"
            >
              <Switch
                checked={settings.privacy.showReadReceipts}
                onCheckedChange={(checked) => updateSetting('privacy', 'showReadReceipts', checked)}
              />
            </SettingRow>

            <Separator />

            <SettingRow label="Typing Indicator" description="Let others see when you're typing">
              <Switch
                checked={settings.privacy.showTypingIndicator}
                onCheckedChange={(checked) =>
                  updateSetting('privacy', 'showTypingIndicator', checked)
                }
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data & Storage
            </CardTitle>
            <CardDescription>Manage your data and storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
              </div>
              <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" onClick={() => setShowLogoutDialog(true)}>
                Log Out
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Log Out"
        description="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log Out"
        onConfirm={handleLogout}
      />

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, messages, and contacts will be permanently removed."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Account'}
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />
    </PageContainer>
  )
}
