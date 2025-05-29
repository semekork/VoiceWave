// utils/colorExtractor.js
import { Image } from 'react-native';

/**
 * Extract dominant colors from an image URI using React Native compatible methods
 * This is a simplified version that works with React Native
 */

// Convert RGB to HSL for better color analysis
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

// Convert HSL back to RGB
const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Darken a color for better contrast
const darkenColor = (r, g, b, amount = 0.3) => {
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = Math.max(0, l - (amount * 100));
  return hslToRgb(h, s, newL);
};

// Generate colors based on image characteristics
const generateAdaptiveColors = (imageUri) => {
  return new Promise((resolve) => {
    // Since we can't analyze the actual image pixels in React Native without additional libraries,
    // we'll use a hash-based approach to generate consistent colors from the image URI
    
    try {
      // Create a simple hash from the image URI
      let hash = 0;
      const str = imageUri || '';
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Use the hash to generate consistent but varied colors
      const hue1 = Math.abs(hash % 360);
      const hue2 = Math.abs((hash * 7) % 360);
      
      // Generate two colors with good saturation and lightness for gradients
      const color1 = hslToRgb(hue1, 70, 45); // Darker, more saturated
      const color2 = hslToRgb(hue2, 60, 25); // Even darker for gradient end
      
      // Ensure colors are dark enough for white text
      const darkenedColor1 = darkenColor(color1[0], color1[1], color1[2], 0.2);
      const darkenedColor2 = darkenColor(color2[0], color2[1], color2[2], 0.4);
      
      const gradientColor1 = `rgb(${darkenedColor1[0]}, ${darkenedColor1[1]}, ${darkenedColor1[2]})`;
      const gradientColor2 = `rgb(${darkenedColor2[0]}, ${darkenedColor2[1]}, ${darkenedColor2[2]})`;
      
      resolve([gradientColor1, gradientColor2]);
      
    } catch (error) {
      console.log('Adaptive color generation failed:', error);
      // Fallback to original colors
      resolve(['#9C3141', '#262726']);
    }
  });
};

// Alternative: Predefined color schemes that work well
const predefinedColorSchemes = [
  ['#FF6B6B', '#4ECDC4'], // Coral to Teal
  ['#667eea', '#764ba2'], // Blue to Purple  
  ['#f093fb', '#f5576c'], // Pink to Red
  ['#4facfe', '#00f2fe'], // Blue to Cyan
  ['#43e97b', '#38f9d7'], // Green to Mint
  ['#fa709a', '#fee140'], // Pink to Yellow
  ['#a8edea', '#fed6e3'], // Mint to Pink
  ['#ff9a9e', '#fecfef'], // Coral to Lavender
  ['#667eea', '#764ba2'], // Purple gradient
  ['#f093fb', '#f5576c'], // Magenta gradient
];

// Get color scheme based on image URI
export const getAdaptiveGradientColors = async (imageUri) => {
  if (!imageUri) {
    return ['#9C3141', '#262726']; // Default colors
  }
  
  try {
    // Method 1: Hash-based adaptive colors
    return await generateAdaptiveColors(imageUri);
    
  } catch (error) {
    console.log('Color extraction error:', error);
    
    // Method 2: Fallback to predefined schemes based on URI hash
    let hash = 0;
    for (let i = 0; i < imageUri.length; i++) {
      hash = ((hash << 5) - hash) + imageUri.charCodeAt(i);
      hash = hash & hash;
    }
    
    const schemeIndex = Math.abs(hash % predefinedColorSchemes.length);
    return predefinedColorSchemes[schemeIndex];
  }
};

// Get a single accent color for UI elements
export const getAccentColor = (gradientColors) => {
  if (!gradientColors || gradientColors.length === 0) {
    return '#9C3141';
  }
  
  // Extract RGB values from the first gradient color
  const colorMatch = gradientColors[0].match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (colorMatch) {
    const [, r, g, b] = colorMatch.map(Number);
    // Lighten the color slightly for accent use
    const [h, s, l] = rgbToHsl(r, g, b);
    const lightenedColor = hslToRgb(h, Math.min(100, s + 10), Math.min(80, l + 15));
    return `rgb(${lightenedColor[0]}, ${lightenedColor[1]}, ${lightenedColor[2]})`;
  }
  
  return gradientColors[0];
};

export default {
  getAdaptiveGradientColors,
  getAccentColor,
};