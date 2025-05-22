import { prisma } from './api/prisma-client';

/**
 * Функция для инициализации базы данных при запуске приложения
 * Создает начальные настройки API Sensay, если они отсутствуют
 */
export async function initDatabase() {
  try {
    console.log('Инициализация базы данных...');
    
    // Проверяем, есть ли уже настройки API в базе данных
    const existingSettings = await prisma.apiSettings.findFirst();
    
    // Если настроек нет, создаем их из переменных окружения
    if (!existingSettings) {
      console.log('Настройки API не найдены, создаем из переменных окружения...');
      
      const apiKey = process.env.SENSAY_API_KEY;
      const organizationId = process.env.SENSAY_ORG_ID;
      const userId = process.env.SENSAY_USER_ID;
      const replicaUuid = process.env.SENSAY_REPLICA_UUID;
      
      // Проверяем наличие всех необходимых переменных окружения
      if (!apiKey || !organizationId || !userId || !replicaUuid) {
        console.error('Ошибка: Отсутствуют необходимые переменные окружения для настроек API');
        console.error('Убедитесь, что в файле .env определены следующие переменные:');
        console.error('SENSAY_API_KEY, SENSAY_ORG_ID, SENSAY_USER_ID, SENSAY_REPLICA_UUID');
        return;
      }
      
      // Создаем запись в базе данных с настройками API
      const settings = await prisma.apiSettings.create({
        data: {
          name: 'Default Sensay API Settings',
          apiKey,
          organizationId,
          userId,
          replicaUuid,
          isActive: true,
        },
      });
      
      console.log(`Настройки API успешно созданы с ID: ${settings.id}`);
    } else {
      console.log('Настройки API уже существуют в базе данных');
    }
    
    console.log('Инициализация базы данных завершена');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  }
}
