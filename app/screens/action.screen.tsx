import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/app/components/Header';
import { useAction } from '../hooks/action-hooks/action.hooks';
import { useQuery } from '@tanstack/react-query'; // Import useQuery

const ActionsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const isLandscape = useOrientation();
    const handleBack = useHandleBack();
    const router = useRouter();

    const [backEnabled, setBackEnabled] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch userId from SecureStore
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await SecureStore.getItemAsync('userId');
                setUserId(storedUserId);
            } catch (error) {
                console.error('Failed to fetch userId:', error);
                // Optionally handle error (e.g., show a message or redirect)
            }
        };
        fetchUserId();
    }, []);

    // Use the useAction hook
const { getActions } = useAction();
const { data: actions, isLoading, error, refetch } = useQuery(getActions());

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Africa/Tunis',
        });
    };

    // Loading state for userId
    if (!userId) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Animated.View entering={FadeIn.duration(600)}>
                    <ActivityIndicator size="large" color="#A855F7" />
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Animated.View
                entering={FadeIn.duration(600)}
                className="absolute top-0 left-0 right-0 z-40 bg-transparent"
                style={{ paddingTop: insets.top }}
            >
                <Header
                    title="Actions"
                    onBackPress={handleBack}
                    isLandscape={isLandscape}
                    backEnabled={backEnabled}
                    historyEnabled={false}
                />
            </Animated.View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 60 }}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#A855F7']}
                        tintColor="#A855F7"
                    />
                }
            >
                <Animated.View
                    entering={FadeInDown.duration(600).delay(200)}
                    className={`flex-1 ${isLandscape ? 'px-6' : 'px-4'} pb-4`}
                >
                    {/* Loading State */}
                    {isLoading && (
                        <Animated.View
                            entering={FadeIn.duration(600).delay(400)}
                            className="flex-1 justify-center items-center"
                        >
                            <ActivityIndicator size="large" color="#A855F7" />
                        </Animated.View>
                    )}

                    {/* Error State */}
                    {error && (
                        <Animated.Text
                            entering={FadeIn.duration(600).delay(400)}
                            className="text-red-500 text-center mt-4"
                        >
                            {error.message}
                        </Animated.Text>
                    )}

                    {/* No Actions State */}
                    {actions && actions.length === 0 && (
                        <Animated.Text
                            entering={FadeIn.duration(600).delay(400)}
                            className="text-gray-600 text-center mt-4"
                        >
                            No actions found.
                        </Animated.Text>
                    )}

                    {/* Actions List */}
                    {actions && actions.length > 0 && (
                        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
                            {actions.map((action, index) => (
                                <View key={index}>
                                    <LinearGradient
                                        colors={['#A855F7', '#F472B6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            height: 2,
                                            marginVertical: 4,
                                            borderRadius: 2,
                                            opacity: 0.7, // Fixed opacity value (0.7 instead of 70)
                                        }}
                                    />
                                    <View className="py-3 px-2">
                                        <Text className="text-black text-base">
                                            {action.description}
                                        </Text>
                                        <Text className="text-gray-500 text-sm mt-1">
                                            {formatDate(action.date)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>
            </ScrollView>

            <StatusBar style="dark" translucent={false} backgroundColor="white" />
        </SafeAreaView>
    );
};

export default ActionsScreen;