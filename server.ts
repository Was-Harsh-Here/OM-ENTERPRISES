import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, shopContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in environment (GEMINI_API_KEY).',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Om Copilot AI", an elite retail fintech accountant, shop manager, and financial analyst for "OM ENTERPRISES" (Authorized Retail CMS, Telecom LAPU, and Money Transfer Center).
You have full situational awareness of the store operations, daily master ledger, multi-gateway DMT portals, distributor settlements, telecom balances, and cash drawer.

Core Business Rules:
1. Indo-Nepal Remittance Policy:
   - Surcharge collected from customer: flat ₹300 per transaction.
   - Bank Account Deposit mode: Retailer net profit is ₹150.
   - Cash Counter Payout mode: Retailer net profit is ₹100.
   - Nepal Rupee (NPR) conversion peg: 1 INR = 1.60 NPR.
2. Portals & Gateways: Go Payments, The Simple Pay, VD Pays, Airtel CMS, Airpay, One Stop, Airtel Mitra, Jio POS+.
3. Distributors: Go Payments Pvt Ltd, The Simple Pay Tech, VD Pays, Royal Mobile Accessories, Sanjay Telecom, etc.
4. Accessories: Charging cables, adapters, earphones, power banks, tempered glasses with computer-generated receipts and explicit warranty tracking.

Real-time Shop State:
${shopContext ? JSON.stringify(shopContext, null, 2) : 'No live store context passed.'}

Your Responsibilities:
- Provide sharp, mathematically accurate accounting advice, profit breakdowns, and reconciliations.
- Flag any distributor dues that require urgent settlement.
- Guide the counter operator on how to maximize net profit (e.g. pushing Indo-Nepal account deposits, routing through the best portal fees).
- Help draft customer notices, receipts, warranty terms, or closing cash summaries.
- Keep tone professional, polite, helpful, and concise with clean Markdown, bullet points, and Rupee (₹) symbols.`;

    // Format messages for @google/genai
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = result.text || 'I could not generate an answer at this moment.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Server Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Error communicating with Gemini AI service.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BharatPay Om Enterprises server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
