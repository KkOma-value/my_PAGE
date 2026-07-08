import Constants from 'expo-constants';

// Automatically detect host IP to connect to Next.js API server on port 5555
const getLocalServerUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':').shift();
  if (host) {
    return `http://${host}:5555`;
  }
  // Fallback for emulator / simulator local testing
  return 'http://localhost:5555';
};

export const API_URL = getLocalServerUrl();
export const API_BASE = `${API_URL}/api`;

console.log('SipNotes Mobile API Base URL:', API_BASE);
