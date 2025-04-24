import { useRouter, useNavigation } from 'expo-router';
import { isAuthenticated } from './useIsAuthenticated';


export const useHandleBack = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = async () => {
    const authStatus = await isAuthenticated(); // Check authentication status

    if (navigation.canGoBack()) {
      router.back(); // Go back if possible
    } else {
      // Fallback based on authentication status
      if (authStatus) {
        router.replace('/(tabs)/Home'); // Redirect to private route if authenticated
      } else {
        router.replace('/screens/splash.screen'); // Redirect to public route if not authenticated
      }
    }
  };

  return handleBack;
};