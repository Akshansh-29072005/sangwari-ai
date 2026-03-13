import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mic, Send, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm z-10">
        <View className="flex-row items-center space-x-3">
          <View className="bg-blue-600 rounded-full w-10 h-10 items-center justify-center">
            <Text className="text-white font-bold text-lg">S</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 tracking-tight ml-2">Sangwari AI</Text>
        </View>
        <TouchableOpacity 
          className="bg-gray-100 p-2 rounded-full"
          onPress={() => router.push('/profile')}
        >
          <User size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Schemes Summary Grid */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">My Schemes Dashboard</Text>
          
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100 h-32 justify-between"
              onPress={() => router.push('/schemes')}
            >
              <FileText size={28} color="#2563EB" />
              <View>
                <Text className="text-3xl font-bold text-gray-900">12</Text>
                <Text className="text-sm text-gray-500 font-medium mt-1">Eligible Schemes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100 h-32 justify-between">
              <CheckCircle2 size={28} color="#16A34A" />
              <View>
                <Text className="text-3xl font-bold text-gray-900">3</Text>
                <Text className="text-sm text-gray-500 font-medium mt-1">Registered</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Application Status Timeline */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Application Status</Text>
            
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                <CheckCircle2 size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Kisan Samman Nidhi</Text>
                <Text className="text-sm text-gray-500">Approved • Transfer Pending</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-4">
                <Clock size={20} color="#CA8A04" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">PM Awas Yojana</Text>
                <Text className="text-sm text-gray-500">Document Verification in Progress</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grievance Tracking Dashboard */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-4">Grievance Tracking</Text>
            
            <View className="bg-red-50 rounded-xl p-4 border border-red-100">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-red-800">#GRV-2024-892</Text>
                <View className="bg-red-200 px-2 py-1 rounded">
                  <Text className="text-xs font-bold text-red-900">Escalated: L2</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-700 mb-1"><Text className="font-medium">Dept:</Text> Water Resources</Text>
              <Text className="text-sm text-gray-700 mb-1"><Text className="font-medium">Officer designated:</Text> Suresh K.</Text>
              <Text className="text-sm text-gray-700 mb-2"><Text className="font-medium">Stage:</Text> Field Inspection</Text>
              <Text className="text-xs text-red-700 font-medium">ETA: 2 Days remaining</Text>
            </View>
          </View>
        </View>

        {/* App Version Footer */}
        <View className="items-center mt-6 py-6 pb-10">
          <Text className="text-gray-400 font-medium">Sangwari AI v1.0.0</Text>
          <Text className="text-gray-400 text-xs">Developed for Citizens</Text>
        </View>
      </ScrollView>

      {/* Floating Complaint & Voice Assistant Section */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 flex-row items-end">
        <TextInput 
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 min-h-[50px] max-h-32 text-gray-900 mr-3"
          placeholder="Ask a question or file a complaint..."
          multiline
        />
        <TouchableOpacity className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center shadow-lg">
          <Mic size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
