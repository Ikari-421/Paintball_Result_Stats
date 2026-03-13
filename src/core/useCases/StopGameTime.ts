import { GameTimeStoppedEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class StopGameTime {
    constructor(
        private readonly gameRepository: IGameRepository,
        private readonly eventStore: IEventStore,
    ) { }

    async execute(gameId: string): Promise<void> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const stoppedGame = game.stopTime();

        await this.gameRepository.save(stoppedGame);

        const event: GameTimeStoppedEvent = {
            aggregateId: stoppedGame.id,
            timestamp: Date.now(),
            type: 'GameTimeStopped',
            payload: {
                remainingTime: stoppedGame.timer.remainingTime
            }
        };

        await this.eventStore.append(event);
    }
}
