import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class EndBreak {
    constructor(
        private readonly gameRepository: IGameRepository,
        private readonly eventStore: IEventStore,
    ) { }

    async execute(gameId: string): Promise<void> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const resumedGame = game.endBreak();
        await this.gameRepository.save(resumedGame);

        await this.eventStore.append({
            aggregateId: resumedGame.id,
            timestamp: Date.now(),
            type: 'GameResumed', // Or BreakEnded event
            payload: { remainingTime: resumedGame.timer.remainingTime }
        });
    }
}
