import { IEventStore } from '../ports/IEventStore';
import { ITournamentRepository } from '../ports/ITournamentRepository';

export class DeleteTournament {
    constructor(
        private tournamentRepository: ITournamentRepository,
        private eventStore: IEventStore
    ) { }

    async execute(id: string): Promise<void> {
        await this.tournamentRepository.delete(id);

        await this.eventStore.append({
            aggregateId: id,
            timestamp: Date.now(),
            type: 'TournamentDeleted',
            payload: {}
        });
    }
}
