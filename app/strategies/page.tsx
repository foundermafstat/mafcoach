import MainLayout from "@/components/main-layout"
import GameStrategies from "@/components/game-strategies"
import QuestSystem from "@/components/quest-system"

export default function StrategiesPage() {
  return (
    <MainLayout>
      <GameStrategies />
      <QuestSystem pageType="strategies" />
    </MainLayout>
  )
}
