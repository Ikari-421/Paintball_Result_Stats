import { Field } from "@/src/core/domain/Field";
import { GameMode } from "@/src/core/domain/GameMode";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IFieldRepository } from "@/src/core/ports/IFieldRepository";
import { IGameModeRepository } from "@/src/core/ports/IGameModeRepository";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { CreateGame, CreateGameParams } from "@/src/core/useCases/CreateGame";

describe("CreateGame UseCase", () => {
    let mockGameRepo: jest.Mocked<IGameRepository>;
    let mockGameModeRepo: jest.Mocked<IGameModeRepository>;
    let mockFieldRepo: jest.Mocked<IFieldRepository>;
    let mockEventStore: jest.Mocked<IEventStore>;
    let useCase: CreateGame;

    const gameMode: GameMode = {
        id: "gm-1",
        name: "Standard",
        gameTime: { minutes: 10, seconds: 0 },
        breakTime: { minutes: 0, seconds: 30 },
        raceTo: { value: 5 }
    };

    const field = Field.create("f-1", "t-1", "Field 1");

    beforeEach(() => {
        mockGameRepo = { findById: jest.fn(), save: jest.fn(), findAll: jest.fn(), delete: jest.fn() };
        mockGameModeRepo = { findById: jest.fn(), save: jest.fn(), findAll: jest.fn(), delete: jest.fn() };
        mockFieldRepo = { findById: jest.fn(), save: jest.fn(), findAll: jest.fn(), delete: jest.fn() };
        mockEventStore = { append: jest.fn(), getEventsByAggregateId: jest.fn(), getAllEvents: jest.fn() };
        useCase = new CreateGame(mockGameRepo, mockGameModeRepo, mockFieldRepo, mockEventStore);
    });

    it("should create a new game correctly", async () => {
        mockGameModeRepo.findById.mockResolvedValue(gameMode);
        mockFieldRepo.findById.mockResolvedValue(field);

        const params: CreateGameParams = {
            id: "g-1",
            fieldId: "f-1",
            matchupId: "m-1",
            teamAId: "t-a",
            teamBId: "t-b",
            matchupOrder: 0,
            gameModeId: "gm-1"
        };

        const result = await useCase.execute(params);

        expect(result.id).toBe("g-1");
        expect(result.status).toBe(GameStatus.NOT_STARTED);
        expect(mockGameRepo.save).toHaveBeenCalled();
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "GameCreated" }));
    });

    it("should throw if GameMode not found", async () => {
        mockGameModeRepo.findById.mockResolvedValue(null);
        const params: any = { gameModeId: "invalid" };

        await expect(useCase.execute(params)).rejects.toThrow("GameMode with id invalid not found");
    });
});
