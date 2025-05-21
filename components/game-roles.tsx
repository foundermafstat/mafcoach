import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GameRoles() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-mafia-900 dark:text-mafia-300">Mafia Game Roles</h1>

      <p className="text-lg text-muted-foreground">
        Mafia games feature various roles divided into two main teams: the Town (innocent) and the Mafia (informed
        minority). Some variants include neutral roles with their own win conditions.
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400">Town Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Villager</CardTitle>
              <CardDescription>Basic town member</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The most basic role. Villagers have no special abilities but must use their deduction skills during day
                discussions to identify mafia members.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Doctor</CardTitle>
              <CardDescription>Protective role</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Each night, the Doctor can choose one player to protect. If the mafia targets that player, they will
                survive the night.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Detective</CardTitle>
              <CardDescription>Investigative role</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Each night, the Detective can investigate one player and learn if they are a mafia member or not. This
                information must be used carefully during day discussions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Bodyguard</CardTitle>
              <CardDescription>Protective role</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Each night, the Bodyguard can choose to protect one player. If that player is targeted by the mafia, the
                Bodyguard will die instead.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400 mt-8">Mafia Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Mafioso</CardTitle>
              <CardDescription>Basic mafia member</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Basic mafia role. Mafiosi know who their fellow mafia members are and work together to eliminate
                townspeople each night.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Godfather</CardTitle>
              <CardDescription>Mafia leader</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The leader of the mafia. The Godfather appears innocent to the Detective's investigation, making them
                harder to identify.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Framer</CardTitle>
              <CardDescription>Deceptive role</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Each night, the Framer can choose one player to "frame." If that player is investigated by the Detective
                that night, they will appear to be a mafia member even if they're innocent.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Consigliere</CardTitle>
              <CardDescription>Investigative role</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Each night, the Consigliere can investigate one player and learn their exact role, providing valuable
                information to the mafia team.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-mafia-800 dark:text-mafia-400 mt-8">Neutral Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Jester</CardTitle>
              <CardDescription>Chaos role</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The Jester wins if they are voted out during the day phase. Their goal is to act suspicious and get
                lynched by the town.
              </p>
            </CardContent>
          </Card>

          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Serial Killer</CardTitle>
              <CardDescription>Solo killer</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The Serial Killer acts alone and can kill one player each night. They win if they are the last player
                standing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
