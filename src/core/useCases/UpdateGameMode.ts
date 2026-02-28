import { GameModeUpdatedEvent } from "../domain/events/GameModeEvents";
import {
    BreakDuration,
    GameDuration,
    GameMode,
    OvertimeDuration,
    ScoreLimit,
    TimeoutCount,
} from "../domain/GameMode";
import { IEventStore } from "../ports/IEventStore";
import { IGameModeRepository } from "../ports/IGameModeRepository";

export class UpdateGameMode {
  constructor(
    private gameModeRepository: IGameModeRepository,
    private eventStore: IEventStore,
  ) {}

  async execute(params: {
    id: string;
    name: string;
    gameTimeMinutes: number;
    breakTimeSeconds: number;
    timeOutsPerTeam: number;
    raceTo: number;
    overtimeMinutes?: number;
  }): Promise<GameMode> {
    const existingGameMode = await this.gameModeRepository.findById(params.id);
    if (!existingGameMode) {
      throw new Error(`GameMode with id ${params.id} not found`);
    }

    const gameTime = new GameDuration(params.gameTimeMinutes);
    const breakTime = new BreakDuration(params.breakTimeSeconds);
    const timeOuts = new TimeoutCount(params.timeOutsPerTeam);
    const raceTo = new ScoreLimit(params.raceTo);
    const overTime = params.overtimeMinutes
      ? new OvertimeDuration(params.overtimeMinutes)
      : undefined;

    const updatedGameMode = GameMode.create(
      params.id,
      params.name,
      gameTime,
      breakTime,
      timeOuts,
      raceTo,
      overTime,
    );

    await this.gameModeRepository.save(updatedGameMode);

    const event: GameModeUpdatedEvent = {
      aggregateId: params.id,
      type: "GameModeUpdated",
      payload: {
        name: params.name,
        gameTimeMinutes: params.gameTimeMinutes,
        breakTimeSeconds: params.breakTimeSeconds,
        timeOutsPerTeam: params.timeOutsPerTeam,
        raceTo: params.raceTo,
        overtimeMinutes: params.overtimeMinutes,
      },
      timestamp: Date.now(),
    };

    await this.eventStore.append(event);

    return updatedGameMode;
  }
}
