import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { TermsOfService } from './TermsOfService';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
}));

describe('TermsOfService', () => {
    it('renders heading', () => {
        render(
            <TermsOfService />
        );
        const heading = screen.getByRole('heading', { name: /terms of service/i });
        expect(heading).toBeInTheDocument();
    });
});
