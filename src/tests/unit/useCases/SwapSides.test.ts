import { Game } from "@/src/core/domain/Game";
import { GameMode } from "@/src/core/domain/GameMode";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { SwapSides } from "@/src/core/useCases/SwapSides";

describe("SwapSides UseCase", () => {
    const gameMode: GameMode = {
        id: "gm-1",
        name: "Standard",
        gameTime: { minutes: 10, seconds: 0 },
        breakTime: { minutes: 0, seconds: 30 },
        raceTo: { value: 5 }
    };

    const matchup = { id: "m-1", teamA: "t-a", teamB: "t-b", order: 1, gameModeId: "gm-1" };

    let mockGameRepo: jest.Mocked<IGameRepository>;
    let mockEventStore: jest.Mocked<IEventStore>;
    let useCase: SwapSides;

    beforeEach(() => {
        mockGameRepo = { findById: jest.fn(), save: jest.fn(), findAll: jest.fn(), delete: jest.fn() };
        mockEventStore = { append: jest.fn(), getEventsByAggregateId: jest.fn(), getAllEvents: jest.fn() };
        useCase = new SwapSides(mockGameRepo, mockEventStore);
    });

    it("should swap sides and log event", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode);
        mockGameRepo.findById.mockResolvedValue(game);

        const result = await useCase.execute("g-1");

        expect(result.areSidesSwapped).toBe(true);
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "SidesSwapped" }));

        // Swap back
        mockGameRepo.findById.mockResolvedValue(result);
        const result2 = await useCase.execute("g-1");
        expect(result2.areSidesSwapped).toBe(false);
    });
});
