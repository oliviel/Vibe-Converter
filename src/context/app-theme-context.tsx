import Storage from "expo-sqlite/kv-store";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppPalette = {
  id: string;
  name: string;
  mode: "dark" | "light";
  background: string;
  darkBackground: string;
  surface: string;
  selection: string;
  muted: string;
  text: string;
  textMuted: string;
  brightText: string;
  accent: string;
  operator: string;
  utilityText: string;
};

type OmarchyColors = Omit<AppPalette, "id" | "name" | "operator" | "utilityText">;

function omarchyTheme(id: string, name: string, colors: OmarchyColors): AppPalette {
  return {
    id,
    name,
    ...colors,
    operator: colors.accent,
    utilityText: colors.mode === "light" ? colors.brightText : colors.background,
  };
}

export const appThemes: AppPalette[] = [
  {
    id: "vibe-default",
    name: "Vibe Default",
    mode: "dark",
    background: "#000000",
    darkBackground: "#000000",
    surface: "#303030",
    selection: "#393220",
    muted: "#AAAAAA",
    text: "#F4F4F4",
    textMuted: "#818181",
    brightText: "#FFFFFF",
    accent: "#F8D486",
    operator: "#FF9E08",
    utilityText: "#050505",
  },
  omarchyTheme("catppuccin-latte", "Catppuccin Latte", { mode: "light", background: "#eff1f5", darkBackground: "#e3e4e8", surface: "#dce0e8", selection: "#ccd0da", muted: "#acb0be", text: "#4c4f69", textMuted: "#9ca0b0", brightText: "#4c4f69", accent: "#1e66f5" }),
  omarchyTheme("catppuccin", "Catppuccin", { mode: "dark", background: "#1e1e2e", darkBackground: "#161622", surface: "#313244", selection: "#45475a", muted: "#585b70", text: "#cdd6f4", textMuted: "#6c7086", brightText: "#cdd6f4", accent: "#89b4fa" }),
  omarchyTheme("ethereal", "Ethereal", { mode: "dark", background: "#060B1E", darkBackground: "#040816", surface: "#131a3a", selection: "#252e56", muted: "#6d7db6", text: "#ffcead", textMuted: "#6d7db6", brightText: "#ffcead", accent: "#7d82d9" }),
  omarchyTheme("everforest", "Everforest", { mode: "dark", background: "#2d353b", darkBackground: "#21272c", surface: "#343f44", selection: "#3d484d", muted: "#475258", text: "#d3c6aa", textMuted: "#4f585e", brightText: "#d3c6aa", accent: "#7fbbb3" }),
  omarchyTheme("flexoki-light", "Flexoki Light", { mode: "light", background: "#FFFCF0", darkBackground: "#f2efe4", surface: "#E6E4D9", selection: "#CECDC3", muted: "#B7B5AC", text: "#100F0F", textMuted: "#878580", brightText: "#100F0F", accent: "#205EA6" }),
  omarchyTheme("gruvbox", "Gruvbox", { mode: "dark", background: "#282828", darkBackground: "#1e1e1e", surface: "#3c3836", selection: "#504945", muted: "#665c54", text: "#d4be98", textMuted: "#7c6f64", brightText: "#d4be98", accent: "#7daea3" }),
  omarchyTheme("hackerman", "Hackerman", { mode: "dark", background: "#0B0C16", darkBackground: "#080910", surface: "#151828", selection: "#1f253a", muted: "#2d3450", text: "#ddf7ff", textMuted: "#6a6e95", brightText: "#ddf7ff", accent: "#82FB9C" }),
  omarchyTheme("kanagawa", "Kanagawa", { mode: "dark", background: "#1f1f28", darkBackground: "#17171e", surface: "#223249", selection: "#363646", muted: "#54546D", text: "#dcd7ba", textMuted: "#727169", brightText: "#dcd7ba", accent: "#dcd7ba" }),
  omarchyTheme("last-horizon", "Last Horizon", { mode: "dark", background: "#0c0b0c", darkBackground: "#090809", surface: "#0c0b0c", selection: "#584e51", muted: "#584e51", text: "#FAFCFB", textMuted: "#584e51", brightText: "#e2dddc", accent: "#b59790" }),
  omarchyTheme("lumon", "Lumon", { mode: "dark", background: "#16242d", darkBackground: "#101b21", surface: "#1b2d40", selection: "#243d56", muted: "#304860", text: "#d6e2ee", textMuted: "#4d86b0", brightText: "#f2fcff", accent: "#8bc9eb" }),
  omarchyTheme("lupine", "Lupine", { mode: "light", background: "#fafafa", darkBackground: "#ececec", surface: "#f5f5f5", selection: "#d0d0d0", muted: "#9e9e9e", text: "#212121", textMuted: "#757575", brightText: "#000000", accent: "#3264eb" }),
  omarchyTheme("matte-black", "Matte Black", { mode: "dark", background: "#121212", darkBackground: "#0d0d0d", surface: "#1e1e1e", selection: "#2a2a2a", muted: "#333333", text: "#bebebe", textMuted: "#555555", brightText: "#bebebe", accent: "#e68e0d" }),
  omarchyTheme("miasma", "Miasma", { mode: "dark", background: "#222222", darkBackground: "#191919", surface: "#2c2c2c", selection: "#383838", muted: "#666666", text: "#c2c2b0", textMuted: "#555555", brightText: "#c2c2b0", accent: "#78824b" }),
  omarchyTheme("nord", "Nord", { mode: "dark", background: "#2e3440", darkBackground: "#222730", surface: "#3b4252", selection: "#434c5e", muted: "#4c566a", text: "#d8dee9", textMuted: "#667080", brightText: "#d8dee9", accent: "#81a1c1" }),
  omarchyTheme("osaka-jade", "Osaka Jade", { mode: "dark", background: "#111c18", darkBackground: "#0c1512", surface: "#23372B", selection: "#32473B", muted: "#53685B", text: "#C1C497", textMuted: "#81B8A8", brightText: "#F7E8B2", accent: "#509475" }),
  omarchyTheme("retro-82", "Retro 82", { mode: "dark", background: "#05182e", darkBackground: "#031222", surface: "#0a2540", selection: "#134e5a", muted: "#2a6b78", text: "#f6dcac", textMuted: "#3f8f8a", brightText: "#f6dcac", accent: "#faa968" }),
  omarchyTheme("ristretto", "Ristretto", { mode: "dark", background: "#2c2525", darkBackground: "#211b1b", surface: "#3d2f2a", selection: "#403e41", muted: "#72696a", text: "#e6d9db", textMuted: "#72696a", brightText: "#e6d9db", accent: "#f38d70" }),
  omarchyTheme("rose-pine", "Rose Pine", { mode: "light", background: "#faf4ed", darkBackground: "#ede7e1", surface: "#f2e9e1", selection: "#dfdad9", muted: "#cecacd", text: "#575279", textMuted: "#9893a5", brightText: "#575279", accent: "#56949f" }),
  omarchyTheme("solitude", "Solitude", { mode: "dark", background: "#101315", darkBackground: "#0c0e10", surface: "#101315", selection: "#343d41", muted: "#4b4e55", text: "#cacccc", textMuted: "#4b4e55", brightText: "#a5aeb4", accent: "#798186" }),
  omarchyTheme("tokyo-night", "Tokyo Night", { mode: "dark", background: "#1a1b26", darkBackground: "#13141c", surface: "#24283b", selection: "#292e42", muted: "#414868", text: "#a9b1d6", textMuted: "#565f89", brightText: "#c0caf5", accent: "#7aa2f7" }),
  omarchyTheme("vantablack", "Vantablack", { mode: "dark", background: "#000000", darkBackground: "#090909", surface: "#1a1a1a", selection: "#1a1a1a", muted: "#7a7a7a", text: "#ffffff", textMuted: "#505050", brightText: "#ffffff", accent: "#8d8d8d" }),
  omarchyTheme("white", "White", { mode: "light", background: "#ffffff", darkBackground: "#f5f5f5", surface: "#c0c0c0", selection: "#c0c0c0", muted: "#808080", text: "#000000", textMuted: "#c0c0c0", brightText: "#000000", accent: "#6e6e6e" }),
];

type AppThemeContextValue = {
  theme: AppPalette;
  setTheme: (id: string) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);
const themeStorageKey = "vibe-converter:theme";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(appThemes[0].id);
  const theme = appThemes.find((candidate) => candidate.id === themeId) ?? appThemes[0];
  const setTheme = useCallback((id: string) => {
    if (!appThemes.some((candidate) => candidate.id === id)) return;
    setThemeId(id);
    void Storage.setItem(themeStorageKey, id).catch(() => undefined);
  }, []);

  useEffect(() => {
    void Storage.getItem(themeStorageKey)
      .then((savedThemeId) => {
        if (savedThemeId && appThemes.some((candidate) => candidate.id === savedThemeId)) {
          setThemeId(savedThemeId);
        }
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [setTheme, theme]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error("useAppTheme must be used inside AppThemeProvider");
  return context;
}
