import { Game } from '../domain/Game';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class StartBreak {
    constructor(
        private readonly gameRepository: IGameRepository,
        private readonly eventStore: IEventStore,
    ) { }

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const breakGame = game.startBreak();
        await this.gameRepository.save(breakGame);

        await this.eventStore.append({
            aggregateId: breakGame.id,
            timestamp: Date.now(),
            type: 'GameTimeStopped', // Or a new BreakStarted event if needed
            payload: { remainingTime: breakGame.timer.remainingTime }
        });

        return breakGame;
    }
}
