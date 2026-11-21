// Fixture content for the temporary Phase 3 Build Preview home page.
// Replaced by real home page content driven by content collections in Phase 4.

export interface ComponentGroup {
  name: string;
  description: string;
  components: string[];
}

export interface PreviewFixtures {
  pageTitle: string;
  badge: string;
  heading: string;
  phaseLabel: string;
  phaseName: string;
  phaseStatus: string;
  description: string;
  pagesSectionLabel: string;
  pagesSectionTitle: string;
  pages: Array<{
    title: string;
    description: string;
    href: string;
    badge: string;
  }>;
  componentsSectionLabel: string;
  componentsSectionTitle: string;
  componentsIntro: string;
  componentGroups: ComponentGroup[];
  componentsLinkText: string;
  componentsLinkHref: string;
  techStackLabel: string;
  techStackTitle: string;
  techStack: Array<{ name: string; variant: 'filled' | 'accent' | 'outlined' }>;
  notice: string;
  themeToggleLabel: string;
}

export const previewFixtures: PreviewFixtures = {
  pageTitle: 'MansurVerse — Build Preview',
  badge: 'Build Preview',
  heading: 'MansurVerse Portfolio',
  phaseLabel: 'Current Phase',
  phaseName: 'Phase 3: Static Components (Ready for Review)',
  phaseStatus: 'Preview Deployment Active',
  description:
    'This is an internal build preview deployment on Vercel. All components and design tokens from Phase 1 through Phase 3 are complete, strictly token-driven, and verified. Full content collections and production views will be constructed in Phase 4.',
  pagesSectionLabel: 'Directory',
  pagesSectionTitle: 'Pages in This Build',
  pages: [
    {
      title: 'Component Style Guide & Token Catalog',
      description:
        'Interactive showcase of all design tokens (colors, typography, spacing, motion) and all 25+ components across Primitives, Layout, Content, and Forms in both light and dark themes.',
      href: '/styleguide',
      badge: 'Interactive',
    },
    {
      title: 'Build Preview (This Page)',
      description:
        'Temporary build preview landing page. Replaced by the production Home page in Phase 4.',
      href: '/',
      badge: 'Temporary',
    },
  ],
  componentsSectionLabel: 'Component Catalog',
  componentsSectionTitle: 'Built Component Groups',
  componentsIntro:
    'All 25+ components built as static Astro components with typed props, token-only styling, and strict visual guardrails.',
  componentGroups: [
    {
      name: 'Primitives',
      description: 'Foundational UI atoms, wordmark, and decorative pixel geometry.',
      components: [
        'Logo',
        'Button',
        'Chip',
        'KeywordTag',
        'SlashLabel',
        'SuperscriptNumber',
        'PixelShape',
        'Divider',
      ],
    },
    {
      name: 'Layout',
      description: 'Shell structure, sticky header, navigation, and persistent bands.',
      components: [
        'Nav',
        'MenuOverlay',
        'ThemeToggle',
        'MotionToggle',
        'SectionHeader',
        'CTABand',
        'Footer',
      ],
    },
    {
      name: 'Content',
      description: 'Project showcases, capabilities, editorial rows, and metrics.',
      components: [
        'ProjectCard',
        'CapabilityRow',
        'ProcessStep',
        'ValueRow',
        'StatTile',
        'JobRow',
        'Marquee',
        'StatementText',
        'EmailDisplay',
        'ExperienceRow',
        'SkillChips',
        'MetaSidebar',
      ],
    },
    {
      name: 'Forms',
      description: 'Accessible inputs, textareas, and interactive status message containers.',
      components: ['FormField', 'Form'],
    },
  ],
  componentsLinkText: 'Open Full Style Guide →',
  componentsLinkHref: '/styleguide',
  techStackLabel: 'Architecture',
  techStackTitle: 'Technical Foundations',
  techStack: [
    { name: 'Astro 7', variant: 'accent' },
    { name: 'TypeScript', variant: 'filled' },
    { name: 'Tailwind 4', variant: 'filled' },
    { name: 'Design Tokens', variant: 'filled' },
    { name: 'Vercel Preview', variant: 'accent' },
    { name: 'Flat Look Guardrails', variant: 'outlined' },
    { name: 'Zero Magic Numbers', variant: 'outlined' },
  ],
  notice:
    'Safety Note: Search engine indexing is blocked during preview via noindex, nofollow and robots.txt disallow.',
  themeToggleLabel: 'Theme Toggle',
};
