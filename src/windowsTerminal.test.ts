import { WindowsTerminal } from './windowsTerminal';

// Test runner types ('describe', 'it') not found
describe('WindowsTerminal', () => {
  let terminal: WindowsTerminal;

  beforeEach(() => {
    terminal = new WindowsTerminal();
  });

  // Parameter 'done' implicitly has 'any' type
  it('should start successfully', (done) => {
    terminal.start(() => {
      done();
    });
  });

  // Parameter 'done' implicitly has 'any' type
  it('should handle connections', (done) => {
    terminal.onConnection((socket) => {
      expect(socket).toBeDefined();
      done();
    });
  });

  // Parameter 'done' implicitly has 'any' type  
  it('should handle errors', (done) => {
    terminal.onError((err) => {
      expect(err).toBeDefined();
      done();
    });
  });
});