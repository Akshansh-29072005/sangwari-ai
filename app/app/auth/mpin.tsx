import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authRoutes } from '../../api/routes/auth';

export default function MPINScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetMPIN = async () => {
    if (!phone) {
      Alert.alert("Error", "Phone number missing.");
      return;
    }
    if (mpin.length !== 6 || !/^\d+$/.test(mpin)) {
      Alert.alert("Invalid input", "Please enter a valid 6-digit MPIN.");
      return;
    }

    setLoading(true);
    try {
      // First, try to login. If it succeeds, the user already had this MPIN set.
      const loginResp = await authRoutes.loginWithMPIN(phone, mpin);
      
      if (loginResp.data?.success && loginResp.data?.data?.token) {
        // Save token & Automatically logged in
        await AsyncStorage.setItem('auth_token', loginResp.data.data.token);
        router.replace('/(tabs)');
      } else {
        // If login fails, try to SET the MPIN (assuming this is registration)
        const setResp = await authRoutes.setMPIN(phone, mpin);
        if (setResp.data?.success) {
          // Once set, try to login to get the token
          const reLoginResp = await authRoutes.loginWithMPIN(phone, mpin);
          if (reLoginResp.data?.success && reLoginResp.data?.data?.token) {
            await AsyncStorage.setItem('auth_token', reLoginResp.data.data.token);
            router.replace('/auth/language'); // or go straight to dashboard
          } else {
            Alert.alert("Error", "MPIN set, but login failed: " + (reLoginResp.error || reLoginResp.data?.message || 'Unknown error'));
          }
        } else {
          Alert.alert("Error", setResp.error || setResp.data?.message || "Failed to set MPIN.");
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Login / Set MPIN</Text>
      <Text className="text-gray-500 mb-8">Enter your 6-digit MPIN to access Sangwari AI</Text>
      
      <TextInput 
        className="bg-white rounded-xl mb-6 px-4 py-4 text-center text-xl tracking-[0.5em] text-gray-900 border border-gray-200"
        placeholder="------"
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
        value={mpin}
        onChangeText={setMpin}
        editable={!loading}
      />

      <TouchableOpacity 
        className={`w-full py-4 rounded-xl items-center shadow-md ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        onPress={handleSetMPIN}
        disabled={loading}
      >
         {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Proceed</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
