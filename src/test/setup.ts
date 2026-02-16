import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock scrollIntoView which is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();
