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
      showArrow?: boolean | undefined;
    }>;
    chips: Array<{
      label: string;
      variant: 'filled' | 'accent' | 'outlined';
      active?: boolean | undefined;
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
  layout: {
    navLinks: Array<{ label: string; href: string }>;
    sectionHeader: {
      slashLabel: string;
      title: string;
    };
    cta: {
      slashLabel: string;
      heading: string;
      text: string;
      buttonLabel: string;
      buttonHref: string;
    };
    footer: {
      pages: Array<{ label: string; href: string }>;
      socials: Array<{ label: string; href: string }>;
      localTimeLabel: string;
      timeZone: string;
      copyright: string;
    };
  };
  content: {
    projects: Array<{
      title: string;
      number: number | string;
      description: string;
      category: string;
      year: string;
      href: string;
      accent: string;
      imageAlt: string;
    }>;
    capabilities: Array<{
      title: string;
      number: number | string;
      description: string;
      tags: string[];
    }>;
    processSteps: Array<{
      stepNumber: number | string;
      title: string;
      text: string;
    }>;
    values: Array<{
      slashLabel: string;
      text: string;
    }>;
    stats: Array<{
      number: string;
      caption: string;
      variant?: 'lime' | 'white' | undefined;
      staggered?: boolean | undefined;
    }>;
    jobs: Array<{
      category: string;
      title: string;
      meta: string;
      ctaLabel: string;
      ctaHref: string;
    }>;
    marqueeItems: Array<{
      name: string;
      number: number;
    }>;
    statement: {
      sentence: string;
      words: string[];
    };
    email: string;
    experience: Array<{
      period: string;
      role: string;
      company: string;
      location: string;
    }>;
    skills: Array<{
      name: string;
      variant: 'filled' | 'accent' | 'outlined';
    }>;
    metaSidebar: {
      role: string;
      year: string;
      tools: string[];
      links: Array<{ label: string; href: string }>;
      sections: Array<{ id: string; label: string }>;
    };
    forms: {
      fields: {
        idle: { name: string; label: string };
        focus: {
          name: string;
          label: string;
          state: 'focus';
          value: string;
        };
        filled: {
          name: string;
          label: string;
          state: 'filled';
          value: string;
        };
        error: {
          name: string;
          label: string;
          state: 'error';
          value: string;
          errorMessage: string;
        };
        disabled: {
          name: string;
          label: string;
          state: 'disabled';
          value: string;
          disabled: boolean;
        };
        textarea: {
          name: string;
          label: string;
          as: 'textarea';
          rows: number;
        };
      };
      formStates: {
        idle: { state: 'idle'; submitText: string };
        sending: {
          state: 'sending';
          nameValue: string;
          emailValue: string;
          messageValue: string;
          sendingText: string;
        };
        sent: {
          state: 'sent';
          nameValue: string;
          emailValue: string;
          messageValue: string;
          sentText: string;
        };
        failed: {
          state: 'failed';
          nameValue: string;
          emailValue: string;
          messageValue: string;
          failedText: string;
          fallbackLabel: string;
          fallbackEmail: string;
        };
      };
    };
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
  layout: {
    navLinks: [
      { label: 'Home', href: '/' },
      { label: 'Work', href: '/work' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    sectionHeader: {
      slashLabel: 'Selected Work',
      title: 'Crafting digital experiences with precision and intent.',
    },
    cta: {
      slashLabel: 'Say Hello',
      heading: 'Let’s work together.',
      text: 'Available for freelance UI design and frontend engineering projects.',
      buttonLabel: 'Get In Touch',
      buttonHref: '/contact',
    },
    footer: {
      pages: [
        { label: 'Home', href: '/' },
        { label: 'Work', href: '/work' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
      socials: [
        { label: 'GitHub', href: 'https://github.com/mansur00' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
        { label: 'X / Twitter', href: 'https://twitter.com' },
      ],
      localTimeLabel: 'Local Time',
      timeZone: 'Asia/Dhaka',
      copyright: '© 2026 Mansur. All rights reserved.',
    },
  },
  content: {
    projects: [
      {
        title: 'Tutor LMS Design System',
        number: 1,
        description:
          'Comprehensive design tokens, component library and interactive prototypes for modern e-learning.',
        category: 'Design System',
        year: '2026',
        href: '/work/tutor-lms',
        accent: 'lime',
        imageAlt: 'Tutor LMS project cover preview',
      },
      {
        title: 'NextGen Financial Dashboard',
        number: 2,
        description:
          'High-frequency trading interface with real-time WebGL charts, reduced latency, and keyboard navigation.',
        category: 'Web App',
        year: '2025',
        href: '/work/financial-dashboard',
        accent: 'sky',
        imageAlt: 'Financial dashboard project preview',
      },
    ],
    capabilities: [
      {
        title: 'Design Systems',
        number: 1,
        description:
          'Token pipelines, cross-platform component libraries, and strict visual guardrails.',
        tags: ['Figma', 'Tokens', 'Astro', 'Tailwind'],
      },
      {
        title: 'Creative Frontend Engineering',
        number: 2,
        description:
          'Fluid micro-interactions, canvas/WebGL shaders, and accessible animation orchestrations.',
        tags: ['GSAP', 'Lenis', 'OGL', 'TypeScript'],
      },
      {
        title: 'Performance & Accessibility',
        number: 3,
        description:
          'Zero-runtime JS where possible, 100/100 Lighthouse audits, and WCAG 2.2 AA conformance.',
        tags: ['A11y', 'Core Web Vitals', 'Semantic HTML'],
      },
    ],
    processSteps: [
      {
        stepNumber: 1,
        title: 'Discovery & Direction',
        text: 'Aligning on core objectives, constraints, audience, and defining non-negotiable visual principles.',
      },
      {
        stepNumber: 2,
        title: 'System Foundations',
        text: 'Establishing design tokens, fluid typography scales, color contrast pairs, and motion guidelines.',
      },
      {
        stepNumber: 3,
        title: 'Interactive Prototyping',
        text: 'Building tactile components with realistic data, reduced-motion fallbacks, and micro-interactions.',
      },
      {
        stepNumber: 4,
        title: 'Production Craft',
        text: 'Refining every state, verifying zero magic numbers, enforcing guardrails, and optimizing performance.',
      },
    ],
    values: [
      {
        slashLabel: 'Craft & Precision',
        text: 'Every spacing value, transition curve, and contrast ratio is calculated with mathematical intent.',
      },
      {
        slashLabel: 'Accessibility First',
        text: 'Beauty and high interaction must never compromise usability, keyboard navigation, or screen readers.',
      },
      {
        slashLabel: 'Systems Over Hacks',
        text: 'Tokens and content schemas govern the UI so products scale cleanly without brittle overrides.',
      },
    ],
    stats: [
      { number: '10+', caption: 'Years of craft', variant: 'lime' },
      { number: '40+', caption: 'Shipped systems', variant: 'white', staggered: true },
      { number: '99.9%', caption: 'Accessibility score', variant: 'lime' },
      { number: '0ms', caption: 'Layout shift (CLS)', variant: 'white', staggered: true },
    ],
    jobs: [
      {
        category: 'Freelance & Contract',
        title: 'Design System Architect',
        meta: 'Remote / Global · Available Q1 2027',
        ctaLabel: 'Let’s talk',
        ctaHref: '/contact',
      },
      {
        category: 'Full-time Opportunities',
        title: 'Staff Frontend Engineer',
        meta: 'Hybrid or Remote · Selective',
        ctaLabel: 'Let’s talk',
        ctaHref: '/contact',
      },
    ],
    marqueeItems: [
      { name: 'Design Systems', number: 1 },
      { name: 'Creative Engineering', number: 2 },
      { name: 'Interactive UI', number: 3 },
      { name: 'Performance', number: 4 },
      { name: 'Accessibility', number: 5 },
    ],
    statement: {
      sentence: 'I craft interfaces for the modern web with rigorous systems behind every pixel.',
      words: [
        'I',
        'craft',
        'interfaces',
        'for',
        'the',
        'modern',
        'web',
        'with',
        'rigorous',
        'systems',
        'behind',
        'every',
        'pixel.',
      ],
    },
    email: 'mansur@mansurverse.dev',
    experience: [
      {
        period: '2024 — Present',
        role: 'Lead UI/UX Engineer',
        company: 'MansurVerse Studio',
        location: 'Remote',
      },
      {
        period: '2021 — 2024',
        role: 'Senior Design Systems Developer',
        company: 'Digital Systems Inc.',
        location: 'Remote',
      },
      {
        period: '2018 — 2021',
        role: 'Frontend Designer',
        company: 'Creative Labs',
        location: 'Dhaka',
      },
    ],
    skills: [
      { name: 'Design Systems', variant: 'accent' },
      { name: 'Astro', variant: 'filled' },
      { name: 'TypeScript', variant: 'filled' },
      { name: 'Tailwind CSS', variant: 'filled' },
      { name: 'GSAP', variant: 'outlined' },
      { name: 'Lenis', variant: 'outlined' },
      { name: 'WebGL / OGL', variant: 'outlined' },
      { name: 'WCAG 2.2 AA', variant: 'accent' },
    ],
    metaSidebar: {
      role: 'Lead Designer & Frontend Engineer',
      year: '2026',
      tools: ['Astro', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Figma'],
      links: [
        { label: 'Live Demo', href: 'https://example.com/demo' },
        { label: 'Source Repository', href: 'https://github.com/mansur00' },
      ],
      sections: [
        { id: 'overview', label: 'Overview' },
        { id: 'problem', label: 'The Problem' },
        { id: 'solution', label: 'The Solution' },
        { id: 'results', label: 'Results & Impact' },
      ],
    },
    forms: {
      fields: {
        idle: { name: 'sample-idle', label: 'Your Full Name' },
        focus: {
          name: 'sample-focus',
          label: 'Email Address',
          state: 'focus' as const,
          value: 'mansur@',
        },
        filled: {
          name: 'sample-filled',
          label: 'Company / Studio',
          state: 'filled' as const,
          value: 'MansurVerse Studio',
        },
        error: {
          name: 'sample-error',
          label: 'Project Budget',
          state: 'error' as const,
          value: 'None',
          errorMessage: 'Please enter a valid estimate or budget range',
        },
        disabled: {
          name: 'sample-disabled',
          label: 'Referral Source',
          state: 'disabled' as const,
          value: 'Read-only field',
          disabled: true,
        },
        textarea: {
          name: 'sample-textarea',
          label: 'Tell me about the project',
          as: 'textarea' as const,
          rows: 4,
        },
      },
      formStates: {
        idle: { state: 'idle' as const, submitText: 'Send message' },
        sending: {
          state: 'sending' as const,
          nameValue: 'Elena Rostova',
          emailValue: 'elena@example.com',
          messageValue: 'We would love to discuss a design system project.',
          sendingText: 'Sending…',
        },
        sent: {
          state: 'sent' as const,
          nameValue: 'Elena Rostova',
          emailValue: 'elena@example.com',
          messageValue: 'We would love to discuss a design system project.',
          sentText: 'Sent ✓',
        },
        failed: {
          state: 'failed' as const,
          nameValue: 'Elena Rostova',
          emailValue: 'elena@example.com',
          messageValue: 'We would love to discuss a design system project.',
          failedText: 'Failed to send message. Please retry or email directly.',
          fallbackLabel: 'Send via email client instead',
          fallbackEmail: 'mansur@mansurverse.dev',
        },
      },
    },
  },
};
