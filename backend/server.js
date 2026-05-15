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

app.post('/faults', (req, res) => {
  const { equipment_id, reported_by, role, description, severity, unlisted_name } = req.body
  
  let finalEquipmentId = equipment_id

  // If unlisted, auto-add it to the equipment table first
  if (!equipment_id && unlisted_name) {
    const result = db.prepare(`
      INSERT INTO equipment (name, location, status, last_checked)
      VALUES (?, ?, ?, ?)
    `).run(unlisted_name, 'Unknown - Please Update', 'Faulty', new Date().toISOString().split('T')[0])
    finalEquipmentId = result.lastInsertRowid
  }

  const result = db.prepare(`
    INSERT INTO fault_reports (equipment_id, reported_by, role, description, severity)
    VALUES (?, ?, ?, ?, ?)
  `).run(finalEquipmentId, reported_by, role, description, severity)

  res.json({ id: result.lastInsertRowid, message: 'Fault reported!' })
})
// Update fault report status
app.patch('/faults/:id', (req, res) => {
  const { status } = req.body
  db.prepare(`
    UPDATE fault_reports SET status = ? WHERE id = ?
  `).run(status, req.params.id)
  res.json({ message: 'Fault updated!' })
})
// Update equipment status
app.patch('/equipment/:id', (req, res) => {
const { status } = req.body
db.prepare(`
    UPDATE equipment SET status = ? WHERE id = ?
`).run(status, req.params.id)
res.json({ message: 'Equipment updated!' })
})

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
    .get(username, password)
  
  if (user) {
    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role, username: user.username }
    })
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' })
  }
})

// Get equipment by role
app.get('/equipment/role/:role', (req, res) => {
  const { role } = req.params
  let equipment

  if (role === 'dialysis') {
    equipment = db.prepare(`
      SELECT * FROM equipment 
      WHERE department = 'dialysis' OR name = 'Dialysis Water Pump'
    `).all()
  } else {
    equipment = db.prepare(`
      SELECT * FROM equipment 
      WHERE department = 'general'
    `).all()
  }
  res.json(equipment)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})