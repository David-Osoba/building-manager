const db = require('./database')

const users = [
  { username: 'dialysis_eng', password: 'dialysis123', role: 'dialysis', name: 'Dialysis Engineer' },
  { username: 'duty_eng1', password: 'duty123', role: 'duty', name: 'Duty Engineer 1' },
  { username: 'duty_eng2', password: 'duty456', role: 'duty', name: 'Duty Engineer 2' },
  { username: 'duty_eng3', password: 'duty789', role: 'duty', name: 'Duty Engineer 3' },
]

const insert = db.prepare(`
  INSERT OR IGNORE INTO users (username, password, role, name)
  VALUES (?, ?, ?, ?)
`)

for (const user of users) {
  insert.run(user.username, user.password, user.role, user.name)
}

console.log('Users created!')