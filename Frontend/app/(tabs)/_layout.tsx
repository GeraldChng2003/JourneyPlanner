import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Ionicons } from '@expo/vector-icons';


import { UserProvider } from "../hooks/useUser"; // Adjust path if needed

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}


export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      // Disable the static render of the header on web
      // to prevent a hydration error in React Navigation v6.
      headerShown: useClientOnlyValue(false, true),
    }}
    >
      
      <Tabs.Screen 
        name="login" 
        options={{
          tabBarIcon: ({color}) => (
            <Ionicons name="log-in-outline" size={28} color = {color}/>
            ),
            headerShown: false,

      }} 
      />

<Tabs.Screen
    name="search"
    options={{
        tabBarIcon: ({ color }) => (
            <Ionicons name='compass' size={28} color={color} />
            
        ),
        headerShown: false,

    }}
/>
      <Tabs.Screen 
        name="help" 
        options={{
          tabBarIcon: ({color}) => (
            <Ionicons name='help-outline' size={28} color = {color}/>
            ),
            headerShown: false,

      }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          tabBarIcon: ({color}) => (
            <Ionicons name='settings-outline' size={28} color = {color}/>
            ),
            headerShown: false,

      }} 
      />


    {/* Hidden Tracking Node */}
    <Tabs.Screen
      name="track"
      options={{
        href: null,
        headerShown: false,

      }}
    />
        <Tabs.Screen
      name="detailedRoute"
      options={{
        href: null,
        headerShown: false,

      }}
    />
   
            <Tabs.Screen
      name="register"
      options={{
        href: null,
        headerShown: false,

      }}
    />

    
      
    
    </Tabs>
    </UserProvider>
  );
}
