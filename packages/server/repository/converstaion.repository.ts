type Message = {
   role: 'system' | 'user' | 'assistant';
   content: string;
};
export class ConversationRepository {
   private conversations = new Map<string, Message[]>();

   getOrCreate(sessionId: string): Message[] {
      if (!this.conversations.has(sessionId)) {
         this.conversations.set(sessionId, [
            { role: 'system', content: 'You are a helpful assistant.' },
         ]);
      }

      return this.conversations.get(sessionId)!;
   }

   addUserMessage(sessionId: string, content: string) {
      const messages = this.getOrCreate(sessionId);
      messages.push({ role: 'user', content });
   }

   addAssistantMessage(sessionId: string, content: string) {
      const messages = this.getOrCreate(sessionId);
      messages.push({ role: 'assistant', content });
   }
}
