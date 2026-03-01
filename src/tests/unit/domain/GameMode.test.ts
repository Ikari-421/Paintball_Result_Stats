import { BreakDuration, GameDuration, GameMode, OvertimeDuration, ScoreLimit } from '../../../core/domain/GameMode';

describe('GameMode', () => {
    describe('Value Objects', () => {
        it('should create valid GameDuration', () => {
            const duration = new GameDuration(10);
            expect(duration.minutes).toBe(10);
        });

        it('should throw error for negative GameDuration', () => {
            expect(() => new GameDuration(-5)).toThrow('Game duration cannot be negative');
        });

        it('should create valid BreakDuration', () => {
            const duration = new BreakDuration(30);
            expect(duration.seconds).toBe(30);
        });

        it('should throw error for negative BreakDuration', () => {
            expect(() => new BreakDuration(-10)).toThrow('Break duration cannot be negative');
        });

        it('should create valid OvertimeDuration', () => {
            const duration = new OvertimeDuration(5);
            expect(duration.minutes).toBe(5);
        });

        it('should throw error for negative OvertimeDuration', () => {
            expect(() => new OvertimeDuration(-3)).toThrow('Overtime duration cannot be negative');
        });

        it('should allow zero ScoreLimit', () => {
            const limit = new ScoreLimit(0);
            expect(limit.value).toBe(0);
        });

        it('should throw error for negative ScoreLimit', () => {
            expect(() => new ScoreLimit(-5)).toThrow('Score limit must be zero or positive');
        });
    });

    describe('create', () => {
        it('should create a valid GameMode without overtime', () => {
            const gameMode = GameMode.create(
                'mode-1',
                'Quick Match',
                new GameDuration(10),
                new BreakDuration(30),
                new ScoreLimit(5)
            );

            expect(gameMode.id).toBe('mode-1');
            expect(gameMode.name).toBe('Quick Match');
            expect(gameMode.gameTime.minutes).toBe(10);
            expect(gameMode.breakTime.seconds).toBe(30);
            expect(gameMode.raceTo.value).toBe(5);
            expect(gameMode.overTime).toBeUndefined();
        });

        it('should create a valid GameMode with overtime', () => {
            const gameMode = GameMode.create(
                'mode-2',
                'Tournament',
                new GameDuration(15),
                new BreakDuration(60),
                new ScoreLimit(10),
                new OvertimeDuration(5)
            );

            expect(gameMode.overTime?.minutes).toBe(5);
        });

        it('should throw error if id is empty', () => {
            expect(() =>
                GameMode.create(
                    '',
                    'Quick Match',
                    new GameDuration(10),
                    new BreakDuration(30),
                    new ScoreLimit(5)
                )
            ).toThrow('GameMode ID cannot be empty');
        });

        it('should throw error if name is empty', () => {
            expect(() =>
                GameMode.create(
                    'mode-1',
                    '',
                    new GameDuration(10),
                    new BreakDuration(30),
                    new ScoreLimit(5)
                )
            ).toThrow('GameMode name cannot be empty');
        });
    });
});
