import { router } from "expo-router";
import { useAudioPlayer } from "expo-audio";
import { useMemo, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/app-theme-context";
import { useCurrencies } from "@/context/currency-context";

const keypad = [
  ["C", "←", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

function formatAmount(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  const absoluteValue = Math.abs(value);
  const maximumFractionDigits = absoluteValue < 0.0001 ? 8 : absoluteValue < 1 ? 6 : 2;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function formatEditableAmount(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  const maximumFractionDigits = Math.abs(value) < 1 ? 8 : 4;
  return value
    .toFixed(maximumFractionDigits)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
}

function formatTypedAmount(value: string) {
  const [integerPart, decimalPart] = value.split(".");
  const sign = integerPart.startsWith("-") ? "-" : "";
  const digits = sign ? integerPart.slice(1) : integerPart;
  const groupedInteger = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart === undefined
    ? `${sign}${groupedInteger}`
    : `${sign}${groupedInteger}.${decimalPart}`;
}

export default function ConverterScreen() {
  const { theme } = useAppTheme();
  const keypadPlayer = useAudioPlayer(require("@/assets/sounds/keypad-tap.wav"));
  const { selectedCurrencies: currencies, isRefreshing, keypadSoundEnabled, refreshRates } = useCurrencies();
  const [activeIndex, setActiveIndex] = useState(2);
  const [value, setValue] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const active = currencies[activeIndex] ?? currencies[0];
  const usdAmount = (Number(value) || 0) * active.usdRate;
  const amounts = useMemo(
    () =>
      currencies.map((currency) => ({
        ...currency,
        amount: usdAmount / currency.usdRate,
      })),
    [currencies, usdAmount],
  );

  function playKeypadSound() {
    if (!keypadSoundEnabled) return;
    keypadPlayer.seekTo(0);
    keypadPlayer.play();
  }

  function selectActiveCurrency(index: number) {
    if (index === activeIndex) return;
    setValue(formatEditableAmount(amounts[index]?.amount ?? 0));
    setActiveIndex(index);
    setStoredValue(null);
    setOperator(null);
  }

  function calculate(nextOperator?: string) {
    if (storedValue === null || !operator) return;
    const current = Number(value) || 0;
    const result =
      operator === "+"
        ? storedValue + current
        : operator === "−"
          ? storedValue - current
          : operator === "×"
            ? storedValue * current
            : current === 0
              ? 0
              : storedValue / current;
    setValue(String(result));
    setStoredValue(nextOperator ? result : null);
    setOperator(nextOperator ?? null);
  }
  function onKeyPress(key: string) {
    playKeypadSound();
    if (/^\d$/.test(key)) {
      setValue((current) => (current === "0" ? key : `${current}${key}`));
      return;
    }
    if (key === ".") {
      setValue((current) => (current.includes(".") ? current : `${current}.`));
      return;
    }
    if (key === "C") {
      setValue("0");
      setStoredValue(null);
      setOperator(null);
      return;
    }
    if (key === "←") {
      setValue((current) => (current.length > 1 ? current.slice(0, -1) : "0"));
      return;
    }
    if (key === "%") {
      setValue(String((Number(value) || 0) / 100));
      return;
    }
    if (key === "=") {
      calculate();
      return;
    }
    if (storedValue !== null && operator) calculate(key);
    else {
      setStoredValue(Number(value) || 0);
      setValue("0");
      setOperator(key);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]} collapsable={false}>
      <StatusBar barStyle={theme.mode === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Vibe Converter</Text>
            </View>
            <View style={styles.headerActions}>
              <HeaderButton
                label={isRefreshing ? "…" : "↻"}
                accessibilityLabel="Refresh exchange rates"
                onPress={() => void refreshRates(true)}
              />
              <HeaderButton
                label="▰"
                accessibilityLabel="Manage currencies"
                onPress={() => router.push({ pathname: "/currencies", params: { slot: String(activeIndex) } })}
              />
              <HeaderButton
                label="⚙"
                accessibilityLabel="Settings"
                onPress={() => router.push("/settings" as never)}
              />
            </View>
          </View>
          <View style={styles.currencyList}>
            {amounts.map((currency, index) => {
              const selected = index === activeIndex;
              return (
                <View key={`${currency.id}:${index}`} style={styles.currencyRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Change ${currency.name}`}
                    onPress={() => router.push({ pathname: "/currencies", params: { slot: String(index) } })}
                    style={({ pressed }) => [styles.currencyLabel, { backgroundColor: theme.surface }, pressed && styles.pressed]}
                  >
                    <Text style={[styles.flag, currency.kind === "crypto" && styles.cryptoIcon, currency.kind === "crypto" && { color: theme.accent }]}>
                      {currency.icon}
                    </Text>
                    <Text style={[styles.currencyCode, { color: theme.text }]}>{currency.code}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Enter amount in ${currency.name}`}
                    accessibilityState={{ selected }}
                    onPress={() => selectActiveCurrency(index)}
                    style={({ pressed }) => [
                      styles.amountField,
                      { backgroundColor: selected ? theme.selection : theme.surface },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[styles.amount, { color: selected ? theme.accent : theme.text }]}
                    >
                      {selected ? formatTypedAmount(value) : formatAmount(currency.amount)}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View style={styles.keypad}>
            {keypad.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keyRow}>
                {row.map((key) => {
                  const isOperator = ["÷", "×", "−", "+", "="].includes(key);
                  const isUtility = rowIndex === 0 && !isOperator;
                  return (
                    <Pressable
                      key={key}
                      accessibilityLabel={key}
                      onPress={() => onKeyPress(key)}
                      style={({ pressed }) => [
                        styles.key,
                        { backgroundColor: theme.surface },
                        key === "0" && styles.zeroKey,
                        isOperator && { backgroundColor: theme.operator },
                        isUtility && { backgroundColor: theme.muted },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.keyText,
                          { color: isUtility ? theme.utilityText : theme.brightText },
                        ]}
                      >
                        {key}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function HeaderButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress?: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.headerButton}
    >
      <Text style={[styles.headerIcon, { color: theme.accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  safeArea: { flex: 1, backgroundColor: "#000" },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 27,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: "row", gap: 16, alignItems: "center" },
  headerButton: {
    width: 32,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    color: "#F8D486",
    fontSize: 25,
    lineHeight: 28,
    fontWeight: "600",
  },
  currencyList: { gap: 15, marginBottom: 15 },
  currencyRow: { height: 56, flexDirection: "row", gap: 24 },
  currencyLabel: {
    width: 120,
    backgroundColor: "#303030",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  flag: { fontSize: 24 },
  cryptoIcon: { color: "#F8D486", fontSize: 20, fontWeight: "700" },
  currencyCode: { color: "#E9E9E9", fontSize: 15, fontWeight: "600" },
  amountField: {
    flex: 1,
    backgroundColor: "#303030",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  amount: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  keypad: { flex: 1, gap: 16 },
  keyRow: { flex: 1, flexDirection: "row", gap: 16 },
  key: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#303030",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  zeroKey: { flex: 2.05 },
  keyText: { color: "#FFF", fontSize: 28, fontWeight: "500" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
