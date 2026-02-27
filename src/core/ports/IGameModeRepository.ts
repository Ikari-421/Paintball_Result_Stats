import { GameMode, GameModeId } from '../domain/GameMode';

export interface IGameModeRepository {
    save(gameMode: GameMode): Promise<void>;
    findById(id: GameModeId): Promise<GameMode | null>;
    findAll(): Promise<GameMode[]>;
    delete(id: GameModeId): Promise<void>;
}
