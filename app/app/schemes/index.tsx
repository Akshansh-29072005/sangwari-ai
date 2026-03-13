import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronRight, XCircle, Search, X } from 'lucide-react-native';
import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Scheme {
  id: string;
  name: string;
  desc: string;
  match: string;
  eligible: boolean;
  category: string;
}

// Full mock database — will be replaced by backend search
const allSchemes: Scheme[] = [
  { id: '1', name: 'Kisan Samman Nidhi', desc: 'Financial support for farmers', match: '98%', eligible: true, category: 'Agriculture' },
  { id: '2', name: 'Mitanin Yojana', desc: 'Health worker support program', match: '85%', eligible: true, category: 'Health' },
  { id: '3', name: 'PM Awas Yojana', desc: 'Housing for rural & urban poor', match: '70%', eligible: true, category: 'Housing' },
  { id: '4', name: 'Ayushman Bharat', desc: 'Health insurance up to ₹5 lakh', match: '92%', eligible: true, category: 'Health' },
  { id: '5', name: 'PM Vishwakarma Yojana', desc: 'Support for traditional artisans', match: '40%', eligible: false, category: 'Skill Dev' },
  { id: '6', name: 'PM Mudra Yojana', desc: 'Loans up to ₹10 lakh for small business', match: '30%', eligible: false, category: 'Finance' },
  { id: '7', name: 'Sukanya Samriddhi Yojana', desc: 'Savings scheme for girl child', match: '0%', eligible: false, category: 'Finance' },
  { id: '8', name: 'Atal Pension Yojana', desc: 'Pension scheme for unorganized sector', match: '55%', eligible: false, category: 'Pension' },
  { id: '9', name: 'PM Ujjwala Yojana', desc: 'Free LPG connections for BPL families', match: '88%', eligible: true, category: 'Energy' },
  { id: '10', name: 'Jan Dhan Yojana', desc: 'Bank accounts with zero balance & insurance', match: '95%', eligible: true, category: 'Finance' },
  { id: '11', name: 'PM Garib Kalyan Yojana', desc: 'Free food grains for poor families', match: '78%', eligible: true, category: 'Welfare' },
  { id: '12', name: 'Stand Up India', desc: 'Loans for SC/ST and women entrepreneurs', match: '25%', eligible: false, category: 'Finance' },
];

export default function SchemesListScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Eligible schemes (default view)
  const eligibleSchemes = allSchemes.filter(s => s.eligible);

  // Search results — simulates backend search with debounce
  const [searchResults, setSearchResults] = useState<Scheme[]>([]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce 300ms — simulates backend API call (schemeRoutes.searchSchemes)
    searchTimeout.current = setTimeout(() => {
      const q = text.toLowerCase();
      const results = allSchemes.filter(
        s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
      // Sort: eligible first, then by match percentage
      results.sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return parseInt(b.match) - parseInt(a.match);
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearching(false);
    inputRef.current?.blur();
  };

  const isSearchActive = query.trim().length > 0;
  const displaySchemes = isSearchActive ? searchResults : eligibleSchemes;

  const renderSchemeCard = (s: Scheme, index: number) => (
    <TouchableOpacity
      key={s.id}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: !s.eligible ? (isDark ? '#5C1E1E' : '#FECACA') : colors.cardBorder,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: s.eligible ? 1 : 0.85,
      }}
      onPress={() => s.eligible ? router.push(`/schemes/${s.id}`) : null}
      activeOpacity={s.eligible ? 0.7 : 1}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        {/* Scheme Name + Category */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 8 }}>{s.name}</Text>
          <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.category}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8, lineHeight: 16 }}>{s.desc}</Text>

        {/* Eligibility Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {s.eligible ? (
            <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={12} color="#16A34A" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#6EE7B7' : '#065F46', marginLeft: 4 }}>Eligible • Match {s.match}</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: isDark ? '#3B1010' : '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
              <XCircle size={12} color={isDark ? '#FCA5A5' : '#DC2626'} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FCA5A5' : '#991B1B', marginLeft: 4 }}>Not Eligible</Text>
            </View>
          )}
        </View>
      </View>

      {s.eligible && <ChevronRight size={20} color={colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
          {isSearchActive ? 'Search Results' : 'Eligible Schemes'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {/* Working Search Bar */}
        <View style={{ backgroundColor: isDark ? colors.inputBg : '#FFFFFF', borderRadius: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: isDark ? colors.cardBorder : '#D1D5DB', paddingHorizontal: 14 }}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 15, color: colors.text }}
            placeholder="Search all government schemes..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {isSearchActive && (
            <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Header */}
        {!isSearchActive && (
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 }}>Recommended for You</Text>
        )}

        {isSearchActive && !isSearching && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
              {searchResults.length} scheme{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 4 }} />
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Eligible</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626', marginRight: 4 }} />
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Not Eligible</Text>
              </View>
            </View>
          </View>
        )}

        {/* Loading Spinner */}
        {isSearching && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13 }}>Searching schemes...</Text>
          </View>
        )}

        {/* Results or Default List */}
        {!isSearching && displaySchemes.map(renderSchemeCard)}

        {/* No Results */}
        {isSearchActive && !isSearching && searchResults.length === 0 && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Search size={40} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16, marginTop: 16 }}>No schemes found</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>Try different keywords like{'\n'}"pension", "housing" or "health"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
