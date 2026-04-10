import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { ConversationRepository } from './repository/converstaion.repository';
import { ChatService } from './services/chat.services';
import { ChatController } from './controller/chat.controller';
import OpenAI from 'openai';
import dotenv from 'dotenv';

const app = express();
app.use(
   cors({
      origin: 'https://futsum-chatbot.vercel.app',
      methods: ['GET', 'POST'],
   })
);
app.use(express.json());

const client = new OpenAI({
   apiKey: process.env.OPEN_AI_APIKEY,
   baseURL: 'https://openrouter.ai/api/v1',
});

const conversationRepo = new ConversationRepository();
const chatService = new ChatService(conversationRepo, client);
const chatController = new ChatController(chatService);

app.get('/', (req: Request, res: Response) => {
   res.send('Hello, World!');
});

app.post('/api/chat', async (req, res) => chatController.chat(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});
