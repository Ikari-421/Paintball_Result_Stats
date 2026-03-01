<<<<<<< HEAD
import { Matchup } from '../domain/Field';
import { Game } from '../domain/Game';
import { DomainGameEvent } from '../domain/events/GameEvents';
import { IEventStore } from '../ports/IEventStore';
import { IFieldRepository } from '../ports/IFieldRepository';
import { IGameModeRepository } from '../ports/IGameModeRepository';
import { IGameRepository } from '../ports/IGameRepository';
=======
import { Matchup } from "../domain/Field";
import { Game } from "../domain/Game";
import { DomainGameEvent } from "../domain/events/GameEvents";
import { IEventStore } from "../ports/IEventStore";
import { IFieldRepository } from "../ports/IFieldRepository";
import { IGameModeRepository } from "../ports/IGameModeRepository";
import { IGameRepository } from "../ports/IGameRepository";
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10

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
<<<<<<< HEAD
    constructor(
        private gameRepository: IGameRepository,
        private gameModeRepository: IGameModeRepository,
        private fieldRepository: IFieldRepository,
        private eventStore: IEventStore
    ) { }
=======
  constructor(
    private gameRepository: IGameRepository,
    private gameModeRepository: IGameModeRepository,
    private fieldRepository: IFieldRepository,
    private eventStore: IEventStore,
  ) {}
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10

  async execute(params: CreateGameParams): Promise<Game> {
    console.log("[CreateGame] Début - params:", params);

<<<<<<< HEAD
        const field = await this.fieldRepository.findById(params.fieldId);
        if (!field) {
            throw new Error(`Field with id ${params.fieldId} not found`);
        }

        const matchup = Matchup.create(
            params.matchupId,
            params.teamAId,
            params.teamBId,
            params.matchupOrder,
            params.gameModeId
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
=======
    const gameMode = await this.gameModeRepository.findById(params.gameModeId);
    if (!gameMode) {
      console.error("[CreateGame] GameMode non trouvé:", params.gameModeId);
      throw new Error(`GameMode with id ${params.gameModeId} not found`);
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10
    }
    console.log("[CreateGame] GameMode trouvé:", gameMode.id, gameMode.name);

    const field = await this.fieldRepository.findById(params.fieldId);
    if (!field) {
      console.error("[CreateGame] Field non trouvé:", params.fieldId);
      throw new Error(`Field with id ${params.fieldId} not found`);
    }
    console.log("[CreateGame] Field trouvé:", field.id, field.name);

    const matchup = Matchup.create(
      params.matchupId,
      params.teamAId,
      params.teamBId,
      params.matchupOrder,
      params.gameModeId,
    );
    console.log("[CreateGame] Matchup créé:", matchup.id);

    const game = Game.create(params.id, params.fieldId, matchup, gameMode);
    console.log("[CreateGame] Game créé:", game.id, "status:", game.status);

    await this.gameRepository.save(game);
    console.log("[CreateGame] Game sauvegardé en DB");

    const event: DomainGameEvent = {
      aggregateId: game.id,
      timestamp: Date.now(),
      type: "GameCreated",
      payload: {
        fieldId: game.fieldId,
        matchupId: matchup.id,
        gameModeId: gameMode.id,
      },
    };

    await this.eventStore.append(event);

    return game;
  }
}
