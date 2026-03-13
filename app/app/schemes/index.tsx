import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, Search } from 'lucide-react-native';

export default function SchemesListScreen() {
  const router = useRouter();

  const schemes = [
    { id: '1', name: 'Kisan Samman Nidhi', desc: 'Financial support for farmers', match: '98%', status: 'eligible' },
    { id: '2', name: 'Mitanin Yojana', desc: 'Health worker support program', match: '85%', status: 'eligible' },
    { id: '3', name: 'PM Awas Yojana', desc: 'Housing for rural & urban poor', match: '70%', status: 'eligible' }
  ];

  return (
    <View className="flex-1 bg-[#F2F2F7]">
      <View className="px-6 py-4 bg-white flex-row items-center shadow-sm z-10 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Eligible Schemes</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-xl mb-6 flex-row items-center border border-gray-200 px-4 py-3">
          <Search size={20} color="#9CA3AF" />
          <Text className="text-gray-400 ml-3">Search schemes...</Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Recommended for You</Text>

        {schemes.map((s, index) => (
          <TouchableOpacity 
            key={index} 
            className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 flex-row items-center justify-between"
            onPress={() => router.push(`/schemes/${s.id}`)}
          >
            <View className="flex-1 mr-4">
              <Text className="text-base font-bold text-gray-900 mb-1">{s.name}</Text>
              <Text className="text-sm text-gray-500 mb-2">{s.desc}</Text>
              
              <View className="flex-row items-center">
                <View className="bg-green-100 px-2 py-1 rounded flex-row items-center">
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text className="text-xs font-bold text-green-700 ml-1">Match: {s.match}</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
