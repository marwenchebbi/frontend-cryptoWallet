import { useRouter, useNavigation } from 'expo-router';

export const useHandleBack = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); // Fallback to welcome screen if no previous route
    }
  };

  return handleBack;
};