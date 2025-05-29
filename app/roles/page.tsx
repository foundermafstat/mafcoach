import GameRoles from "@/components/game-roles"
import QuestSystem from "@/components/quest-system"

export default function RolesPage() {
  return (
    <div className="p-6">
      <GameRoles />
      <QuestSystem pageType="roles" />
    </div>
  )
}
