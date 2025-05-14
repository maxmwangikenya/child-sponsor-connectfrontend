// src/components/GoogleLogin.js
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode as jwt_decode} from 'jwt-decode';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  // Utility function to securely store token
  const storeAuthToken = (token) => {
    try {
      const decoded = jwt_decode(token);
      
      // Basic token validation
      if (!decoded.exp || !decoded.email) {
        throw new Error('Invalid token structure');
      }

      // Store with expiration (matches server expiration)
      const authData = {
        token,
        expiresAt: decoded.exp * 1000 // Convert to milliseconds
      };
      localStorage.setItem('auth', JSON.stringify(authData));
      localStorage.setItem('token', token)
      localStorage.setItem('admin', decoded.isAdmin)
      return true;
    } catch (error) {
      console.error('Token storage failed:', error);
      return false;
    }
  };

  // Validate token structure and expiration
  const validateToken = (token) => {
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      
      return {
        isValid: decoded.exp > currentTime,
        isAdmin: decoded.isAdmin || false,
        hasProfile: !!decoded.sponsorId,
        email: decoded.email
      };
    } catch (error) {
      return { isValid: false };
    }
  };

  // Handle successful login
  const handleSuccess = async (credentialResponse) => {
    try {
      // 1. Send token to backend for verification
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        { token: credentialResponse.credential },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // 2. Validate response
      if (!response.data?.token) {
        throw new Error('No token received from server');
      }

      // 3. Securely store the token
      if (!storeAuthToken(response.data.token)) {
        throw new Error('Failed to store authentication token');
      }

      // 4. Validate token and determine redirect
      const tokenStatus = validateToken(response.data.token);
      
      if (!tokenStatus.isValid) {
        localStorage.removeItem('auth');
        navigate('/login', { state: { error: 'Session expired' } });
        return;
      }

      // 5. Determine appropriate redirect path
      let redirectPath = '/';
      if (tokenStatus.isAdmin) {
        redirectPath = '/admin';
      } else if (!tokenStatus.hasProfile) {
        redirectPath = '/complete-profile';
      }

      // 6. Navigate with success state
      navigate(redirectPath, {
        state: { 
          welcomeMessage: `Welcome ${tokenStatus.email}` 
        }
      });

    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your network.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      navigate('/login', { 
        state: { 
          error: errorMessage,
          from: 'google' 
        } 
      });
    }
  };

  // Handle login errors
  const handleError = () => {
    navigate('/login', { 
      state: { 
        error: 'Google login failed. Please try another method.',
        from: 'google'
      } 
    });
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="google-auth-container">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text="signin_with"
          shape="rectangular"
          size="large"
          useOneTap={true}
          auto_select={true}
          ux_mode="popup"
          logo_alignment="center"
          width="300" // Explicit width for consistency
        />
        
        <style jsx>{`
          .google-auth-container {
            display: flex;
            justify-content: center;
            padding: 20px 0;
          }
          /* Override default Google button styles if needed */
          :global(div#buttonDiv) {
            min-width: 200px !important;
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
