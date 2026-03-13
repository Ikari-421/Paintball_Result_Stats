import { Game } from '../domain/Game';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class StartGame {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) { }

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const startedGame = game.start();

        await this.gameRepository.save(startedGame);

        const event: DomainGameEvent = {
            aggregateId: startedGame.id,
            timestamp: Date.now(),
            gameTime: startedGame.timer.remainingTime,
            type: 'GameStarted',
            payload: {
                startTime: Date.now()
            }
        };

        await this.eventStore.append(event);

        return startedGame;
    }
}
