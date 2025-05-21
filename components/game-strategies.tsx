import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GameStrategies() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-mafia-900 dark:text-mafia-300">Mafia Game Strategies</h1>

      <p className="text-lg text-muted-foreground">
        Success in Mafia requires different strategies depending on your role. Here are some effective approaches for
        both town and mafia players.
      </p>

      <Tabs defaultValue="town">
        <TabsList className="grid w-full grid-cols-2 bg-mafia-100 dark:bg-mafia-900/30">
          <TabsTrigger value="town" className="data-[state=active]:bg-mafia-600 data-[state=active]:text-white">
            Town Strategies
          </TabsTrigger>
          <TabsTrigger value="mafia" className="data-[state=active]:bg-mafia-600 data-[state=active]:text-white">
            Mafia Strategies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="town" className="space-y-4">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Information Gathering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>As town, your primary goal is to identify mafia members through careful observation and deduction:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pay attention to voting patterns. Mafia members often vote together or protect each other.</li>
                <li>Watch for inconsistencies in players' statements or behavior.</li>
                <li>
                  If you're a Detective, be strategic about when to reveal information. Sometimes it's better to gather
                  more data before sharing your findings.
                </li>
                <li>Create a mental timeline of events and deaths to identify patterns.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Effective communication is crucial for town victory:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share your suspicions and reasoning clearly.</li>
                <li>
                  If you have a special role, consider when it's strategic to reveal it. Revealing too early makes you a
                  target, but revealing too late might mean your information isn't used effectively.
                </li>
                <li>Ask direct questions to players you suspect.</li>
                <li>Listen carefully to how others defend themselves.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Voting Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Strategic voting is essential:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Don't rush to vote without evidence.</li>
                <li>
                  Consider skipping a vote if there's insufficient information rather than risking eliminating a town
                  member.
                </li>
                <li>Pay attention to who initiates votes against whom.</li>
                <li>Be wary of bandwagon voting without proper discussion.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mafia" className="space-y-4">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Blending In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>As mafia, your goal is to remain undetected while eliminating town members:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Act like a town member. Participate in discussions and show genuine interest in finding the mafia.
                </li>
                <li>Don't be too quiet or too loud. Both extremes can draw suspicion.</li>
                <li>
                  Occasionally voice suspicion against your mafia teammates to appear impartial, but be careful not to
                  actually get them eliminated.
                </li>
                <li>Develop a consistent persona throughout the game.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Strategic Eliminations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Choose your targets wisely during night phases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prioritize eliminating players with special roles like the Detective or Doctor.</li>
                <li>Target vocal or influential town members who are organizing the town effectively.</li>
                <li>Consider eliminating quiet players who might be observing and gathering information.</li>
                <li>
                  Avoid targeting players who are already under town suspicion, as their elimination might clear your
                  team's name.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Misdirection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Create confusion and doubt among town members:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Claim to be an important town role if necessary (like Detective or Doctor).</li>
                <li>Create false leads by accusing innocent players with seemingly logical reasoning.</li>
                <li>If a town member is already under suspicion, reinforce that suspicion with "evidence."</li>
                <li>Sow discord between town members by highlighting contradictions in their statements.</li>
                <li>
                  Consider throwing one of your mafia teammates under the bus if they're already heavily suspected, to
                  gain credibility.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-mafia-200 dark:border-mafia-800">
        <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
          <CardTitle className="text-mafia-900 dark:text-mafia-300">Advanced Tips for All Players</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-mafia-700 dark:text-mafia-400">Body language:</strong> In in-person games, watch
              for physical tells but be aware of your own.
            </li>
            <li>
              <strong className="text-mafia-700 dark:text-mafia-400">Psychological patterns:</strong> People tend to
              have patterns in how they play games. Observe these patterns across multiple games.
            </li>
            <li>
              <strong className="text-mafia-700 dark:text-mafia-400">Meta-gaming:</strong> Understanding the "meta" of
              your specific group can provide insights into how certain players typically behave in different roles.
            </li>
            <li>
              <strong className="text-mafia-700 dark:text-mafia-400">Adaptability:</strong> Be ready to change your
              strategy if your current approach isn't working or if you're drawing too much suspicion.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
