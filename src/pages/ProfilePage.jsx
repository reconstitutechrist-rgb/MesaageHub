import { useState, useRef, useCallback, useEffect } from 'react'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLocalStorage } from '@/hooks'
import { isValidEmail, getPasswordStrength, cn } from '@/lib/utils'
import { Camera, Trash2, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

function PasswordStrengthIndicator({ password }) {
  const strength = getPasswordStrength(password)

  const getColor = () => {
    switch (strength.label) {
      case 'Strong':
        return 'bg-green-500'
      case 'Medium':
        return 'bg-yellow-500'
      case 'Weak':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              level <= strength.score ? getColor() : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', getColor().replace('bg-', 'text-'))}>{strength.label}</p>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const fileInputRef = useRef(null)
  const [savedProfile] = useLocalStorage('user-profile', null)

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    avatar: null,
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Initialize profile from user/localStorage
  useEffect(() => {
    const initialProfile = savedProfile || {
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      phone: '',
      avatar: null,
    }
    setProfile(initialProfile)
    setAvatarPreview(initialProfile.avatar)
  }, [user, savedProfile])

  // Track changes
  useEffect(() => {
    const originalProfile = savedProfile || {
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      phone: '',
    }
    const changed =
      profile.name !== originalProfile.name ||
      profile.email !== originalProfile.email ||
      profile.bio !== (originalProfile.bio || '') ||
      profile.phone !== (originalProfile.phone || '') ||
      avatarPreview !== originalProfile.avatar
    setHasChanges(changed)
  }, [profile, avatarPreview, user, savedProfile])

  // Handle profile field changes
  const handleChange = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle avatar upload
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or GIF image')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
      setProfile((prev) => ({ ...prev, avatar: reader.result }))
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ''
  }, [])

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null)
    setProfile((prev) => ({ ...prev, avatar: null }))
  }, [])

  // Save profile
  const handleSaveProfile = useCallback(async () => {
    // Validation
    if (!profile.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!profile.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!isValidEmail(profile.email)) {
      toast.error('Please enter a valid email')
      return
    }

    setIsSaving(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))

    // Update auth context
    if (updateProfile) {
      updateProfile({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      })
    }

    // Save to localStorage
    localStorage.setItem('user-profile', JSON.stringify(profile))

    setIsSaving(false)
    setHasChanges(false)
    toast.success('Profile updated successfully')
  }, [profile, updateProfile])

  // Handle password change
  const handlePasswordChange = useCallback((field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
  }, [])

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const handleChangePassword = useCallback(async () => {
    // Validation
    if (!passwords.current) {
      toast.error('Please enter your current password')
      return
    }
    if (!passwords.new) {
      toast.error('Please enter a new password')
      return
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }

    const strength = getPasswordStrength(passwords.new)
    if (strength.score < 2) {
      toast.error('Please choose a stronger password')
      return
    }

    setIsChangingPassword(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))

    setIsChangingPassword(false)
    setPasswords({ current: '', new: '', confirm: '' })
    setShowPasswordSection(false)
    toast.success('Password changed successfully')
  }, [passwords])

  const passwordsMatch = passwords.new && passwords.confirm && passwords.new === passwords.confirm

  return (
    <PageContainer>
      <PageHeader title="Profile" description="Manage your personal information" />

      <div className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a new profile picture</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
            />
            <div className="relative">
              <UserAvatar
                user={{ ...user, avatar: avatarPreview }}
                size="xl"
                className="h-20 w-20"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAvatarClick}>
                  Upload Image
                </Button>
                {avatarPreview && (
                  <Button variant="ghost" size="icon" onClick={handleRemoveAvatar}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordSection ? (
              <Button variant="outline" onClick={() => setShowPasswordSection(true)}>
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => handlePasswordChange('current', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => handlePasswordChange('new', e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <PasswordStrengthIndicator password={passwords.new} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                      placeholder="Confirm new password"
                      className={cn(
                        passwords.confirm &&
                          (passwordsMatch ? 'border-green-500' : 'border-red-500')
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    {passwords.confirm && (
                      <span className="absolute right-10 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordSection(false)
                      setPasswords({ current: '', new: '', confirm: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
