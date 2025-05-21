export default function GameRules() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-mafia-900 dark:text-mafia-300">Mafia Game Rules</h1>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400">Setup</h2>
          <p>
            The game requires a moderator who doesn't participate as a player but manages the game flow. Players are
            secretly assigned roles, typically with the majority being innocent townspeople and a minority being mafia
            members.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400">Game Phases</h2>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-mafia-700 dark:text-mafia-500">Night Phase</h3>
            <p>
              All players "sleep" by closing their eyes. The moderator calls on specific roles to wake up, perform their
              actions, and go back to sleep. The mafia members wake up together and silently agree on one player to
              eliminate.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-mafia-700 dark:text-mafia-500">Day Phase</h3>
            <p>
              All players "wake up" and the moderator announces who was eliminated during the night. The surviving
              players then discuss who they suspect might be mafia members. After discussion, players vote on who to
              eliminate. The player with the most votes is "lynched" and their role is revealed.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400">Win Conditions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-mafia-600 dark:text-mafia-400">Town wins:</strong> If all mafia members are
              eliminated.
            </li>
            <li>
              <strong className="text-mafia-600 dark:text-mafia-400">Mafia wins:</strong> If the number of mafia members
              equals or exceeds the number of townspeople.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400">Important Rules</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Players cannot reveal their role cards to others.</li>
            <li>Eliminated players cannot speak or give hints about the game.</li>
            <li>During the night phase, players must keep their eyes closed unless called upon by the moderator.</li>
            <li>The moderator's decisions are final.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
