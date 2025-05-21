"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useChat } from "./chat-provider"
import { useState } from "react"

export default function GameIntroduction() {
  const { addMessage } = useChat()
  const [isLoaded, setIsLoaded] = useState(true)

  const handleAskQuestion = (question: string) => {
    addMessage({ role: "user", content: question })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-mafia-900 dark:text-mafia-300">Welcome to Mafia Game Learning</h1>

      <p className="text-lg text-muted-foreground">
        Mafia is a social deduction game where players are secretly assigned roles and must work together to identify
        the mafia members among them, or if you're a mafia member, to eliminate the innocent townspeople.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-mafia-200 dark:border-mafia-800">
          <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
            <CardTitle className="text-mafia-900 dark:text-mafia-300">Game Overview</CardTitle>
            <CardDescription>Learn the basics of the Mafia game</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Mafia is played in alternating phases: night, when the mafia and other special roles perform actions, and
              day, when all players discuss and vote to eliminate a suspected mafia member.
            </p>
            <Button
              variant="outline"
              onClick={() => handleAskQuestion("What's the basic flow of a Mafia game?")}
              className="border-mafia-300 text-mafia-900 hover:bg-mafia-50 dark:text-mafia-300 dark:hover:bg-mafia-900/20"
            >
              Ask about game flow
            </Button>
          </CardContent>
        </Card>

        <Card className="border-mafia-200 dark:border-mafia-800">
          <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
            <CardTitle className="text-mafia-900 dark:text-mafia-300">Getting Started</CardTitle>
            <CardDescription>Tips for your first game</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you're new to Mafia, start by understanding the basic roles and the win conditions for each team. Pay
              attention to player behavior and practice your deduction skills.
            </p>
            <Button
              variant="outline"
              onClick={() => handleAskQuestion("What tips do you have for a first-time Mafia player?")}
              className="border-mafia-300 text-mafia-900 hover:bg-mafia-50 dark:text-mafia-300 dark:hover:bg-mafia-900/20"
            >
              Ask for beginner tips
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-mafia-200 dark:border-mafia-800">
        <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
          <CardTitle className="text-mafia-900 dark:text-mafia-300">How to Use This Site</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Browse through the different sections using the navigation menu to learn about rules, roles, and strategies.
            Use the chat assistant on the left to ask specific questions about the game. You can resize the panels to
            adjust your view.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
