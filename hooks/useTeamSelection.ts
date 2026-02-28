import { useState } from 'react';

export const useTeamSelection = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const selectTeam = (teamId: string) => setSelectedTeamId(teamId);
  const clearSelection = () => setSelectedTeamId(null);
  const isSelected = (teamId: string) => selectedTeamId === teamId;
  
  return { selectedTeamId, selectTeam, clearSelection, isSelected };
};
