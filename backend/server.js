const express = require('express')
const cors = require('cors')
const db = require('./database')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})

// --- EQUIPMENT ROUTES ---

// Get all equipment
app.get('/equipment', (req, res) => {
  const equipment = db.prepare('SELECT * FROM equipment').all()
  res.json(equipment)
})

// Add new equipment
app.post('/equipment', (req, res) => {
  const { name, location, status, last_checked } = req.body
  const result = db.prepare(`
    INSERT INTO equipment (name, location, status, last_checked)
    VALUES (?, ?, ?, ?)
  `).run(name, location, status, last_checked)
  res.json({ id: result.lastInsertRowid, message: 'Equipment added!' })
})

// --- FAULT REPORT ROUTES ---

// Get all fault reports
app.get('/faults', (req, res) => {
  const faults = db.prepare('SELECT * FROM fault_reports').all()
  res.json(faults)
})

// Submit a fault report
app.post('/faults', (req, res) => {
  const { equipment_id, reported_by, role, description } = req.body
  const result = db.prepare(`
    INSERT INTO fault_reports (equipment_id, reported_by, role, description)
    VALUES (?, ?, ?, ?)
  `).run(equipment_id, reported_by, role, description)
  res.json({ id: result.lastInsertRowid, message: 'Fault reported!' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})