// Mock Data
export const MOCK_VEHICLES = [
  { id: 1, type: 'Sedan', make: 'Toyota', model: 'Camry', year: '2020', color: 'Silver' },
  { id: 2, type: 'SUV', make: 'Honda', model: 'CR-V', year: '2021', color: 'Blue' },
  { id: 3, type: 'Truck', make: 'Ford', model: 'F-150', year: '2019', color: 'Black' }
];

export const MOCK_WASH_TYPES = [
  {
    id: 1,
    name: 'Quick Wash',
    description: 'Exterior wash, wheel cleaning, and basic dry',
    duration: 30,
    basePrice: 29.99,
    features: ['Exterior Wash', 'Wheel Cleaning', 'Basic Dry']
  },
  {
    id: 2,
    name: 'Premium Wash',
    description: 'Quick wash plus interior vacuum and window cleaning',
    duration: 45,
    basePrice: 49.99,
    features: ['Everything in Quick Wash', 'Interior Vacuum', 'Window Cleaning', 'Tire Shine']
  },
  {
    id: 3,
    name: 'Deluxe Detail',
    description: 'Premium wash plus wax, interior detail, and trim conditioning',
    duration: 90,
    basePrice: 89.99,
    features: [
      'Everything in Premium Wash',
      'Hand Wax',
      'Interior Detail',
      'Trim Conditioning',
      'Air Freshener'
    ]
  }
];

export const MOCK_ADD_ONS = [
  {
    id: 1,
    name: 'Pet Hair Removal',
    description: 'Deep cleaning to remove stubborn pet hair',
    price: 15.00,
    duration: 15
  },
  {
    id: 2,
    name: 'Clay Bar Treatment',
    description: 'Remove contaminants and restore smooth finish',
    price: 25.00,
    duration: 20
  },
  {
    id: 3,
    name: 'Leather Conditioning',
    description: 'Clean and condition leather surfaces',
    price: 20.00,
    duration: 15
  }
];

export const MOCK_TIME_SLOTS = [
  { id: 1, time: '9:00 AM', available: true },
  { id: 2, time: '10:00 AM', available: false },
  { id: 3, time: '11:00 AM', available: true },
  { id: 4, time: '12:00 PM', available: true },
  { id: 5, time: '1:00 PM', available: true },
  { id: 6, time: '2:00 PM', available: false },
  { id: 7, time: '3:00 PM', available: true },
  { id: 8, time: '4:00 PM', available: true }
];

// Design System
export const THEME = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    success: {
      light: '#86efac',
      main: '#22c55e',
      dark: '#15803d'
    },
    warning: {
      light: '#fde047',
      main: '#eab308',
      dark: '#a16207'
    },
    error: {
      light: '#fca5a5',
      main: '#ef4444',
      dark: '#b91c1c'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px'
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      display: 'Cal Sans, Inter, system-ui, sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
}; 