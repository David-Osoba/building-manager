import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EngineerDashboard({ user }) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [faultReports, setFaultReports] = useState([]); 
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'Working',
    last_checked: new Date().toISOString().split('T')[0] 
  });
  const [filter, setFilter] = useState('Open')

  const fetchEquipment = async () => {
    const response = await axios.get(`http://localhost:3000/equipment/role/${user.role}`)
    setEquipmentList(response.data)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [equipRes, faultRes] = await Promise.all([
          axios.get(`http://localhost:3000/equipment/role/${user.role}`),
          axios.get('http://localhost:3000/faults')
        ]);
        setEquipmentList(equipRes.data);
        setFaultReports(faultRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/equipment', formData);
      await fetchEquipment();
      setFormData({ ...formData, name: '', location: '' }); 
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const filteredFaults = faultReports.filter(r => filter === 'All' ? true : r.status === filter)
  const sortedFaults = [...filteredFaults].sort((a, b) => {
    const weightA = { 'CRITICAL': 3, 'Urgent': 2, 'Routine': 1 }[a.severity] || 1;
    const weightB = { 'CRITICAL': 3, 'Urgent': 2, 'Routine': 1 }[b.severity] || 1;
    return weightB - weightA;
  });

  const resolveFault = async (id) => {
    try {
      const fault = faultReports.find(r => r.id === id)
      await axios.patch(`http://localhost:3000/faults/${id}`, { status: 'Resolved' })
      if (fault.equipment_id) {
        await axios.patch(`http://localhost:3000/equipment/${fault.equipment_id}`, { status: 'Working' })
      }
      const [faultRes] = await Promise.all([
        axios.get('http://localhost:3000/faults'),
      ])
      setFaultReports(faultRes.data)
      await fetchEquipment()
    } catch (error) {
      console.error('Error resolving fault:', error)
    }
  }

  return (
    <div>
      <h2>Engineer Dashboard: Command Center</h2>
      
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <h3 style={{ color: '#d9534f', margin: 0 }}>🚨 Fault Reports</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Open', 'Resolved', 'All'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                  fontWeight: filter === f ? 'bold' : 'normal',
                  backgroundColor: filter === f ? '#0056b3' : 'white',
                  color: filter === f ? 'white' : 'black'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', background: '#fffafb' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>Report ID</th>
              <th>Reported By</th>
              <th>Role</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedFaults.map((report) => (
              <tr key={report.id} style={{ 
                borderBottom: '1px solid #eee',
                backgroundColor: report.severity === 'CRITICAL' ? '#ffebee' : 'transparent'
              }}>
                <td>{report.id}</td>
                <td>{report.reported_by}</td>
                <td>{report.role}</td>
                <td>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: report.severity === 'CRITICAL' ? 'red' : report.severity === 'Urgent' ? 'gold' : 'lightgreen',
                    color: report.severity === 'CRITICAL' ? 'white' : 'black'
                  }}>
                    {report.severity || 'Routine'}
                  </span>
                </td>
                <td>
                  {report.description.startsWith('[UNLISTED MACHINE:') ? (
                    <span>
                      <span style={{ backgroundColor: '#fff3cd', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#856404' }}>
                        ⚠️ Unlisted
                      </span>
                      {' '}{report.description.replace(/\[UNLISTED MACHINE:.*?\] - /, '')}
                    </span>
                  ) : (
                    report.description
                  )}
                </td>
                <td>{new Date(report.date_reported).toLocaleString()}</td>
                <td>
                  {report.status === 'Open' ? (
                    <button 
                      onClick={() => resolveFault(report.id)}
                      style={{ 
                        backgroundColor: '#28a745', color: 'white', 
                        border: 'none', padding: '4px 10px', 
                        borderRadius: '4px', cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                      Mark Resolved
                    </button>
                  ) : (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Resolved</span>
                  )}
                </td>
              </tr>
            ))}
            {sortedFaults.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '15px' }}>No active faults. All clear!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: '30px 0', border: '1px solid #ddd' }} />

      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Log New Equipment</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" name="name" placeholder="Equipment Name" 
            value={formData.name} onChange={handleInputChange} required 
          />
          <input 
            type="text" name="location" placeholder="Location" 
            value={formData.location} onChange={handleInputChange} required 
          />
          <select name="status" value={formData.status} onChange={handleInputChange}>
            <option value="Working">Working</option>
            <option value="Maintenance Required">Maintenance Required</option>
            <option value="Out of Order">Out of Order</option>
          </select>
          <button type="submit" style={{ padding: '5px 15px', cursor: 'pointer' }}>Add Asset</button>
        </form>
      </div>

      <h3>Current Inventory</h3>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Last Checked</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.location}</td>
              <td>
                <span style={{ color: item.status === 'Working' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {item.status}
                </span>
              </td>
              <td>{item.last_checked}</td>
            </tr>
          ))}
          {equipmentList.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>No equipment logged yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}