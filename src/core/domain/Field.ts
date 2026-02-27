import { TeamId } from "./Team";

export type FieldId = string;
export type MatchupId = string;

export class Matchup {
  private constructor(
    public readonly id: MatchupId,
    public readonly teamA: TeamId,
    public readonly teamB: TeamId,
    public readonly order: number,
  ) {}

  static create(
    id: MatchupId,
    teamA: TeamId,
    teamB: TeamId,
    order: number,
  ): Matchup {
    if (!id || id.trim() === "") {
      throw new Error("Matchup ID cannot be empty");
    }
    if (!teamA || teamA.trim() === "") {
      throw new Error("Team A ID cannot be empty");
    }
    if (!teamB || teamB.trim() === "") {
      throw new Error("Team B ID cannot be empty");
    }
    if (teamA === teamB) {
      throw new Error("Team A and Team B must be different");
    }
    if (order < 0) {
      throw new Error("Order cannot be negative");
    }

    return new Matchup(id, teamA, teamB, order);
  }
}

export class Field {
  private constructor(
    public readonly id: FieldId,
    public readonly name: string,
    public readonly matchups: Matchup[],
  ) {}

  static create(id: FieldId, name: string, matchups: Matchup[] = []): Field {
    if (!id || id.trim() === "") {
      throw new Error("Field ID cannot be empty");
    }
    if (!name || name.trim() === "") {
      throw new Error("Field name cannot be empty");
    }

    return new Field(id, name, matchups);
  }

  addMatchup(matchup: Matchup): Field {
    return new Field(this.id, this.name, [...this.matchups, matchup]);
  }

  removeMatchup(matchupId: MatchupId): Field {
    const updatedMatchups = this.matchups.filter((m) => m.id !== matchupId);
    return new Field(this.id, this.name, updatedMatchups);
  }
}
