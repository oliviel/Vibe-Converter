import { router } from "expo-router";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { appThemes, AppPalette, useAppTheme } from "@/context/app-theme-context";

function ThemeRow({ option }: { option: AppPalette }) {
  const { theme, setTheme } = useAppTheme();
  const selected = option.id === theme.id;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Use ${option.name} theme`}
      accessibilityState={{ selected }}
      onPress={() => setTheme(option.id)}
      style={({ pressed }) => [
        styles.themeRow,
        { backgroundColor: theme.surface },
        selected && { borderColor: theme.accent },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.preview, { backgroundColor: option.background }]}>
        <View style={[styles.previewSurface, { backgroundColor: option.surface }]} />
        <View style={[styles.previewAccent, { backgroundColor: option.accent }]} />
      </View>
      <View style={styles.themeDetails}>
        <Text style={[styles.themeName, { color: theme.text }]}>{option.name}</Text>
        <Text style={[styles.themeMode, { color: theme.textMuted }]}>
          {option.id === "vibe-default" ? "Current app colors" : `Omarchy Quattro · ${option.mode}`}
        </Text>
      </View>
      {selected && <Text style={[styles.checkmark, { color: theme.accent }]}>✓</Text>}
    </Pressable>
  );
}

export default function ThemesScreen() {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={[styles.backIcon, { color: theme.accent }]}>‹</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Themes</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={[styles.intro, { color: theme.textMuted }]}>Choose a color palette for the entire app.</Text>
          {appThemes.map((option) => <ThemeRow key={option.id} option={option} />)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingHorizontal: 24 },
  header: { height: 104, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "flex-start" },
  backIcon: { fontSize: 52, fontWeight: "300", lineHeight: 48 },
  title: { fontSize: 18, fontWeight: "600" },
  headerSpacer: { width: 44 },
  listContent: { paddingBottom: 32 },
  intro: { fontSize: 14, marginBottom: 18, textAlign: "center" },
  themeRow: { minHeight: 82, borderRadius: 22, borderWidth: 2, borderColor: "transparent", marginBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  preview: { width: 50, height: 50, borderRadius: 15, padding: 8, marginRight: 16, justifyContent: "space-between" },
  previewSurface: { height: 13, borderRadius: 6 },
  previewAccent: { width: "65%", height: 10, borderRadius: 5, alignSelf: "flex-end" },
  themeDetails: { flex: 1 },
  themeName: { fontSize: 17, fontWeight: "600" },
  themeMode: { fontSize: 11, marginTop: 4, textTransform: "capitalize" },
  checkmark: { fontSize: 20, fontWeight: "700", marginLeft: 10 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
});
