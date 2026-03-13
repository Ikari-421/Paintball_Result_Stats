import { Field, Matchup } from "@/src/core/domain/Field";
import { IFieldRepository } from "@/src/core/ports/IFieldRepository";
import { ReorderMatchupsUseCase } from "@/src/core/useCases/ReorderMatchupsUseCase";

describe("ReorderMatchupsUseCase", () => {
    let mockFieldRepo: jest.Mocked<IFieldRepository>;
    let useCase: ReorderMatchupsUseCase;

    beforeEach(() => {
        mockFieldRepo = {
            findById: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn()
        };
        useCase = new ReorderMatchupsUseCase(mockFieldRepo);
    });

    it("should reorder matchups in a field", async () => {
        const matchup1 = Matchup.create("m-1", "t-a", "t-b", 0, "gm-1");
        const matchup2 = Matchup.create("m-2", "t-c", "t-d", 1, "gm-1");
        const field = Field.create("f-1", "t-1", "Field 1", [matchup1, matchup2]);

        mockFieldRepo.findById.mockResolvedValue(field);

        await useCase.execute("f-1", ["m-2", "m-1"]);

        expect(mockFieldRepo.save).toHaveBeenCalled();
        const savedField = mockFieldRepo.save.mock.calls[0][0];
        expect(savedField.matchups[0].id).toBe("m-2");
        expect(savedField.matchups[0].order).toBe(0);
        expect(savedField.matchups[1].id).toBe("m-1");
        expect(savedField.matchups[1].order).toBe(1);
    });

    it("should throw error if matchup count mismatch", async () => {
        const matchup1 = Matchup.create("m-1", "t-a", "t-b", 0, "gm-1");
        const field = Field.create("f-1", "t-1", "Field 1", [matchup1]);
        mockFieldRepo.findById.mockResolvedValue(field);

        await expect(useCase.execute("f-1", ["m-1", "m-2"])).rejects.toThrow("Mismatch in matchups length");
    });

    it("should throw if field not found", async () => {
        mockFieldRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute("invalid", ["m-1"])).rejects.toThrow("Field with ID invalid not found");
    });
});
