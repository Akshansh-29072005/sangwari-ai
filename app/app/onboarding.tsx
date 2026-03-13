import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Onboarding() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-[#F2F2F7] p-6">
      <View className="flex-1 items-center justify-center">
        <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">Welcome to Sangwari AI</Text>
        <Text className="text-base text-gray-500 text-center px-4">
          Your friendly community assistant. Check scheme eligibility, file complaints, and track your applications easily.
        </Text>
      </View>
      <TouchableOpacity 
        className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg"
        onPress={() => router.push('/auth')}
      >
        <Text className="text-white font-semibold text-lg">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
