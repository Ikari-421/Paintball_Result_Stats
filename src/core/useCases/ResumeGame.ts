import { IGameRepository } from '../ports/IGameRepository';
import { IEventStore } from '../ports/IEventStore';
import { Game } from '../domain/Game';
import { DomainGameEvent } from '../domain/events/GameEvents';

export class ResumeGame {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) {}

    async execute(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const resumedGame = game.resume();
        
        await this.gameRepository.save(resumedGame);

        const event: DomainGameEvent = {
            aggregateId: resumedGame.id,
            timestamp: Date.now(),
            type: 'GameResumed',
            payload: {
                remainingTime: resumedGame.timer.remainingTime
            }
        };

        await this.eventStore.append(event);

        return resumedGame;
    }
}
