import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useRouter, Router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSafeAreaInsets, SafeAreaViewProps } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/app/components/Header';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import SuccessModal from '@/app/components/SuccessModal';
import Button from '@/app/components/Button';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { useRewards } from '../hooks/rewards/get-all.hooks';

// Define interfaces for the Reward and SuccessModal state
interface Reward {
    rewardPoints: number;
    completedOnTime: boolean;
    isClaimed: boolean;
    rewardedAt: string;
    description?: string;
}

interface SuccessModalState {
    isVisible: boolean;
    title: string;
    message: string;
}

// Define types for custom hooks and components
interface RewardsQueryResult {
    data: Reward[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
    isRefetching: boolean;
}

interface UseRewardsHook {
    getRewards: () => { queryKey: string[]; queryFn: () => Promise<Reward[]> };
}

const RewardsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const isLandscape: boolean = useOrientation();
    const handleBack: () => void = useHandleBack();
    const router: Router = useRouter();
    const { getRewards }: UseRewardsHook = useRewards();

    const [backEnabled, setBackEnabled] = useState<boolean>(true);
    const [successModal, setSuccessModal] = useState<SuccessModalState>({
        isVisible: false,
        title: '',
        message: '',
    });

    const {
        data: rewards,
        isLoading,
        error,
        refetch,
        isRefetching,
    }: RewardsQueryResult = useQuery(getRewards());

    const showSuccessModal = (title: string, message: string): void => {
        setSuccessModal({ isVisible: true, title, message });
    };

    const closeSuccessModal = (): void => {
        setSuccessModal({ isVisible: false, title: '', message: '' });
    };

