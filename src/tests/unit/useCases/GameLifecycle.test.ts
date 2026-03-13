import { Game } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, ScoreLimit } from "@/src/core/domain/GameMode";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { ResumeGame } from "@/src/core/useCases/ResumeGame";
import { StartGame } from "@/src/core/useCases/StartGame";
import { StopGameTime } from "@/src/core/useCases/StopGameTime";

describe("Game Lifecycle UseCases", () => {
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
    });

    describe("StartGame", () => {
        it("should start a notched game", async () => {
            const useCase = new StartGame(mockGameRepo, mockEventStore);
            const game = Game.create("g-1", "f-1", matchup, gameMode);
            mockGameRepo.findById.mockResolvedValue(game);

            const result = await useCase.execute("g-1");

            expect(result.status).toBe(GameStatus.RUNNING);
            expect(mockGameRepo.save).toHaveBeenCalled();
            expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "GameStarted" }));
        });
    });

    describe("StopGameTime", () => {
        it("should stop game time", async () => {
            const useCase = new StopGameTime(mockGameRepo, mockEventStore);
            const game = Game.create("g-1", "f-1", matchup, gameMode).start();
            mockGameRepo.findById.mockResolvedValue(game);

            const result = await useCase.execute("g-1");

            expect(result.isTimeStopped).toBe(1);
            expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "GameTimeStopped" }));
        });
    });

    describe("ResumeGame", () => {
        it("should resume a stopped match", async () => {
            const useCase = new ResumeGame(mockGameRepo, mockEventStore);
            const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
            mockGameRepo.findById.mockResolvedValue(game);

            const result = await useCase.execute("g-1");

            expect(result.isTimeStopped).toBe(0);
            expect(result.status).toBe(GameStatus.RUNNING);
            expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "GameResumed" }));
        });
    });
});
