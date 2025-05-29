'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SensayReplica } from '@/app/lib/api/sensay-replicas-client';
import { format } from 'date-fns';
import { 
  Bot, 
  Globe, 
  Lock, 
  Calendar, 
  Mail, 
  Tag, 
  MessageSquare, 
  Video, 
  Volume2,
  Database,
  BrainCircuit,
  Code,
  MessageCircleQuestion
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReplicaDetailProps {
  replica: SensayReplica;
}

export default function ReplicaDetail({ replica }: ReplicaDetailProps) {
  return (
    <ScrollArea className="h-[600px] w-full pr-4">
      <div className="space-y-6">
        {/* Основная информация */}
        <Card className="border border-dark-500 bg-dark-300 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-mafia-300" />
              <span>Основная информация</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Название:</p>
                <p className="font-medium">{replica.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Тип:</p>
                <p className="font-medium">{replica.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">ID:</p>
                <p className="font-medium text-xs truncate">{replica.uuid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Slug:</p>
                <p className="font-medium">{replica.slug}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Назначение:</p>
                <p className="font-medium">{replica.purpose}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Приветствие:</p>
                <p className="font-medium">{replica.greeting}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Краткое описание:</p>
                <p className="font-medium">{replica.shortDescription || replica.short_description || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Доступ:</p>
                <div className="flex items-center gap-1 mt-1">
                  {replica.private ? (
                    <>
                      <Lock className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">Приватный</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Публичный</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Создан:</p>
                <p className="font-medium">
                  {replica.created_at ? format(new Date(replica.created_at), 'dd.MM.yyyy HH:mm') : 'Нет данных'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">ID владельца:</p>
                <p className="font-medium text-xs truncate">{replica.ownerID || replica.owner_uuid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Теги */}
        {replica.tags && replica.tags.length > 0 && (
          <Card className="border border-dark-500 bg-dark-300 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-mafia-300" />
                <span>Теги</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {replica.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-dark-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Разрешенные email */}
        {replica.whitelistEmails && replica.whitelistEmails.length > 0 && (
          <Card className="border border-dark-500 bg-dark-300 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-mafia-300" />
                <span>Разрешенные Email-адреса</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {replica.whitelistEmails.map((email, index) => (
                  <div key={index} className="px-3 py-2 bg-dark-400 rounded-md">
                    {email}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Предложенные вопросы */}
        {replica.suggestedQuestions && replica.suggestedQuestions.length > 0 && (
          <Card className="border border-dark-500 bg-dark-300 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5 text-mafia-300" />
                <span>Предложенные вопросы</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {replica.suggestedQuestions.map((question, index) => (
                  <div key={index} className="px-3 py-2 bg-dark-400 rounded-md">
                    {question}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Настройки LLM */}
        {replica.llm && (
          <Card className="border border-dark-500 bg-dark-300 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-mafia-300" />
                <span>Настройки LLM</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Модель:</p>
                  <p className="font-medium">{replica.llm.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Режим памяти:</p>
                  <p className="font-medium">{replica.llm.memoryMode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Системное сообщение:</p>
                  <p className="font-medium">{replica.llm.systemMessage || replica.system_message}</p>
                </div>
                {replica.llm.tools && replica.llm.tools.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Инструменты:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {replica.llm.tools.map((tool, index) => (
                        <Badge key={index} variant="outline" className="bg-dark-400">
                          <Code className="h-3 w-3 mr-1" />
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Интеграции */}
        <Card className="border border-dark-500 bg-dark-300 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-mafia-300" />
              <span>Интеграции и функции</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Видео:</p>
                <Badge variant={replica.video_enabled ? "success" : "destructive"}>
                  {replica.video_enabled ? "Включено" : "Выключено"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400">Голос:</p>
                <Badge variant={replica.voice_enabled ? "success" : "destructive"}>
                  {replica.voice_enabled ? "Включено" : "Выключено"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400">ElevenLabs ID:</p>
                <p className="font-medium text-xs truncate">{replica.elevenLabsID || "Не указан"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">История чатов:</p>
                <p className="font-medium">{replica.chat_history_count || 0}</p>
              </div>
            </div>

            {/* Discord интеграция */}
            {replica.discord_integration && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Discord интеграция:</p>
                <div className="bg-dark-400 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Имя сервиса:</p>
                      <p className="font-medium">{replica.discord_integration.service_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Статус:</p>
                      <Badge variant={replica.discord_integration.is_active ? "success" : "destructive"}>
                        {replica.discord_integration.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Telegram интеграция */}
            {replica.telegram_integration && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Telegram интеграция:</p>
                <div className="bg-dark-400 p-3 rounded-md">
                  <div>
                    <p className="text-xs text-gray-400">Имя сервиса:</p>
                    <p className="font-medium">{replica.telegram_integration.service_name}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Изображение профиля */}
        {(replica.profileImage || replica.profile_image) && (
          <Card className="border border-dark-500 bg-dark-300 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Изображение профиля</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img 
                  src={replica.profileImage || replica.profile_image} 
                  alt={`${replica.name} profile`} 
                  className="rounded-lg max-h-[300px] max-w-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 break-all">
                URL: {replica.profileImage || replica.profile_image}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
