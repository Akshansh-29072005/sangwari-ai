import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authRoutes } from '../../api/routes/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      Alert.alert("Invalid input", "Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const resp = await authRoutes.sendOTP(`+91${phone}`);
      if (resp.data?.success) {
        // Navigate to OTP screen and pass phone
        router.push({ pathname: '/auth/otp', params: { phone: `+91${phone}` } });
      } else {
        Alert.alert("Error", resp.error || resp.data?.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Login / Register</Text>
      <Text className="text-gray-500 mb-8">Enter your valid phone number to continue</Text>
      
      <View className="bg-white rounded-xl mb-6 flex-row items-center border border-gray-200">
        <View className="px-4 py-4 border-r border-gray-100">
          <Text className="text-gray-900 font-medium">+91</Text>
        </View>
        <TextInput 
          className="flex-1 px-4 py-4 text-lg text-gray-900"
          placeholder="Phone Number"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
        />
      </View>

      <TouchableOpacity 
        className={`w-full py-4 rounded-xl items-center shadow-md ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
