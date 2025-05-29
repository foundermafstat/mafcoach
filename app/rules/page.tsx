import GameRules from "@/components/game-rules"
import QuestSystem from "@/components/quest-system"

export default function RulesPage() {
  return (
    <div className="p-6">
      <GameRules />
      <QuestSystem pageType="rules" />
    </div>
  )
}
