import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('scoreboard_pb.db');

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
  `);
};
