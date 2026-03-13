import { Game } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, ScoreLimit } from "@/src/core/domain/GameMode";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { EndBreak } from "@/src/core/useCases/EndBreak";
import { StartBreak } from "@/src/core/useCases/StartBreak";

describe("Break Lifecycle UseCases", () => {
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

    it("should start a break", async () => {
        const useCase = new StartBreak(mockGameRepo, mockEventStore);
        const game = Game.create("g-1", "f-1", matchup, gameMode).start();
        mockGameRepo.findById.mockResolvedValue(game);

        await useCase.execute("g-1");

        expect(mockGameRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            status: GameStatus.BREAK
        }));
    });

    it("should end a break", async () => {
        const useCase = new EndBreak(mockGameRepo, mockEventStore);
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().startBreak();
        mockGameRepo.findById.mockResolvedValue(game);

        await useCase.execute("g-1");

        const savedGame = mockGameRepo.save.mock.calls[0][0];
        expect(savedGame.status).not.toBe(GameStatus.BREAK);
        expect(savedGame.isTimeStopped).toBe(1); // Ends break but stays stopped until RESUME
    });
});
