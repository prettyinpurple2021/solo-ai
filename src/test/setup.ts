import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream, TransformStream } from 'node:stream/web';

// Polyfill globals for Node/Jest environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// Polyfill web streams
if (typeof global.ReadableStream === 'undefined') {
  // @ts-ignore
  global.ReadableStream = ReadableStream;
  // @ts-ignore
  global.WritableStream = WritableStream;
  // @ts-ignore
  global.TransformStream = TransformStream;
}

// Polyfill MessagePort
if (typeof global.MessagePort === 'undefined') {
  // @ts-ignore
  global.MessagePort = class MessagePort {};
}

// Polyfill fetch if missing - use a simpler polyfill for JSDOM to avoid Undici timer issues
if (typeof global.fetch === 'undefined') {
  // Use node-fetch style simple polyfill or native if available in Node 18+
  if (parseInt(process.versions.node.split('.')[0]) >= 18) {
    // @ts-ignore
    global.fetch = globalThis.fetch;
    // @ts-ignore
    global.Request = globalThis.Request;
    // @ts-ignore
    global.Response = globalThis.Response;
    // @ts-ignore
    global.Headers = globalThis.Headers;
  } else {
    // Fallback for older node if absolutely needed, but prefer native
    const { fetch, Request, Response, Headers } = await import('undici');
    // @ts-ignore
    global.fetch = fetch;
    // @ts-ignore
    global.Request = Request;
    // @ts-ignore
    global.Response = Response;
    // @ts-ignore
    global.Headers = Headers;
  }
}

// Mock scrollIntoView which is not implemented in jsdom
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Mock scrollIntoView which is not implemented in jsdom
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}
