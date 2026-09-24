import { router } from "expo-router";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/app-theme-context";
import { useCurrencies } from "@/context/currency-context";

type SettingRowProps = {
  icon: string;
  iconStyle: object;
  label: string;
  onPress?: () => void;
};

function SettingRow({ icon, iconStyle, label, onPress }: SettingRowProps) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.rowIcon, iconStyle]}>
        <Text style={styles.rowIconText}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { theme } = useAppTheme();
  const { keypadSoundEnabled, setKeypadSoundEnabled } = useCurrencies();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={[styles.backIcon, { color: theme.accent }]}>‹</Text>
            </Pressable>
            <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={[styles.group, { backgroundColor: theme.surface }]}>
            <SettingRow
              icon="♛"
              iconStyle={styles.premiumIcon}
              label="Free"
              onPress={() => router.push("/free" as never)}
            />
            <View style={[styles.divider, { backgroundColor: theme.muted }]} />
            <SettingRow
              icon="✦"
              iconStyle={styles.themesIcon}
              label="Themes"
              onPress={() => router.push("/themes" as never)}
            />
          </View>

          <View style={[styles.group, { backgroundColor: theme.surface }]}>
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Keypad click sound"
              accessibilityState={{ checked: keypadSoundEnabled }}
              onPress={() => setKeypadSoundEnabled(!keypadSoundEnabled)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={[styles.rowIcon, styles.soundIcon]}>
                <Text style={styles.rowIconText}>◖</Text>
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Click</Text>
              <View style={[styles.toggle, { backgroundColor: theme.muted }, keypadSoundEnabled && { backgroundColor: theme.accent }]}>
                <View style={[styles.toggleThumb, { backgroundColor: theme.brightText }, keypadSoundEnabled && styles.toggleThumbEnabled]} />
              </View>
            </Pressable>
          </View>

          <View style={styles.credits}>
            <Text style={[styles.creditText, { color: theme.textMuted }]}>Vibe Converter v.1.0</Text>
            <Text style={[styles.creditText, { color: theme.textMuted }]}>Holiviel Valdez &amp; Codex</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000000" },
  safeArea: { flex: 1, backgroundColor: "#000000" },
  content: { flex: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 24 },
  header: { height: 104, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "flex-start" },
  backIcon: { color: "#F8D486", fontSize: 52, fontWeight: "300", lineHeight: 48 },
  title: { color: "#F0F0F0", fontSize: 18, fontWeight: "600" },
  headerSpacer: { width: 44 },
  group: { backgroundColor: "#2B2B2B", borderRadius: 28, marginBottom: 24, paddingHorizontal: 24 },
  row: { minHeight: 96, flexDirection: "row", alignItems: "center" },
  rowIcon: { width: 52, height: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 24 },
  rowIconText: { color: "#FFFFFF", fontSize: 28, fontWeight: "700" },
  premiumIcon: { backgroundColor: "#087CF0" },
  themesIcon: { backgroundColor: "#F04BCB" },
  soundIcon: { backgroundColor: "#A943D5" },
  rowLabel: { color: "#EFEFF1", fontSize: 18, fontWeight: "400" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 72, backgroundColor: "#3B3B3B" },
  toggle: { width: 84, height: 52, borderRadius: 28, marginLeft: "auto", padding: 5, backgroundColor: "#77777B" },
  toggleThumb: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF" },
  toggleThumbEnabled: { alignSelf: "flex-end" },
  credits: { alignItems: "center", gap: 14, paddingTop: 24 },
  creditText: { color: "#A1A1A4", fontSize: 16 },
  pressed: { opacity: 0.7 },
});
