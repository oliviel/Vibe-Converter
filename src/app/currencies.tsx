import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrencyOption } from "@/constants/currencies";
import { useAppTheme } from "@/context/app-theme-context";
import { useCurrencies } from "@/context/currency-context";

export default function CurrenciesScreen() {
  const { theme } = useAppTheme();
  const { slot = "0" } = useLocalSearchParams<{ slot?: string }>();
  const slotIndex = Math.min(4, Math.max(0, Number.parseInt(slot, 10) || 0));
  const {
    selectedCurrencies,
    fiatCurrencies,
    cryptoCurrencies,
    isRefreshing,
    liveStatus,
    replaceCurrency,
    refreshRates,
  } = useCurrencies();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const sections = useMemo(() => {
    const matches = (currency: CurrencyOption) =>
      !normalizedQuery ||
      currency.name.toLocaleLowerCase().includes(normalizedQuery) ||
      currency.code.toLocaleLowerCase().includes(normalizedQuery);

    return [
      { title: "World currencies", data: fiatCurrencies.filter(matches) },
      { title: "Top 100 cryptocurrencies", data: cryptoCurrencies.filter(matches) },
    ].filter((section) => section.data.length > 0);
  }, [cryptoCurrencies, fiatCurrencies, normalizedQuery]);

  function selectCurrency(currency: CurrencyOption) {
    replaceCurrency(slotIndex, currency);
    router.back();
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]} collapsable={false}>
      <StatusBar barStyle={theme.mode === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={[styles.backIcon, { color: theme.accent }]}>‹</Text>
            </Pressable>
            <Text style={[styles.title, { color: theme.text }]}>Currencies</Text>
            <View style={styles.headerSpacer} />
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search currencies or codes"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
            selectionColor={theme.accent}
            style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text }]}
          />

          <View style={styles.metaRow}>
            <Text style={[styles.statusText, { color: liveStatus ? theme.accent : theme.textMuted }]}>
              {liveStatus ?? "Live market rates"}
            </Text>
            {isRefreshing && <ActivityIndicator size="small" color={theme.accent} />}
          </View>

          <View style={styles.attributionRow}>
            <Link href="https://www.exchangerate-api.com" asChild>
              <Pressable><Text style={[styles.attribution, { color: theme.textMuted }]}>Rates by Exchange Rate API</Text></Pressable>
            </Link>
            <Text style={[styles.attribution, { color: theme.textMuted }]}> · </Text>
            <Link href="https://www.coinlore.com/cryptocurrency-data-api" asChild>
              <Pressable><Text style={[styles.attribution, { color: theme.textMuted }]}>Crypto by CoinLore</Text></Pressable>
            </Link>
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            refreshing={isRefreshing}
            onRefresh={() => void refreshRates(true)}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{section.title}</Text>
            )}
            renderItem={({ item }) => {
              const selected = selectedCurrencies[slotIndex]?.id === item.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${item.name}`}
                  accessibilityState={{ selected }}
                  onPress={() => selectCurrency(item)}
                  style={({ pressed }) => [styles.currencyRow, pressed && styles.pressed]}
                >
                  <View style={[styles.iconContainer, item.kind === "crypto" && styles.cryptoContainer, item.kind === "crypto" && { backgroundColor: theme.surface }]}>
                    <Text style={[styles.currencyIcon, item.kind === "crypto" && styles.cryptoIcon, item.kind === "crypto" && { color: theme.accent }]}>
                      {item.icon}
                    </Text>
                  </View>
                  <View style={styles.currencyDetails}>
                    <Text style={[styles.currencyName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    {item.kind === "crypto" && item.rank ? (
                      <Text style={[styles.rank, { color: theme.textMuted }]}>Market rank #{item.rank}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.currencyCode, { color: selected ? theme.accent : theme.textMuted }]}>{item.code}</Text>
                  {selected && <Text style={[styles.checkmark, { color: theme.accent }]}>✓</Text>}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No currencies found</Text>
                <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>Try another name or currency code.</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000" },
  safeArea: { flex: 1, backgroundColor: "#000000" },
  container: { flex: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 16, paddingTop: 32, backgroundColor: "#000000" },
  header: { height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backButton: { width: 42, height: 44, justifyContent: "center", alignItems: "flex-start" },
  backIcon: { color: "#F8D486", fontSize: 44, lineHeight: 44, fontWeight: "300" },
  title: { color: "#F4F4F4", fontSize: 20, fontWeight: "600" },
  headerSpacer: { width: 42 },
  searchInput: { height: 54, borderRadius: 16, backgroundColor: "#303030", color: "#FFFFFF", paddingHorizontal: 16, fontSize: 17, marginBottom: 10 },
  metaRow: { minHeight: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2 },
  statusText: { color: "#72D88B", fontSize: 12 },
  attributionRow: { flexDirection: "row", paddingHorizontal: 2, marginTop: 2, marginBottom: 8 },
  attribution: { color: "#777777", fontSize: 10 },
  listContent: { paddingBottom: 28 },
  sectionTitle: { color: "#8E8E93", fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", paddingTop: 18, paddingBottom: 8 },
  currencyRow: { minHeight: 66, flexDirection: "row", alignItems: "center" },
  iconContainer: { width: 52, alignItems: "flex-start", justifyContent: "center" },
  currencyIcon: { fontSize: 33 },
  cryptoContainer: { alignItems: "center", width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: "#2F2F2F" },
  cryptoIcon: { color: "#F8D486", fontSize: 20, fontWeight: "700" },
  currencyDetails: { flex: 1, justifyContent: "center" },
  currencyName: { color: "#F2F2F2", fontSize: 18, fontWeight: "400" },
  rank: { color: "#686868", fontSize: 11, marginTop: 2 },
  currencyCode: { color: "#818181", fontSize: 16, marginLeft: 12 },
  checkmark: { color: "#F8D486", fontSize: 16, marginLeft: 8 },
  emptyState: { alignItems: "center", paddingTop: 72 },
  emptyTitle: { color: "#F2F2F2", fontSize: 18, fontWeight: "600" },
  emptyMessage: { color: "#777777", fontSize: 14, marginTop: 8 },
  pressed: { opacity: 0.65 },
});
