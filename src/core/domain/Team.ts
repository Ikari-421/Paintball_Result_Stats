export type TeamId = string;

export class Team {
  private constructor(
    public readonly id: TeamId,
    public readonly name: string,
    public readonly isGuest: boolean,
  ) {}

  static create(id: TeamId, name: string, isGuest: boolean = false): Team {
    if (!id || id.trim() === "") {
      throw new Error("Team ID cannot be empty");
    }
    if (!name || name.trim() === "") {
      throw new Error("Team name cannot be empty");
    }

    return new Team(id, name, isGuest);
  }
}
