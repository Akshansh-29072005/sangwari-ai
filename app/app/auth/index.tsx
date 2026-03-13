import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Login / Register</Text>
      <Text className="text-gray-500 mb-8">Enter your phone number to continue</Text>
      
      <View className="bg-white rounded-xl mb-6 flex-row items-center border border-gray-200">
        <View className="px-4 py-4 border-r border-gray-100">
          <Text className="text-gray-900 font-medium">+91</Text>
        </View>
        <TextInput 
          className="flex-1 px-4 py-4 text-lg text-gray-900"
          placeholder="Phone Number"
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      <TouchableOpacity 
        className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-md"
        onPress={() => router.push('/auth/otp')}
      >
        <Text className="text-white font-semibold text-lg">Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
