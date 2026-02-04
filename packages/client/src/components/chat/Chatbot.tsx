import { Button } from '../ui/button';
import { FaArrowUp } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TypingIndicator from './TypingIndicator';

type FormData = {
   prompt: string;
};

const Chatbot = () => {
   const [isBotTyping, setIsBotTyping] = useState(false);
   const lastMessageRef = useRef<HTMLParagraphElement | null>(null);
   const [error, setError] = useState('');
   const [messages, setMessages] = useState<
      Array<{ role: 'user' | 'assistant'; content: string }>
   >([]);
   const conversationId = useRef(crypto.randomUUID()).current;
   const { register, handleSubmit, reset, formState } = useForm<FormData>();

   useEffect(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const onSubmit = async ({ prompt }: FormData) => {
      try {
         setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
         setIsBotTyping(true);
         setError('');
         reset();
         const { data } = await axios.post('/api/chat', {
            prompt,
            sessionId: conversationId,
         });
         setMessages((prev) => [...prev, { role: 'assistant', content: data }]);
      } catch (error) {
         console.error(error);
         setError('something went wrong. please try again!');
      } finally {
         setIsBotTyping(false);
      }
   };
   const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
   return (
      <div className="flex flex-col  h-full ">
         <div className="flex flex-col gap-3 mb-4 flex-1 overflow-y-auto">
            {messages.map((msg, index) => (
               <div
                  key={index}
                  onCopy={onCopyMessage}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={`px-3 py-1 rounded-xl
                        ${
                           msg.role === 'user'
                              ? 'self-end bg-blue-600 text-white '
                              : 'self-start bg-gray-100 text-black '
                        }`}
               >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
               </div>
            ))}
            {isBotTyping && <TypingIndicator />}
            {error && <p className=" text-red-600">{error}</p>}
         </div>

         <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={onKeyDown}
            className="flex flex-col gap-2 items-end border-2 p-4 rounded-3xl"
         >
            <textarea
               {...register('prompt', {
                  required: true,
                  validate: (data) => data.trim().length > 0,
               })}
               autoFocus
               placeholder="Ask anything"
               className="w-full border-0 focus:outline-0 resize-none"
               maxLength={1000}
            ></textarea>
            <Button
               disabled={!formState.isValid}
               className="rounded-full w-9 h-9"
            >
               <FaArrowUp />
            </Button>
         </form>
      </div>
   );
};

export default Chatbot;
