import { IFieldRepository } from '../ports/IFieldRepository';
import { IEventStore } from '../ports/IEventStore';
import { FieldDeletedEvent } from '../domain/events/FieldEvents';

export class DeleteField {
  constructor(
    private fieldRepository: IFieldRepository,
    private eventStore: IEventStore
  ) {}

  async execute(id: string): Promise<void> {
    const existingField = await this.fieldRepository.findById(id);
    if (!existingField) {
      throw new Error(`Field with id ${id} not found`);
    }

    // Prevent deletion if field has matchups
    if (existingField.matchups.length > 0) {
      throw new Error('Cannot delete field with existing matchups');
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
