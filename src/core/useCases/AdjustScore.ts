import { Game, Score } from '../domain/Game';
import { GameStatus } from '../domain/GameStatus';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class AdjustScore {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) { }

    async execute(
        gameId: string,
        newScoreTeamA: number,
        newScoreTeamB: number,
        reason: string
    ): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        if (game.status === GameStatus.RUNNING || game.status === GameStatus.OVERTIME) {
            if (game.isTimeStopped !== 1 && (game.isTimeStopped as any) !== true) {
                throw new Error(`Cannot adjust score while game timer is running (status: ${game.status}). Stop the game time first.`);
            }
        }

        if (newScoreTeamA < 0 || newScoreTeamB < 0) {
            throw new Error('Score cannot be negative');
        }

        const previousScore = game.score;
        const newScore = new Score(newScoreTeamA, newScoreTeamB);
        const updatedGame = game.updateScore(newScore);

        await this.gameRepository.save(updatedGame);

        const event: DomainGameEvent = {
            aggregateId: updatedGame.id,
            timestamp: Date.now(),
            type: 'ScoreCorrected',
            payload: {
                previousScoreTeamA: previousScore.teamAScore,
                previousScoreTeamB: previousScore.teamBScore,
                newScoreTeamA,
                newScoreTeamB,
                reason
            }
        };

        await this.eventStore.append(event);

        return updatedGame;
    }
}
