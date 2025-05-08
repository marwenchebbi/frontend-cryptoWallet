import { Stack, Redirect } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "../global.css";
import { useEffect, useState } from "react";
import { isAuthenticated } from "./hooks/shared/useIsAuthenticated";


const queryClient = new QueryClient();



export default function RootLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);
    };
    checkAuth();
  }, []);

  if (isAuth === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{headerShown : false}}>
        {!isAuth && (
          <>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="screens/login.screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/signup.screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/splash.screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/email-verification.screen" options={{ headerShown: false }} />
            
          </>
        )}

        {isAuth && (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens/app-lock.screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/history.screen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/action.screen.tsx" options={{ headerShown: false }} />
            <Stack.Screen name="screens/settings.screen.tsx" options={{ headerShown: false }} />
          </>
        )}

      </Stack>
    </QueryClientProvider>
  );
}