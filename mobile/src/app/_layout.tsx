import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthGate } from '@/components/AuthGate';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthGate>
        <Tabs
          initialRouteName="check-in"
          screenOptions={{
          tabBarActiveTintColor: '#43664d',
          tabBarInactiveTintColor: '#78716c',
            tabBarStyle: {
            backgroundColor: '#F7F8F5',
            borderTopColor: '#eeeeea',
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            paddingBottom: 5,
            paddingTop: 5,
            height: 64,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            fontFamily: 'System',
          },
          headerStyle: {
            backgroundColor: '#faf9f5',
            borderBottomColor: '#eeeeea',
            borderBottomWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#43664d',
            fontWeight: '800',
            fontSize: 18,
            fontFamily: 'System',
          },
        }}
        >
          <Tabs.Screen
            name="check-in"
            options={{
              title: '打卡',
              headerTitle: '记录这一杯',
              tabBarLabel: '打卡',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
            title: '地图',
            headerTitle: 'SipNotes 足迹地图',
            tabBarLabel: '地图',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
            ),
          }}
          />
          <Tabs.Screen
          name="discover"
          options={{
            title: '发现',
            headerTitle: 'SipNotes 发现',
            tabBarLabel: '发现',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'compass' : 'compass-outline'} size={size} color={color} />
            ),
          }}
          />
          <Tabs.Screen
          name="profile"
          options={{
            title: '个人中心',
            headerTitle: 'SipNotes 我的主页',
            tabBarLabel: '我的',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            ),
          }}
          />
        </Tabs>
      </AuthGate>
    </SafeAreaProvider>
  );
}
