"use client"

import { ReactNode, useEffect } from 'react'
import { toast } from 'sonner'

export default function SensayDbProvider({ children }: { children: ReactNode }) {
  // Инициализация базы данных при загрузке компонента
  useEffect(() => {
    const initDb = async () => {
      try {
        // Вызываем API для инициализации базы данных
        const response = await fetch('/api/db-init')
        const data = await response.json()
        
        if (data.success) {
          console.log('База данных Sensay API успешно инициализирована')
        } else {
          console.error('Ошибка при инициализации базы данных:', data.error)
          toast.error('Ошибка при инициализации настроек API')
        }
      } catch (error) {
        console.error('Не удалось инициализировать базу данных:', error)
      }
    }
    
    initDb()
  }, [])
  
  return <>{children}</>
}
