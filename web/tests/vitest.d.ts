declare module 'vitest' {
  export const describe: any, it: any, expect: any, vi: any
}
declare const location: { hash: string }
declare const window: { addEventListener: (...args: any[]) => void }
declare const document: any
declare const fetch: any
declare const RequestInit: any
