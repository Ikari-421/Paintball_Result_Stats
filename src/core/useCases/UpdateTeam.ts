import { Team } from '../domain/Team';
import { ITeamRepository } from '../ports/ITeamRepository';
import { IEventStore } from '../ports/IEventStore';
import { TeamUpdatedEvent } from '../domain/events/TeamEvents';

export class UpdateTeam {
  constructor(
    private teamRepository: ITeamRepository,
    private eventStore: IEventStore
  ) {}

  async execute(id: string, name: string, isGuest: boolean): Promise<Team> {
    const existingTeam = await this.teamRepository.findById(id);
    if (!existingTeam) {
      throw new Error(`Team with id ${id} not found`);
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Team name cannot be empty');
    }

    const updatedTeam = Team.create(id, name.trim(), isGuest);
    await this.teamRepository.save(updatedTeam);

    const event: TeamUpdatedEvent = {
      aggregateId: id,
      type: 'TeamUpdated',
      payload: {
        name: name.trim(),
        isGuest,
      },
      timestamp: Date.now(),
    };

    await this.eventStore.append(event);

    return updatedTeam;
  }
}
