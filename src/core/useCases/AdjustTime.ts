import { Game, GameTimer } from '../domain/Game';
import { GameStatus } from '../domain/GameStatus';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class AdjustTime {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) { }

    async execute(gameId: string, newTimeSeconds: number, reason: string): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        if (game.status === GameStatus.RUNNING) {
            throw new Error('Cannot adjust time while game is running. Stop the game time first.');
        }

        if (newTimeSeconds < 0) {
            throw new Error('Time cannot be negative');
        }

        const previousTime = game.timer.remainingTime;
        const newTimer = new GameTimer(newTimeSeconds, game.timer.isRunning);
        const updatedGame = game.updateTimer(newTimer);

        await this.gameRepository.save(updatedGame);

        const event: DomainGameEvent = {
            aggregateId: updatedGame.id,
            timestamp: Date.now(),
            type: 'TimerAdjusted',
            payload: {
                previousTime,
                newTime: newTimeSeconds,
                reason
            }
        };

        await this.eventStore.append(event);

        return updatedGame;
    }
}
