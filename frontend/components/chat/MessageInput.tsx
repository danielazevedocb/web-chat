'use client';

import {
  FileText,
  Image,
  Mic,
  MicOff,
  Paperclip,
  Send,
  Smile,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, type: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  isSending: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  isSending,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Emojis comuns
  const emojis = [
    '😀',
    '😊',
    '😂',
    '😍',
    '🤔',
    '😮',
    '😢',
    '😡',
    '👍',
    '👎',
    '❤️',
    '🎉',
    '🔥',
    '💯',
    '👌',
    '🙏',
  ];

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Gerenciar indicador de digitação
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Parar de digitar após 2 segundos de inatividade
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || selectedFiles.length > 0) {
      if (selectedFiles.length > 0) {
        // Enviar arquivos primeiro
        handleSendFiles();
      } else {
        // Enviar mensagem de texto
        onSendMessage(message.trim(), 'TEXTO');
        setMessage('');
      }

      // Parar indicador de digitação
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }

      // Limpar timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendFiles = async () => {
    // Aqui você implementaria o upload dos arquivos
    // Por enquanto, vamos simular o envio
    selectedFiles.forEach((file) => {
      console.log('Enviando arquivo:', file.name);
      // Simular envio de arquivo
      onSendMessage(`Arquivo enviado: ${file.name}`, 'ARQUIVO');
    });

    setSelectedFiles([]);
    setShowFilePicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Aqui você implementaria a gravação de áudio
    console.log('Iniciando gravação...');
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Aqui você implementaria o envio do áudio
    console.log('Parando gravação...');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              Arquivos selecionados ({selectedFiles.length})
            </h4>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpar todos
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0">{getFileIcon(file)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input de mensagem */}
      <div className="flex items-end space-x-3">
        {/* Botões de ação */}
        <div className="flex items-center space-x-2">
          {/* Anexar arquivo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Gravação de áudio */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`p-2 ${
              isRecording
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Emoji */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Adicionar emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Picker de emojis */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmoji(emoji)}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campo de texto */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Botão de envio */}
        <button
          onClick={handleSendMessage}
          disabled={
            disabled ||
            isSending ||
            (!message.trim() && selectedFiles.length === 0)
          }
          className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Enviar mensagem"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Input oculto para arquivos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Indicador de digitação */}
      {isTyping && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <span>Digitando...</span>
        </div>
      )}
    </div>
  );
}
