import { View, Text, Image } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AppLockScreen({ navigation }: any) {
    const router = useRouter();
    return (

        <View className="flex-1 items-center justify-center bg-white px-6">
            
            <View className="flex-1 justify-center items-start">
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3064/3064155.png" }} className="w-40 h-40 mb-4" />

            </View>
            <Text className="flex-1 text-lg font-semibold text-center items-center text-black">
                Ensure that only you can access and manage your wallets by securing them with your lock
            </Text>
            <Button title="Enable App Lock" onPress={() => router.push('/screens/LoginScreen')} />

            <View className="rounded-3xl p-px bg-gradient-to-b from-gray-200 to-transparent">
                <View className="bg-gray-50 p-10">
                </View>
            </View>
            <StatusBar style='light' />
        </View>
    );
}
