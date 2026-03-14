import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authRoutes } from '../../api/routes/auth';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!phone) {
      Alert.alert("Error", "Phone number missing.");
      return;
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      Alert.alert("Invalid input", "Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const resp = await authRoutes.verifyOTP(phone, otp);
      if (resp.data?.success) {
        // Navigate to MPIN screen and pass phone & otp_token
        router.push({ 
          pathname: '/auth/mpin', 
          params: { phone, otpToken: resp.data.data.otp_token } 
        });
      } else {
        Alert.alert("Error", resp.data?.message || "Failed to verify OTP.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</Text>
      <Text className="text-gray-500 mb-8">
        Enter the 6-digit code sent to your phone {phone ? `(${phone})` : ''}
      </Text>
      
      <TextInput 
        className="bg-white rounded-xl mb-6 px-4 py-4 text-center text-xl tracking-[0.5em] text-gray-900 border border-gray-200"
        placeholder="------"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        editable={!loading}
      />

      <TouchableOpacity 
        className={`w-full py-4 rounded-xl items-center shadow-md ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Verify & Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
