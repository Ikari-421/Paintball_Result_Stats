import { IGameRepository } from '../ports/IGameRepository';
import { IEventStore } from '../ports/IEventStore';
import { Game } from '../domain/Game';
import { TeamId } from '../domain/Team';
import { DomainGameEvent } from '../domain/events/GameEvents';

export class ScorePoint {
    constructor(
        private gameRepository: IGameRepository,
        private eventStore: IEventStore
    ) {}

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

        const updatedGame = game.updateScore(newScore);
        
        await this.gameRepository.save(updatedGame);

        const event: DomainGameEvent = {
            aggregateId: updatedGame.id,
            timestamp: Date.now(),
            type: 'PointScored',
            payload: {
                teamId,
                newScoreTeamA: newScore.teamAScore,
                newScoreTeamB: newScore.teamBScore
            }
        };

        await this.eventStore.append(event);

        return updatedGame;
    }
}
