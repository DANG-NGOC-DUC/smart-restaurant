/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ============ SEAFOOD BRAND COLORS ============
        // Primary - Teal (từ bát và text logo)
        sea: {
          DEFAULT: "#1A6B7C",
          50: "#E8F4F6",
          100: "#D1E9ED",
          200: "#A3D3DB",
          300: "#75BDC9",
          400: "#47A7B7",
          500: "#1A6B7C",
          600: "#155663",
          700: "#10414A",
          800: "#0D4A55", // Dark text
          900: "#0A2B31",
        },
        // Coral - Cam san hô (từ tôm/hải sản)
        coral: {
          DEFAULT: "#F28B6D",
          50: "#FEF5F2",
          100: "#FDEBE5",
          200: "#FBD7CB",
          300: "#F9C3B1",
          400: "#F5A78F",
          500: "#F28B6D",
          600: "#EF6F4B",
          700: "#E85A4F", // CTA button
          800: "#C44A3F",
          900: "#A03B30",
        },
        // Crimson - Đỏ thẫm (từ đường cong trang trí)
        crimson: {
          DEFAULT: "#C23A4E",
          50: "#FCF2F3",
          100: "#F9E5E8",
          200: "#F3CBD1",
          300: "#EDB1BA",
          400: "#E08493",
          500: "#C23A4E",
          600: "#A32E40",
          700: "#842432",
          800: "#651A24",
          900: "#461016",
        },
        // Gold - Vàng nâu (từ bánh/lưới)
        gold: {
          DEFAULT: "#CDA855",
          50: "#FBF8F0",
          100: "#F7F1E1",
          200: "#EFE3C3",
          300: "#E7D5A5",
          400: "#DAC17D",
          500: "#CDA855",
          600: "#B89440",
          700: "#967730",
          800: "#745A20",
          900: "#523D10",
        },
        // Cream - Background
        cream: {
          DEFAULT: "#FFF8F0",
          50: "#FFFFFF",
          100: "#FFF8F0",
          200: "#FFEDD9",
          300: "#FFE2C2",
          400: "#FFD7AB",
        },
      },
      fontFamily: {
        heading: ["Quicksand", "Nunito", "sans-serif"],
        body: ["Inter", "Open Sans", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        button: "9999px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(26, 107, 124, 0.08)",
        "card-hover": "0 8px 30px rgba(26, 107, 124, 0.15)",
        button: "0 4px 6px rgba(26, 107, 124, 0.15)",
      },
    },
  },
  plugins: [],
};
