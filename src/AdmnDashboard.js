// src/components/AdminDashboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode as jwt_decode} from 'jwt-decode';

const AdminDashboard = () => {
  const [sponsors, setSponsors] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Verify admin status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwt_decode(token);
      if (!decoded.isAdmin) {
        navigate('/');
      }
    } catch (err) {
      console.error('Invalid token:', err);
      navigate('/login');
    }
  }, [navigate]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/admin/sponsors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSponsors(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/admin/family-members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilyMembers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Baobab School Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button onClick={fetchSponsors} disabled={loading}>
          View Sponsors
        </button>
        <button onClick={fetchFamilyMembers} disabled={loading}>
          View Family Members
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : sponsors.length > 0 ? (
        <div className="data-table">
          <h2>Sponsors ({sponsors.length})</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Family Members</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map(sponsor => (
                <tr key={sponsor.id}>
                  <td>{sponsor.id}</td>
                  <td>{sponsor.name}</td>
                  <td>{sponsor.email}</td>
                  <td>
                    {sponsor.family_members?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : familyMembers.length > 0 ? (
        <div className="data-table">
          <h2>Family Members ({familyMembers.length})</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Date of Birth</th>
                <th>Sponsor</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{new Date(member.date_of_birth).toLocaleDateString()}</td>
                  <td>{member.sponsor_name} (ID: {member.sponsor_id})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">No data available. Click buttons above to load data.</div>
      )}

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .logout-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .admin-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .admin-tabs button {
          padding: 10px 20px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .admin-tabs button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        .data-table {
          margin-top: 20px;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        tr:hover {
          background-color: #f9f9f9;
        }
        .error-message {
          color: #f44336;
          margin: 20px 0;
          padding: 10px;
          background: #ffebee;
          border-radius: 4px;
        }
        .loading, .no-data {
          margin: 20px 0;
          padding: 20px;
          text-align: center;
          background: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;