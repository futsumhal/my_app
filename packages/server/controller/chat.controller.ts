import type { Request, Response } from 'express';
import z from 'zod';
import { ChatService } from '../services/chat.services';

const chatSchema = z.object({
   sessionId: z.string().uuid(),
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required')
      .max(1000, 'Prompt is too long (max 1000 characters)'),
});

export class ChatController {
   constructor(private readonly chatService: ChatService) {}

   async chat(req: Request, res: Response) {
      const parseResult = chatSchema.safeParse(req.body);

      if (!parseResult.success) {
         return res.status(400).json(parseResult.error.format());
      }

      try {
         const { sessionId, prompt } = parseResult.data;

         const reply = await this.chatService.chat(sessionId, prompt);

         res.send(reply);
      } catch (error) {
         res.status(500).json({ error: 'cannot process request' });
      }
   }
}
