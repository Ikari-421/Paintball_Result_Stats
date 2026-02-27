import { Game, GameId } from '../domain/Game';

export interface IGameRepository {
    save(game: Game): Promise<void>;
    findById(id: GameId): Promise<Game | null>;
    findAll(): Promise<Game[]>;
    delete(id: GameId): Promise<void>;
}
