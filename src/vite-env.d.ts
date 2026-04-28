/// <reference types="vite/client" />

declare module "virtual:characters" {
  export const characters: Array<{
    id: string;
    updatedAt: string;
    name?: string;
  }>;
}
