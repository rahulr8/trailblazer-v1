type GradientConfig = {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const horizontal = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

interface GradientValue {
  colors: readonly string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export const Gradients = {
  light: {
    primary: {
      colors: ['#007AFF', '#0055FF'] as const,
      ...diagonal,
    },
    accent: {
      colors: ['#34C759', '#248A3D'] as const,
      ...diagonal,
    },
    ai: {
      colors: ['#BF5AF2', '#7928CA'] as const,
      ...diagonal,
    },
    gold: {
      colors: ['#FFD700', '#FDB931', '#E6AC00'] as const,
      ...horizontal,
    },
    danger: {
      colors: ['#FF3B30', '#FF453A'] as const,
      ...diagonal,
    },
  },
  dark: {
    primary: {
      colors: ['#00F2FF', '#0066FF'] as const,
      ...diagonal,
    },
    accent: {
      colors: ['#2AFF5D', '#00CC44'] as const,
      ...diagonal,
    },
    ai: {
      colors: ['#FF0080', '#7928CA'] as const,
      ...diagonal,
    },
    gold: {
      colors: ['#FFD700', '#FDB931', '#E6AC00'] as const,
      ...horizontal,
    },
    danger: {
      colors: ['#FF453A', '#FF6961'] as const,
      ...diagonal,
    },
  },
} as const;

export type GradientKey = keyof typeof Gradients.light;
export type GradientTokens = {
  [K in GradientKey]: GradientValue;
};
