import { Matchup } from '../../core/domain/Field';
import { Game, GameTimer, Score } from '../../core/domain/Game';
import { BreakDuration, GameDuration, GameMode, ScoreLimit, TimeoutCount } from '../../core/domain/GameMode';
import { GameStatus } from '../../core/domain/GameStatus';

describe('Domain Models Test', () => {
    it('should initialize a Game with correct default values', () => {
        const gameMode = new GameMode(
            'mode-1',
            'Test Mode',
            new GameDuration(10),
            new BreakDuration(60),
            new TimeoutCount(1),
            new ScoreLimit(5)
        );
        const matchup = new Matchup('matchup-1', 'teamA', 'teamB', 1);

        const game = new Game(
            'game-1',
            'field-1',
            matchup,
            gameMode,
            new Score(),
            new GameTimer(600)
        );

        expect(game.score.teamAScore).toBe(0);
        expect(game.status).toBe(GameStatus.NOT_STARTED);
    });
});
