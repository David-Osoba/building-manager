const db = require('./database')

const dialysisEquipment = [
  { name: 'Dialyzer', location: 'Dialysis Unit', status: 'Working', department: 'dialysis' },
  { name: 'Blood Line', location: 'Dialysis Unit', status: 'Working', department: 'dialysis' },
  { name: 'Normal Saline', location: 'Dialysis Unit', status: 'Working', department: 'dialysis' },
  { name: 'Acid Concentrate', location: 'Dialysis Unit', status: 'Working', department: 'dialysis' },
  { name: 'Base Concentrate', location: 'Dialysis Unit', status: 'Working', department: 'dialysis' },
  { name: 'Dialysis Filters', location: 'Dialysis Unit', status: 'Working', department: 'dialysis' },
  { name: 'Dialysis Water Pump', location: 'Dialysis Unit', status: 'Working', department: 'general' },
]

const insert = db.prepare(`
  INSERT OR IGNORE INTO equipment (name, location, status, last_checked, department)
  VALUES (?, ?, ?, ?, ?)
`)

const today = new Date().toISOString().split('T')[0]

for (const item of dialysisEquipment) {
  insert.run(item.name, item.location, item.status, today, item.department)
}

console.log('Dialysis equipment added!')