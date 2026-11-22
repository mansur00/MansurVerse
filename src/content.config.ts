// Content Collections configuration and Zod schemas per docs/02-engineering/content-schema.md.
// All content is strictly typed, validated at build time, and components never hold copy.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, type LoaderContext } from 'astro/loaders';
import { promises as fs } from 'node:fs';

// Loader for single JSON files storing structured entries
function singleFileJsonLoader(relativePath: string) {
  return {
    name: 'single-file-json-loader',
    load: async ({ store, parseData, generateDigest }: LoaderContext) => {
      const url = new URL(relativePath, import.meta.url);
      const content = await fs.readFile(url, 'utf-8');
      const data = JSON.parse(content);
      const parsed = await parseData({ id: 'default', data });
      store.set({
        id: 'default',
        data: parsed,
        digest: generateDigest(content),
      });
    },
  };
}

// 1. Projects collection (MDX files with frontmatter and body)
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().max(48),
    order: z.number().int(),
    featured: z.boolean(),
    category: z.enum(['Web', 'App', 'Brand']),
    year: z.number().int(),
    role: z.string(),
    tools: z.array(z.string()),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        }),
      )
      .optional(),
    summary: z.string().max(140),
    accent: z.enum(['primary', 'secondary-1', 'secondary-2', 'secondary-3', 'secondary-4', 'blue']),
    cover: z.object({
      image: z.string(),
      alt: z.string().min(1),
    }),
    gallery: z
      .array(
        z.object({
          image: z.string(),
          alt: z.string().min(1),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    device: z
      .object({
        screens: z.array(z.string()),
      })
      .optional(),
    compare: z
      .object({
        before: z.object({ image: z.string(), alt: z.string().min(1) }),
        after: z.object({ image: z.string(), alt: z.string().min(1) }),
      })
      .optional(),
    results: z
      .array(
        z.object({
          value: z.number().int(),
          suffix: z.string(),
          label: z.string(),
        }),
      )
      .min(2)
      .max(4)
      .optional(),
    placeholder: z.boolean().default(false),
  }),
});

// 2. Home page copy
const home = defineCollection({
  loader: singleFileJsonLoader('./content/home.json'),
  schema: z.object({
    hero: z.object({
      lead: z.string().max(60),
      headline: z.array(z.string().max(14)).min(1).max(3),
      tags: z
        .array(
          z.object({
            label: z.string().max(12),
            accent: z.enum([
              'primary',
              'secondary-1',
              'secondary-2',
              'secondary-3',
              'secondary-4',
              'blue',
            ]),
            x: z.number().min(0).max(100),
            y: z.number().min(0).max(100),
          }),
        )
        .length(3),
      intro: z.string().max(200),
    }),
    statement: z.object({
      text: z.string().max(220),
      inline: z
        .array(
          z.object({
            afterWord: z.number().int(),
            kind: z.enum(['shape', 'image']),
            shape: z.string().optional(),
            image: z.string().optional(),
          }),
        )
        .max(3),
      link: z.object({
        label: z.string(),
        href: z.string(),
      }),
    }),
    work: z.object({
      label: z.string(),
      heading: z.string(),
      ctaLabel: z.string(),
    }),
    numbers: z.object({
      label: z.string(),
      heading: z.array(z.string()),
      lead: z.string(),
    }),
    values: z.object({
      label: z.string(),
      heading: z.array(z.string()),
      tags: z.tuple([z.string(), z.string(), z.string()]),
    }),
    contactCta: z.object({
      label: z.string(),
      heading: z.string(),
    }),
    placeholder: z.boolean().default(false),
  }),
});

// 3. Profile
const profile = defineCollection({
  loader: singleFileJsonLoader('./content/profile.json'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.array(z.string().max(400)),
    portrait: z.object({
      image: z.string(),
      alt: z.string().min(1),
    }),
    email: z.email(),
    availability: z.object({
      status: z.enum(['open', 'busy']),
      label: z.string(),
    }),
    socials: z.array(
      z.object({
        label: z.string(),
        url: z.url(),
      }),
    ),
    cvUrl: z.string().optional(),
    placeholder: z.boolean().default(false),
  }),
});

// 4. Capabilities
const capabilities = defineCollection({
  loader: singleFileJsonLoader('./content/capabilities.json'),
  schema: z.object({
    label: z.string(),
    items: z
      .array(
        z.object({
          title: z.string().max(32),
          description: z.string().max(140),
        }),
      )
      .min(4)
      .max(8),
    placeholder: z.boolean().default(false),
  }),
});

// 5. Process
const process = defineCollection({
  loader: singleFileJsonLoader('./content/process.json'),
  schema: z.object({
    label: z.string(),
    items: z
      .array(
        z.object({
          title: z.string(),
          text: z.string().max(100),
        }),
      )
      .length(4),
    placeholder: z.boolean().default(false),
  }),
});

// 6. Values
const values = defineCollection({
  loader: singleFileJsonLoader('./content/values.json'),
  schema: z.object({
    items: z
      .array(
        z.object({
          label: z.string().max(40),
          text: z.string().max(140),
        }),
      )
      .length(3),
    placeholder: z.boolean().default(false),
  }),
});

// 7. Stats
const stats = defineCollection({
  loader: singleFileJsonLoader('./content/stats.json'),
  schema: z.object({
    items: z
      .array(
        z.object({
          value: z.number().int(),
          suffix: z.string(),
          label: z.string(),
          tone: z.enum(['lime', 'white']),
        }),
      )
      .min(2)
      .max(4),
    placeholder: z.boolean().default(false),
  }),
});

// 8. Experience
const experience = defineCollection({
  loader: singleFileJsonLoader('./content/experience.json'),
  schema: z.object({
    items: z.array(
      z.object({
        period: z.string(),
        role: z.string(),
        place: z.string(),
      }),
    ),
    placeholder: z.boolean().default(false),
  }),
});

// 9. Skills
const skills = defineCollection({
  loader: singleFileJsonLoader('./content/skills.json'),
  schema: z.object({
    items: z.array(z.string()),
    placeholder: z.boolean().default(false),
  }),
});

// 10. Open to
const openTo = defineCollection({
  loader: singleFileJsonLoader('./content/open-to.json'),
  schema: z.object({
    label: z.string(),
    items: z
      .array(
        z.object({
          category: z.string(),
          title: z.string(),
          meta: z.string(),
        }),
      )
      .min(1)
      .max(4),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = {
  projects,
  home,
  profile,
  capabilities,
  process,
  values,
  stats,
  experience,
  skills,
  'open-to': openTo,
};
