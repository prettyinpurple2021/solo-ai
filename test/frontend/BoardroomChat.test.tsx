import React from 'react';
import { render, screen } from '@testing-library/react';
import { BoardroomChat } from '../../src/components/boardroom/BoardroomChat';
import { AGENTS } from '../../src/constants';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    })),
  };
});

describe('BoardroomChat Component', () => {
  it('renders the chat interface', () => {
    render(<BoardroomChat sessionId="session-1" />);
    expect(screen.getByText(/Active Discussion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/INTERJECT.../i)).toBeInTheDocument();
  });

  it('displays agent avatars in the header', () => {
    render(<BoardroomChat sessionId="session-1" />);
    // Check if at least some agent avatars are rendered (header has first 3)
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(3);
  });
});
