import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-[#F2F2F7]">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Select Language</Text>
      <Text className="text-gray-500 mb-8">Choose your preferred language</Text>
      
      <View className="space-y-4 mb-8">
        <TouchableOpacity 
          className={`p-4 rounded-xl border ${selected === 'en' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
          onPress={() => setSelected('en')}
        >
          <Text className={`text-lg font-medium ${selected === 'en' ? 'text-blue-600' : 'text-gray-900'}`}>English</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`p-4 rounded-xl border ${selected === 'hi' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
          onPress={() => setSelected('hi')}
          style={{ marginTop: 16 }}
        >
          <Text className={`text-lg font-medium ${selected === 'hi' ? 'text-blue-600' : 'text-gray-900'}`}>हिंदी (Hindi)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className={`w-full py-4 rounded-xl items-center shadow-md ${selected ? 'bg-blue-600' : 'bg-gray-300'}`}
        disabled={!selected}
        onPress={handleContinue}
      >
        <Text className="text-white font-semibold text-lg">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
