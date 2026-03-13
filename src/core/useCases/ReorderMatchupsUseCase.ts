import { FieldId, MatchupId } from "../domain/Field";
import { IFieldRepository } from "../ports/IFieldRepository";

export class ReorderMatchupsUseCase {
    constructor(private fieldRepository: IFieldRepository) { }

    async execute(fieldId: FieldId, matchupIds: MatchupId[]): Promise<void> {
        if (!fieldId || fieldId.trim() === "") {
            throw new Error("Field ID is required");
        }
        if (!matchupIds || matchupIds.length === 0) {
            throw new Error("Matchup IDs cannot be empty");
        }

        const field = await this.fieldRepository.findById(fieldId);
        if (!field) {
            throw new Error(`Field with ID ${fieldId} not found`);
        }

        const currentMatchups = field.matchups;
        if (currentMatchups.length !== matchupIds.length) {
            throw new Error("Mismatch in matchups length");
        }

        // Reorder the matchups based on the new array of IDs
        const reorderedMatchups = matchupIds.map((id, index) => {
            const matchup = currentMatchups.find((m) => m.id === id);
            if (!matchup) {
                throw new Error(`Matchup with ID ${id} not found in field`);
            }
            // Assuming Matchup.create handles the assignment of the new order
            return Object.assign(Object.create(Object.getPrototypeOf(matchup)), matchup, { order: index });
        });

        const updatedField = Object.assign(Object.create(Object.getPrototypeOf(field)), field, { matchups: reorderedMatchups });

        await this.fieldRepository.save(updatedField);
    }
}
