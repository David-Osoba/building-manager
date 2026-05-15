const db = require('./database')

const commonEquipment = [
  { name: 'Ventilator', location: 'ICU', status: 'Working' },
  { name: 'Defibrillator', location: 'Emergency', status: 'Working' },
  { name: 'Oxygen Tank', location: 'Floor 1', status: 'Working' },
  { name: 'Blood Pressure Monitor', location: 'Ward A', status: 'Working' },
  { name: 'ECG Machine', location: 'Cardiology', status: 'Working' },
  { name: 'Suction Machine', location: 'ICU', status: 'Working' },
  { name: 'Infusion Pump', location: 'Ward B', status: 'Working' },
  { name: 'Ultrasound Machine', location: 'Radiology', status: 'Working' },
  { name: 'X-Ray Machine', location: 'Radiology', status: 'Working' },
  { name: 'Fire Extinguisher', location: 'Floor 1', status: 'Working' },
  { name: 'Fire Extinguisher', location: 'Floor 2', status: 'Working' },
  { name: 'Fire Extinguisher', location: 'Floor 3', status: 'Working' },
  { name: 'Generator', location: 'Basement', status: 'Working' },
  { name: 'HVAC Unit', location: 'Roof', status: 'Working' },
  { name: 'Elevator', location: 'Main Lobby', status: 'Working' },
  { name: 'Sterilizer', location: 'Theatre', status: 'Working' },
  { name: 'Patient Monitor', location: 'ICU', status: 'Working' },
  { name: 'Nebulizer', location: 'Ward A', status: 'Working' },
]

const insert = db.prepare(`
  INSERT INTO equipment (name, location, status, last_checked)
  VALUES (?, ?, ?, ?)
`)

const today = new Date().toISOString().split('T')[0]

let added = 0
for (const item of commonEquipment) {
  const existing = db.prepare('SELECT id FROM equipment WHERE name = ? AND location = ?')
    .get(item.name, item.location)
  
  if (!existing) {
    insert.run(item.name, item.location, item.status, today)
    added++
  }
}

console.log(`Seed complete! ${added} items added.`)