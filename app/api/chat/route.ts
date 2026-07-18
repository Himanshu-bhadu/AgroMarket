import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },  
      select: { isPro: true, aiQuestionsUsed: true }
    });
    if (!user) return new NextResponse('User not found', { status: 404 });

    const FREE_LIMIT = 3;
    if (!user.isPro && user.aiQuestionsUsed >= FREE_LIMIT) {
      return new NextResponse('FREE_LIMIT_REACHED', { status: 403 });
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    // --- NEW: Save the User's question to the database ---
    const lastMessage = messages[messages.length - 1] as any; 
        
        if (lastMessage && lastMessage.role === 'user') {
          
          // 2. Smart extraction: Grab the text whether it's a simple string or buried in 'parts'
          const messageText = typeof lastMessage.content === 'string' 
            ? lastMessage.content 
            : (lastMessage.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || "");

          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: 'user',
              content: messageText, 
            }
          });
        }

    if (!user.isPro) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { aiQuestionsUsed: { increment: 1 } }
      });
    }

    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: `You are AI Kishan, a friendly, highly knowledgeable agricultural expert and advisor for Indian farmers.
      Your goal is to help farmers maximize their yield, deal with pests, understand weather patterns, and choose the right equipment.
      Keep your answers concise, practical, and easy to understand. Do not use overly complex jargon.
      If they ask about buying or renting equipment, remind them they can find it on the AgriMarket platform!`,
      messages: await convertToModelMessages(messages),
      
      // --- NEW: Save the AI's answer to the database once it finishes generating! ---
      async onFinish({ text }) {
        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: 'assistant',
            content: text,
          }
        });
      }
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("AI Chat Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}