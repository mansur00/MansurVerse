// Site configuration: brand, navigation, SEO, footer, contact form, and categories.
// All values are token-driven or configured here; components never hardcode copy or URLs.
export interface NavItem {
  label: string;
  href: string;
}

export interface SeoConfig {
  titleTemplate: string;
  description: string;
  ogImage: string;
}

export interface FooterConfig {
  pagesLabel: string;
  elsewhereLabel: string;
  timeLabel: string;
  copyright: string;
}

export interface CtaConfig {
  label: string;
  heading: string;
  text: string;
  button: {
    label: string;
    href: string;
  };
}

export interface NotFoundConfig {
  heading: string;
  text: string;
  button: {
    label: string;
    href: string;
  };
}

export interface FormConfig {
  labels: {
    name: string;
    email: string;
    message: string;
    submit: string;
  };
  placeholders: {
    name: string;
    email: string;
    message: string;
  };
  errors: {
    name: string;
    email: string;
    message: string;
  };
  sending: string;
  sent: string;
  failed: string;
  privacyNote: string;
}

export interface SiteConfig {
  brand: {
    primary: string;
    secondary: string;
  };
  url: string;
  nav: NavItem[];
  seo: SeoConfig;
  footer: FooterConfig;
  timezone: string;
  timezonePlaceholder: boolean;
  cta: CtaConfig;
  notFound: NotFoundConfig;
  form: FormConfig;
  categories: string[];
}

export const siteConfig: SiteConfig = {
  brand: {
    primary: 'Mansur',
    secondary: 'Verse',
  },
  url: process.env.PUBLIC_SITE_URL ?? 'https://mansurverse.com',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  seo: {
    titleTemplate: '%s | MansurVerse',
    description:
      'Frontend designer and engineer crafting calm, high-performance web interfaces with design systems and rich interactive details.',
    ogImage: '/assets/og-default.svg',
  },
  footer: {
    pagesLabel: 'Pages',
    elsewhereLabel: 'Elsewhere',
    timeLabel: 'Local time',
    copyright: '© 2026 MansurVerse. All rights reserved.',
  },
  // Default timezone placeholder is UTC until owner provides IANA timezone (O-16)
  timezone: 'UTC',
  timezonePlaceholder: true,
  cta: {
    label: 'Next step',
    heading: 'Let’s build something obvious.',
    text: 'Open for select design and frontend engineering projects.',
    button: {
      label: 'Start a project',
      href: '/contact',
    },
  },
  notFound: {
    heading: '404',
    text: 'This page doesn’t exist or has moved.',
    button: {
      label: 'Take me home',
      href: '/',
    },
  },
  form: {
    labels: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      submit: 'Send message',
    },
    placeholders: {
      name: 'Your name',
      email: 'you@domain.com',
      message: 'Tell me about your project, timeline and goals…',
    },
    errors: {
      name: 'Please enter your name',
      email: 'Please enter a valid email address',
      message: 'Please write a brief message',
    },
    sending: 'Sending…',
    sent: 'Sent ✓',
    failed: 'Something went wrong. Please try again or email me directly.',
    privacyNote: 'Your email is only used to reply to your message.',
  },
  categories: ['Web', 'App', 'Brand'],
};
