// Fixture content for the temporary Phase 3 Build Preview home page.
// Replaced by real home page content driven by content collections in Phase 4.

export interface PreviewFixtures {
  pageTitle: string;
  badge: string;
  heading: string;
  phaseLabel: string;
  phaseName: string;
  phaseStatus: string;
  description: string;
  pagesSectionTitle: string;
  pages: Array<{
    title: string;
    description: string;
    href: string;
    badge: string;
  }>;
  componentsSectionTitle: string;
  componentsSummary: string;
  componentsLinkText: string;
  componentsLinkHref: string;
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
  componentsSectionTitle: 'Component Library Summary',
  componentsSummary:
    '25+ static components across 4 groups: Primitives (Logo, Button, Chip, KeywordTag, SlashLabel, SuperscriptNumber, PixelShape, Divider), Layout (Nav, MenuOverlay, ThemeToggle, MotionToggle, SectionHeader, CTABand, Footer), Content (ProjectCard, CapabilityRow, ProcessStep, ValueRow, StatTile, JobRow, Marquee, StatementText, EmailDisplay, ExperienceRow, SkillChips, MetaSidebar), and Forms (FormField, Form).',
  componentsLinkText: 'Open Style Guide →',
  componentsLinkHref: '/styleguide',
  techStackTitle: 'Architecture & Foundations',
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
