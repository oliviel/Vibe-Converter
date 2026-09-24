import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/app-theme-context";

type Plan = "year" | "month";

export default function FreeScreen() {
  const { theme } = useAppTheme();
  const [plan, setPlan] = useState<Plan>("year");
  const period = plan === "year" ? "year" : "month";

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
            <Text style={[styles.title, { color: theme.text }]}>Free</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.checkCircle, { backgroundColor: theme.accent }]}>
              <Text style={[styles.check, { color: theme.background }]}>✓</Text>
            </View>
            <Text style={[styles.description, { color: theme.text }]}>
              {"This app was vibe coded, and it's 100% free;"}{"\n"}
              {"you don't need to see ads."}
            </Text>

            <View style={[styles.planPicker, { borderColor: theme.muted }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: plan === "year" }}
                accessibilityLabel="Yearly plan"
                onPress={() => setPlan("year")}
                style={({ pressed }) => [
                  styles.planButton,
                  styles.yearButton,
                  { borderRightColor: theme.muted },
                  plan === "year" && { backgroundColor: theme.selection },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.planText, { color: theme.text }]}>Yearly</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: plan === "month" }}
                accessibilityLabel="Monthly plan"
                onPress={() => setPlan("month")}
                style={({ pressed }) => [
                  styles.planButton,
                  plan === "month" && { backgroundColor: theme.selection },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.planText, { color: theme.text }]}>Monthly</Text>
              </Pressable>
            </View>

            <Text style={[styles.price, { color: theme.brightText }]}>$0.00 per {period}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Free"
              style={({ pressed }) => [styles.freeButton, { backgroundColor: theme.accent }, pressed && styles.pressed]}
            >
              <Text style={[styles.freeButtonIcon, { color: theme.background }]}>✓</Text>
              <Text style={[styles.freeButtonText, { color: theme.background }]}>Free</Text>
            </Pressable>
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
  card: { minHeight: 610, borderRadius: 28, backgroundColor: "#2B2B2B", alignItems: "center", paddingHorizontal: 24, paddingTop: 40 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", backgroundColor: "#62C728" },
  check: { color: "#16280C", fontSize: 48, fontWeight: "800", lineHeight: 54 },
  description: { marginTop: 42, color: "#F0F0F0", fontSize: 18, lineHeight: 27, textAlign: "center" },
  planPicker: { width: "100%", maxWidth: 352, height: 66, marginTop: 40, flexDirection: "row", overflow: "hidden", borderWidth: 2, borderColor: "#A09BA8", borderRadius: 34 },
  planButton: { flex: 1, alignItems: "center", justifyContent: "center" },
  yearButton: { borderRightWidth: 2, borderRightColor: "#A09BA8" },
  planText: { color: "#F3F0F5", fontSize: 17, fontWeight: "600" },
  price: { marginTop: 40, color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  freeButton: { marginTop: 38, minWidth: 168, height: 80, borderRadius: 25, backgroundColor: "#2FCB63", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  freeButtonIcon: { color: "#FFFFFF", fontSize: 29, fontWeight: "800" },
  freeButtonText: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
