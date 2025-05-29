import GameStrategies from "@/components/game-strategies"
import QuestSystem from "@/components/quest-system"

export default function StrategiesPage() {
  return (
    <div className="p-6">
      <GameStrategies />
      <QuestSystem pageType="strategies" />
    </div>
  )
}
