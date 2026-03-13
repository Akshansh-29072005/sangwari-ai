import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MPINScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Set up MPIN</Text>
      <Text className="text-gray-500 mb-8">Create a 6-digit MPIN for quick access</Text>
      
      <TextInput 
        className="bg-white rounded-xl mb-6 px-4 py-4 text-center text-xl tracking-[0.5em] text-gray-900 border border-gray-200"
        placeholder="------"
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity 
        className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-md"
        onPress={() => router.push('/auth/language')}
      >
        <Text className="text-white font-semibold text-lg">Set MPIN</Text>
      </TouchableOpacity>
    </View>
  );
}
