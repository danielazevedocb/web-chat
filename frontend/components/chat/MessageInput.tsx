'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Video, Send, Smile } from 'lucide-react';
import { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (
    content: string,
    type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'EMOJI',
    options?: { fileUrl?: string; fileSize?: number; mimeType?: string }
  ) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), 'TEXT');
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (onStopTyping) {
        onStopTyping();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);

    if (onTyping && value.trim()) {
      onTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 1000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const data = await response.json();
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${data.url}`;

      onSend(fileUrl, data.type as 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE', {
        fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          onSend(reader.result as string, 'AUDIO');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-card">
      <div className="flex items-end gap-2">
        {/* File Input (hidden) */}
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
        />

        {/* Emoji Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            // TODO: Implementar emoji picker
            alert('Emoji picker em breve');
          }}
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* File Upload Button */}
        <label htmlFor="file-input">
          <Button type="button" variant="ghost" size="icon" asChild>
            <span>
              <Paperclip className="h-5 w-5" />
            </span>
          </Button>
        </label>

        {/* Audio Record Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          className={isRecording ? 'bg-destructive/10 text-destructive' : ''}
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Video Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            // TODO: Implementar gravação de vídeo
            alert('Gravação de vídeo em breve');
          }}
        >
          <Video className="h-5 w-5" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              handleInputChange(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="min-h-[44px] max-h-[120px] resize-none pr-12"
            disabled={disabled}
          />
        </div>

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
