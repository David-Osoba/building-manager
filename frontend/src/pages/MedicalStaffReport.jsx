import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MedicalStaffReport() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    equipment_id: '',
    reported_by: '',
    role: 'Nurse',
    description: '',
    severity: 'Routine'
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
      if (!payload.description) {
        payload.description = 'No description provided - Emergency submission';
      }
      if (payload.equipment_id === 'unlisted') {
        payload.equipment_id = null;
        payload.unlisted_name = unlistedInfo;
      }
      await axios.post('http://localhost:3000/faults', payload);
      setSuccessMessage('Fault report submitted! Engineering has been notified.');
      setFormData({
        equipment_id: '',
        reported_by: '',
        role: formData.role,
        description: '',
        severity: 'Routine'
      });
      setUnlistedInfo('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error submitting fault report:', error);
      alert('Failed to submit. Please check connection.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🚨 Report a Fault</h1>
          <p className="text-gray-500 text-sm mt-1">Notify the engineering team of any equipment malfunction.</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            ✅ {successMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 space-y-5">

          {/* Machine Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Machine
            </label>
            <select
              name="equipment_id"
              value={formData.equipment_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>-- Select a machine --</option>
              <option value="unlisted">⚠️ Unlisted / Unknown Machine</option>
              {equipmentList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.location}
                </option>
              ))}
            </select>
          </div>

          {/* Unlisted Machine Input */}
          {formData.equipment_id === 'unlisted' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-yellow-800 mb-1">
                Machine Name & Location
              </label>
              <input
                type="text"
                value={unlistedInfo}
                onChange={(e) => setUnlistedInfo(e.target.value)}
                required
                placeholder="e.g., Blood Pressure Monitor in Room 102"
                className="w-full px-4 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}

          {/* Rest of form — shows after machine selected */}
          {formData.equipment_id && (
            <>
              {/* Reporter Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  name="reported_by"
                  value={formData.reported_by}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Jane Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nurse">Nurse</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
                <div className="flex gap-3">
                  {[
                    { value: 'Routine', label: '🟢 Routine', color: 'border-green-400 bg-green-50 text-green-700' },
                    { value: 'Urgent', label: '🟡 Urgent', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
                    { value: 'CRITICAL', label: '🔴 CRITICAL', color: 'border-red-500 bg-red-50 text-red-700' },
                  ].map(s => (
                    <label key={s.value} className={`flex-1 text-center border-2 rounded-lg py-2 text-sm font-bold cursor-pointer transition ${
                      formData.severity === s.value ? s.color : 'border-gray-200 text-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="severity"
                        value={s.value}
                        checked={formData.severity === s.value}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Describe the Issue <span className="text-gray-400 font-normal">(optional in emergencies)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="What exactly is wrong with the machine?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition text-sm"
              >
                Submit Fault Report
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}