import { Tournament } from "../domain/Tournament";

export interface ITournamentRepository {
    save(tournament: Tournament): Promise<void>;
    findById(id: string): Promise<Tournament | null>;
    findAll(): Promise<Tournament[]>;
    delete(id: string): Promise<void>;
}
