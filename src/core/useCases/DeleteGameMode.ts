import { IGameModeRepository } from '../ports/IGameModeRepository';
import { IEventStore } from '../ports/IEventStore';
import { GameModeDeletedEvent } from '../domain/events/GameModeEvents';

export class DeleteGameMode {
  constructor(
    private gameModeRepository: IGameModeRepository,
    private eventStore: IEventStore
  ) {}

  async execute(id: string): Promise<void> {
    const existingGameMode = await this.gameModeRepository.findById(id);
    if (!existingGameMode) {
      throw new Error(`GameMode with id ${id} not found`);
    }

    await this.gameModeRepository.delete(id);

    const event: GameModeDeletedEvent = {
      aggregateId: id,
      type: 'GameModeDeleted',
      payload: {},
      timestamp: Date.now(),
    };

    await this.eventStore.append(event);
  }
}
