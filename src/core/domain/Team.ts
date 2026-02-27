// Type alias for better readability
export type TeamId = string;

export class Team {
    constructor(
        public readonly id: TeamId,
        public readonly name: string,
        public readonly isGuest: boolean
    ) { }
}
