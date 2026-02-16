import React from 'react';
import { render, screen } from '@testing-library/react';
import { BoardroomChat } from '../../src/components/boardroom/BoardroomChat';
import { AGENTS } from '../../src/constants';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  return {
    io: jest.fn(() => mSocket),
  };
});

describe('BoardroomChat Component', () => {
  it('renders the chat interface', () => {
    render(<BoardroomChat sessionId="session-1" />);
    expect(screen.getByText(/Active Discussion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/INTERJECT.../i)).toBeInTheDocument();
  });

  it('connects to the boardroom namespace and joins the session', () => {
    render(<BoardroomChat sessionId="session-1" />);
    expect(io).toHaveBeenCalledWith(expect.stringContaining('/boardroom'));
    
    // Get the mock socket instance
    const mSocket = (io as jest.Mock).mock.results[0].value;
    
    // Simulate connection to trigger join-session
    const connectHandler = mSocket.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
    connectHandler();
    
    expect(mSocket.emit).toHaveBeenCalledWith('join-session', 'session-1');
  });
});
