import { Game } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, ScoreLimit } from "@/src/core/domain/GameMode";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { AdjustTime } from "@/src/core/useCases/AdjustTime";

describe("AdjustTime UseCase", () => {
    const gameMode = GameMode.create(
        "gm-1",
        "Standard",
        new GameDuration(10),
        new BreakDuration(30),
        new ScoreLimit(5)
    );

    const matchup = {
        id: "m-1",
        teamA: "team-a",
        teamB: "team-b",
        order: 1,
        gameModeId: "gm-1"
    };

    let mockGameRepo: jest.Mocked<IGameRepository>;
    let mockEventStore: jest.Mocked<IEventStore>;
    let adjustTime: AdjustTime;

    beforeEach(() => {
        mockGameRepo = {
            findById: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn()
        };
        mockEventStore = {
            append: jest.fn(),
            getEvents: jest.fn(),
            getAllEvents: jest.fn()
        } as any;
        adjustTime = new AdjustTime(mockGameRepo, mockEventStore);
    });

    it("should update game time and append event", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
        mockGameRepo.findById.mockResolvedValue(game);

        const result = await adjustTime.execute("g-1", 120, "Correction");

        expect(result.timer.remainingTime).toBe(120);
        expect(mockGameRepo.save).toHaveBeenCalled();
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({
            type: "TimerAdjusted",
            payload: expect.objectContaining({
                newTime: 120,
                reason: "Correction"
            })
        }));
    });

    it("should throw error if game is running", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start();
        mockGameRepo.findById.mockResolvedValue(game);

        await expect(adjustTime.execute("g-1", 120, "Reason")).rejects.toThrow("Cannot adjust time while game timer is running");
    });

    it("should throw error for negative time", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
        mockGameRepo.findById.mockResolvedValue(game);

        await expect(adjustTime.execute("g-1", -10, "Reason")).rejects.toThrow("Time cannot be negative");
    });
});
