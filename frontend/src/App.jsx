import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EngineerDashboard from './pages/EngineerDashboard';
import MedicalStaffReport from './pages/MedicalStaffReport';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        
        {user ? (
          <>
            <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: '0 0 10px 0' }}>🏥 Building Manager</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <Link to="/">Engineer Dashboard</Link>
                  <Link to="/report">Medical Staff - Report Fault</Link>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>👷 {user.name}</p>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '13px', textTransform: 'capitalize' }}>{user.role} Engineer</p>
                <button 
                  onClick={handleLogout}
                  style={{ padding: '4px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                  Logout
                </button>
              </div>
            </nav>
            <main>
              <Routes>
                <Route path="/" element={<EngineerDashboard user={user} />} />
                <Route path="/report" element={<MedicalStaffReport />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/report" element={<MedicalStaffReport />} />
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        )}

      </div>
    </Router>
  );
}

export default App;