import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MedicalStaffReport() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    equipment_id: '',
    reported_by: '',
    role: 'Nurse',
    description: '',
    severity: 'Routine' // Added severity to initial state
  });
  
  const [unlistedInfo, setUnlistedInfo] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('http://localhost:3000/equipment');
        setEquipmentList(response.data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };
    fetchEquipment();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      if (payload.equipment_id === 'unlisted') {
        payload.equipment_id = null; 
        payload.description = `[UNLISTED MACHINE: ${unlistedInfo}] - ${payload.description}`;
      }

      await axios.post('http://localhost:3000/faults', payload);
      setSuccessMessage('Fault report submitted successfully. Engineering has been notified.');
      
      // Reset the form, including returning severity to 'Routine'
      setFormData({
        equipment_id: '',
        reported_by: '',
        role: formData.role,
        description: '',
        severity: 'Routine'
      });
      setUnlistedInfo(''); 

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting fault report:', error);
      alert('Failed to submit report. Please check the connection.');
    }
  };

  return (
    <div>
      <h2>Medical Staff: Report a Fault</h2>
      <p>Use this form to notify the engineering team of any equipment malfunctions.</p>

      {successMessage && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ marginBottom: '8px' }}>Step 1: Select the Broken Machine</strong>
            <select 
              name="equipment_id" 
              value={formData.equipment_id} 
              onChange={handleInputChange} 
              required
              style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="" disabled>-- Select a machine --</option>
              <option value="unlisted" style={{ fontWeight: 'bold', color: 'blue' }}>
                -- Unlisted / Unknown Machine --
              </option>
              {equipmentList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Location: {item.location})
                </option>
              ))}
            </select>
          </label>
        </div>

        {formData.equipment_id === 'unlisted' && (
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeeba', animation: 'fadeIn 0.3s' }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ color: '#856404' }}>Machine Details (Name & Location):</strong>
              <input 
                type="text" 
                value={unlistedInfo} 
                onChange={(e) => setUnlistedInfo(e.target.value)} 
                required 
                placeholder="e.g., Blood Pressure Monitor in Room 102"
                style={{ padding: '8px', marginTop: '5px', border: '1px solid #ffeeba' }}
              />
            </label>
          </div>
        )}

        {formData.equipment_id && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fadeIn 0.5s' }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <strong>Your Name:</strong>
              <input 
                type="text" 
                name="reported_by" 
                value={formData.reported_by} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g., Jane Doe"
                style={{ padding: '8px', marginTop: '5px' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <strong>Your Role:</strong>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange}
                style={{ padding: '8px', marginTop: '5px' }}
              >
                <option value="Nurse">Nurse</option>
                <option value="Doctor">Doctor</option>
                <option value="Technician">Technician</option>
              </select>
            </label>

            {/* NEW: Severity Toggle */}
            <label style={{ display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
              <strong>Severity Level:</strong>
              <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" name="severity" value="Routine" checked={formData.severity === 'Routine'} onChange={handleInputChange} />
                  🟢 Routine
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="radio" name="severity" value="Urgent" checked={formData.severity === 'Urgent'} onChange={handleInputChange} />
                  🟡 Urgent
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'red', fontWeight: 'bold' }}>
                  <input type="radio" name="severity" value="CRITICAL" checked={formData.severity === 'CRITICAL'} onChange={handleInputChange} />
                  🔴 CRITICAL
                </label>
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column' }}>
              <strong>Describe the Issue:</strong>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                required 
                rows="4"
                placeholder="What exactly is wrong with the machine?"
                style={{ padding: '8px', marginTop: '5px' }}
              />
            </label>

            <button type="submit" style={{ padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              Submit Report
            </button>
          </div>
        )}
      </form>
    </div>
  );
}