// Type aliases for readability
export type FieldId = string;

// Note: Matchup should be defined, or we can use a basic type for now
import { TeamId } from './Team';

export type MatchupId = string;

export class Matchup {
    constructor(
        public readonly id: MatchupId,
        public readonly teamA: TeamId,
        public readonly teamB: TeamId,
        public readonly order: number
    ) { }
}

export class Field {
    constructor(
        public readonly id: FieldId,
        public readonly name: string,
        public readonly matchups: Matchup[]
    ) { }
}
