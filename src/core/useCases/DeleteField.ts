import { FieldDeletedEvent } from '../domain/events/FieldEvents';
import { IEventStore } from '../ports/IEventStore';
import { IFieldRepository } from '../ports/IFieldRepository';

export class DeleteField {
  constructor(
    private fieldRepository: IFieldRepository,
    private eventStore: IEventStore
  ) { }

  async execute(id: string): Promise<void> {
    const existingField = await this.fieldRepository.findById(id);
    if (!existingField) {
      throw new Error(`Field with id ${id} not found`);
    }

    await this.fieldRepository.delete(id);

    const event: FieldDeletedEvent = {
      aggregateId: id,
      type: 'FieldDeleted',
      payload: {},
      timestamp: Date.now(),
    };

    await this.eventStore.append(event);
  }
}
