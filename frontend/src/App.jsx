import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EngineerDashboard from './pages/EngineerDashboard';
// 1. Import the new component
import MedicalStaffReport from './pages/MedicalStaffReport'; 

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>Building Manager App</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/">Engineer Dashboard</Link>
            <Link to="/report">Medical Staff - Report Fault</Link>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<EngineerDashboard />} />
            {/* 2. Swap out the placeholder */}
            <Route path="/report" element={<MedicalStaffReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;