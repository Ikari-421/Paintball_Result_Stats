import { Field } from '../domain/Field';
import { IFieldRepository } from '../ports/IFieldRepository';
import { IEventStore } from '../ports/IEventStore';
import { FieldUpdatedEvent } from '../domain/events/FieldEvents';

export class UpdateField {
  constructor(
    private fieldRepository: IFieldRepository,
    private eventStore: IEventStore
  ) {}

  async execute(id: string, name: string): Promise<Field> {
    const existingField = await this.fieldRepository.findById(id);
    if (!existingField) {
      throw new Error(`Field with id ${id} not found`);
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Field name cannot be empty');
    }

    // Preserve matchups when updating
    let updatedField = Field.create(id, name.trim());
    existingField.matchups.forEach(matchup => {
      updatedField = updatedField.addMatchup(matchup);
    });

    await this.fieldRepository.save(updatedField);

    const event: FieldUpdatedEvent = {
      aggregateId: id,
      type: 'FieldUpdated',
      payload: {
        name: name.trim(),
      },
      timestamp: Date.now(),
    };

    await this.eventStore.append(event);

    return updatedField;
  }
}
