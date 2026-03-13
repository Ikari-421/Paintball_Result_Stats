# C4 Model - Level 4: Code Diagram

## Vue d'ensemble

Le diagramme de code (C4) montre les classes et interfaces principales avec leurs relations et méthodes clés.

**Niveau:** C4 - Code  
**Audience:** Développeurs  
**Focus:** Implémentation détaillée des composants critiques

---

## Game Aggregate (Core Domain)

```mermaid
classDiagram
    class Game {
        <<Aggregate Root>>
        -GameId id
        -FieldId fieldId
        -Matchup matchup
        -GameMode gameMode
        -Score score
        -GameTimer timer
        -GameStatus status
        -number currentRound
        -number isTimeStopped
        -string gameStateStatus
        
        +create(id, fieldId, matchup, gameMode)$ Game
        +start() Game
        +startOvertime() Game
        +stopTime() Game
        +resume() Game
        +finish() Game
        +startBreak() Game
        +endBreak() Game
        +updateScore(score) Game
        +updateTimer(timer) Game
    }
    
    class Score {
        <<Value Object>>
        +readonly teamAScore: number
        +readonly teamBScore: number
        
        +incrementTeamA() Score
        +incrementTeamB() Score
        +isTied() boolean
        +hasReachedLimit(limit) boolean
    }
    
    class GameTimer {
        <<Value Object>>
        +readonly remainingTime: number
        +readonly isRunning: boolean
        +readonly endTimestamp: number | null
        
        +start() GameTimer
        +stop() GameTimer
        +updateTime(seconds) GameTimer
        +isExpired() boolean
    }
    
    class GameState {
        <<Entity>>
        +readonly status: GameStatus
        +readonly currentRound: number
        +readonly isTimeStopped: boolean
        
        +create(status, round, stopped)$ GameState
        +canStart() boolean
        +canStopTime() boolean
        +canResume() boolean
        +start() GameState
        +stopTime() GameState
        +resume() GameState
        +startBreak() GameState
        +endBreak() GameState
        +startOvertime() GameState
        +finish() GameState
    }
    
    class GameStatus {
        <<Enumeration>>
        NOT_STARTED
        RUNNING
        TIME_STOPPED
        BREAK
        OVERTIME
        FINISHED
    }
    
    Game *-- Score : composition
    Game *-- GameTimer : composition
    Game --> GameState : uses
    Game --> GameStatus : has
    GameState --> GameStatus : has
    
    note for Game "Immuable:\nToutes les méthodes\nretournent nouvelle instance"
    note for Score "Dérivé:\nScore = rounds gagnés"
    note for GameTimer "Précis:\nendTimestamp évite drift"
```

---

## GameStateMachine (UI State Pattern)

```mermaid
classDiagram
    class GameStateMachine {
        <<Static>>
        +getUIState(game)$ GameUIState | null
    }
    
    class GameUIState {
        <<Abstract>>
        #game: Game
        +getView()* GameStateView
    }
    
    class NotStartedState {
        +getView() GameStateView
    }
    
    class RunningState {
        +getView() GameStateView
    }
    
    class OvertimeRunningState {
        +getView() GameStateView
    }
    
    class StoppedState {
        +getView() GameStateView
    }
    
    class BreakState {
        +getView() GameStateView
    }
    
    class FinishedState {
        +getView() GameStateView
    }
    
    class GameStateView {
        <<Interface>>
        +badgeLabel: string
        +badgeColor: string
        +showDot: boolean
        +actions: ActionButton[]
        +activeTimerType: string
    }
    
    class ActionButton {
        <<Interface>>
        +label: string
        +actionId: string
        +styleType: ActionStyle
        +subType?: string
    }
    
    GameStateMachine ..> GameUIState : creates
    GameUIState <|-- NotStartedState
    GameUIState <|-- RunningState
    GameUIState <|-- OvertimeRunningState
    GameUIState <|-- StoppedState
    GameUIState <|-- BreakState
    GameUIState <|-- FinishedState
    GameUIState ..> GameStateView : produces
    GameStateView --> ActionButton : contains
    
    note for GameStateMachine "Factory:\nCrée le bon état\nselon Game.status"
    note for GameUIState "State Pattern:\nChaque état définit\nses propres actions"
```

