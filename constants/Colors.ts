/**
 * Kinetix Cyberpunk Color Scheme.
 * Engineered for high-contrast dark interfaces using Deep Void, Surface, and Matrix Green,
 * with semantic rating alerts for safe-to-dangerous driving metrics.
 */
export const Colors = {
  light: {
    text: '#FFFFFF',       // Primary Text on black background
    background: '#000000', 
    tint: '#D4D4D4',       // Light grey tint
    card: '#18181B',       // Card
    border: '#E4E4E7',     // Light grey border
    primary: '#D4D4D4',
    muted: '#71717A',
    // Rating Scales
    excellent: '#10B981',  // Green
    good: '#EAB308',       // Yellow
    fair: '#F97316',       // Orange
    poor: '#EF4444',       // Red
  },
  dark: {
    text: '#FFFFFF',       // Primary Text
    background: '#000000', // Pure Black
    tint: '#D4D4D4',       // Light grey tint
    card: '#18181B',       // Surface
    border: '#27272A',     // Sleek zinc border
    primary: '#D4D4D4',    // Light grey
    muted: '#A1A1AA',      // Muted zinc grey
    // Rating Scales
    excellent: '#10B981',  // Green
    good: '#EAB308',       // Yellow
    fair: '#F97316',       // Orange
    poor: '#EF4444',       // Red
  },
};

export default Colors;
