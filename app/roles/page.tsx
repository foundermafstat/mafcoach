import MainLayout from "@/components/main-layout"
import GameRoles from "@/components/game-roles"
import QuestSystem from "@/components/quest-system"

export default function RolesPage() {
  return (
    <MainLayout>
      <GameRoles />
      <QuestSystem pageType="roles" />
    </MainLayout>
  )
}
