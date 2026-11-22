/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_E2E?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
