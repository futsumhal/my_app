import { ConversationRepository } from '../repository/converstaion.repository';
import fs from 'fs';
import path from 'path';

const systemPrompt = fs.readFileSync(
   path.join(__dirname, '..', 'prompts', 'chatbot.txt'),
   'utf-8'
);

const systemMessage = {
   role: 'system' as const,
   content:
      `CRITICAL INSTRUCTIONS — YOU MUST FOLLOW THESE EXACTLY:\n\n` +
      systemPrompt,
};

export class ChatService {
   constructor(
      private readonly conversationRepo: ConversationRepository,
      private readonly client: any
   ) {}

   async chat(sessionId: string, prompt: string): Promise<string> {
      // 1. Save user message
      this.conversationRepo.addUserMessage(sessionId, prompt);

      // 2. Get conversation history
      const messages = this.conversationRepo.getOrCreate(sessionId);

      // 3. Call OpenAI with system prompt injected
      const response = await this.client.chat.completions.create({
         model: 'openai/gpt-4o-mini',
         messages: [systemMessage, ...messages],
         temperature: 0.3, // lower = more obedient to instructions
         max_tokens: 2000,
      });

      // 4. Extract reply
      const reply = response.choices[0].message.content;

      // 5. Save assistant reply
      this.conversationRepo.addAssistantMessage(sessionId, reply);

      return reply;
   }
}
