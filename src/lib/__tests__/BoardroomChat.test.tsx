import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { jest, describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BoardroomChat } from '@/components/boardroom/BoardroomChat';
import { AGENTS } from '@/constants';
import { AgentId } from '@/types';
import { io } from 'socket.io-client';

jest.mock('@/lib/socket-client', () => ({
  fetchSocketAuthToken: jest.fn(() => Promise.resolve('mock-jwt')),
  getSocketIoBaseUrl: jest.fn(() => 'http://localhost:5000'),
}));

jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    io: jest.fn(() => mSocket),
  };
});

describe('BoardroomChat Component', () => {
  it('renders the chat interface', async () => {
    render(<BoardroomChat sessionId="session-1" />);
    await waitFor(() => expect(io).toHaveBeenCalled());
    expect(screen.getByText(/Active Discussion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/DIRECTIVE.../i)).toBeInTheDocument();
  });

  it('allows selecting a target agent', async () => {
    render(<BoardroomChat sessionId="session-1" />);
    await waitFor(() => expect(io).toHaveBeenCalled());
    const agentAvatars = screen.getAllByRole('img');
    fireEvent.click(agentAvatars[0]);

    expect(screen.getByText(/Target:/i)).toHaveTextContent(AGENTS[AgentId.ROXY].name);
  });

  it('triggers conclusion event', async () => {
    render(<BoardroomChat sessionId="session-1" />);
    await waitFor(() => {
      expect(io).toHaveBeenCalled();
    });
    const concludeBtn = screen.getByText(/Conclude/i);
    fireEvent.click(concludeBtn);

    const mSocket = (io as jest.Mock).mock.results.at(-1)?.value as { emit: jest.Mock };
    expect(mSocket.emit).toHaveBeenCalledWith('test-trigger-stream', expect.objectContaining({
      text: expect.stringContaining('adjourned')
    }));
  });
});
