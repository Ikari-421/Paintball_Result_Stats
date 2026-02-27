import { Team, TeamId } from '../domain/Team';

export interface ITeamRepository {
    save(team: Team): Promise<void>;
    findById(id: TeamId): Promise<Team | null>;
    findAll(): Promise<Team[]>;
    delete(id: TeamId): Promise<void>;
}
