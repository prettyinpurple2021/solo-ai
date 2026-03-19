"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { logError, logWarn } from "@/lib/logger";

export interface UseVoiceInputResult {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

export function useVoiceInput(): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionCtor) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognitionCtor();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              // interim handling if needed
            }
          }
          if (finalTranscript) {
             setTranscript((prev) => prev ? `${prev} ${finalTranscript}` : finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          logError("Speech recognition error", event.error);
          setIsListening(false);
          toast.error("Voice input error: " + event.error);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
         logWarn("Speech Recognition not supported in this browser.");
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        toast.info("Listening...");
      } catch (error) {
        logError("Failed to start recognition", error);
        toast.error("Could not start voice input.");
      }
    } else if (!recognition) {
        toast.error("Voice input not supported on this device.");
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      toast.success("Stopped listening.");
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}
