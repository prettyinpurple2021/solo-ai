// Lightweight shims to reduce noisy TypeScript errors while we triage
// These are intentionally permissive (any) and temporary. We'll replace
// them with accurate types as we stabilize the codebase.

// declare module "@/lib/neon/server" {
//   export function createClient(...args: any[]): any;
//   const _default: any;
//   export default _default;
// }
//
// declare module "@/lib/neon/client" {
//   export function createClient(...args: any[]): any;
//   const _default: any;
//   export default _default;
// }
//
// declare module "./neon/client" {
//   export function createClient(...args: any[]): any;
//   const _default: any;
//   export default _default;
// }
//
// declare module "@/lib/neon" {
//   const anything: any;
//   export default anything;
// }

// Common global helpers that many libs reference without strict imports
// Common global helpers that many libs reference without strict imports
// declare global {
//   const query: (...args: any[]) => Promise<any>;
//   const db: any;
//
//   function logInfo(...args: any[]): void;
//   function logWarn(...args: any[]): void;
//   function logError(...args: any[]): void;
//   function logDebug(...args: any[]): void;
//
//   const openai: any;
//   function generateText(...args: any[]): Promise<any>;
//   function generateObject(...args: any[]): Promise<any>;
// }

export {};
