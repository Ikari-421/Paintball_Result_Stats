import { IGameRepository } from '../ports/IGameRepository';
import { IGameModeRepository } from '../ports/IGameModeRepository';
import { IFieldRepository } from '../ports/IFieldRepository';
import { IEventStore } from '../ports/IEventStore';
import { Game } from '../domain/Game';
import { Matchup } from '../domain/Field';
import { DomainGameEvent } from '../domain/events/GameEvents';

export interface CreateGameParams {
    id: string;
    fieldId: string;
    matchupId: string;
    teamAId: string;
    teamBId: string;
    matchupOrder: number;
    gameModeId: string;
}

export class CreateGame {
    constructor(
        private gameRepository: IGameRepository,
        private gameModeRepository: IGameModeRepository,
        private fieldRepository: IFieldRepository,
        private eventStore: IEventStore
    ) {}

    async execute(params: CreateGameParams): Promise<Game> {
        const gameMode = await this.gameModeRepository.findById(params.gameModeId);
        if (!gameMode) {
            throw new Error(`GameMode with id ${params.gameModeId} not found`);
        }

        const field = await this.fieldRepository.findById(params.fieldId);
        if (!field) {
            throw new Error(`Field with id ${params.fieldId} not found`);
        }

        const matchup = Matchup.create(
            params.matchupId,
            params.teamAId,
            params.teamBId,
            params.matchupOrder
        );

        const game = Game.create(params.id, params.fieldId, matchup, gameMode);
        
        await this.gameRepository.save(game);

        const event: DomainGameEvent = {
            aggregateId: game.id,
            timestamp: Date.now(),
            type: 'GameCreated',
            payload: {
                fieldId: game.fieldId,
                matchupId: matchup.id,
                gameModeId: gameMode.id
            }
        };

        await this.eventStore.append(event);

        return game;
    }
}
