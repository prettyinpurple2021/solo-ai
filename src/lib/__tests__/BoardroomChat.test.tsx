import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AGENTS } from '@/constants';
import { AgentId } from '@/types';

let BoardroomChat: React.FC<{ sessionId: string }>;
let mockIo: jest.Mock;
let mockSocket: { on: jest.Mock; emit: jest.Mock; disconnect: jest.Mock };
let mockFetchSocketAuthToken: jest.Mock<() => Promise<string | null>>;

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

  const socketClientMod = await import('@/lib/socket-client');
  mockFetchSocketAuthToken = socketClientMod.fetchSocketAuthToken as jest.Mock<() => Promise<string | null>>;

  const mod = await import('@/components/boardroom/BoardroomChat');
  BoardroomChat = mod.BoardroomChat as React.FC<{ sessionId: string }>;
});

describe('BoardroomChat Component', () => {
  function getLastAuthCallback() {
    const lastCall = mockIo.mock.calls[mockIo.mock.calls.length - 1] as [
      string,
      { auth?: (cb: (data: { token: string }) => void) => void },
    ];
    return lastCall[1].auth!;
  }

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
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();

    render(<BoardroomChat sessionId="session-conclude" />);
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    // Simulate Socket.IO 'connect' so the socket is available in component state
    const connectHandler = (mockSocket.on.mock.calls as Array<[string, () => void]>)
      .find(([evt]) => evt === 'connect')?.[1];
    expect(connectHandler).toBeDefined();
    await act(async () => connectHandler!());

    fireEvent.click(screen.getByText(/Conclude/i));

    await waitFor(() =>
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'test-trigger-stream',
        expect.objectContaining({ text: expect.stringContaining('adjourned') })
      )
    );
  });

  it('passes an auth callback to io() that provides the fetched token', async () => {
    render(<BoardroomChat sessionId="session-auth" />);
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    const auth = getLastAuthCallback();
    expect(typeof auth).toBe('function');

    const cb = jest.fn();
    auth(cb);
    await waitFor(() => expect(cb).toHaveBeenCalledWith({ token: 'mock-jwt' }));
  });

  it('auth callback passes empty token when fetchSocketAuthToken returns null', async () => {
    mockFetchSocketAuthToken.mockResolvedValueOnce(null);

    render(<BoardroomChat sessionId="session-auth-null" />);
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    const cb = jest.fn();
    getLastAuthCallback()(cb);
    await waitFor(() => expect(cb).toHaveBeenCalledWith({ token: '' }));
  });

  it('auth callback passes empty token when fetchSocketAuthToken rejects', async () => {
    mockFetchSocketAuthToken.mockRejectedValueOnce(new Error('network error'));

    render(<BoardroomChat sessionId="session-auth-reject" />);
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    const cb = jest.fn();
    getLastAuthCallback()(cb);
    await waitFor(() => expect(cb).toHaveBeenCalledWith({ token: '' }));
  });
});
