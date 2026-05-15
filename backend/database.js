const Database = require('better-sqlite3')

const db = new Database('building.db')

// Create equipment table
db.exec(`
  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'Working',
    last_checked TEXT
  )
`)

// Create fault reports table
db.exec(`
  CREATE TABLE IF NOT EXISTS fault_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER,
    reported_by TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'Routine', -- NEW COLUMN
    status TEXT DEFAULT 'Open',
    date_reported TEXT DEFAULT (datetime('now'))
  )
`)

// Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL
  )
`)

// Add department column to equipment if it doesn't exist
try {
  db.exec(`ALTER TABLE equipment ADD COLUMN department TEXT DEFAULT 'general'`)
} catch(e) {
  // Column already exists, ignore
}

console.log('Database ready!')

module.exports = db