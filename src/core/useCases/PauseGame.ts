import { IGameRepository } from '../ports/IGameRepository';
import { IEventStore } from '../ports/IEventStore';
import { Game } from '../domain/Game';
import { DomainGameEvent } from '../domain/events/GameEvents';

export class PauseGame {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) {}

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const pausedGame = game.pause();
        
        await this.gameRepository.save(pausedGame);

        const event: DomainGameEvent = {
            aggregateId: pausedGame.id,
            timestamp: Date.now(),
            type: 'GamePaused',
            payload: {
                remainingTime: pausedGame.timer.remainingTime
            }
        };

        await this.eventStore.append(event);

        return pausedGame;
    }
}
