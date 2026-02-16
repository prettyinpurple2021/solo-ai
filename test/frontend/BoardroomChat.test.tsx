import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardroomChat } from '../../src/components/boardroom/BoardroomChat';
import { AGENTS } from '../../src/constants';
import { AgentId } from '../../src/types';
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
    expect(screen.getByPlaceholderText(/DIRECTIVE.../i)).toBeInTheDocument();
  });

  it('allows selecting a target agent', () => {
    render(<BoardroomChat sessionId="session-1" />);
    const agentAvatars = screen.getAllByRole('img');
    fireEvent.click(agentAvatars[0]);
    
    // Header images are sliced(0,3), first one should be roxy
    expect(screen.getByText(/Target:/i)).toHaveTextContent(AGENTS[AgentId.ROXY].name);
  });

  it('triggers conclusion event', () => {
    render(<BoardroomChat sessionId="session-1" />);
    const concludeBtn = screen.getByText(/Conclude/i);
    fireEvent.click(concludeBtn);
    
    const mSocket = (io as jest.Mock).mock.results[0].value;
    expect(mSocket.emit).toHaveBeenCalledWith('test-trigger-stream', expect.objectContaining({
      text: expect.stringContaining('adjourned')
    }));
  });
});
