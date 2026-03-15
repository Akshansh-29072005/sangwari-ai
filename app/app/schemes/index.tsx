import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronRight, XCircle, Search, X } from 'lucide-react-native';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { schemeRoutes } from '../../api/routes/schemes';

interface Scheme {
  id: string;
  name: string;
  desc: string;
  match: string;
  eligible: boolean;
  category: string;
}

export default function SchemesListScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States for backend data
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);
  const [searchResults, setSearchResults] = useState<Scheme[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Fetch initial eligible schemes from backend
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const resp = await schemeRoutes.getEligibleSchemes();
        if (resp.data?.success && Array.isArray(resp.data?.data)) {
          setEligibleSchemes(resp.data.data);
        } else {
          Alert.alert("Error", "Could not load schemes");
        }
      } catch (err) {
        Alert.alert("Error", "Failed to connect to server");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchSchemes();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce backend search
    searchTimeout.current = setTimeout(async () => {
      try {
        const resp = await schemeRoutes.searchSchemes(text);
        if (resp.data?.success && Array.isArray(resp.data?.data)) {
          // Sort results: eligible first
          const sorted = [...resp.data.data].sort((a, b) => {
            if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
            return 0; // fallback
          });
          setSearchResults(sorted);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce
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
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.category || 'WELFARE'}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8, lineHeight: 16 }}>{s.desc}</Text>

        {/* Eligibility Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {s.eligible ? (
            <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={12} color="#16A34A" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#6EE7B7' : '#065F46', marginLeft: 4 }}>{t('eligible')} • {t('match')} {s.match || 'High'}</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: isDark ? '#3B1010' : '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
              <XCircle size={12} color={isDark ? '#FCA5A5' : '#DC2626'} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FCA5A5' : '#991B1B', marginLeft: 4 }}>{t('not_eligible')}</Text>
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
          {isSearchActive ? t('search_results') : t('eligible_schemes')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {/* Working Search Bar */}
        <View style={{ backgroundColor: isDark ? colors.inputBg : '#FFFFFF', borderRadius: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: isDark ? colors.cardBorder : '#D1D5DB', paddingHorizontal: 14 }}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 15, color: colors.text }}
            placeholder={t('search_schemes')}
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
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 }}>{t('recommended')}</Text>
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

        {/* Loading Spinners */}
        {(isSearching || loadingInitial) && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13 }}>{t('searching')}</Text>
          </View>
        )}

        {/* Results or Default List */}
        {!isSearching && !loadingInitial && displaySchemes.map(renderSchemeCard)}

        {/* No Results Search */}
        {isSearchActive && !isSearching && searchResults.length === 0 && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Search size={40} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16, marginTop: 16 }}>{t('no_schemes_found')}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>{t('try_keywords')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
