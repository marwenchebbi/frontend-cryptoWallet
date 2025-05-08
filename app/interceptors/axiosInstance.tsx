import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode library
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from "@/app/models/types";



// Helper function to check if the token is expired
const isTokenExpired =  (token: string): boolean => {
  const decodedToken: any =jwtDecode(token);
  const currentTime = Date.now() / 1000; // Current time in seconds
  return decodedToken.exp < currentTime; // Token expiration check
};



// Axios instance with interceptor
const axiosInstance = axios.create({
  baseURL: `http://${IP_ADDRESS}:3000`, // Set your base URL here
});


// Add a request interceptor
axiosInstance.interceptors.request.use(
 
  async (config) => {
    
    const token = await SecureStore.getItemAsync('accessToken'); // Retrieve JWT token from Secure Store

    if (token) {
      // If token exists, check if it's expired
      if (isTokenExpired(token)) {
        // Token is expired, handle it (e.g., request a new token, logout user, etc.)
        console.log('Token expired. Please login again.');
        
        //router.replace('/screens/login.screen')
        // Optionally, navigate to login screen or refresh token
        // e.g., navigation.navigate('Login'); (you can use useNavigation hook)
      } else {
        // If token is not expired, attach it to the Authorization header
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      console.log('No token found');
      // Optionally, handle the case where no token is available
    }

    return config; // Return the modified config
  },
  (error) => {
    console.log('hello')
    return Promise.reject(error); // Handle errors
  }
);

export default axiosInstance;
