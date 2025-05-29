"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Navigation, Moon, Sun, Palette, MessageSquare } from "lucide-react"
import { useHeader } from "./header-context"
import { ChatTrigger } from "@/app/lib/utils/parseTrigger"
import { SensayReplica } from "@/app/lib/api/sensay-replicas-client"
import { useChat } from "./chat-provider"

// Расширенный тип триггера, включающий возможность вопросов
type QuestionTrigger = {
  action: "question";
  payload: string;
};

// Тип для всех триггеров (стандартные + вопросы)
type TriggerType = ChatTrigger | QuestionTrigger;

// Структура кнопки триггера
interface TriggerButton {
  id: string;
  name: string;
  icon: React.ReactNode;
  trigger: TriggerType;
}

interface TriggerButtonsProps {
  className?: string;
  selectedReplica?: SensayReplica | null;
}

export function TriggerButtons({ className, selectedReplica }: TriggerButtonsProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { setHeaderState } = useHeader();
  const { addMessage } = useChat();

  // Предопределенные триггеры для навигации
  const navigationTriggers: TriggerButton[] = [
    {
      id: "nav-home",
      name: "Главная",
      icon: <Navigation className="h-4 w-4 mr-1" />,
      trigger: { action: "navigate", payload: "/" }
    },
    {
      id: "nav-rules",
      name: "Правила",
      icon: <Navigation className="h-4 w-4 mr-1" />,
      trigger: { action: "navigate", payload: "/rules" }
    },
    {
      id: "nav-game-board",
      name: "Игровая доска",
      icon: <Navigation className="h-4 w-4 mr-1" />,
      trigger: { action: "navigate", payload: "/game-board" }
    },
    {
      id: "nav-replicas",
      name: "Реплики Sensay",
      icon: <Navigation className="h-4 w-4 mr-1" />,
      trigger: { action: "navigate", payload: "/replicas" }
    }
  ];
  
  // Триггеры для смены темы
  const themeTriggers: TriggerButton[] = [
    {
      id: "theme-dark",
      name: "Тёмная тема",
      icon: <Moon className="h-4 w-4 mr-1" />,
      trigger: { action: "theme", payload: "dark" }
    },
    {
      id: "theme-light",
      name: "Светлая тема",
      icon: <Sun className="h-4 w-4 mr-1" />,
      trigger: { action: "theme", payload: "light" }
    },
    {
      id: "theme-system",
      name: "Системная тема",
      icon: <Palette className="h-4 w-4 mr-1" />,
      trigger: { action: "theme", payload: "system" }
    }
  ];
  
  // Генерируем триггеры из предлагаемых вопросов реплики
  const suggestedQuestionTriggers: TriggerButton[] = [];
  
  // Если есть выбранная реплика и у нее есть предлагаемые вопросы
  if (selectedReplica?.suggestedQuestions?.length > 0) {
    // Создаем триггеры из вопросов
    selectedReplica.suggestedQuestions.forEach((question, index) => {
      suggestedQuestionTriggers.push({
        id: `question-${index}`,
        name: question,
        icon: <MessageSquare className="h-4 w-4 mr-1" />,
        trigger: {
          action: "question",
          payload: question
        }
      });
    });
  }
  
  // Объединяем все триггеры
  const triggers: TriggerButton[] = [
    // Сначала показываем предлагаемые вопросы реплики, если они есть
    ...suggestedQuestionTriggers,
    // Затем стандартные триггеры
    ...navigationTriggers,
    ...themeTriggers
  ];

  // Обработка нажатия на кнопку триггера
  const handleTrigger = (trigger: TriggerType) => {
    switch (trigger.action) {
      case "navigate":
        if (typeof trigger.payload === "string") {
          router.push(trigger.payload);
        }
        break;
      case "theme":
        if (
          trigger.payload === "light" ||
          trigger.payload === "dark" ||
          trigger.payload === "system"
        ) {
          setTheme(trigger.payload);
        }
        break;
      case "headerState":
        setHeaderState(trigger.payload);
        break;
      case "question":
        // Обработка триггера типа "question" - добавляем вопрос в чат от имени пользователя
        addMessage({ role: "user", content: trigger.payload });
        break;
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${className || ""}`}>
      {triggers.map((trigger) => (
        <Button
          key={trigger.id}
          variant="outline"
          size="sm"
          className="bg-mafia-50 border-mafia-200 hover:bg-mafia-100 text-mafia-800 text-xs font-medium dark:bg-mafia-900 dark:border-mafia-700 dark:text-mafia-200 flex items-center"
          onClick={() => handleTrigger(trigger.trigger)}
        >
          {trigger.icon}
          {trigger.name}
        </Button>
      ))}
    </div>
  )
}
