// Shim module to fix pdfjs-dist worker import issue with pdf-parse
// For server-side usage, we don't need the worker URL (workers are browser-only)
// This provides a default export that pdf-parse expects
// The worker URL is only needed in browser environments, so we can export null or a placeholder
const worker = null;
export default worker;

