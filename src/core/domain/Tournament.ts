export type TournamentId = string;

export class Tournament {
    private constructor(
        public readonly id: TournamentId,
        public readonly name: string,
        public readonly location: string,
        public readonly startDate: Date,
        public readonly endDate: Date,
    ) { }

    static create(id: TournamentId, name: string, location: string, startDate: Date, endDate: Date): Tournament {
        if (!id || id.trim() === "") {
            throw new Error("Tournament ID cannot be empty");
        }
        if (!name || name.trim() === "") {
            throw new Error("Tournament name cannot be empty");
        }
        if (!startDate || isNaN(startDate.getTime())) {
            throw new Error("Tournament must have a valid start date");
        }
        if (!endDate || isNaN(endDate.getTime())) {
            throw new Error("Tournament must have a valid end date");
        }
        if (endDate < startDate) {
            throw new Error("Tournament end date cannot be before start date");
        }

        return new Tournament(id, name, location, startDate, endDate);
    }
}
