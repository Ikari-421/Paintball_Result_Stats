import { Field, Matchup } from "../../../core/domain/Field";

<<<<<<< HEAD
describe('Field', () => {
    describe('Matchup', () => {
        it('should create a valid matchup', () => {
            const matchup = Matchup.create('matchup-1', 'team-a', 'team-b', 1, 'mode-1');

            expect(matchup.id).toBe('matchup-1');
            expect(matchup.teamA).toBe('team-a');
            expect(matchup.teamB).toBe('team-b');
            expect(matchup.order).toBe(1);
            expect(matchup.gameModeId).toBe('mode-1');
        });

        it('should throw error if id is empty', () => {
            expect(() => Matchup.create('', 'team-a', 'team-b', 1, 'mode-1')).toThrow('Matchup ID cannot be empty');
        });

        it('should throw error if teamA is empty', () => {
            expect(() => Matchup.create('matchup-1', '', 'team-b', 1, 'mode-1')).toThrow('Team A ID cannot be empty');
        });

        it('should throw error if teamB is empty', () => {
            expect(() => Matchup.create('matchup-1', 'team-a', '', 1, 'mode-1')).toThrow('Team B ID cannot be empty');
        });

        it('should throw error if teamA and teamB are the same', () => {
            expect(() => Matchup.create('matchup-1', 'team-a', 'team-a', 1, 'mode-1')).toThrow('Team A and Team B must be different');
        });

        it('should throw error if order is negative', () => {
            expect(() => Matchup.create('matchup-1', 'team-a', 'team-b', -1, 'mode-1')).toThrow('Order cannot be negative');
        });

        it('should throw error if gameModeId is empty', () => {
            expect(() => Matchup.create('matchup-1', 'team-a', 'team-b', 1, '')).toThrow('GameMode ID cannot be empty');
        });
    });

    describe('create', () => {
        it('should create a valid field without matchups', () => {
            const field = Field.create('field-1', 'Court Central');

            expect(field.id).toBe('field-1');
            expect(field.name).toBe('Court Central');
            expect(field.matchups).toEqual([]);
        });

        it('should create a valid field with matchups', () => {
            const matchup = Matchup.create('matchup-1', 'team-a', 'team-b', 1, 'mode-1');
            const field = Field.create('field-1', 'Court Central', [matchup]);

            expect(field.matchups.length).toBe(1);
            expect(field.matchups[0].id).toBe('matchup-1');
        });

        it('should throw error if id is empty', () => {
            expect(() => Field.create('', 'Court Central')).toThrow('Field ID cannot be empty');
        });

        it('should throw error if name is empty', () => {
            expect(() => Field.create('field-1', '')).toThrow('Field name cannot be empty');
        });
    });

    describe('addMatchup', () => {
        it('should add a matchup to the field', () => {
            const field = Field.create('field-1', 'Court Central');
            const matchup = Matchup.create('matchup-1', 'team-a', 'team-b', 1, 'mode-1');
            const updated = field.addMatchup(matchup);

            expect(updated.matchups.length).toBe(1);
            expect(updated.matchups[0].id).toBe('matchup-1');
        });

        it('should preserve existing matchups when adding new one', () => {
            const matchup1 = Matchup.create('matchup-1', 'team-a', 'team-b', 1, 'mode-1');
            const field = Field.create('field-1', 'Court Central', [matchup1]);

            const matchup2 = Matchup.create('matchup-2', 'team-c', 'team-d', 2, 'mode-1');
            const updated = field.addMatchup(matchup2);

            expect(updated.matchups.length).toBe(2);
        });
    });

    describe('removeMatchup', () => {
        it('should remove a matchup from the field', () => {
            const matchup1 = Matchup.create('matchup-1', 'team-a', 'team-b', 1, 'mode-1');
            const matchup2 = Matchup.create('matchup-2', 'team-c', 'team-d', 2, 'mode-1');
            const field = Field.create('field-1', 'Court Central', [matchup1, matchup2]);

            const updated = field.removeMatchup('matchup-1');

            expect(updated.matchups.length).toBe(1);
            expect(updated.matchups[0].id).toBe('matchup-2');
        });

        it('should return field unchanged if matchup not found', () => {
            const matchup = Matchup.create('matchup-1', 'team-a', 'team-b', 1, 'mode-1');
            const field = Field.create('field-1', 'Court Central', [matchup]);

            const updated = field.removeMatchup('non-existent');

            expect(updated.matchups.length).toBe(1);
        });
=======
describe("Field", () => {
  describe("Matchup", () => {
    it("should create a valid matchup", () => {
      const matchup = Matchup.create(
        "matchup-1",
        "team-a",
        "team-b",
        1,
        "mode-1",
      );

      expect(matchup.id).toBe("matchup-1");
      expect(matchup.teamA).toBe("team-a");
      expect(matchup.teamB).toBe("team-b");
      expect(matchup.order).toBe(1);
      expect(matchup.gameModeId).toBe("mode-1");
    });

    it("should throw error if id is empty", () => {
      expect(() => Matchup.create("", "team-a", "team-b", 1, "mode-1")).toThrow(
        "Matchup ID cannot be empty",
      );
    });

    it("should throw error if teamA is empty", () => {
      expect(() =>
        Matchup.create("matchup-1", "", "team-b", 1, "mode-1"),
      ).toThrow("Team A ID cannot be empty");
    });

    it("should throw error if teamB is empty", () => {
      expect(() =>
        Matchup.create("matchup-1", "team-a", "", 1, "mode-1"),
      ).toThrow("Team B ID cannot be empty");
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10
    });

    it("should throw error if teamA and teamB are the same", () => {
      expect(() =>
        Matchup.create("matchup-1", "team-a", "team-a", 1, "mode-1"),
      ).toThrow("Team A and Team B must be different");
    });

    it("should throw error if order is negative", () => {
      expect(() =>
        Matchup.create("matchup-1", "team-a", "team-b", -1, "mode-1"),
      ).toThrow("Order cannot be negative");
    });

    it("should throw error if gameModeId is empty", () => {
      expect(() =>
        Matchup.create("matchup-1", "team-a", "team-b", 1, ""),
      ).toThrow("GameMode ID cannot be empty");
    });
  });

  describe("create", () => {
    it("should create a valid field without matchups", () => {
      const field = Field.create("field-1", "Court Central");

      expect(field.id).toBe("field-1");
      expect(field.name).toBe("Court Central");
      expect(field.matchups).toEqual([]);
    });

    it("should create a valid field with matchups", () => {
      const matchup = Matchup.create(
        "matchup-1",
        "team-a",
        "team-b",
        1,
        "mode-1",
      );
      const field = Field.create("field-1", "Court Central", [matchup]);

      expect(field.matchups.length).toBe(1);
      expect(field.matchups[0].id).toBe("matchup-1");
    });

    it("should throw error if id is empty", () => {
      expect(() => Field.create("", "Court Central")).toThrow(
        "Field ID cannot be empty",
      );
    });

    it("should throw error if name is empty", () => {
      expect(() => Field.create("field-1", "")).toThrow(
        "Field name cannot be empty",
      );
    });
  });

  describe("addMatchup", () => {
    it("should add a matchup to the field", () => {
      const field = Field.create("field-1", "Court Central");
      const matchup = Matchup.create(
        "matchup-1",
        "team-a",
        "team-b",
        1,
        "mode-1",
      );
      const updated = field.addMatchup(matchup);

      expect(updated.matchups.length).toBe(1);
      expect(updated.matchups[0].id).toBe("matchup-1");
    });

    it("should preserve existing matchups when adding new one", () => {
      const matchup1 = Matchup.create(
        "matchup-1",
        "team-a",
        "team-b",
        1,
        "mode-1",
      );
      const field = Field.create("field-1", "Court Central", [matchup1]);

      const matchup2 = Matchup.create(
        "matchup-2",
        "team-c",
        "team-d",
        2,
        "mode-1",
      );
      const updated = field.addMatchup(matchup2);

      expect(updated.matchups.length).toBe(2);
    });
  });

  describe("removeMatchup", () => {
    it("should remove a matchup from the field", () => {
      const matchup1 = Matchup.create(
        "matchup-1",
        "team-a",
        "team-b",
        1,
        "mode-1",
      );
      const matchup2 = Matchup.create(
        "matchup-2",
        "team-c",
        "team-d",
        2,
        "mode-1",
      );
      const field = Field.create("field-1", "Court Central", [
        matchup1,
        matchup2,
      ]);

      const updated = field.removeMatchup("matchup-1");

      expect(updated.matchups.length).toBe(1);
      expect(updated.matchups[0].id).toBe("matchup-2");
    });

    it("should return field unchanged if matchup not found", () => {
      const matchup = Matchup.create(
        "matchup-1",
        "team-a",
        "team-b",
        1,
        "mode-1",
      );
      const field = Field.create("field-1", "Court Central", [matchup]);

      const updated = field.removeMatchup("non-existent");

      expect(updated.matchups.length).toBe(1);
    });
  });
});
