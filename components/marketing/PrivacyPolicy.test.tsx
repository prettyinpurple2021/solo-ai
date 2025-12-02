import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { PrivacyPolicy } from './PrivacyPolicy';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
}));

describe('PrivacyPolicy', () => {
    it('renders heading', () => {
        render(
            <PrivacyPolicy />
        );
        const heading = screen.getByRole('heading', { name: /privacy policy/i });
        expect(heading).toBeInTheDocument();
    });
});
