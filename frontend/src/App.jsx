import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EngineerDashboard from './pages/EngineerDashboard';
import MedicalStaffReport from './pages/MedicalStaffReport';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user ? (
          <>
            <nav className="bg-blue-950 text-white px-6 py-4 flex justify-between items-center shadow-lg">
              <div>
                <h1 className="text-xl font-bold">🏥 Building Manager</h1>
                <div className="flex gap-4 mt-1">
                  <Link to="/" className="text-blue-300 hover:text-white text-sm transition">
                    Engineer Dashboard
                  </Link>
                  <Link to="/report" className="text-blue-300 hover:text-white text-sm transition">
                    Report a Fault
                  </Link>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">👷 {user.name}</p>
                <p className="text-blue-300 text-xs capitalize">{user.role} Engineer</p>
                <button
                  onClick={() => setUser(null)}
                  className="mt-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition">
                  Logout
                </button>
              </div>
            </nav>
            <main className="max-w-6xl mx-auto p-6">
              <Routes>
                <Route path="/" element={<EngineerDashboard user={user} />} />
                <Route path="/report" element={<MedicalStaffReport />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/report" element={<MedicalStaffReport />} />
            <Route path="*" element={<Login onLogin={setUser} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;