import MainLayout from "@/components/main-layout"
import GameRules from "@/components/game-rules"
import QuestSystem from "@/components/quest-system"

export default function RulesPage() {
  return (
    <MainLayout>
      <GameRules />
      <QuestSystem pageType="rules" />
    </MainLayout>
  )
}