---

## ArbitratorCommand Pattern

```mermaid
classDiagram
    class CommandType {
        <<Enumeration>>
        ADJUST_SCORE
        ADJUST_TIME
        UNDO_LAST_POINT
    }
    
    class ArbitratorCommand {
        <<Interface>>
        +type: CommandType
        +gameId: string
        +timestamp: number
        +reason?: string
    }
    
    class AdjustScoreCommand {
        +type: ADJUST_SCORE
        +gameId: string
        +timestamp: number
        +reason?: string
        +newScoreTeamA: number
        +newScoreTeamB: number
    }
    
    class AdjustTimeCommand {
        +type: ADJUST_TIME
        +gameId: string
        +timestamp: number
        +reason?: string
        +newTimeSeconds: number
    }
    
    class UndoLastPointCommand {
        +type: UNDO_LAST_POINT
        +gameId: string
        +timestamp: number
        +reason?: string
    }
    
    class PendingCommand {
        +readonly command: Command
        +readonly createdAt: number
        
        +isExpired(timeoutMs) boolean
    }
    
    ArbitratorCommand <|.. AdjustScoreCommand
    ArbitratorCommand <|.. AdjustTimeCommand
    ArbitratorCommand <|.. UndoLastPointCommand
    ArbitratorCommand --> CommandType : has
    PendingCommand --> ArbitratorCommand : wraps
    
    note for PendingCommand "Validation explicite:\nCommande en attente\nde validation arbitre"
```

---

## Repository Pattern (Ports & Adapters)

```mermaid
classDiagram
    class IGameRepository {
        <<Interface - Port>>
        +save(game)* Promise~void~
        +findById(id)* Promise~Game | null~
        +findAll()* Promise~Game[]~
        +delete(id)* Promise~void~
    }
    
    class GameRepository {
        <<Adapter>>
        -db: SQLiteDatabase
        
        +save(game) Promise~void~
        +findById(id) Promise~Game | null~
        +findAll() Promise~Game[]~
        +delete(id) Promise~void~
        -toEntity(row) Game
        -toRow(game) object
    }
    
    class IEventStore {
        <<Interface - Port>>
        +append(event)* Promise~void~
        +getEvents(aggregateId)* Promise~DomainEvent[]~
        +getAllEvents()* Promise~DomainEvent[]~
    }
    
    class EventStore {
        <<Adapter>>
        -db: SQLiteDatabase
        
        +append(event) Promise~void~
        +getEvents(aggregateId) Promise~DomainEvent[]~
        +getAllEvents() Promise~DomainEvent[]~
    }
    
    IGameRepository <|.. GameRepository : implements
    IEventStore <|.. EventStore : implements
    
    note for IGameRepository "Port (Domain):\nDéfinit le contrat"
    note for GameRepository "Adapter (Infrastructure):\nImplémente avec SQLite"
```

---

## Use Case Pattern

```mermaid
classDiagram
    class ScorePointUseCase {
        -gameRepository: IGameRepository
        -eventStore: IEventStore
        
        +execute(input) Promise~void~
    }
    
    class ScorePointInput {
        +gameId: string
        +teamId: 'teamA' | 'teamB'
    }
    
    class AdjustScoreUseCase {
        -gameRepository: IGameRepository
        -eventStore: IEventStore
        
        +execute(input) Promise~void~
    }
    
    class AdjustScoreInput {
        +gameId: string
        +newScoreTeamA: number
        +newScoreTeamB: number
        +reason: string
    }
    
    ScorePointUseCase --> ScorePointInput : uses
    ScorePointUseCase --> IGameRepository : depends on
    ScorePointUseCase --> IEventStore : depends on
    ScorePointUseCase --> Game : uses
    ScorePointUseCase --> PointScoredEvent : emits
    
    AdjustScoreUseCase --> AdjustScoreInput : uses
    AdjustScoreUseCase --> IGameRepository : depends on
    AdjustScoreUseCase --> IEventStore : depends on
    AdjustScoreUseCase --> Game : uses
    AdjustScoreUseCase --> ScoreCorrectedEvent : emits
    
    note for ScorePointUseCase "Use Case simple:\n1. Load game\n2. Increment score\n3. Save\n4. Emit event"
    note for AdjustScoreUseCase "Use Case avec validation:\n1. Vérifier timer arrêté\n2. Load game\n3. Update score\n4. Save\n5. Emit event"
```

