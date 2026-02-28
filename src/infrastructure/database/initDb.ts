import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("scoreboard_pb.db");

export const initDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aggregateId TEXT NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS game_modes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gameTimeMinutes INTEGER NOT NULL,
      breakTimeSeconds INTEGER NOT NULL,
      overtimeMinutes INTEGER,
      timeOutsPerTeam INTEGER NOT NULL,
      raceTo INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isGuest BOOLEAN NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS fields (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS matchups (
      id TEXT PRIMARY KEY,
      fieldId TEXT NOT NULL,
      teamA TEXT NOT NULL,
      teamB TEXT NOT NULL,
      orderIndex INTEGER NOT NULL,
      gameModeId TEXT NOT NULL,
      FOREIGN KEY (fieldId) REFERENCES fields(id),
      FOREIGN KEY (teamA) REFERENCES teams(id),
      FOREIGN KEY (teamB) REFERENCES teams(id),
      FOREIGN KEY (gameModeId) REFERENCES game_modes(id)
    );
    
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      fieldId TEXT NOT NULL,
      matchupId TEXT NOT NULL,
      matchupTeamA TEXT NOT NULL,
      matchupTeamB TEXT NOT NULL,
      matchupOrder INTEGER NOT NULL,
      gameModeId TEXT NOT NULL,
      gameModeName TEXT NOT NULL,
      gameTimeMinutes INTEGER NOT NULL,
      breakTimeSeconds INTEGER NOT NULL,
      overtimeMinutes INTEGER,
      timeOutsPerTeam INTEGER NOT NULL,
      raceTo INTEGER NOT NULL,
      teamAScore INTEGER NOT NULL,
      teamBScore INTEGER NOT NULL,
      remainingTime INTEGER NOT NULL,
      timerIsRunning INTEGER NOT NULL,
      status TEXT NOT NULL,
      currentRound INTEGER DEFAULT 1,
      isPaused INTEGER DEFAULT 0,
      gameStateStatus TEXT DEFAULT 'NOT_STARTED',
      FOREIGN KEY (fieldId) REFERENCES fields(id)
    );
  `);
};
