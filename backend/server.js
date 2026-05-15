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

// Inside server.js
app.post('/faults', (req, res) => {
  // 1. Add severity to the destructured body
  const { equipment_id, reported_by, role, description, severity } = req.body;
  
  // 2. Add severity to the INSERT statement and values
  const result = db.prepare(`
    INSERT INTO fault_reports (equipment_id, reported_by, role, description, severity)
    VALUES (?, ?, ?, ?, ?)
  `).run(equipment_id, reported_by, role, description, severity || 'Routine');
  
  res.json({ id: result.lastInsertRowid, message: 'Fault reported!' });
});

// Update fault report status
app.patch('/faults/:id', (req, res) => {
  const { status } = req.body
  db.prepare(`
    UPDATE fault_reports SET status = ? WHERE id = ?
  `).run(status, req.params.id)
  res.json({ message: 'Fault updated!' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})