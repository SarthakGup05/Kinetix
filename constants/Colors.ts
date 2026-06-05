/**
 * Kinetix Cyberpunk Color Scheme.
 * Engineered for high-contrast dark interfaces using Deep Void, Surface, and Matrix Green.
 */
export const Colors = {
  // Light mode (minimal dark-accented style)
  light: {
    text: '#0A0A0F',       // Deep Void
    background: '#FAFAFA', 
    tint: '#1b8a0a',       // Deep green tint
    card: '#FFFFFF',       // Clean white card
    border: '#E4E4E7',     // Light grey border
    primary: '#1b8a0a',
    muted: '#71717A',
  },
  // Dark mode (Futuristic Sci-Fi Cyberpunk)
  dark: {
    text: '#FFFFFF',       // Primary Text
    background: '#0A0A0F', // Deep Void
    tint: '#39FF14',       // Matrix Green
    card: '#18181B',       // Surface
    border: '#27272A',     // Sleek zinc border
    primary: '#39FF14',    // Matrix Green
    muted: '#A1A1AA',      // Muted zinc grey
  },
};

export default Colors;
