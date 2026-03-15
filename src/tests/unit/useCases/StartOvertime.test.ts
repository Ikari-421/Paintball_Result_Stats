import { Game } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, OvertimeDuration, ScoreLimit } from "@/src/core/domain/GameMode";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { StartOvertime } from "@/src/core/useCases/StartOvertime";

describe("StartOvertime UseCase", () => {
    const gameMode = GameMode.create(
        "gm-1",
        "Standard",
        new GameDuration(10),
        new BreakDuration(30),
        new ScoreLimit(5),
        new OvertimeDuration(5)
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
    let useCase: StartOvertime;

    beforeEach(() => {
        mockGameRepo = { findById: jest.fn(), save: jest.fn(), findAll: jest.fn(), delete: jest.fn() };
        mockEventStore = { append: jest.fn(), getEvents: jest.fn(), getAllEvents: jest.fn() } as any;
        useCase = new StartOvertime(mockGameRepo, mockEventStore);
    });

    it("should start overtime", async () => {
        // Game must be started and then stopped before overtime
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
        mockGameRepo.findById.mockResolvedValue(game);

        const result = await useCase.execute("g-1");

        expect(result.status).toBe(GameStatus.OVERTIME);
        expect(result.isOvertime).toBe(true);
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "OvertimeStarted" }));
    });

    it("should start overtime from break", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().startBreak();
        mockGameRepo.findById.mockResolvedValue(game);

        const result = await useCase.execute("g-1");

        expect(result.status).toBe(GameStatus.OVERTIME);
        expect(result.isOvertime).toBe(true);
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "OvertimeStarted" }));
    });
});
