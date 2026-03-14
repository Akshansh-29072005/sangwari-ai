import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, FileText, MessageSquare, Info, LifeBuoy } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs = [
    {
      id: 'sec_1',
      category: 'Security',
      icon: ShieldCheck,
      question: 'Why do I need an MPIN for Secure Documents?',
      answer: 'To protect your sensitive identity data like PAN and Ration Card numbers, we require a 6-digit MPIN. This ensures that even if someone else has your phone, they cannot see your private documents without your code.'
    },
    {
      id: 'sec_2',
      category: 'Security',
      icon: ShieldCheck,
      question: 'What if I forget my MPIN?',
      answer: 'If you forget your MPIN, you can reset it using the "Forgot MPIN" option on the login screen, which will require OTP verification of your registered phone number.'
    },
    {
      id: 'app_1',
      category: 'Applications',
      icon: FileText,
      question: 'How does Auto-Fill work?',
      answer: 'When you upload your documents or store your ID numbers in your profile, Sangwari AI automatically recognizes these fields in government scheme forms and fills them for you. Green-highlighted fields indicate data pulled from your profile.'
    },
    {
      id: 'app_2',
      category: 'Applications',
      icon: FileText,
      question: 'Can I track the status of my application?',
      answer: 'Yes! Navigate to the "Application Status" card on your Home dashboard. You will see real-time updates and an AI-predicted resolution date for every scheme you apply for.'
    },
    {
      id: 'sup_1',
      category: 'Grievances',
      icon: MessageSquare,
      question: 'How do I file a complaint?',
      answer: 'Click the "Magic Button" (Mic Icon) or use the search bar on the Home screen to describe your issue. Our AI will automatically categorize your complaint and route it to the correct department.'
    },
    {
      id: 'sup_2',
      category: 'Support',
      icon: LifeBuoy,
      question: 'Who can I contact for manual support?',
      answer: 'You can visit your nearest Jan Sewa Kendra or call the toll-free helpline at 1800-XXX-XXXX for direct assistance with Sangwari AI services.'
    }
  ];

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>FAQ & Support</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ marginBottom: 24, alignItems: 'center' }}>
          <View style={{ backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', padding: 20, borderRadius: 99, marginBottom: 16 }}>
            <Info size={40} color="#2563EB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' }}>How can we help?</Text>
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
            Find answers to common questions about Sangwari AI security, applications, and support.
          </Text>
        </View>

        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          const Icon = faq.icon;
          
          return (
            <TouchableOpacity 
              key={faq.id} 
              onPress={() => toggleExpand(faq.id)}
              activeOpacity={0.7}
              style={{ 
                backgroundColor: colors.card, 
                borderRadius: 16, 
                marginBottom: 12, 
                borderWidth: 1, 
                borderColor: isExpanded ? '#2563EB' : colors.cardBorder,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: isExpanded ? 0.05 : 0,
                shadowRadius: 10,
                elevation: isExpanded ? 4 : 0
              }}
            >
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6', padding: 10, borderRadius: 12, marginRight: 16 }}>
                    <Icon size={20} color={isExpanded ? "#2563EB" : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      {faq.category}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {faq.question}
                    </Text>
                  </View>
                </View>
                {isExpanded ? <ChevronUp size={20} color={colors.textSecondary} /> : <ChevronDown size={20} color={colors.textSecondary} />}
              </View>
              
              {isExpanded && (
                <View style={{ padding: 16, paddingTop: 0, paddingLeft: 72 }}>
                  <View style={{ height: 1, backgroundColor: colors.cardBorder, marginBottom: 12 }} />
                  <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ marginTop: 24, backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#2563EB' : '#BFDBFE' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#93C5FD' : '#1E40AF', marginBottom: 8 }}>Still need help?</Text>
          <Text style={{ fontSize: 14, color: isDark ? '#BFDBFE' : '#1E40AF', textAlign: 'center', marginBottom: 20 }}>
            Our AI assistant can help you with specific queries in Hindi and English.
          </Text>
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)')}
            style={{ backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, shadowColor: '#2563EB', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Talk to AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
