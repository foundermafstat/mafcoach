"use client"

import GameBoard from "@/components/game-board"

export default function GameBoardPage() {
  return (
    <div className="h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4 text-mafia-900 dark:text-mafia-300">Game Board</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Track player roles and statuses. Click on cards to flip them and use the controls to mark player states.
      </p>
      <div className="flex-1 overflow-auto">
        <GameBoard />
      </div>
    </div>
  )
}
