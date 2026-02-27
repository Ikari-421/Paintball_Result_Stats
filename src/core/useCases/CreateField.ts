import { IFieldRepository } from '../ports/IFieldRepository';
import { IEventStore } from '../ports/IEventStore';
import { Field } from '../domain/Field';
import { DomainFieldEvent } from '../domain/events/FieldEvents';

export class CreateField {
    constructor(
        private fieldRepository: IFieldRepository,
        private eventStore: IEventStore
    ) {}

    async execute(id: string, name: string): Promise<Field> {
        const field = Field.create(id, name);
        
        await this.fieldRepository.save(field);

        const event: DomainFieldEvent = {
            aggregateId: field.id,
            timestamp: Date.now(),
            type: 'FieldCreated',
            payload: {
                name: field.name
            }
        };

        await this.eventStore.append(event);

        return field;
    }
}
