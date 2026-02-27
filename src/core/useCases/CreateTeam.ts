import { ITeamRepository } from '../ports/ITeamRepository';
import { IEventStore } from '../ports/IEventStore';
import { Team } from '../domain/Team';
import { DomainTeamEvent } from '../domain/events/TeamEvents';

export class CreateTeam {
    constructor(
        private teamRepository: ITeamRepository,
        private eventStore: IEventStore
    ) {}

    async execute(id: string, name: string, isGuest: boolean = false): Promise<Team> {
        const team = Team.create(id, name, isGuest);
        
        await this.teamRepository.save(team);

        const event: DomainTeamEvent = {
            aggregateId: team.id,
            timestamp: Date.now(),
            type: 'TeamCreated',
            payload: {
                name: team.name,
                isGuest: team.isGuest
            }
        };

        await this.eventStore.append(event);

        return team;
    }
}
