import { Team } from '../../../core/domain/Team';

describe('Team', () => {
    describe('create', () => {
        it('should create a valid team', () => {
            const team = Team.create('team-1', 'Team Alpha', false);

            expect(team.id).toBe('team-1');
            expect(team.name).toBe('Team Alpha');
            expect(team.isGuest).toBe(false);
        });

        it('should create a guest team', () => {
            const team = Team.create('team-2', 'Guest Team', true);

            expect(team.isGuest).toBe(true);
        });

        it('should throw error if id is empty', () => {
            expect(() => Team.create('', 'Team Alpha', false)).toThrow('Team ID cannot be empty');
        });

        it('should throw error if name is empty', () => {
            expect(() => Team.create('team-1', '', false)).toThrow('Team name cannot be empty');
        });

        it('should throw error if id is whitespace', () => {
            expect(() => Team.create('   ', 'Team Alpha', false)).toThrow('Team ID cannot be empty');
        });

        it('should throw error if name is whitespace', () => {
            expect(() => Team.create('team-1', '   ', false)).toThrow('Team name cannot be empty');
        });
    });
});