---

## Domain Events

```mermaid
classDiagram
    class DomainEvent {
        <<Interface>>
        +aggregateId: string
        +timestamp: number
    }
    
    class GameEvent {
        <<Interface>>
        +aggregateId: GameId
        +timestamp: number
    }
    
    class GameCreatedEvent {
        +type: 'GameCreated'
        +aggregateId: GameId
        +timestamp: number
        +payload: object
    }
    
    class PointScoredEvent {
        +type: 'PointScored'
        +aggregateId: GameId
        +timestamp: number
        +payload: object
    }
    
    class ScoreCorrectedEvent {
        +type: 'ScoreCorrected'
        +aggregateId: GameId
        +timestamp: number
        +payload: object
    }
    
    class GameFinishedEvent {
        +type: 'GameFinished'
        +aggregateId: GameId
        +timestamp: number
        +payload: object
    }
    
    DomainEvent <|-- GameEvent
    GameEvent <|.. GameCreatedEvent
    GameEvent <|.. PointScoredEvent
    GameEvent <|.. ScoreCorrectedEvent
    GameEvent <|.. GameFinishedEvent
    
    note for DomainEvent "Base interface\npour tous les events"
    note for GameEvent "Events spécifiques\nau Game Aggregate"
```

---

## Zustand Store Structure

```mermaid
classDiagram
    class CoreStore {
        <<Interface>>
        +tournaments: Tournament[]
        +fields: Field[]
        +teams: Team[]
        +gameModes: GameMode[]
        +games: Game[]
        +currentGame: Game | null
        +isLoading: boolean
        +error: string | null
        
        +loadTournaments() Promise~void~
        +createTournament(data) Promise~void~
        +loadGames() Promise~void~
        +createGame(data) Promise~void~
        +startGame(id) Promise~void~
        +scorePoint(id, teamId) Promise~void~
        +finishGame(id) Promise~void~
    }
    
    class TournamentSlice {
        +tournaments: Tournament[]
        +selectedTournament: Tournament | null
        +loadTournaments() Promise~void~
        +createTournament(data) Promise~void~
        +updateTournament(id, data) Promise~void~
        +deleteTournament(id) Promise~void~
    }
    
    class GameSlice {
        +games: Game[]
        +currentGame: Game | null
        +loadGames() Promise~void~
        +loadGame(id) Promise~void~
        +createGame(data) Promise~void~
        +startGame(id) Promise~void~
        +stopGameTime(id) Promise~void~
        +resumeGame(id) Promise~void~
        +scorePoint(id, teamId) Promise~void~
        +adjustScore(id, a, b, reason) Promise~void~
        +startBreak(id, duration) Promise~void~
        +endBreak(id) Promise~void~
        +startOvertime(id) Promise~void~
        +adjustTime(id, seconds, reason) Promise~void~
        +finishGame(id, note) Promise~void~
    }
    
    CoreStore o-- TournamentSlice : contains
    CoreStore o-- GameSlice : contains
    
    note for CoreStore "Store global:\nCombine tous les slices"
    note for GameSlice "Slice le plus complexe:\n11 actions"
```

---

## Hooks Spécialisés

```mermaid
classDiagram
    class useGameStateMachine {
        <<Hook>>
        +game: Game | undefined
        
        -uiState: GameUIState | null
        -view: GameStateView | null
        -gameTimer: TimerController
        -breakTimer: TimerController
        -overtimeTimer: TimerController
        -activeTimer: TimerController
        
        +return: object
    }
    
    class useGameTimer {
        <<Hook>>
        +initialSeconds: number
        
        -remainingSeconds: number
        -isRunning: boolean
        -endTimestamp: number | null
        
        +start() void
        +stop() void
        +resume() void
        +reset(seconds?) void
        +setTime(seconds) void
        +syncWithDB(seconds, running, endTs) void
        +return: TimerController
    }
    
    class useArbitratorCommand {
        <<Hook>>
        -pendingCommand: PendingCommand | null
        
        +initiateCommand(command) void
        +validateCommand() Promise~void~
        +cancelCommand() void
        +return: object
    }
    
    class TimerController {
        <<Interface>>
        +remainingSeconds: number
        +isRunning: boolean
        +isFinished: boolean
        +formattedTime: string
        +start() void
        +stop() void
        +resume() void
        +setTime(seconds) void
    }
    
    useGameStateMachine --> useGameTimer : uses (x3)
    useGameStateMachine --> GameStateMachine : uses
    useGameTimer ..> TimerController : returns
    useArbitratorCommand --> PendingCommand : manages
    
    note for useGameStateMachine "Orchestration:\nGère 3 timers distincts\n(game, break, overtime)"
    note for useGameTimer "Précision:\nendTimestamp évite drift"
```

