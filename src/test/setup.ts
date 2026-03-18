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

// Polyfill fetch primitives if missing or invalid.
if (typeof global.fetch !== 'function' && typeof globalThis.fetch === 'function') {
  // @ts-ignore
  global.fetch = globalThis.fetch;
}

if (typeof global.Request !== 'function') {
  // @ts-ignore
  global.Request = globalThis.Request || class Request {};
}

if (typeof global.Response !== 'function') {
  // @ts-ignore
  global.Response = globalThis.Response || class Response {};
}

if (typeof global.Headers !== 'function') {
  // @ts-ignore
  global.Headers = globalThis.Headers || class Headers {};
}

if (typeof global.fetch !== 'function') {
  // Fallback mock for environments where Fetch API is unavailable.
  // Tests that need fetch should mock responses explicitly.
  // @ts-ignore
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({}), text: async () => '' }));
}

// Mock scrollIntoView which is not implemented in jsdom
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Mock scrollIntoView which is not implemented in jsdom
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}
