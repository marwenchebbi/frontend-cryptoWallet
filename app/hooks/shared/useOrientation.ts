import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

// Custom hook to handle device orientation
export const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height
  );

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setIsLandscape(width > height);
    };

    const subscription = Dimensions.addEventListener('change', updateOrientation);
    
    // Cleanup subscription
    return () => subscription?.remove();
  }, []);

  return isLandscape;
};