import { Field, FieldId } from '../domain/Field';

export interface IFieldRepository {
    save(field: Field): Promise<void>;
    findById(id: FieldId): Promise<Field | null>;
    findAll(): Promise<Field[]>;
    delete(id: FieldId): Promise<void>;
}
