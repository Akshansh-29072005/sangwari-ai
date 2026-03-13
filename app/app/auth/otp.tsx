import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OTPScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</Text>
      <Text className="text-gray-500 mb-8">Enter the 6-digit code sent to your phone</Text>
      
      <TextInput 
        className="bg-white rounded-xl mb-6 px-4 py-4 text-center text-xl tracking-[0.5em] text-gray-900 border border-gray-200"
        placeholder="------"
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity 
        className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-md"
        onPress={() => router.push('/auth/mpin')}
      >
        <Text className="text-white font-semibold text-lg">Verify & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
