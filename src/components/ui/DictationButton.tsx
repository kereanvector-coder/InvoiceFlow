import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DictationButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export function DictationButton({ onResult, className }: DictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            onResultRef.current(finalTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access in your browser settings to use dictation.');
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  if (!recognition) {
    return null; // Browser doesn't support speech recognition
  }

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={cn(
        "p-2 rounded-full transition-colors flex items-center justify-center",
        isListening 
          ? "bg-red-100 text-red-600 animate-pulse" 
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200",
        className
      )}
      title={isListening ? "Stop listening" : "Start dictation"}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
