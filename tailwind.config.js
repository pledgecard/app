/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                accent: {
                    50: '#fffbf0',
                    100: '#fff5d6',
                    200: '#ffe59c',
                    300: '#ffce5c',
                    400: '#ffb324',
                    500: '#f9920b',
                    600: '#db6c04',
                    700: '#b64a06',
                    800: '#94390c',
                    900: '#7a300d',
                    950: '#461702',
                }
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(109, 99, 168, 0.3)',
                'premium': '0 20px 40px -10px rgba(33, 29, 51, 0.1)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
            }
        }
    },
    plugins: [],
}

