import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode as jwt_decode} from 'jwt-decode';
import {admnDashboard}  from '../src/AdmnDashboard'

function App() {
  const [activeTab, setActiveTab] = useState('sponsor');
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    email: '',
    description: ''
  });
  const [familyMemberForm, setFamilyMemberForm] = useState({
    sponsor_id: '',
    name: '',
    email: '',
    date_of_birth: ''
  });
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Check for token on component mount and tab change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        if (decoded.sponsorId) {
          setFamilyMemberForm(prev => ({
            ...prev,
            sponsor_id: decoded.sponsorId
          }));
          setIsLoggedIn(true);
          setUserInfo({
            name: decoded.name || 'Sponsor',
            email: decoded.email
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    }
  }, [activeTab]);

  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sponsors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsorForm),
      });
      const data = await response.json();
      setMessage(`Sponsor added with ID: ${data.sponsorId}`);
      setSponsorForm({ name: '', email: '', description: '' });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleFamilyMemberSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('Please login to add family members');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/family-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(familyMemberForm),
      });

      if (response.status === 401) {
        setMessage('Session expired. Please login again.');
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add family member');
      }

      const data = await response.json();
      setMessage(`Family member added with ID: ${data.memberId}`);
      setFamilyMemberForm(prev => ({
        ...prev,
        name: '',
        email: '',
        date_of_birth: ''
      }));
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'sponsor') {
      setSponsorForm(prev => ({ ...prev, [name]: value }));
    } else {
      setFamilyMemberForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserInfo(null);
    setFamilyMemberForm(prev => ({
      ...prev,
      sponsor_id: ''
    }));
    setMessage('Logged out successfully');
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Child Sponsor Connection</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isLoggedIn && userInfo && (
            <span style={{ marginRight: '10px' }}>
              Welcome, {userInfo.name} ({userInfo.email})
            </span>
          )}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {/* <button 
          onClick={() => setActiveTab('sponsor')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'sponsor' ? '#ddd' : '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sponsor Form
        </button> */}
        <button 
          onClick={() => setActiveTab('family')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'family' ? '#ddd' : '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Family Member Form
        </button>
      </div>

      {message && (
        <div style={{ 
          margin: '10px 0', 
          padding: '10px', 
          background: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px',
          borderLeft: `4px solid ${message.includes('Error') ? '#f44336' : '#4caf50'}`
        }}>
          {message}
        </div>
      )}

      {/* {activeTab === 'sponsor' ? (
        <form onSubmit={handleSponsorSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Sponsor Information</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={sponsorForm.name}
              onChange={(e) => handleInputChange(e, 'sponsor')}
              required
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              name="email"
              value={sponsorForm.email}
              onChange={(e) => handleInputChange(e, 'sponsor')}
              required
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
            <textarea
              name="description"
              value={sponsorForm.description}
              onChange={(e) => handleInputChange(e, 'sponsor')}
              rows="4"
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '12px 24px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Submit Sponsor
          </button>
        </form>
      ) : ( */}
        <form onSubmit={handleFamilyMemberSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Family Member Information</h2>
          
          {isLoggedIn ? (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Sponsor ID</label>
              <input
                type="text"
                name="sponsor_id"
                value={familyMemberForm.sponsor_id}
                readOnly
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  background: '#f0f0f0'
                }}
              />
            </div>
          ) : (
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px',
              background: '#fff3e0',
              borderRadius: '4px',
              borderLeft: '4px solid #ffa000'
            }}>
              Please login to add family members
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
            <input
              type="text"
              name="name"
              value={familyMemberForm.name}
              onChange={(e) => handleInputChange(e, 'family')}
              required
              disabled={!isLoggedIn}
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                background: !isLoggedIn ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              name="email"
              value={familyMemberForm.email}
              onChange={(e) => handleInputChange(e, 'family')}
              disabled={!isLoggedIn}
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                background: !isLoggedIn ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={familyMemberForm.date_of_birth}
              onChange={(e) => handleInputChange(e, 'family')}
              disabled={!isLoggedIn}
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                background: !isLoggedIn ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={!isLoggedIn}
            style={{ 
              padding: '12px 24px',
              background: isLoggedIn ? '#2196f3' : '#b0bec5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoggedIn ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {isLoggedIn ? 'Submit Family Member' : 'Please Login'}
          </button>
        </form>
      {/* )} */}
    </main>
  );
}

export default App;