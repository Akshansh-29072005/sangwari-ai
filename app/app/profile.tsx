import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText, ChevronRight, Settings, HelpCircle, LogOut, ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHindi, setIsHindi] = useState(false);

  return (
    <View className="flex-1 bg-[#F2F2F7]">
      <View className="px-6 py-4 bg-white flex-row items-center shadow-sm z-10 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Account & Settings</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Profile Card */}
        <View className="bg-white m-4 p-6 rounded-2xl shadow-sm items-center border border-gray-100 mt-6">
          <TouchableOpacity className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4 relative">
            <Text className="text-blue-600 text-3xl font-bold">AK</Text>
            <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
              <Upload size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Amit Kumar</Text>
          <Text className="text-gray-500 mt-1">+91 98765 43210</Text>
        </View>

        {/* Documents Upload Section */}
        <View className="bg-white mx-4 p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">My Documents</Text>
          <Text className="text-sm text-gray-500 mb-4 tracking-tight leading-5">Upload documents once to auto-fill scheme application forms instantly.</Text>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3 border border-gray-200">
            <View className="flex-row items-center">
              <FileText size={20} color="#2563EB" />
              <Text className="ml-3 font-medium text-gray-900">PAN Card</Text>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-bold">Uploaded</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-3 border border-gray-200 border-dashed">
            <View className="flex-row items-center">
              <Upload size={20} color="#6B7280" />
              <Text className="ml-3 font-medium text-gray-600">Driving License</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
            <View className="flex-row items-center">
              <Upload size={20} color="#6B7280" />
              <Text className="ml-3 font-medium text-gray-600">Income Certificate</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View className="bg-white mx-4 p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Preferences</Text>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Settings size={20} color="#4B5563" />
              <Text className="ml-3 font-medium text-gray-900">Dark Mode</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-lg">🌐</Text>
              <Text className="ml-3 font-medium text-gray-900">हिंदी Language</Text>
            </View>
            <Switch value={isHindi} onValueChange={setIsHindi} />
          </View>

          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <ShieldAlert size={20} color="#4B5563" />
              <Text className="ml-3 font-medium text-gray-900">Change MPIN</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <HelpCircle size={20} color="#4B5563" />
              <Text className="ml-3 font-medium text-gray-900">FAQ & Support</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="mx-4 p-4 rounded-xl items-center flex-row justify-center border border-red-200 bg-red-50"
          onPress={() => router.replace('/auth')}
        >
          <LogOut size={20} color="#DC2626" />
          <Text className="text-red-600 font-bold ml-2 text-base">Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
