// AarogyaCare Design Tokens
// Consistent design language across all pages

export const colors = {
  // Feature-specific color families
  hydration: {
    primary: 'from-cyan-500 to-blue-600',
    light: 'from-cyan-50 to-blue-50',
    dark: 'from-cyan-900/20 to-blue-900/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    accent: '#06b6d4',
  },
  sleep: {
    primary: 'from-indigo-500 to-purple-600',
    light: 'from-indigo-50 to-purple-50',
    dark: 'from-indigo-900/20 to-purple-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    accent: '#6366f1',
  },
  activity: {
    primary: 'from-orange-500 to-coral-600',
    light: 'from-orange-50 to-red-50',
    dark: 'from-orange-900/20 to-red-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    accent: '#f97316',
  },
  medications: {
    primary: 'from-emerald-500 to-green-600',
    light: 'from-emerald-50 to-green-50',
    dark: 'from-emerald-900/20 to-green-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    accent: '#10b981',
  },
  mental: {
    primary: 'from-purple-500 to-pink-600',
    light: 'from-purple-50 to-pink-50',
    dark: 'from-purple-900/20 to-pink-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    accent: '#a855f7',
  },
  brand: {
    primary: 'from-teal-500 to-emerald-600',
    light: 'from-teal-50 to-emerald-50',
    dark: 'from-teal-900/20 to-emerald-900/20',
    text: 'text-teal-600 dark:text-teal-400',
    accent: '#14b8a6',
  },
} as const;

export const typography = {
  pageTitle: 'text-3xl sm:text-4xl font-extrabold',
  sectionTitle: 'text-xl sm:text-2xl font-bold',
  cardTitle: 'text-lg font-semibold',
  statValue: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
  body: 'text-base font-normal',
  caption: 'text-sm font-medium',
  tiny: 'text-xs font-medium',
} as const;

export const spacing = {
  page: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
  cardPadding: 'p-5 sm:p-6',
  cardGap: 'gap-4 sm:gap-6',
  sectionGap: 'mb-6 sm:mb-8',
} as const;

export const shadows = {
  card: 'shadow-md hover:shadow-xl',
  cardActive: 'shadow-xl shadow-black/10',
  button: 'shadow-lg hover:shadow-xl',
  glow: (color: string) => `shadow-lg shadow-${color}/20`,
} as const;

export const radius = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  pill: 'rounded-full',
  input: 'rounded-xl',
} as const;

export const transitions = {
  default: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
  colors: 'transition-colors duration-300',
} as const;
