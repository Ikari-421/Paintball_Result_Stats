import { Game } from '../domain/Game';
import { SidesSwappedEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class SwapSides {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) { }

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const updatedGame = game.swapSides();

        await this.gameRepository.save(updatedGame);

        const event: SidesSwappedEvent = {
            aggregateId: updatedGame.id,
            timestamp: Date.now(),
            gameTime: game.timer.remainingTime,
            type: 'SidesSwapped',
            payload: {
                areSidesSwapped: updatedGame.areSidesSwapped
            }
        };

        await this.eventStore.append(event);

        return updatedGame;
    }
}
