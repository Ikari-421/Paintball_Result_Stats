import { Game } from '../domain/Game';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class StopGameTime {
    constructor(
        private readonly gameRepository: IGameRepository,
        private readonly eventStore: IEventStore,
    ) { }

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const updatedGame = game.stopTime();

        await this.gameRepository.save(updatedGame);

        const event: DomainGameEvent = {
            aggregateId: updatedGame.id,
            timestamp: Date.now(),
            gameTime: updatedGame.timer.remainingTime,
            type: 'GameTimeStopped',
            payload: {
                remainingTime: updatedGame.timer.remainingTime
            }
        };

        await this.eventStore.append(event);

        return updatedGame;
    }
}
