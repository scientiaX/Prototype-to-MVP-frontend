/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./Layout.jsx",
        "./Pages/**/*.{js,jsx}",
        "./Components/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            colors: {
                zinc: {
                    950: '#09090b',
                }
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'float': 'float 4s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(249, 115, 22, 0.5)' },
                },
            },
        },
    },
    plugins: [],
}
