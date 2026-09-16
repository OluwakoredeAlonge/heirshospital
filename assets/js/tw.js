/* Tailwind (Play CDN) brand configuration, load right after cdn.tailwindcss.com */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#061A35', 800: '#0B2447' },
        brand: { 50: '#F1F6FF', 100: '#DCE9FF', 400: '#5C97F5', 500: '#2F7BF0', 600: '#1663D6', 700: '#0F52BA', 800: '#0A3D91' },
        teal: { 100: '#D6F5F0', 500: '#14B8A6', 600: '#0C9C8F' },
        gold: { 100: '#FFF1D6', 500: '#F2B84B', 600: '#D6961A' },
        coral: { 100: '#FDE3E4', 500: '#E5484D', 600: '#D93A3F' },
        ink: '#101E36',
        muted: '#5F6F8A',
        line: '#E4EAF3',
        surface: { DEFAULT: '#F6F8FC', 2: '#EEF2F9' }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem', '4xl': '2.25rem' },
      boxShadow: {
        soft: '0 4px 14px rgba(16,30,54,.06)',
        card: '0 12px 32px rgba(16,30,54,.10)',
        deep: '0 24px 60px rgba(6,26,53,.16)',
        blue: '0 14px 34px rgba(22,99,214,.28)'
      }
    }
  }
};
