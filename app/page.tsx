import MainLayout from "@/components/main-layout"
import GameIntroduction from "@/components/game-introduction"
import QuestSystem from "@/components/quest-system"

export default function Home() {
  return (
    <MainLayout>
      <GameIntroduction />
      <QuestSystem pageType="home" />
    </MainLayout>
  )
}
