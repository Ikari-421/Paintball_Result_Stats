import { Game, Score } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, ScoreLimit } from "@/src/core/domain/GameMode";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { IEventStore } from "@/src/core/ports/IEventStore";
import { IGameRepository } from "@/src/core/ports/IGameRepository";
import { ScorePoint } from "@/src/core/useCases/ScorePoint";

describe("ScorePoint UseCase", () => {
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
    let scorePoint: ScorePoint;

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
        scorePoint = new ScorePoint(mockGameRepo, mockEventStore);
    });

    it("should increment score for team A and append event", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
        mockGameRepo.findById.mockResolvedValue(game);

        const result = await scorePoint.execute("g-1", "team-a");

        expect(result.score.teamAScore).toBe(1);
        expect(mockGameRepo.save).toHaveBeenCalled();
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({
            type: "PointScored",
            payload: expect.objectContaining({
                teamId: "team-a"
            })
        }));
    });

    it("should throw error if game not found", async () => {
        mockGameRepo.findById.mockResolvedValue(null);

        await expect(scorePoint.execute("invalid", "team-a")).rejects.toThrow("Game with id invalid not found");
    });

    it("should throw error if team is not in matchup", async () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
        mockGameRepo.findById.mockResolvedValue(game);

        await expect(scorePoint.execute("g-1", "team-unknown")).rejects.toThrow("Team team-unknown is not part of this game");
    });

    it("should finish match when reaching raceTo score limit", async () => {
        // Set score to 4-0 then score one more point to reach raceTo=5
        const game = Game.create("g-1", "f-1", matchup, gameMode)
            .start()
            .stopTime()
            .updateScore(new Score(4, 0));

        mockGameRepo.findById.mockResolvedValue(game);

        const result = await scorePoint.execute("g-1", "team-a");

        expect(result.status).toBe(GameStatus.FINISHED);
        expect(mockEventStore.append).toHaveBeenCalledWith(expect.objectContaining({ type: "GameFinished" }));
    });
});
