import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import your global CSS file
import "../global.css";
import Animated from "react-native-reanimated";


const queryClient = new QueryClient();
export default function RootLayout() {
   
    return (
        <QueryClientProvider client={queryClient}>
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false}}/>
            <Stack.Screen name="index" options={{ headerShown: false}}/>
            <Stack.Screen name="screens/LoginScreen" options={{ headerShown: false}}/>
            <Stack.Screen name="screens/AppLockScreen" options={{ headerShown: false}}/>
            <Stack.Screen name="screens/SignupScreen" options={{ headerShown: false}}/>
            <Stack.Screen name="screens/CryptoWalletScreen" options={{ headerShown: false}}/>
        </Stack>
        </QueryClientProvider>
    );
}
