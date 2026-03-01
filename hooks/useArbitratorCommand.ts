import { useState } from 'react';
import { Command, PendingCommand } from '@/src/core/domain/ArbitratorCommand';

export function useArbitratorCommand() {
    const [pendingCommand, setPendingCommand] = useState<PendingCommand | null>(null);

    const proposeCommand = (command: Command) => {
        setPendingCommand(new PendingCommand(command));
    };

    const validateCommand = () => {
        const command = pendingCommand;
        setPendingCommand(null);
        return command;
    };

    const cancelCommand = () => {
        setPendingCommand(null);
    };

    const hasPendingCommand = (): boolean => {
        return pendingCommand !== null;
    };

    return {
        pendingCommand,
        proposeCommand,
        validateCommand,
        cancelCommand,
        hasPendingCommand,
    };
}
