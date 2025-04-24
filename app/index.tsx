// app/_layout.tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import CryptoWalletScreen from './screens/splash.screen';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const handleSplash = async () => {
      try {
        // Simulate a minimum splash duration (e.g., 3 seconds)
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn('Error during splash:', e);
      } finally {
        // Hide the native splash screen and transition to the app
        setIsSplashVisible(false);
        await SplashScreen.hideAsync();
      }
    };

    handleSplash();
  }, []);

  if (isSplashVisible) {
    return (
      <View style={styles.container}>
        <LottieView
          source={require('./images/splash.json')} // Path to your Lottie file
          autoPlay
          loop={false} // Set to true if you want the animation to loop
          onAnimationFinish={() => {
            // Optional: Hide splash immediately after animation finishes
            setIsSplashVisible(false);
            SplashScreen.hideAsync();
          }}
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
<CryptoWalletScreen></CryptoWalletScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Match the splash.backgroundColor in app.json
  },
  lottie: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});