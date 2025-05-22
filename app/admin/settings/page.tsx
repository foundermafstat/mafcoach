"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type ApiSettings = {
  id: string
  name: string
  apiKey: string
  organizationId: string
  userId: string
  replicaUuid: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ApiSettings[]>([])
  const [loading, setLoading] = useState(false)
  const [newSetting, setNewSetting] = useState({
    name: '',
    apiKey: '',
    organizationId: '',
    userId: '',
    replicaUuid: '',
    isActive: true
  })

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    fetchSettings()
  }, [])

  // Получение всех настроек API
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.settings)
      } else {
        toast.error('Ошибка при загрузке настроек')
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error)
      toast.error('Не удалось загрузить настройки')
    } finally {
      setLoading(false)
    }
  }

  // Создание или обновление настроек API
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSetting),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Настройки успешно сохранены')
        setNewSetting({
          name: '',
          apiKey: '',
          organizationId: '',
          userId: '',
          replicaUuid: '',
          isActive: true
        })
        fetchSettings()
      } else {
        toast.error(`Ошибка при сохранении настроек: ${data.error}`)
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error)
      toast.error('Не удалось сохранить настройки')
    } finally {
      setLoading(false)
    }
  }

  // Удаление настроек API
  const deleteSettings = async (name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить настройки "${name}"?`)) {
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/settings?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Настройки успешно удалены')
        fetchSettings()
      } else {
        toast.error(`Ошибка при удалении настроек: ${data.error}`)
      }
    } catch (error) {
      console.error('Ошибка при удалении настроек:', error)
      toast.error('Не удалось удалить настройки')
    } finally {
      setLoading(false)
    }
  }

  // Активация настроек API
  const activateSettings = async (setting: ApiSettings) => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...setting,
          isActive: true
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Настройки "${setting.name}" активированы`)
        fetchSettings()
      } else {
        toast.error(`Ошибка при активации настроек: ${data.error}`)
      }
    } catch (error) {
      console.error('Ошибка при активации настроек:', error)
      toast.error('Не удалось активировать настройки')
    } finally {
      setLoading(false)
    }
  }

  // Редактирование настроек
  const editSettings = (setting: ApiSettings) => {
    setNewSetting({
      name: setting.name,
      apiKey: setting.apiKey,
      organizationId: setting.organizationId,
      userId: setting.userId,
      replicaUuid: setting.replicaUuid,
      isActive: setting.isActive
    })
    
    // Прокручиваем страницу к форме
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Загрузка настроек из .env файла
  const loadFromEnv = () => {
    const apiKey = process.env.NEXT_PUBLIC_SENSAY_API_KEY || ''
    const organizationId = process.env.NEXT_PUBLIC_SENSAY_ORG_ID || ''
    const userId = process.env.NEXT_PUBLIC_SENSAY_USER_ID || ''
    const replicaUuid = process.env.NEXT_PUBLIC_SENSAY_REPLICA_UUID || ''
    
    if (!apiKey || !organizationId || !userId || !replicaUuid) {
      toast.error('Не удалось загрузить настройки из .env файла')
      return
    }
    
    setNewSetting({
      ...newSetting,
      apiKey,
      organizationId,
      userId,
      replicaUuid
    })
    
    toast.success('Настройки загружены из .env файла')
  }

  return (
    <div style={{
      height: "100vh",
      overflowY: "auto",
      paddingBottom: "100px"
    }}>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">API Sensay Settings Management</h1>
        
        <div className="grid gap-8 grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
          {/* Форма для создания/редактирования настроек */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {newSetting.name ? `Edit "${newSetting.name}"` : 'New API Settings'}
              </CardTitle>
              <CardDescription>
                Enter parameters for connecting to Sensay API
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={saveSettings}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Settings Name</Label>
                  <Input
                    id="name"
                    placeholder="For example: Main API Settings"
                    value={newSetting.name}
                    onChange={(e) => setNewSetting({...newSetting, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="apiKey">API key (SENSAY_API_KEY)</Label>
                  <Input
                    id="apiKey"
                    placeholder="Sensay API key"
                    value={newSetting.apiKey}
                    onChange={(e) => setNewSetting({...newSetting, apiKey: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="organizationId">Organization ID (SENSAY_ORG_ID)</Label>
                  <Input
                    id="organizationId"
                    placeholder="Organization ID in Sensay"
                    value={newSetting.organizationId}
                    onChange={(e) => setNewSetting({...newSetting, organizationId: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="userId">User ID (SENSAY_USER_ID)</Label>
                  <Input
                    id="userId"
                    placeholder="User ID in Sensay"
                    value={newSetting.userId}
                    onChange={(e) => setNewSetting({...newSetting, userId: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="replicaUuid">UUID Replica (SENSAY_REPLICA_UUID)</Label>
                  <Input
                    id="replicaUuid"
                    placeholder="UUID Replica in Sensay"
                    value={newSetting.replicaUuid}
                    onChange={(e) => setNewSetting({...newSetting, replicaUuid: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newSetting.isActive}
                    onCheckedChange={(checked) => setNewSetting({...newSetting, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Activate these settings</Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <Button variant="outline" type="button" onClick={() => {
                  setNewSetting({
                    name: '',
                    apiKey: '',
                    organizationId: '',
                    userId: '',
                    replicaUuid: '',
                    isActive: true
                  })
                }}>
                  Clear
                </Button>
                
                <div className="flex space-x-2">
                  <Button variant="secondary" type="button" onClick={loadFromEnv}>
                    Load from .env
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save settings'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
          
          {/* Список существующих настроек */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Existing settings</CardTitle>
              <CardDescription>
                List of all saved API settings
              </CardDescription>
            </CardHeader>
            
            <CardContent style={{ maxHeight: "400px", overflowY: "auto" }}>
              {loading ? (
                <p className="text-center py-4">Loading settings...</p>
              ) : settings.length === 0 ? (
                <p className="text-center py-4">No API settings found</p>
              ) : (
                <div className="space-y-6">
                  {settings.map((setting) => (
                    <div key={setting.id} className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-lg font-medium">{setting.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {setting.isActive ? (
                              <span className="text-green-600 font-medium">Active</span>
                            ) : (
                              <span className="text-gray-500">Inactive</span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editSettings(setting)}
                          >
                            Edit
                          </Button>
                          
                          {!setting.isActive && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => activateSettings(setting)}
                            >
                              Activate
                            </Button>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSettings(setting.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium">API key:</p>
                          <p className="truncate">{setting.apiKey.substring(0, 12)}...</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Organization ID:</p>
                          <p className="truncate">{setting.organizationId}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">User ID:</p>
                          <p className="truncate">{setting.userId}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">UUID Replica:</p>
                          <p className="truncate">{setting.replicaUuid}</p>
                        </div>
                      </div>
                      
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={fetchSettings}
                disabled={loading}
              >
                Update list
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
