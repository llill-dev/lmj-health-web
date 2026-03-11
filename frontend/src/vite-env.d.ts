/// <reference types="vite/client" />

type ViteBooleanString = 'true' | 'false' | undefined;

declare interface ImportMetaEnv {
  readonly VITE_UI_ONLY: ViteBooleanString;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
