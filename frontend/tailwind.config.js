/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0B0F14",
        surface: "#111827",
        primary: "#D4B483",
        accent: "#4CC9F0",
        success: "#2EC4B6",
        danger: "#FF595E"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(76, 201, 240, 0.16)",
        gold: "0 0 36px rgba(212, 180, 131, 0.16)",
        danger: "0 0 28px rgba(255, 89, 94, 0.16)"
      },
      backgroundImage: {
        "radial-field":
          "radial-gradient(circle at 18% 12%, rgba(76, 201, 240, 0.16), transparent 30%), radial-gradient(circle at 82% 4%, rgba(212, 180, 131, 0.14), transparent 28%), linear-gradient(135deg, #0B0F14, #0D1219 48%, #080B10)",
        "panel-line":
          "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
      }
    }
  },
  plugins: []
};