---

## Field Aggregate avec Matchup

```mermaid
classDiagram
    class Field {
        <<Aggregate Root>>
        -FieldId id
        -string tournamentId
        -string name
        -Matchup[] matchups
        
        +create(id, tournamentId, name, matchups?)$ Field
        +addMatchup(matchup) Field
        +removeMatchup(matchupId) Field
        +updateMatchup(matchup) Field
    }
    
    class Matchup {
        <<Entity>>
        -MatchupId id
        -TeamId teamA
        -TeamId teamB
        -number order
        -GameModeId gameModeId
        
        +create(id, teamA, teamB, order, gameModeId)$ Matchup
    }
    
    Field *-- Matchup : contains
    
    note for Field "Aggregate boundary:\nMatchup ne peut exister\nindépendamment"
    note for Matchup "Invariant:\nteamA ≠ teamB"
```

---

## GameMode avec Value Objects

```mermaid
classDiagram
    class GameMode {
        <<Aggregate Root>>
        -GameModeId id
        -string name
        -GameDuration gameTime
        -BreakDuration breakTime
        -OvertimeDuration overTime
        -ScoreLimit raceTo
        
        +create(id, name, gameTime, breakTime, raceTo, overTime?)$ GameMode
    }
    
    class GameDuration {
        <<Value Object>>
        +readonly minutes: number
        
        +constructor(minutes)
    }
    
    class BreakDuration {
        <<Value Object>>
        +readonly seconds: number
        
        +constructor(seconds)
    }
    
    class OvertimeDuration {
        <<Value Object>>
        +readonly minutes: number
        
        +constructor(minutes)
    }
    
    class ScoreLimit {
        <<Value Object>>
        +readonly value: number
        
        +constructor(value)
    }
    
    GameMode *-- GameDuration : composition
    GameMode *-- BreakDuration : composition
    GameMode *-- OvertimeDuration : composition
    GameMode *-- ScoreLimit : composition
    
    note for GameDuration "Validation:\nminutes >= 0"
    note for ScoreLimit "Validation:\nvalue >= 0"
```

---

## Dependency Injection

```mermaid
classDiagram
    class Dependencies {
        <<Object>>
        +repositories: Repositories
        +useCases: UseCases
    }
    
    class Repositories {
        +tournament: ITournamentRepository
        +field: IFieldRepository
        +team: ITeamRepository
        +gameMode: IGameModeRepository
        +game: IGameRepository
        +eventStore: IEventStore
    }
    
    class UseCases {
        +createTournament: CreateTournamentUseCase
        +createField: CreateFieldUseCase
        +createTeam: CreateTeamUseCase
        +createGameMode: CreateGameModeUseCase
        +createGame: CreateGameUseCase
        +startGame: StartGameUseCase
        +scorePoint: ScorePointUseCase
        +finishGame: FinishGameUseCase
    }
    
    Dependencies *-- Repositories : contains
    Dependencies *-- UseCases : contains
    UseCases --> Repositories : depends on
    
    note for Dependencies "Simple DI:\nInstanciation manuelle\ndes dépendances"
```

---

## Patterns Implémentés

### 1. Aggregate Pattern

**Exemple: Game**

```typescript
class Game {
  private constructor(...) {}  // Constructeur privé
  
  static create(...): Game {   // Factory method
    // Validation
    return new Game(...);
  }
  
  start(): Game {              // Méthode métier
    // Business logic
    return new Game(...);      // Nouvelle instance (immuable)
  }
}
```

