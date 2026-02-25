Compréhension du Domaine
À partir de tes écrans, le domaine semble être :
Gestion de terrains de jeu, matchs, équipes et modes de jeu avec gestion du score et du temps.
On peut appeler ton domaine :
Match Management System
🧠 2️⃣ Ubiquitous Language (Langage Métier)
D’après tes écrans, voici le vocabulaire métier à utiliser partout (code + discussions) :
Field (terrain)
Matchup
Team
Game
GameMode
Score
GameTime
BreakTime
GuestTeam
Points
Timer
⚠️ Important : dans ton code, tu dois utiliser EXACTEMENT ces termes.
🏗 3️⃣ Délimitation des Bounded Contexts
Vu la complexité, on peut séparer en 4 sous-domaines :
1️⃣ Field Management
Création de terrain
Organisation des matchups
2️⃣ Team Management
Création d’équipe
Gestion des équipes invitées
3️⃣ Game Mode Management
Création de modes
Paramétrage (temps, pause, score max…)
4️⃣ Game Session (Core Domain ❤️)
Lancer un match
Gérer le score
Gérer le timer
Pause
Fin de partie
Le Core Domain ici = Game Session (la logique temps réel).
🧱 4️⃣ Modélisation du Domaine
On va maintenant définir :
Entités
Value Objects
Aggregates
Domain Services
📦 FIELD CONTEXT
🧩 Entité : Field
class Field {
  id: FieldId
  name: string
  matchups: Matchup[]
}
🧩 Entité : Matchup
Un matchup représente un duel entre 2 équipes sur un terrain.
class Matchup {
  id: MatchupId
  teamA: TeamId
  teamB: TeamId
  order: number
}
👥 TEAM CONTEXT
🧩 Entité : Team
class Team {
  id: TeamId
  name: string
  isGuest: boolean
}
🎮 GAME MODE CONTEXT
🧩 Entité : GameMode (Aggregate Root)
class GameMode {
  id: GameModeId
  name: string
  gameTime: GameDuration
  breakTime: BreakDuration
  timeOut: TimeoutDuration
  raceTo: ScoreLimit
}
💎 Value Objects
class GameDuration { minutes: number }
class BreakDuration { seconds: number }
class TimeoutDuration { seconds: number }
class ScoreLimit { value: number }
Ces objets sont :
immuables
validés à la création
🔥 GAME SESSION (CORE DOMAIN)
C’est la partie la plus importante.
🧩 Aggregate Root : Game
class Game {
  id: GameId
  fieldId: FieldId
  matchup: Matchup
  gameMode: GameMode
  score: Score
  timer: GameTimer
  status: GameStatus
}
💎 Value Object : Score
class Score {
  teamAScore: number
  teamBScore: number
}
💎 Value Object : GameTimer
class GameTimer {
  remainingTime: number
  isRunning: boolean
}
Enum : GameStatus
enum GameStatus {
  NOT_STARTED,
  RUNNING,
  BREAK,
  FINISHED
}