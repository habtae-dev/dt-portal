// components/public/AccessibilityBar.jsx
// A slim strip above the main header exposing the three accessibility
// controls required by the spec: font scaling (100–150%), a theme cycle
// (default / high-visibility / dark), and language toggle (EN/AM). All the
// underlying state already lives in ThemeContext/LanguageContext — this
// component is just the missing UI that triggers it.

import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const THEME_LABELS = {
  default: { en: "Default", am: "መደበኛ" },
  "high-visibility": { en: "High Visibility", am: "ከፍተኛ ታይነት" },
  dark: { en: "Dark", am: "ጨለማ" },
};

export default function AccessibilityBar() {
  const { theme, cycleTheme, fontScale, increaseFont, decreaseFont } = useTheme();
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="hidden sm:flex items-center justify-end gap-4 bg-[#003366] text-white text-[11px] px-4 lg:px-6 py-1.5">
      {/* Font scale */}
      <div className="flex items-center gap-1.5" role="group" aria-label="Text size">
        <span className="opacity-80">{lang === "am" ? "ፊደል" : "Text"}</span>
        <button
          type="button"
          onClick={decreaseFont}
          disabled={fontScale <= 100}
          aria-label="Decrease text size"
          className="w-5 h-5 flex items-center justify-center rounded border border-white/30 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="w-8 text-center tabular-nums">{fontScale}%</span>
        <button
          type="button"
          onClick={increaseFont}
          disabled={fontScale >= 150}
          aria-label="Increase text size"
          className="w-5 h-5 flex items-center justify-center rounded border border-white/30 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <span className="h-3 w-px bg-white/20" />

      {/* Theme cycle */}
      <button
        type="button"
        onClick={cycleTheme}
        className="flex items-center gap-1.5 rounded border border-white/30 px-2 py-0.5 hover:bg-white/10"
        aria-label="Switch theme"
      >
        <span aria-hidden>{theme === "dark" ? "🌙" : theme === "high-visibility" ? "◐" : "☀"}</span>
        {THEME_LABELS[theme][lang] || THEME_LABELS[theme].en}
      </button>

      <span className="h-3 w-px bg-white/20" />

      {/* Language toggle */}
      <button
        type="button"
        onClick={toggleLang}
        className="rounded border border-white/30 px-2 py-0.5 font-bold hover:bg-white/10"
      >
        {lang === "en" ? "አማርኛ" : "English"}
      </button>
    </div>
  );
}