**Bénéfices:**
- Encapsulation
- Invariants garantis
- Immuabilité

---

### 2. Value Object Pattern

**Exemple: Score**

```typescript
class Score {
  constructor(
    public readonly teamAScore: number,
    public readonly teamBScore: number
  ) {
    if (teamAScore < 0 || teamBScore < 0) {
      throw new Error("Score cannot be negative");
    }
  }
  
  incrementTeamA(): Score {
    return new Score(this.teamAScore + 1, this.teamBScore);
  }
}
```

**Caractéristiques:**
- Immuable (readonly)
- Validation dans constructeur
- Méthodes retournent nouvelles instances

---

### 3. State Pattern

**Exemple: GameStateMachine**

```typescript
abstract class GameUIState {
  constructor(protected game: Game) {}
  abstract getView(): GameStateView;
}

class RunningState extends GameUIState {
  getView(): GameStateView {
    return {
      badgeLabel: "RUNNING",
      badgeColor: "#34C759",
      actions: [{ label: "Stop", actionId: "STOP_MATCH" }]
    };
  }
}
```

**Bénéfices:**
- Comportement spécifique par état
- Transitions explicites
- Facilite l'ajout de nouveaux états

---

### 4. Command Pattern

**Exemple: ArbitratorCommand**

```typescript
interface ArbitratorCommand {
  type: CommandType;
  gameId: string;
  timestamp: number;
  reason?: string;
}

class PendingCommand {
  constructor(public readonly command: Command) {}
}

// Utilisation
const command: AdjustScoreCommand = {
  type: CommandType.ADJUST_SCORE,
  gameId: "123",
  newScoreTeamA: 3,
  newScoreTeamB: 1,
  reason: "erreur arbitre"
};

const pending = new PendingCommand(command);
// UI affiche validation
// Si validé → execute
// Si annulé → discard
```

**Bénéfices:**
- Validation explicite
- Traçabilité
- Annulation possible

---

### 5. Repository Pattern

**Exemple: GameRepository**

```typescript
// Port (Domain)
interface IGameRepository {
  save(game: Game): Promise<void>;
  findById(id: GameId): Promise<Game | null>;
}

// Adapter (Infrastructure)
class GameRepository implements IGameRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async save(game: Game): Promise<void> {
    const row = this.toRow(game);
    await this.db.run("UPDATE games SET ...", row);
  }
  
  async findById(id: GameId): Promise<Game | null> {
    const row = await this.db.get("SELECT * FROM games WHERE id = ?", id);
    return row ? this.toEntity(row) : null;
  }
}
```

**Bénéfices:**
- Abstraction de la persistance
- Domain indépendant de la DB
- Testabilité (mocks faciles)

---

### 6. Factory Method Pattern

**Exemple: Game.create()**

```typescript
class Game {
  private constructor(...) {}  // Empêche new Game()
  
  static create(
    id: GameId,
    fieldId: FieldId,
    matchup: Matchup,
    gameMode: GameMode
  ): Game {
    // Validation
    if (!id || id.trim() === "") {
      throw new Error("Game ID cannot be empty");
    }
    
    // Initialisation
    const initialScore = new Score(0, 0);
    const initialTimer = new GameTimer(gameMode.gameTime.minutes * 60);
    
    // Création
    return new Game(
      id, fieldId, matchup, gameMode,
      initialScore, initialTimer,
      GameStatus.NOT_STARTED, 1, 0, GameStatus.NOT_STARTED
    );
  }
}
```

**Bénéfices:**
- Encapsulation de la logique de création
- Validation centralisée
- Initialisation cohérente

---

## Conventions de Code

### Naming

**Classes:**
- PascalCase: `Game`, `GameMode`, `ScorePointUseCase`

**Interfaces (Ports):**
- Préfixe `I`: `IGameRepository`, `IEventStore`

**Value Objects:**
- Nom descriptif: `Score`, `GameTimer`, `GameDuration`

**Events:**
- Suffixe `Event`: `GameCreatedEvent`, `PointScoredEvent`

**Use Cases:**
- Verbe + Nom: `CreateGame`, `ScorePoint`, `AdjustScore`

---

### Immutabilité

