import { BreakDuration, GameDuration, GameMode, OvertimeDuration, ScoreLimit } from '../domain/GameMode';
import { DomainGameModeEvent } from '../domain/events/GameModeEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameModeRepository } from '../ports/IGameModeRepository';

export interface CreateGameModeParams {
    id: string;
    name: string;
    gameTimeMinutes: number;
    breakTimeSeconds: number;
    raceTo: number;
    overtimeMinutes?: number;
}

export class CreateGameMode {
    constructor(
        private gameModeRepository: IGameModeRepository,
        private eventStore: IEventStore
    ) { }

    async execute(params: CreateGameModeParams): Promise<GameMode> {
        const gameMode = GameMode.create(
            params.id,
            params.name,
            new GameDuration(params.gameTimeMinutes),
            new BreakDuration(params.breakTimeSeconds),
            new ScoreLimit(params.raceTo),
            params.overtimeMinutes !== undefined ? new OvertimeDuration(params.overtimeMinutes) : undefined
        );

        await this.gameModeRepository.save(gameMode);

        const event: DomainGameModeEvent = {
            aggregateId: gameMode.id,
            timestamp: Date.now(),
            type: 'GameModeCreated',
            payload: {
                name: gameMode.name,
                gameTimeMinutes: gameMode.gameTime.minutes,
                breakTimeSeconds: gameMode.breakTime.seconds,
                overtimeMinutes: gameMode.overTime?.minutes,
                raceTo: gameMode.raceTo.value
            }
        };

        await this.eventStore.append(event);

        return gameMode;
    }
}
