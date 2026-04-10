import { FaArrowUp } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TypingIndicator from './TypingIndicator';
import popSound from '../../assets/sounds/pop.mp3.mp3';
import notificationSound from '../../assets/sounds/notification.mp3.wav';

const popAudio = new Audio(popSound);
popAudio.volume = 0.5;
const notificationAudio = new Audio(notificationSound);
notificationAudio.volume = 0.5;

type FormData = { prompt: string };

const Chatbot = () => {
   const [isBotTyping, setIsBotTyping] = useState(false);
   const lastMessageRef = useRef<HTMLDivElement | null>(null);
   const [error, setError] = useState('');
   const [messages, setMessages] = useState<
      Array<{ role: 'user' | 'assistant'; content: string }>
   >([]);
   const conversationId = useRef(crypto.randomUUID()).current;
   const { register, handleSubmit, reset, formState } = useForm<FormData>();
   const textareaRef = useRef<HTMLTextAreaElement | null>(null);

   useEffect(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages, isBotTyping]);

   const onSubmit = async ({ prompt }: FormData) => {
      try {
         setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
         setIsBotTyping(true);
         setError('');
         reset({ prompt: '' });
         if (textareaRef.current) {
            textareaRef.current.value = '';
            textareaRef.current.style.height = 'auto';
         }
         popAudio.play();

         const { data } = await axios.post(
            'https://futsum-chatbot-server.onrender.com/api/chat',
            {
               prompt,
               sessionId: conversationId,
            }
         );

         setMessages((prev) => [...prev, { role: 'assistant', content: data }]);
         notificationAudio.play();
      } catch {
         setError('Something went wrong. Please try again.');
      } finally {
         setIsBotTyping(false);
      }
   };

   const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleSubmit(onSubmit)();
      }
   };

   const onCopyMessage = (e: React.ClipboardEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
         e.preventDefault();
         e.clipboardData.setData('text/plain', selection);
      }
   };

   const { ref: formRef, ...rest } = register('prompt', {
      required: true,
      validate: (v) => v.trim().length > 0,
   });

   return (
      <div className="chat-window">
         {/* Header */}
         <div className="chat-header">
            <div className="chat-header-dot" />
            <span className="chat-header-title">
               Futsum's Portfolio Assistant
            </span>
            <span className="chat-header-subtitle">powered by futsum</span>
         </div>

         {/* Messages */}
         <div className="chat-messages">
            {messages.length === 0 && !isBotTyping && (
               <div className="chat-empty" style={{ opacity: 1 }}>
                  <div className="chat-empty-icon">⬡</div>
                  <div className="chat-empty-text">Start a conversation</div>
               </div>
            )}

            {messages.map((msg, index) => (
               <div
                  key={index}
                  onCopy={onCopyMessage}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={
                     msg.role === 'user'
                        ? 'bubble bubble-user'
                        : 'bubble bubble-assistant'
                  }
               >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
               </div>
            ))}

            {isBotTyping && (
               <div ref={lastMessageRef}>
                  <TypingIndicator />
               </div>
            )}

            {error && <div className="chat-error">⚠ {error}</div>}
         </div>

         {/* Input */}
         <div className="chat-input-area">
            <div className="chat-input-box">
               <textarea
                  {...rest}
                  ref={(el) => {
                     formRef(el);
                     textareaRef.current = el;
                  }}
                  onKeyDown={onKeyDown}
                  autoFocus
                  placeholder="Ask me anything about Futsum..."
                  className="chat-textarea"
                  maxLength={1000}
                  rows={1}
                  onInput={(e) => {
                     const t = e.currentTarget;
                     t.style.height = 'auto';
                     t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                  }}
               />
               <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={!formState.isValid}
                  className="chat-send-btn"
                  type="button"
                  aria-label="Send message"
               >
                  <FaArrowUp size={13} />
               </button>
            </div>
            <p className="chat-hint">
               ENTER to send · SHIFT+ENTER for new line
            </p>
         </div>
      </div>
   );
};

export default Chatbot;
