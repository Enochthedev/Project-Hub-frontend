"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Shield, Palette, Download, Trash2, Save, Moon, Sun, Monitor } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useTheme } from "next-themes"
import { toast } from "sonner"

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  milestoneReminders: boolean
  projectUpdates: boolean
  aiEscalations: boolean
  weeklyDigest: boolean
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "supervisors-only"
  showEmail: boolean
  showProgress: boolean
  allowAILearning: boolean
  dataRetention: "1-year" | "2-years" | "5-years" | "indefinite"
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  compactMode: boolean
  showAnimations: boolean
  fontSize: "small" | "medium" | "large"
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    milestoneReminders: true,
    projectUpdates: true,
    aiEscalations: true,
    weeklyDigest: false,
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "supervisors-only",
    showEmail: false,
    showProgress: true,
    allowAILearning: true,
    dataRetention: "2-years",
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    compactMode: false,
    showAnimations: true,
    fontSize: "medium",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Simulate data export
      const data = {
        profile: user,
        settings: { notifications, privacy, appearance },
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `projecthub-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Data exported successfully")
    } catch (error) {
      toast.error("Failed to export data")
    }
  }

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences and application settings</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about important updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Milestone Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming deadlines</p>
                    </div>
                    <Switch
                      checked={notifications.milestoneReminders}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, milestoneReminders: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications about project status changes</p>
                    </div>
                    <Switch
                      checked={notifications.projectUpdates}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, projectUpdates: checked }))}
                    />
                  </div>

                  {user.role === "supervisor" && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>AI Escalations</Label>
                        <p className="text-sm text-muted-foreground">When students need your help with AI questions</p>
                      </div>
                      <Switch
                        checked={notifications.aiEscalations}
                        onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, aiEscalations: checked }))}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your activity and progress</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyDigest: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your privacy settings and data usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) =>
                        setPrivacy((prev) => ({
                          ...prev,
                          profileVisibility: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="supervisors-only">Supervisors Only - Only supervisors can see your profile</option>
                      <option value="private">Private - Only you can see your profile</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showEmail: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Progress</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your project progress</p>
                    </div>
                    <Switch
                      checked={privacy.showProgress}
                      onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showProgress: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow AI Learning</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve AI responses by learning from your interactions
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowAILearning}
                      onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowAILearning: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention</Label>
                    <select
                      value={privacy.dataRetention}
                      onChange={(e) =>
                        setPrivacy((prev) => ({
                          ...prev,
                          dataRetention: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="1-year">1 Year</option>
                      <option value="2-years">2 Years</option>
                      <option value="5-years">5 Years</option>
                      <option value="indefinite">Indefinite</option>
                    </select>
                    <p className="text-sm text-muted-foreground">How long to keep your data after account deletion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance & Display</CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="flex items-center gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="flex items-center gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        onClick={() => setTheme("system")}
                        className="flex items-center gap-2"
                      >
                        <Monitor className="h-4 w-4" />
                        System
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use smaller spacing and components</p>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, compactMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                    </div>
                    <Switch
                      checked={appearance.showAnimations}
                      onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, showAnimations: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <select
                      value={appearance.fontSize}
                      onChange={(e) =>
                        setAppearance((prev) => ({
                          ...prev,
                          fontSize: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>Download a copy of your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Export your profile data, bookmarks, milestones, and AI conversations. The data will be provided
                      in JSON format.
                    </p>
                    <Button onClick={handleExportData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
