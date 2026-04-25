/// <reference types="vite/client" />

declare module 'virtual:characters' {
  export const characters: {
    filename: string;
    id: string;
    name: string;
    updatedAt: string;
  }[];
}
