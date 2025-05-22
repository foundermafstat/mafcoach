import { prisma } from './prisma-client';
import { ApiSettings } from '@prisma/client';

/**
 * Сервис для работы с настройками API Sensay, хранящимися в базе данных
 */
export class SensaySettingsService {
  /**
   * Получить активные настройки API
   * @returns Объект с настройками API или null, если настройки не найдены
   */
  static async getActiveSettings(): Promise<ApiSettings | null> {
    try {
      const settings = await prisma.apiSettings.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });
      
      return settings;
    } catch (error) {
      console.error('Ошибка при получении настроек API:', error);
      return null;
    }
  }

  /**
   * Создать или обновить настройки API
   * @param name Имя набора настроек
   * @param apiKey Ключ API
   * @param organizationId ID организации
   * @param userId ID пользователя
   * @param replicaUuid UUID реплики
   * @param isActive Флаг активности настроек
   * @returns Объект с созданными/обновленными настройками API
   */
  static async createOrUpdateSettings(
    name: string,
    apiKey: string,
    organizationId: string,
    userId: string,
    replicaUuid: string,
    isActive: boolean = true
  ): Promise<ApiSettings> {
    try {
      // Если настройка активна, деактивируем все остальные настройки
      if (isActive) {
        await prisma.apiSettings.updateMany({
          where: { isActive: true },
          data: { isActive: false }
        });
      }
      
      const settings = await prisma.apiSettings.upsert({
        where: { name },
        update: {
          apiKey,
          organizationId,
          userId,
          replicaUuid,
          isActive,
          updatedAt: new Date()
        },
        create: {
          name,
          apiKey,
          organizationId,
          userId,
          replicaUuid,
          isActive
        }
      });
      
      return settings;
    } catch (error) {
      console.error('Ошибка при создании/обновлении настроек API:', error);
      throw error;
    }
  }

  /**
   * Получить все настройки API
   * @returns Массив объектов с настройками API
   */
  static async getAllSettings(): Promise<ApiSettings[]> {
    try {
      const settings = await prisma.apiSettings.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      
      return settings;
    } catch (error) {
      console.error('Ошибка при получении всех настроек API:', error);
      return [];
    }
  }

  /**
   * Удалить настройки API по имени
   * @param name Имя набора настроек
   * @returns true, если настройки успешно удалены, иначе false
   */
  static async deleteSettings(name: string): Promise<boolean> {
    try {
      await prisma.apiSettings.delete({
        where: { name }
      });
      
      return true;
    } catch (error) {
      console.error(`Ошибка при удалении настроек API "${name}":`, error);
      return false;
    }
  }
}
