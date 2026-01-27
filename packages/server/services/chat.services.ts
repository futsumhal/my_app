import { ConversationRepository } from '../repository/converstaion.repository';

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

      // 3. Call OpenAI
      const response = await this.client.chat.completions.create({
         model: 'openai/gpt-4o-mini',
         messages,
         temperature: 0.2,
         max_tokens: 100,
      });

      // 4. Extract reply
      const reply = response.choices[0].message.content;

      // 5. Save assistant reply
      this.conversationRepo.addAssistantMessage(sessionId, reply);

      return reply;
   }
}
