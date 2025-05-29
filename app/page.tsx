import GameIntroduction from "@/components/game-introduction"
import QuestSystem from "@/components/quest-system"

export default function Home() {
  return (
    <div className="p-6">
      <GameIntroduction />
      <QuestSystem pageType="home" />
    </div>
  )
}