**Règle:** Toutes les méthodes du Domain retournent de nouvelles instances.

```typescript
// ❌ Mauvais (mutation)
game.score.teamAScore++;

// ✅ Bon (immuable)
const newScore = game.score.incrementTeamA();
const newGame = game.updateScore(newScore);
```

---

### Validation

**Règle:** Validation dans les constructeurs et factory methods.

```typescript
class GameTimer {
  constructor(public readonly remainingTime: number) {
    if (remainingTime < 0) {
      throw new Error("Remaining time cannot be negative");
    }
  }
}
```

---

### Async/Await

**Règle:** Toutes les opérations I/O sont async.

```typescript
async execute(input: ScorePointInput): Promise<void> {
  const game = await this.gameRepository.findById(input.gameId);
  const updatedGame = /* ... */;
  await this.gameRepository.save(updatedGame);
  await this.eventStore.append(event);
}
```

---

## Métriques de Code

### Complexité Cyclomatique

| Classe | Méthodes | Complexité Moyenne | Max |
|--------|----------|-------------------|-----|
| Game | 10 | 3 | 8 |
| GameState | 12 | 2 | 4 |
| GameStateMachine | 1 | 6 | 6 |
| ScorePointUseCase | 1 | 2 | 2 |
| GameRepository | 4 | 3 | 5 |

---

### Lignes de Code par Classe

| Classe | LOC | Commentaires | Ratio |
|--------|-----|--------------|-------|
| Game | 299 | 50 | 17% |
| GameState | 126 | 20 | 16% |
| GameStateMachine | 142 | 30 | 21% |
| useGameStateMachine | 63 | 15 | 24% |
| useGameTimer | 125 | 25 | 20% |

---

## Tests

### Exemple: Game Aggregate Test

```typescript
describe('Game', () => {
  it('should create a game with initial state', () => {
    const game = Game.create(id, fieldId, matchup, gameMode);
    
    expect(game.status).toBe(GameStatus.NOT_STARTED);
    expect(game.score.teamAScore).toBe(0);
    expect(game.score.teamBScore).toBe(0);
  });
  
  it('should increment score when point is scored', () => {
    const game = Game.create(...);
    const newScore = game.score.incrementTeamA();
    const updatedGame = game.updateScore(newScore);
    
    expect(updatedGame.score.teamAScore).toBe(1);
    expect(game.score.teamAScore).toBe(0); // Immuabilité
  });
  
  it('should throw error when modifying score while timer is running', () => {
    const game = Game.create(...).start();
    const newScore = new Score(5, 0);
    
    expect(() => game.updateScore(newScore)).toThrow();
  });
});
```

---

## Résumé

### Classes Principales

**Domain Layer (15):**
- 5 Aggregates: Tournament, Field, Team, GameMode, Game
- 3 Entities: Matchup, GameState
- 7 Value Objects: Score, GameTimer, GameDuration, BreakDuration, OvertimeDuration, ScoreLimit
- 2 Enums: GameStatus, CommandType

**Application Layer (27):**
- 27 Use Cases (4 + 4 + 3 + 3 + 13)

**Infrastructure Layer (7):**
- 5 Repositories
- 1 EventStore
- 1 SQLite Adapter

**Presentation Layer (50+):**
- 20+ Screens
- 26+ Components
- 9 Hooks
- 1 Context

---

### Patterns Utilisés

1. ✅ Aggregate Pattern
2. ✅ Value Object Pattern
3. ✅ State Pattern
4. ✅ Command Pattern
5. ✅ Repository Pattern (Ports & Adapters)
6. ✅ Factory Method Pattern
7. ✅ Dependency Injection (simple)
8. ✅ Event Sourcing

---

### Points Clés

- **Immuabilité stricte** dans Domain Layer
- **Clean Architecture** (dépendances vers Domain)
- **Type-safety** avec TypeScript strict
- **Validation** dans constructeurs
- **Testabilité** maximale (Domain pur)

---

## Références

- **Niveau précédent:** [C3 - Component Diagram](c3-component.md)
- **Architecture DDD:** [Context Map](../ddd/context-map.md)
- **Code source:** `src/core/domain/`, `src/core/useCases/`, `src/infrastructure/`
