import { Tournament } from '../domain/Tournament';
import { IEventStore } from '../ports/IEventStore';
import { ITournamentRepository } from '../ports/ITournamentRepository';

export class UpdateTournament {
    constructor(
        private tournamentRepository: ITournamentRepository,
        private eventStore: IEventStore
    ) { }

    async execute(id: string, name: string, location: string, startDate: Date, endDate: Date): Promise<void> {
        const tournament = Tournament.create(id, name, location, startDate, endDate);

        await this.tournamentRepository.save(tournament);

        await this.eventStore.append({
            aggregateId: tournament.id,
            timestamp: Date.now(),
            type: 'TournamentUpdated',
            payload: { name: tournament.name, location: tournament.location, startDate: tournament.startDate, endDate: tournament.endDate }
        });
    }
}
