// Global type declarations to resolve legacy import issues without overriding React itself.

declare module '*.tsx' {
  const content: any;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
}

declare global {
  type ReactNode = import('react').ReactNode;

  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }

  interface SpeechRecognition {
    continuous: boolean
    interimResults: boolean
    lang: string
    start: () => void
    stop: () => void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart?: (() => void) | null
  }

  interface SpeechRecognitionEvent {
    resultIndex: number
    results: ArrayLike<{
      isFinal: boolean
      0: { transcript: string }
    }>
  }

  interface SpeechRecognitionErrorEvent {
    error: string
  }
}

export {}
