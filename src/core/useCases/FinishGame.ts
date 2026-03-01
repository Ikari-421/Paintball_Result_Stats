import { IGameRepository } from '../ports/IGameRepository';
import { IEventStore } from '../ports/IEventStore';
import { Game } from '../domain/Game';
import { TeamId } from '../domain/Team';
import { DomainGameEvent } from '../domain/events/GameEvents';

export class FinishGame {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) {}

    async execute(gameId: string, endReason: 'SCORE_LIMIT' | 'TIME_EXPIRED' | 'MANUAL'): Promise<Game> {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new Error(`Game with id ${gameId} not found`);
        }

        const finishedGame = game.finish();
        
        await this.gameRepository.save(finishedGame);

        let winnerTeamId: TeamId | null = null;
        if (finishedGame.score.teamAScore > finishedGame.score.teamBScore) {
            winnerTeamId = finishedGame.matchup.teamA;
        } else if (finishedGame.score.teamBScore > finishedGame.score.teamAScore) {
            winnerTeamId = finishedGame.matchup.teamB;
        }

        const event: DomainGameEvent = {
            aggregateId: finishedGame.id,
            timestamp: Date.now(),
            type: 'GameFinished',
            payload: {
                finalScoreTeamA: finishedGame.score.teamAScore,
                finalScoreTeamB: finishedGame.score.teamBScore,
                winnerTeamId,
                endReason
            }
        };

        await this.eventStore.append(event);

        return finishedGame;
    }
}
