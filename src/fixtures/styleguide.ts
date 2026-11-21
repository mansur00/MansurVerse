// Fixtures for /styleguide only. Never imported by production pages.
// Rule 1 & Rule 5: No hardcoded copy or raw values in components; fixtures provide sample content.

export interface StyleguideFixtures {
  pageTitle: string;
  badge: string;
  header: {
    title: string;
    intro: string;
    navLinks: Array<{ label: string; href: string }>;
  };
  sections: {
    colour: {
      number: string;
      label: string;
      title: string;
      paletteTitle: string;
      paletteDesc: string;
      semanticTitle: string;
      semanticDesc: string;
      contrastTitle: string;
      contrastDesc: string;
      lightLabel: string;
      darkLabel: string;
      ratioLabel: string;
      thresholdLabel: string;
      statusPass: string;
      statusFail: string;
    };
    typography: {
      number: string;
      label: string;
      title: string;
      intro: string;
      specimens: Array<{
        family: string;
        role: string;
        element: string;
        sample: string;
        isDisplay?: boolean;
      }>;
      rolesTitle: string;
      rolesDesc: string;
      sampleText: string;
    };
    shapes: {
      number: string;
      label: string;
      title: string;
      pixelShapesTitle: string;
      pixelShapesDesc: string;
      halfPillTitle: string;
      halfPillDesc: string;
      halfPillLabel: string;
      radiusTitle: string;
      spaceTitle: string;
      zIndexTitle: string;
      opacityTitle: string;
    };
    components: {
      number: string;
      label: string;
      title: string;
      intro: string;
      groups: {
        primitives: { title: string; desc: string };
        layout: { title: string; desc: string };
        content: { title: string; desc: string };
        forms: { title: string; desc: string };
      };
      stateLabels: {
        buttons: string;
        chips: string;
        tags: string;
        slashLabels: string;
        superscripts: string;
        dividers: string;
        cards: string;
        formIdle: string;
        formSending: string;
        formSent: string;
        formFailed: string;
      };
    };
    motion: {
      number: string;
      label: string;
      title: string;
      intro: string;
      durationsTitle: string;
      easingsTitle: string;
      interactionsTitle: string;
      interactionsDesc: string;
      interactions: Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        status: string;
      }>;
    };
    composition: {
      number: string;
      label: string;
      title: string;
      intro: string;
      heroEyebrow: string;
      heroTitle: string;
      heroDescription: string;
      heroCtaText: string;
      valuesHeading: string;
      valuesSlash: string;
      numbersHeading: string;
      numbersSlash: string;
    };
  };
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
      disabled?: boolean | undefined;
      loading?: boolean | undefined;
      success?: boolean | undefined;
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
  pageTitle: 'MansurVerse — Design System & Style Guide',
  badge: 'Design System',
  header: {
    title: 'Style Guide',
    intro:
      'Living specification and component showcase for the MansurVerse portfolio. Every color, font, spacing unit, and motion duration is strictly token-driven with zero raw magic values.',
    navLinks: [
      { label: '01 Colour', href: '#colour' },
      { label: '02 Typography', href: '#typography' },
      { label: '03 Shapes & Spacing', href: '#shapes' },
      { label: '04 Components', href: '#components' },
      { label: '05 Motion', href: '#motion' },
      { label: '06 Composition', href: '#composition' },
    ],
  },
  sections: {
    colour: {
      number: '01',
      label: 'Tokens',
      title: 'Colour System',
      paletteTitle: 'Core Palette Swatches',
      paletteDesc:
        'Foundational hex values. Components never consume palette values directly; they reference semantic tokens.',
      semanticTitle: 'Semantic Tokens (Theme Mapped)',
      semanticDesc:
        'Side-by-side values resolving automatically according to the active light or dark theme.',
      contrastTitle: 'WCAG Contrast Verification',
      contrastDesc:
        'Measured contrast ratios computed automatically by the token pipeline against WCAG 2.2 AA requirements.',
      lightLabel: 'Light',
      darkLabel: 'Dark',
      ratioLabel: 'Contrast',
      thresholdLabel: 'Target',
      statusPass: 'PASS',
      statusFail: 'FAIL',
    },
    typography: {
      number: '02',
      label: 'Type',
      title: 'Typography System',
      intro:
        'Three distinct font families governed by strict element-level rules: Jersey 20 for h1 and wordmark, Stack Sans Notch for headings and labels, Plus Jakarta Sans for body.',
      specimens: [
        {
          family: 'Jersey 20',
          role: 'Display (h1 and wordmark only)',
          element: 'h1',
          sample: 'MANSURVERSE CRAFT 2026',
          isDisplay: true,
        },
        {
          family: 'Stack Sans Notch Variable',
          role: 'Headings (h2–h6), Labels, Stat Numbers',
          element: 'h2',
          sample: 'Creative Engineering & Systematic Precision',
        },
        {
          family: 'Plus Jakarta Sans Variable',
          role: 'Body Text, Keyword Tags, Long Reading',
          element: 'p',
          sample:
            'Crafting high-performance digital interfaces where mathematical structure meets playful interaction.',
        },
      ],
      rolesTitle: 'Rendered Text Roles',
      rolesDesc:
        'Every text role rendered at its real calculated clamp size with corresponding element semantics and tracking.',
      sampleText: 'Aa Bb Gg 12345 / Craft & Precision',
    },
    shapes: {
      number: '03',
      label: 'Geometry',
      title: 'Shapes & Spacing Scale',
      pixelShapesTitle: 'Stepped Pixel Shapes',
      pixelShapesDesc:
        'Polygon clip-paths rendered at 80% opacity with flat color fills and no strokes or drop-shadows.',
      halfPillTitle: 'Half-Pill Geometry',
      halfPillDesc:
        'Flat left edge with 999px rounded right edge used as visual anchors behind project media.',
      halfPillLabel: 'Half-Pill Block',
      radiusTitle: 'Corner Radii',
      spaceTitle: 'Spacing Scale (4px Base Grid)',
      zIndexTitle: 'Z-Index Elevation Stack',
      opacityTitle: 'Opacity Scale',
    },
    components: {
      number: '04',
      label: 'Catalog',
      title: 'Static Components Catalog',
      intro:
        'All static components across Primitives, Layout, Content, and Forms rendered in both light and dark modes with complete states.',
      groups: {
        primitives: {
          title: '01. Primitives',
          desc: 'Buttons, chips, keyword tags, slash labels, numbers, pixel shapes, and hairline dividers.',
        },
        layout: {
          title: '02. Layout Components',
          desc: 'Sticky nav, header branding, theme toggles, section headers, CTA band, and footer.',
        },
        content: {
          title: '03. Content Components',
          desc: 'Project cards, capability accordions, process steps, values, stats, marquee, and statement text.',
        },
        forms: {
          title: '04. Form Components',
          desc: 'Interactive form inputs, textarea fields, floating labels, and submit state message banners.',
        },
      },
      stateLabels: {
        buttons: 'Button Variants & States',
        chips: 'Chip Variants & Active Filters',
        tags: 'Keyword Tags (Tag 1–4)',
        slashLabels: 'Slash Labels (Light & Feature)',
        superscripts: 'Superscript Indices',
        dividers: 'Hairline Dividers',
        cards: 'Project Showcase Cards',
        formIdle: 'Idle State',
        formSending: 'Sending State',
        formSent: 'Sent State (Success)',
        formFailed: 'Failed State (Fallback)',
      },
    },
    motion: {
      number: '05',
      label: 'Interaction',
      title: 'Motion & Interaction Contracts',
      intro:
        'Motion durations, easing curves, and formal interaction specifications (I-01 through I-37) implemented in Phase 5.',
      durationsTitle: 'Duration Tokens',
      easingsTitle: 'Easing Curves',
      interactionsTitle: 'Interaction Specifications (I-01 — I-37)',
      interactionsDesc:
        'Formal motion contracts defined in interaction-motion.md. All animations include prefers-reduced-motion fallbacks.',
      interactions: [
        {
          id: 'I-01',
          name: 'Theme Toggle',
          category: 'Supporting',
          description:
            'Theme flip with view-transition circular expand (600ms) or 200ms color fade. Preserved via localStorage.',
          status: 'Markup built, script wired',
        },
        {
          id: 'I-02',
          name: 'Nav Hide & Show',
          category: 'Supporting',
          description:
            'Translates -110% on scroll down past 120px; reveals on scroll up or header focus.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-03',
          name: 'Nav Rolling Hover & Mobile Menu',
          category: 'Supporting',
          description:
            'Letters roll upward with 20ms stagger. Mobile full-screen overlay with focus trap and 80ms entry stagger.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-04',
          name: 'Hero Intro Reveal',
          category: 'Supporting',
          description:
            'Heading lines rise from clip masks over 900ms with 120ms stagger. Tags and digit field fade in.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-05',
          name: 'Digit Field Background',
          category: 'Signature',
          description:
            'Grid of 0 and 1 digits behind hero with distance-based cursor opacity falloff and flip animation.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-06',
          name: 'Floating Keyword Tags',
          category: 'Supporting',
          description:
            'Floating tags rotate ±2.5° and rise 10px with negative delays. Magnetic cursor offset on hover.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-07',
          name: 'Smooth Inertial Scroll',
          category: 'Supporting',
          description:
            'Lenis inertial scrolling with 1.1s feel. Pauses during modal or menu overlay activation.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-08',
          name: 'Scroll Reveal',
          category: 'Supporting',
          description:
            'Elements rise 28px and fade in over motion-slow at 15% intersection threshold.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-09',
          name: 'Line Reveal',
          category: 'Supporting',
          description:
            'Headings split into lines inside overflow masks sliding up 100% to 0 with 120ms stagger.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-10',
          name: 'Statement Text Scrub',
          category: 'Supporting',
          description:
            'Words transition from muted to primary color based on scroll progress. Pixel shapes pop on completion.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-11',
          name: 'Magnetic Custom Cursor',
          category: 'Supporting',
          description:
            '14px lime dot follows fine pointers. Expands to 84px pill with text label over interactive targets.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-12',
          name: 'Magnetic Buttons',
          category: 'Supporting',
          description:
            'Within 80px radius, button body shifts up to 10px and label shifts 14px toward pointer.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-13',
          name: 'Project Card Hover',
          category: 'Signature',
          description:
            'Card lifts 6px, artwork shifts (-8px, -8px), and cursor pill shows View label.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-14',
          name: 'Card to Case Study Transition',
          category: 'Signature',
          description:
            'Shared-element page transition animating card hero media into the case study header.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-15',
          name: 'Capability Row Hover Expansion',
          category: 'Supporting',
          description:
            'Accordion row expands on hover/focus via grid-template-rows (0fr to 1fr) with lime title highlight.',
          status: 'Static markup built (Phase 5 script)',
        },
        {
          id: 'I-17',
          name: 'Animated Counter Numbers',
          category: 'Supporting',
          description:
            'Numbers count up from 0 to target value using tabular numbers on initial scroll intersection.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-18',
          name: 'Velocity-Driven Marquee',
          category: 'Supporting',
          description:
            'Continuous loop marquee multiplying speed with scroll velocity and easing back smoothly.',
          status: 'Static layout built (Phase 5 script)',
        },
        {
          id: 'I-19',
          name: 'Email Letter Repel',
          category: 'Signature',
          description:
            'Letters in email address displace up to 28px away from cursor within 140px proximity.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-20',
          name: 'Copy to Clipboard',
          category: 'Supporting',
          description:
            'Click copies email or snippet and temporarily updates label to Copied ✓ with aria-live notification.',
          status: 'Phase 5 Planned',
        },
        {
          id: 'I-33',
          name: 'Form Floating Labels & Feedback',
          category: 'Supporting',
          description:
            'Floating label transitions on focus/filled. Inline validation on blur. Animated status feedback banners.',
          status: 'Static states built',
        },
        {
          id: 'I-37',
          name: 'Motion Toggle',
          category: 'Supporting',
          description:
            'Toggles data-motion="reduced" on root element. Respects OS preference and persists state.',
          status: 'Markup built, script wired',
        },
      ],
    },
    composition: {
      number: '06',
      label: 'Compositions',
      title: 'Composition Samples',
      intro:
        'Real assembled compositions combining layout, typography, and content components across alternating surface sections.',
      heroEyebrow: 'Design Systems & Creative Engineering',
      heroTitle: 'MANSURVERSE',
      heroDescription:
        'Obsessively crafted interfaces with mathematical token systems, accessible typography, and motion contracts.',
      heroCtaText: 'View Selected Work',
      valuesHeading: 'Core Design Principles',
      valuesSlash: 'Principles',
      numbersHeading: 'Key Metrics & Impact',
      numbersSlash: 'Numbers',
    },
  },
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
      { label: 'Loading State', variant: 'primary', loading: true },
      { label: 'Success State', variant: 'primary', success: true },
      { label: 'Disabled State', variant: 'primary', disabled: true },
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
