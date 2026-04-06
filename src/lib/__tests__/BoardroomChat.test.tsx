import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AGENTS } from '@/constants';
import { AgentId } from '@/types';

let BoardroomChat: React.FC<{ sessionId: string }>;
let mockIo: jest.Mock;
let mockSocket: { on: jest.Mock; emit: jest.Mock; disconnect: jest.Mock };

beforeAll(async () => {
  mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  mockIo = jest.fn(() => mockSocket);

  await jest.unstable_mockModule('@/lib/socket-client', () => ({
    fetchSocketAuthToken: jest.fn(() => Promise.resolve('mock-jwt')),
    getSocketIoBaseUrl: jest.fn(() => 'http://localhost:5000'),
  }));

  await jest.unstable_mockModule('socket.io-client', () => ({
    io: mockIo,
  }));

  const mod = await import('@/components/boardroom/BoardroomChat');
  BoardroomChat = mod.BoardroomChat as React.FC<{ sessionId: string }>;
});

describe('BoardroomChat Component', () => {
  it('renders the chat interface', async () => {
    render(<BoardroomChat sessionId="session-1" />);
    await waitFor(() => expect(mockIo).toHaveBeenCalled());
    expect(screen.getByText(/Active Discussion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/DIRECTIVE.../i)).toBeInTheDocument();
  });

  it('allows selecting a target agent', async () => {
    render(<BoardroomChat sessionId="session-1" />);
    await waitFor(() => expect(mockIo).toHaveBeenCalled());
    const agentAvatars = screen.getAllByRole('img');
    fireEvent.click(agentAvatars[0]);

    expect(screen.getByText(/Target:/i)).toHaveTextContent(AGENTS[AgentId.ROXY].name);
  });

  it('triggers conclusion event', async () => {
    render(<BoardroomChat sessionId="session-1" />);
    await waitFor(() => {
      expect(mockIo).toHaveBeenCalled();
    });
    const concludeBtn = screen.getByText(/Conclude/i);
    fireEvent.click(concludeBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith('test-trigger-stream', expect.objectContaining({
      text: expect.stringContaining('adjourned')
    }));
  });
});
