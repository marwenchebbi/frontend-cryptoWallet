
import React from 'react'
import { Tabs } from 'expo-router'
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{ headerShown: false, tabBarActiveTintColor: '#e91e63', tabBarInactiveTintColor: '#A855F7', tabBarStyle: { backgroundColor: 'white' }  }}>

            <Tabs.Screen name='Home' options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color }) => (

                    <Octicons name="home" size={24} color="#e91e63" />
                )
            }} />
            <Tabs.Screen name='Transfer' options={{

                tabBarLabel: 'Transfer',
                tabBarIcon: ({ color }) => (

                    <MaterialIcons name="currency-exchange" size={24} color="#e91e63" />
                )
            }} />
            <Tabs.Screen name='Transactions' options={{

                tabBarLabel: 'Transactions',
                tabBarIcon: ({ color }) => (

                    <FontAwesome6 name="clipboard-list" size={24} color="#e91e63" />
                )
            }} />





        </Tabs>
    )
}

export default TabsLayout