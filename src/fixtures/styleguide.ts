// Fixtures for /styleguide only. Never imported by production pages.
// Rule 1 & Rule 5: No hardcoded copy or raw values in components; fixtures provide sample content.

export interface StyleguideFixtures {
  brand: {
    primary: string;
    secondary: string;
    homeAriaLabel: string;
  };
  primitives: {
    buttons: Array<{
      label: string;
      variant: 'primary' | 'inverse' | 'outlined';
      showArrow?: boolean;
    }>;
    chips: Array<{
      label: string;
      variant: 'filled' | 'accent' | 'outlined';
      active?: boolean;
    }>;
    tags: Array<{
      text: string;
      tagIndex: 1 | 2 | 3 | 4;
    }>;
    slashLabels: Array<{
      label: string;
      variant: 'on-light' | 'on-feature';
    }>;
    numbers: Array<number | string>;
    pixelShapes: Array<{
      variant: 'blob' | 'corner';
      accent: 'lime' | 'sky' | 'lime-yellow' | 'pink' | 'cyan' | 'blue';
    }>;
  };
}

export const styleguideFixtures: StyleguideFixtures = {
  brand: {
    primary: 'Mansur',
    secondary: 'Verse',
    homeAriaLabel: 'MansurVerse, home',
  },
  primitives: {
    buttons: [
      { label: 'Primary Button', variant: 'primary', showArrow: true },
      { label: 'Inverse Button', variant: 'inverse', showArrow: true },
      { label: 'Outlined Button', variant: 'outlined', showArrow: false },
      { label: 'Loading State', variant: 'primary' },
      { label: 'Success State', variant: 'primary' },
      { label: 'Disabled State', variant: 'primary' },
    ],
    chips: [
      { label: 'Filled Chip', variant: 'filled' },
      { label: 'Accent Chip', variant: 'accent' },
      { label: 'Outlined Chip', variant: 'outlined' },
      { label: 'Active Filter', variant: 'outlined', active: true },
    ],
    tags: [
      { text: 'Code', tagIndex: 1 },
      { text: 'Motion', tagIndex: 2 },
      { text: 'Design', tagIndex: 3 },
      { text: 'Craft', tagIndex: 4 },
    ],
    slashLabels: [
      { label: 'Selected Work', variant: 'on-light' },
      { label: 'Core Capabilities', variant: 'on-feature' },
      { label: 'Process', variant: 'on-light' },
      { label: 'Values', variant: 'on-feature' },
    ],
    numbers: [1, 2, 3, 14, 42],
    pixelShapes: [
      { variant: 'blob', accent: 'lime' },
      { variant: 'blob', accent: 'sky' },
      { variant: 'blob', accent: 'pink' },
      { variant: 'corner', accent: 'lime-yellow' },
      { variant: 'corner', accent: 'cyan' },
      { variant: 'corner', accent: 'blue' },
    ],
  },
};
