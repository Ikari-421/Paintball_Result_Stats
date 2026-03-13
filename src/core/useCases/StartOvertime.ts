import { Game } from '../domain/Game';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class StartOvertime {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) { }

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const overtimeGame = game.startOvertime();

        await this.gameRepository.save(overtimeGame);

        const event: DomainGameEvent = {
            aggregateId: overtimeGame.id,
            timestamp: Date.now(),
            gameTime: game.timer.remainingTime,
            type: 'OvertimeStarted',
            payload: {
                overtimeDuration: overtimeGame.gameMode.overTime?.minutes || 5
            }
        };

        await this.eventStore.append(event);

        return overtimeGame;
    }
}