    const handleClaimReward = async (rewardIndex: number): Promise<void> => {
        try {
            // Add your claim reward API call here
            showSuccessModal('Reward Claimed', 'Your reward has been claimed successfully!');
            refetch(); // Refresh the rewards list
        } catch (error) {
            console.error('Error claiming reward:', error);
            Alert.alert('Error', 'Failed to claim reward. Please try again.');
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRewardIcon = (reward: Reward): string => {
        if (reward.isClaimed) return 'check-circle';
        if (reward.completedOnTime) return 'award';
        return 'clock';
    };

    const getRewardIconColor = (reward: Reward): string => {
        if (reward.isClaimed) return '#10B981';
        if (reward.completedOnTime) return '#F59E0B';
        return '#6B7280';
    };

    const getRewardBgColor = (reward: Reward): string => {
        if (reward.isClaimed) return 'bg-green-50';
        if (reward.completedOnTime) return 'bg-yellow-50';
        return 'bg-gray-50';
    };

    const totalPoints: number = rewards?.reduce((sum: number, reward: Reward) => sum + reward.rewardPoints, 0) || 0;
    const claimedPoints: number = rewards?.filter((r: Reward) => r.isClaimed).reduce((sum: number, reward: Reward) => sum + reward.rewardPoints, 0) || 0;
    const unclaimedPoints: number = totalPoints - claimedPoints;

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center" style={{ paddingTop: insets.top } as SafeAreaViewProps}>
                <Animated.View entering={FadeIn.duration(600)}>
                    <ActivityIndicator size="large" color="#A855F7" />
                </Animated.View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center px-4" style={{ paddingTop: insets.top } as SafeAreaViewProps}>
                <Animated.View entering={FadeIn.duration(600)} className="items-center">
                    <Feather name="alert-circle" size={48} color="#EF4444" />
                    <Text className="text-red-600 text-lg font-semibold mt-4 text-center">
                        Failed to load rewards
                    </Text>
                    <Text className="text-gray-600 text-sm mt-2 text-center">
                        Please check your connection and try again
                    </Text>
                    <Button
                        title="Retry"
                        onPress={() => refetch()}
                        isLandscape={isLandscape}
                        className="mt-4"
                    />
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top } as SafeAreaViewProps}>
            <Animated.View
                entering={FadeIn.duration(600)}
                className="absolute top-0 left-0 right-0 z-50 bg-white"
                style={{ paddingTop: insets.top } as ViewStyle}
            >
                <Header
                    title="My Rewards"
                    onBackPress={handleBack}
                    isLandscape={isLandscape}
                    backEnabled={backEnabled}
                    historyEnabled={false}
                />
            </Animated.View>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: insets.top + 60,
                    paddingBottom: insets.bottom + 40,
                } as ViewStyle}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={['#A855F7']}
                        tintColor="#A855F7"
                    />
                }
            >
                <Animated.View
                    entering={FadeInDown.duration(600).delay(200)}
                    className={`flex-1 items-center ${isLandscape ? 'px-6' : 'px-4'}`}
                >
                    {/* Stats Summary */}
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} className="w-full max-w-md mb-6">
                        <Text className="text-gray-600 text-sm mb-2 uppercase font-medium" style={{ fontSize: 12 } as TextStyle}>
                            Summary
                        </Text>
                        <View className="bg-gray-50 rounded-xl p-4">
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="items-center flex-1">
                                    <Text className="text-2xl font-bold text-purple-600">{totalPoints}</Text>
                                    <Text className="text-gray-600 text-xs">Total Points</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-gray-200 mx-4" />
                                <View className="items-center flex-1">
                                    <Text className="text-2xl font-bold text-green-600">{claimedPoints}</Text>
                                    <Text className="text-gray-600 text-xs">Claimed</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-gray-200 mx-4" />
                                <View className="items-center flex-1">
                                    <Text className="text-2xl font-bold text-orange-600">{unclaimedPoints}</Text>
                                    <Text className="text-gray-600 text-xs">Unclaimed</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Rewards List */}
                    <Animated.View entering={FadeInDown.duration(600).delay(400)} className="w-full max-w-md mb-6">
                        <Text className="text-gray-600 text-sm mb-2 uppercase font-medium" style={{ fontSize: 12 } as TextStyle}>
                            Recent Rewards ({rewards?.length || 0})
                        </Text>
                        <View className="bg-gray-50 rounded-xl overflow-hidden">
                            {rewards && rewards.length > 0 ? (
                                rewards.map((reward: Reward, index: number) => (
                                    <View
                                        key={index}

                                        className={`${getRewardBgColor(reward)} ${index !== rewards.length - 1 ? 'border-b border-gray-100' : ''
                                            }`}
                                    >
                                        <View className="flex-row items-center py-4 px-4">
                                            <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                                                <Feather
                                                    name={getRewardIcon(reward) as keyof typeof Feather.glyphMap}
                                                    size={18}
                                                    color={getRewardIconColor(reward)}
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-black text-base font-semibold">
                                                        {reward.rewardPoints} Points
                                                    </Text>
                                                    {reward.isClaimed && (
                                                        <View className="bg-green-100 px-2 py-1 rounded-full">
                                                            <Text className="text-green-800 text-xs font-medium">Claimed</Text>
                                                        </View>
                                                    )}
                                                    {!reward.isClaimed && reward.completedOnTime && (
                                                        <View className="bg-yellow-100 px-2 py-1 rounded-full">
                                                            <Text className="text-yellow-800 text-xs font-medium">Ready</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {reward.description && (
                                                    <Text className="text-gray-700 text-sm mb-1">{reward.description}</Text>
                                                )}
                                                <View className="flex-row items-center justify-between">
                                                    <Text className="text-gray-600 text-xs">
                                                        {formatDate(reward.rewardedAt)}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        {reward.completedOnTime && (
                                                            <View className="flex-row items-center mr-3">
                                                                <Feather name="check" size={12} color="#10B981" />
                                                                <Text className="text-green-600 text-xs ml-1">On Time</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                                {!reward.isClaimed && (

                                                    <View

                                                        className="w-full max-w-md mt-4 items-center"
                                                    >
                                                        <Button title="Claim reward" onPress={() => handleClaimReward(index)} isLandscape={isLandscape} />
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Animated.View
                                    entering={FadeInDown.duration(600).delay(500)}
                                    className="py-12 px-4 items-center"
                                >
                                    <Feather name="gift" size={48} color="#D1D5DB" />
                                    <Text className="text-gray-500 text-lg font-medium mt-4">No rewards yet</Text>
                                    <Text className="text-gray-400 text-sm mt-2 text-center">
                                        Complete tasks to earn your first rewards
                                    </Text>
                                </Animated.View>
                            )}
                        </View>
                    </Animated.View>

                    <LinearGradient
                        colors={['#A855F7', '#F472B6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            height: 2,
                            marginVertical: 20,
                            borderRadius: 2,
                            opacity: 0.7,
                        } as ViewStyle}
                    />

                    <Animated.View entering={FadeInDown.duration(600).delay(700)} className="items-center mt-6">
                        <Text className="text-gray-600 text-sm">Pull to refresh</Text>
                    </Animated.View>
                </Animated.View>
            </ScrollView>

            <SuccessModal
                isVisible={successModal.isVisible}
                onClose={closeSuccessModal}
                title={successModal.title}
                message={successModal.message}
            />

            <StatusBar style="dark" translucent={false} backgroundColor="white" />
        </SafeAreaView>
    );
};

export default RewardsScreen;