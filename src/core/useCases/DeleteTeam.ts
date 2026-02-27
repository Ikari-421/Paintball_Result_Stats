import { ITeamRepository } from '../ports/ITeamRepository';
import { IEventStore } from '../ports/IEventStore';
import { TeamDeletedEvent } from '../domain/events/TeamEvents';

export class DeleteTeam {
  constructor(
    private teamRepository: ITeamRepository,
    private eventStore: IEventStore
  ) {}

  async execute(id: string): Promise<void> {
    const existingTeam = await this.teamRepository.findById(id);
    if (!existingTeam) {
      throw new Error(`Team with id ${id} not found`);
    }

    await this.teamRepository.delete(id);

    const event: TeamDeletedEvent = {
      aggregateId: id,
      type: 'TeamDeleted',
      payload: {},
      timestamp: Date.now(),
    };

    await this.eventStore.append(event);
  }
}
