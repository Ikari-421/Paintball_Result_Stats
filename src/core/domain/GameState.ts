export enum GameStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  BREAK = 'BREAK',
  OVERTIME = 'OVERTIME',
  FINISHED = 'FINISHED',
  PAUSED = 'PAUSED'
}

export class GameState {
  private constructor(
    public readonly status: GameStatus,
    public readonly currentRound: number,
    public readonly isPaused: boolean
  ) {}

  static create(
    status: GameStatus = GameStatus.NOT_STARTED,
    currentRound: number = 0,
    isPaused: boolean = false
  ): GameState {
    if (currentRound < 0) {
      throw new Error('Current round cannot be negative');
    }

    return new GameState(status, currentRound, isPaused);
  }

  canStart(): boolean {
    return this.status === GameStatus.NOT_STARTED;
  }

  canPause(): boolean {
    return this.status === GameStatus.RUNNING || this.status === GameStatus.OVERTIME;
  }

  canResume(): boolean {
    return this.isPaused;
  }

  canStartBreak(): boolean {
    return this.status === GameStatus.RUNNING;
  }

  canStartOvertime(): boolean {
    return this.status === GameStatus.RUNNING || this.status === GameStatus.BREAK;
  }

  canFinish(): boolean {
    return this.status !== GameStatus.NOT_STARTED && this.status !== GameStatus.FINISHED;
  }

  start(): GameState {
    if (!this.canStart()) {
      throw new Error('Cannot start game from current state');
    }
    return new GameState(GameStatus.RUNNING, 1, false);
  }

  pause(): GameState {
    if (!this.canPause()) {
      throw new Error('Cannot pause game from current state');
    }
    return new GameState(this.status, this.currentRound, true);
  }

  resume(): GameState {
    if (!this.canResume()) {
      throw new Error('Cannot resume game from current state');
    }
    return new GameState(this.status, this.currentRound, false);
  }

  startBreak(): GameState {
    if (!this.canStartBreak()) {
      throw new Error('Cannot start break from current state');
    }
    return new GameState(GameStatus.BREAK, this.currentRound, false);
  }

  endBreak(): GameState {
    if (this.status !== GameStatus.BREAK) {
      throw new Error('Cannot end break when not in break');
    }
    return new GameState(GameStatus.RUNNING, this.currentRound + 1, false);
  }

  startOvertime(): GameState {
    if (!this.canStartOvertime()) {
      throw new Error('Cannot start overtime from current state');
    }
    return new GameState(GameStatus.OVERTIME, this.currentRound, false);
  }

  finish(): GameState {
    if (!this.canFinish()) {
      throw new Error('Cannot finish game from current state');
    }
    return new GameState(GameStatus.FINISHED, this.currentRound, false);
  }

  isRunning(): boolean {
    return (this.status === GameStatus.RUNNING || this.status === GameStatus.OVERTIME) && !this.isPaused;
  }

  isInProgress(): boolean {
    return this.status !== GameStatus.NOT_STARTED && this.status !== GameStatus.FINISHED;
  }
}
