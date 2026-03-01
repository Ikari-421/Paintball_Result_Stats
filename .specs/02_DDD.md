# Modélisation du Domaine (DDD)

## 1. Compréhension du Domaine

À partir des écrans, le domaine semble être :
Gestion de terrains de jeu, matchs, équipes et modes de jeu avec gestion du score et du temps.
On peut appeler ce domaine : **Match Management System**

## 2. Ubiquitous Language (Langage Métier)

D’après les écrans, voici le vocabulaire métier à utiliser partout (code + discussions) :

- Tournament (tournoi)
- Field (terrain)
- Matchup
- Team
- Game
- GameMode
- Score
- GameTime
- BreakTime
- GuestTeam
- Points
- Timer

⚠️ **Important** : dans le code, il faut utiliser EXACTEMENT ces termes.

## 3. Délimitation des Bounded Contexts

Vu la complexité, on sépare en 4 sous-domaines :

1️⃣ **Tournament Management**

- Création de tournoi
- Gestion et assignation des terrains

2️⃣ **Field Management**

- Création de terrain (au sein d'un tournoi)
- Organisation des matchups

3️⃣ **Team Management**

- Création d’équipe
- Gestion des équipes invitées

3️⃣ **Game Mode Management**

- Création de modes
- Paramétrage (temps, pause, score max…)

4️⃣ **Game Session (Core Domain ❤️)**

- Lancer un match
- Gérer le score
- Gérer le timer
- Pause
- Fin de partie

Le **Core Domain** ici = Game Session (la logique temps réel).

## 4. Modélisation du Domaine (Entités, Value Objects, Aggregates)

### 🏆 TOURNAMENT CONTEXT

**🧩 Aggregate Root : Tournament**

```typescript
class Tournament {
  id: TournamentId;
  name: string;
  fieldIds: FieldId[];
}
```

### 📦 FIELD CONTEXT

**🧩 Entité : Field**

```typescript
class Field {
  id: FieldId;
  name: string;
  matchups: Matchup[];
}
```

**🧩 Entité : Matchup**
Un matchup représente un duel entre 2 équipes sur un terrain.

```typescript
class Matchup {
  id: MatchupId;
  teamA: TeamId;
  teamB: TeamId;
  order: number;
}
```

### 👥 TEAM CONTEXT

**🧩 Entité : Team**

```typescript
class Team {
  id: TeamId;
  name: string;
  isGuest: boolean;
}
```

### 🎮 GAME MODE CONTEXT

**🧩 Entité : GameMode (Aggregate Root)**

```typescript
class GameMode {
  id: GameModeId;
  name: string;
  gameTime: GameDuration;
  breakTime: BreakDuration;
  overTime?: OvertimeDuration;
  timeOutsPerTeam: TimeoutCount;
  raceTo: ScoreLimit;
}
```

**💎 Value Objects**

```typescript
class GameDuration {
  minutes: number;
}
class BreakDuration {
  seconds: number;
}
class OvertimeDuration {
  minutes: number;
} // Durée du round d'Overtime
class TimeoutCount {
  quantity: number;
} // Nombre de Timeouts autorisés par équipe
class ScoreLimit {
  value: number;
}
```

Ces objets sont :

- immuables
- validés à la création

### 🔥 GAME SESSION (CORE DOMAIN)

C’est la partie la plus importante.

**🧩 Aggregate Root : Game**

```typescript
class Game {
  id: GameId;
  fieldId: FieldId;
  matchup: Matchup;
  gameMode: GameMode;
  score: Score;
  timer: GameTimer;
  status: GameStatus;
}
```

**💎 Value Object : Score**

```typescript
class Score {
  teamAScore: number;
  teamBScore: number;
}
```

**💎 Value Object : GameTimer**

```typescript
class GameTimer {
  remainingTime: number;
  isRunning: boolean;
}
```

**Enum / State Pattern : GameStatus**
Le cycle de vie du match sera géré via un **State Pattern**.

```typescript
enum GameStatus {
  NOT_STARTED,
  RUNNING,
  BREAK,
  OVERTIME, // Ajout de l'Overtime en tant qu'état spécifique
  FINISHED,
}
```
