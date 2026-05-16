import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EngineerDashboard({ user }) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [faultReports, setFaultReports] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'Working',
    department: 'general',
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

  const deleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return
    try {
      await axios.delete(`http://localhost:3000/equipment/${id}`)
      await fetchEquipment()
    } catch (error) {
      console.error('Error deleting equipment:', error)
    }
  }

  const resolveFault = async (id) => {
    try {
      const fault = faultReports.find(r => r.id === id)
      await axios.patch(`http://localhost:3000/faults/${id}`, { status: 'Resolved' })
      if (fault.equipment_id) {
        await axios.patch(`http://localhost:3000/equipment/${fault.equipment_id}`, { status: 'Working' })
      }
      const faultRes = await axios.get('http://localhost:3000/faults')
      setFaultReports(faultRes.data)
      await fetchEquipment()
    } catch (error) {
      console.error('Error resolving fault:', error)
    }
  }

  const severityBadge = (severity) => {
    const styles = {
      'CRITICAL': 'bg-red-600 text-white',
      'Urgent': 'bg-yellow-400 text-black',
      'Routine': 'bg-green-200 text-green-800',
    }
    return `px-2 py-1 rounded-full text-xs font-bold ${styles[severity] || styles['Routine']}`
  }

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Open Faults</p>
          <p className="text-3xl font-bold text-red-600">{faultReports.filter(r => r.status === 'Open').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Equipment</p>
          <p className="text-3xl font-bold text-green-600">{equipmentList.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Faulty Equipment</p>
          <p className="text-3xl font-bold text-yellow-600">{equipmentList.filter(e => e.status !== 'Working').length}</p>
        </div>
      </div>

      {/* Fault Reports */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🚨 Fault Reports</h2>
          <div className="flex gap-2">
            {['Open', 'Resolved', 'All'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-full text-sm font-semibold border transition ${
                  filter === f
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Reported By</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Severity</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedFaults.map((report) => (
                <tr key={report.id} className={`border-b border-gray-100 ${report.severity === 'CRITICAL' ? 'bg-red-50' : ''}`}>
                  <td className="py-3 pr-4 text-gray-500">#{report.id}</td>
                  <td className="py-3 pr-4 font-medium">{report.reported_by}</td>
                  <td className="py-3 pr-4 text-gray-600">{report.role}</td>
                  <td className="py-3 pr-4">
                    <span className={severityBadge(report.severity)}>
                      {report.severity || 'Routine'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 max-w-xs">
                    {report.description.startsWith('[UNLISTED MACHINE:') ? (
                      <span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded mr-1">
                          ⚠️ Unlisted
                        </span>
                        {report.description.replace(/\[UNLISTED MACHINE:.*?\] - /, '')}
                      </span>
                    ) : report.description}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{new Date(report.date_reported).toLocaleString()}</td>
                  <td className="py-3">
                    {report.status === 'Open' ? (
                      <button
                        onClick={() => resolveFault(report.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-lg transition">
                        ✓ Resolve
                      </button>
                    ) : (
                      <span className="text-green-600 font-bold text-xs">✅ Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedFaults.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    No fault reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Form */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">➕ Log New Equipment</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <input
            type="text" name="name" placeholder="Equipment Name"
            value={formData.name} onChange={handleInputChange} required
            className="flex-1 min-w-40 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text" name="location" placeholder="Location"
            value={formData.location} onChange={handleInputChange} required
            className="flex-1 min-w-40 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select name="status" value={formData.status} onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Working">Working</option>
            <option value="Maintenance Required">Maintenance Required</option>
            <option value="Out of Order">Out of Order</option>
          </select>
          <select name="department" value={formData.department} onChange={handleInputChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="general">General</option>
            <option value="dialysis">Dialysis</option>
          </select>
          <button type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg text-sm transition">
            Add Asset
          </button>
        </form>
      </div>

      {/* Equipment Inventory */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📦 Current Inventory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Location</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Last Checked</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-500">#{item.id}</td>
                  <td className="py-3 pr-4 font-medium">{item.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{item.location}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Working'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'Maintenance Required'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{item.last_checked}</td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteEquipment(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg transition">
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
              {equipmentList.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No equipment logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}