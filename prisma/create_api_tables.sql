-- Создание таблицы для хранения настроек API
CREATE TABLE IF NOT EXISTS api_settings (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  apiKey TEXT NOT NULL,
  organizationId TEXT NOT NULL,
  userId TEXT NOT NULL,
  replicaUuid TEXT NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Создание таблицы для хранения сессий чата
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  apiSettingsId TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (apiSettingsId) REFERENCES api_settings(id)
);

-- Создание таблицы для хранения сообщений чата
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Добавление текущих настроек API из .env
INSERT INTO api_settings (
  id, 
  name, 
  apiKey, 
  organizationId, 
  userId, 
  replicaUuid, 
  isActive, 
  createdAt, 
  updatedAt
) VALUES (
  'cls-default',
  'Default Sensay API Settings',
  '1343969cb3fd346b1ed1be0948dfae12f27647ebfe47dacc3fff83c73b367316',
  '0d603486-9439-4e14-81f1-c9aa70bdc133',
  'f676f323-fc10-44a3-8f8d-508b1f9c942f',
  '2e55fb60-8629-4e6d-b737-77273373f63f',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (name) DO UPDATE SET
  apiKey = EXCLUDED.apiKey,
  organizationId = EXCLUDED.organizationId,
  userId = EXCLUDED.userId,
  replicaUuid = EXCLUDED.replicaUuid,
  updatedAt = CURRENT_TIMESTAMP;
