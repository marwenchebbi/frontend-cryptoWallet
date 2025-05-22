import React from 'react';
import { Tabs } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AntDesign } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{

                headerShown: false,
                tabBarActiveTintColor: '#e91e63',
                tabBarInactiveTintColor: 'black',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    paddingTop: 8,

                    // Shadow for iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,

                    // Shadow for Android
                    elevation: 8,
                },


                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 4,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                },
            }}
        >
            <Tabs.Screen
                name="Home"

                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Octicons name="home" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="Transfer"
                options={{
                    tabBarLabel: 'Transfer',
                    tabBarIcon: ({ color }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesome6 name="money-bill-transfer" size={22} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="Exchange"
                options={{
                    tabBarLabel: 'Exchange',
                    tabBarIcon: ({ color }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="currency-exchange" size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <AntDesign name="user" size={22} color={color} />
                        </View>
                    ),
                }}
            />

        </Tabs>
    );
};

export default TabsLayout;
