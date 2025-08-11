// Environment variables type definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NEXT_PUBLIC_ADSENSE_CLIENT_ID?: string;
    }
  }
}

// This ensures the file is treated as a module
export {};