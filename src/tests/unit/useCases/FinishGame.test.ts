import { Game } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, ScoreLimit } from "@/src/core/domain/GameMode";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { FinishGame } from "@/src/core/useCases/FinishGame";

describe("FinishGame UseCase", () => {
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
    let finishGame: FinishGame;

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
        finishGame = new FinishGame(mockGameRepo, mockEventStore);
    });

    it("should finish game and define winner A", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode);
        // Add some score
        const withScore = game.scorePoint(game.score.incrementTeamA());
        mockGameRepo.findById.mockResolvedValue(withScore);

        const result = await finishGame.execute("g-1", "MANUAL");

        expect(result.status).toBe(GameStatus.FINISHED);
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({
            type: "GameFinished",
            payload: expect.objectContaining({
                winnerTeamId: "team-a",
                endReason: "MANUAL"
            })
        }));
    });

    it("should finish game with a tie", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode);
        mockGameRepo.findById.mockResolvedValue(game);

        const result = await finishGame.execute("g-1", "TIME_EXPIRED");

        expect(result.status).toBe(GameStatus.FINISHED);
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({
            payload: expect.objectContaining({
                winnerTeamId: null,
                endReason: "TIME_EXPIRED"
            })
        }));
    });
});
