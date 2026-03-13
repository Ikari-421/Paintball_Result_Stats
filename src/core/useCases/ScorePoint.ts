import { Game } from '../domain/Game';
import { GameStatus } from '../domain/GameStatus';
import { TeamId } from '../domain/Team';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IGameRepository } from '../ports/IGameRepository';

export class ScorePoint {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) { }

    async execute(gameId: string, teamId: TeamId): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        let newScore;
        if (teamId === game.matchup.teamA) {
            newScore = game.score.incrementTeamA();
        } else if (teamId === game.matchup.teamB) {
            newScore = game.score.incrementTeamB();
        } else {
            throw new Error(`Team ${teamId} is not part of this game`);
        }

        let updatedGame = game.scorePoint(newScore);

        const raceTo = game.gameMode.raceTo.value;
        const hasScoreLimit = raceTo > 0;
        const hasReachedScoreLimit = hasScoreLimit && newScore.hasReachedLimit(raceTo);
        const shouldFinishFromScoreLimit =
            game.status !== GameStatus.FINISHED &&
            hasReachedScoreLimit &&
            // In Overtime (golden point), the flow is handled separately.
            game.status !== GameStatus.OVERTIME &&
            game.gameStateStatus !== GameStatus.OVERTIME;

        if (shouldFinishFromScoreLimit) {
            updatedGame = updatedGame.finish();
        }

        await this.gameRepository.save(updatedGame);

        const event: DomainGameEvent = {
            aggregateId: updatedGame.id,
            timestamp: Date.now(),
            gameTime: game.timer.remainingTime,
            type: 'PointScored',
            payload: {
                teamId,
                newScoreTeamA: newScore.teamAScore,
                newScoreTeamB: newScore.teamBScore,
                pointStartTime: game.pointStartTime,
                pointEndTime: game.timer.remainingTime
            }
        };

        await this.eventStore.append(event);

        if (shouldFinishFromScoreLimit) {
            const winnerTeamId: TeamId | null =
                updatedGame.score.teamAScore > updatedGame.score.teamBScore
                    ? updatedGame.matchup.teamA
                    : updatedGame.score.teamBScore > updatedGame.score.teamAScore
                        ? updatedGame.matchup.teamB
                        : null;

            const finishedEvent: DomainGameEvent = {
                aggregateId: updatedGame.id,
                timestamp: Date.now(),
                gameTime: updatedGame.timer.remainingTime,
                type: 'GameFinished',
                payload: {
                    finalScoreTeamA: updatedGame.score.teamAScore,
                    finalScoreTeamB: updatedGame.score.teamBScore,
                    winnerTeamId,
                    endReason: 'SCORE_LIMIT',
                    note: 'Target score reached'
                }
            };
            await this.eventStore.append(finishedEvent);
        }

        return updatedGame;
    }
}
