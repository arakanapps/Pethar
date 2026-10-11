// Ambient type declarations for Next.js when using shadcn Supabase SSR blocks in Vite
declare module 'next/server' {
  export interface NextRequest {
    cookies: {
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string): void;
    };
    nextUrl: {
      clone(): { pathname: string };
      pathname: string;
    };
  }
  export const NextResponse: {
    next(options?: { request?: unknown }): {
      cookies: {
        set(name: string, value: string, options?: unknown): void;
        getAll(): Array<{ name: string; value: string }>;
        setAll(cookies: Array<{ name: string; value: string; options?: unknown }>): void;
      };
    };
    redirect(url: unknown): unknown;
  };
}

declare module 'next/headers' {
  export function cookies(): Promise<{
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: unknown): void;
  }>;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  }
}

declare const process: {
  env: Record<string, string | undefined>;
};
