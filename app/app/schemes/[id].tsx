import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2, UploadCloud, Info, FileText } from 'lucide-react-native';

export default function SchemeApplicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mocked backend Response for Dynamic Form
  const dynamicFormSchema = [
    { field: 'applicant_name', label: 'Full Name', type: 'text', autoFilled: true, value: 'Amit Kumar' },
    { field: 'aadhaar', label: 'Aadhaar Number', type: 'text', autoFilled: false, value: '' },
    { field: 'pan_card', label: 'PAN Card Copy', type: 'document', autoFilled: true, value: 'pan_card_doc.pdf' },
    { field: 'income_cert', label: 'Income Certificate', type: 'document', autoFilled: false, value: '' }
  ];

  return (
    <View className="flex-1 bg-[#F2F2F7]">
      <View className="px-6 py-4 bg-white flex-row items-center justify-between shadow-sm z-10 pt-12">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Apply for Scheme</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex-row">
          <Info size={20} color="#2563EB" className="mt-1 mr-3" />
          <View className="flex-1">
            <Text className="font-bold text-blue-900 mb-1">Auto-Fill Active</Text>
            <Text className="text-sm text-blue-800">Fields marked in green have been automatically populated from your Profile documents.</Text>
          </View>
        </View>

        {dynamicFormSchema.map((item, index) => (
          <View key={index} className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-900 font-medium ml-1">{item.label}</Text>
              {item.autoFilled && (
                <View className="flex-row items-center bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text className="text-[10px] font-bold text-green-700 ml-1 uppercase tracking-wide">Auto-Filled</Text>
                </View>
              )}
            </View>

            {item.type === 'text' && (
              <TextInput
                className={`bg-white rounded-xl px-4 py-3 border ${item.autoFilled ? 'border-green-300 text-gray-500' : 'border-gray-200 text-gray-900'} shadow-sm`}
                value={item.value}
                editable={!item.autoFilled}
                placeholder={`Enter ${item.label}`}
              />
            )}

            {item.type === 'document' && (
              <TouchableOpacity 
                className={`flex-row items-center justify-center p-4 rounded-xl border border-dashed ${item.autoFilled ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'}`}
              >
                {item.autoFilled ? (
                  <>
                    <FileText size={20} color="#16A34A" />
                    <Text className="ml-2 font-medium text-green-700">{item.value}</Text>
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} color="#6B7280" />
                    <Text className="ml-2 font-medium text-gray-500">Upload Document</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity 
          className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg mt-4"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-white font-semibold text-lg">Submit Application</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
