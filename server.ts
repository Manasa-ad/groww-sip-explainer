import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateQuestion, FALLBACK_RESPONSE } from './src/utils/explainerEngine.ts';

dotenv.config();

// Post-generation output check (Critical fix): the pre-generation engine only
// gates the QUESTION. A live model's answer still needs to be checked before it
// reaches the user — a system prompt alone doesn't guarantee compliance. This scans
// the actual GENERATED TEXT for a fixed list of unsafe phrases.
//
// Known limitation, stated plainly: this is a basic phrase-match filter, not
// complete factual verification. It catches advice/prediction language written in
// the specific wordings listed below; it would NOT catch the same violation phrased
// differently, and it cannot detect an unsupported factual claim that uses none of
// these phrases. Treat it as a safety net for the most common failure modes, not a
// guarantee that every generated answer is correct or compliant.
function findUnsafePattern(text: string): string | null {
  const lower = text.toLowerCase();
  const unsafePhrases = [
    'i recommend',
    'i\'d recommend',
    'you should invest in',
    'you should switch to',
    'you should buy',
    'i suggest switching',
    'i suggest you',
    'the best fund is',
    'i\'d suggest',
    'you should cancel',
    'you should redeem',
    'you should pause',
    'you should skip',
    'you should sell',
    'you should stop your sip',
    'guaranteed return',
    'guaranteed to',
    'will definitely give you',
    'you will earn',
    'you will get',
  ];
  return unsafePhrases.find((phrase) => lower.includes(phrase)) ?? null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API endpoint for SIP Explainer
  app.post('/api/explain', async (req, res) => {
    try {
      const { question, context } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }

      // 1. Evaluate with pure logic guardrail engine first
      const engineResult = evaluateQuestion(question);

      // If query matches mandatory unconfirmed policy (bank mandate) or strict advice refusals,
      // return the verified guardrail result directly to guarantee 0 advice leaks
      if (
        engineResult.isFallback ||
        engineResult.guardrailLabel.includes('Advice Refusal') ||
        engineResult.guardrailLabel.includes('Calculation Guardrail') ||
        engineResult.guardrailLabel.includes('Prediction Refusal') ||
        engineResult.guardrailLabel.includes('Data Boundary')
      ) {
        return res.json(engineResult);
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json(engineResult);
      }

      // 2. Call Gemini API with strict system instructions
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are a non-advisory investment explainer inside Groww, a mutual fund investing app in India.
You ONLY explain concepts and mechanics from the knowledge base below.
You NEVER give investment advice, NEVER recommend or name specific funds, NEVER predict future returns, and NEVER make up a number the user hasn't given you.
Keep responses short (2-4 sentences), in plain beginner-friendly language, and support Hinglish phrasing if the user writes in Hinglish.

KNOWLEDGE BASE:
TERMINOLOGY
- NAV (Net Asset Value): the per-unit value of a fund = (assets − liabilities) / units outstanding, published daily. The NAV number itself (high or low) does NOT indicate a fund's quality or performance — two funds with different NAVs can deliver identical % returns.
- XIRR: the correct return measure for SIPs and multiple irregular cash flows (unlike CAGR). It accounts for the exact date and amount of every instalment. It is personal — two investors in the same fund can have different XIRRs based on their own contribution dates/amounts, even with identical fund performance.
- CAGR: Compound Annual Growth Rate = (Ending Value / Beginning Value)^(1/years) − 1. Best for a single lump-sum investment with no additions/withdrawals. NOT suitable for measuring SIP returns — use XIRR instead for SIPs.
- Expense ratio: an annual fee (% of assets) deducted from the fund's NAV before the investor sees any return. Direct plans have a lower expense ratio than Regular plans because no distributor commission is included. On Groww specifically, the number shown in the app is the Base Expense Ratio (BER) — the AMC's core management cost — not the complete Total Expense Ratio (TER), which also includes brokerage, transaction costs and GST on top of BER.

PERFORMANCE
- The portfolio value graph plots total value over time (instalments plus market movement), not a prediction. Green/red shading just shows whether value is currently above or below where the selected period started — day-to-day movement is normal and isn't a locked-in gain or loss until units are redeemed.
- A negative return means the current value is below what was invested for that period. This is an UNREALISED ("notional") loss unless units are actually sold — it only becomes a permanent/locked-in loss if redeemed at that lower value.
- A fund's value moves with the market value of what it holds (stocks, bonds, etc.) — broader market and economic conditions drive short-term declines, not fund mismanagement. Short-term volatility is normal, especially for equity funds.
- Two investors in the same fund can get different returns mainly because of the exact dates and amounts of their own instalments (different SIP dates buy units at different prices) — not because the fund treated them differently. This difference can narrow over a long holding period, but there's no guarantee it will.
- Calculating someone's actual personal return requires the exact date and amount of every instalment, plus their current value (or redemption amount) and its date. A general explanation of "why returns differ" is NOT the same as a personal calculation — never calculate or state a specific return number without this data being given by the user.

SIP MECHANICS
- Skipping an instalment: you can skip ONE SIP instalment at a time, for free (no ECS bounce charges, late fees, or penalties). You can request another skip once the earlier skipped date has passed. Skipping 3 consecutive instalments auto-cancels the SIP. If the next instalment is due within 2 days, a skip request applies from the instalment after that one.
- Pausing: Groww does NOT offer a general multi-month pause. The real feature is Skip Instalment — it skips only the next scheduled debit, and the SIP resumes automatically from the following one. Never describe a 1–6 month pause as a Groww feature.
- Cancelling: stops future instalments only. On Groww, cancellation can take up to 7 days to process — a debit close to the due date may still go through, and once units are allotted from that debit, it cannot be refunded. There is no penalty for cancelling itself.
- Does cancelling redeem/withdraw your money? NO. Cancelling only stops future instalments. Existing invested units stay invested and continue tracking the market. Redemption is a separate, explicit action you must request to get money back.
- Redemption (full): selling all your units at that day's applicable NAV, with money credited to your registered bank account typically within 2-3 business days (T+2/T+3) for equity funds. Redeeming is independent of cancelling a SIP — redeeming existing units does NOT stop future SIP instalments, and cancelling a SIP does NOT redeem existing units. An exit load may apply if redeemed before a fund's minimum holding period.
- Redemption (partial): you can redeem only part of your holding by specifying an amount or unit count less than the full balance; the remaining units stay invested and continue as before, with no separate penalty for the partial redemption itself beyond any applicable exit load.
- How redemption works generally: submit a redemption request (amount or units), it executes at the NAV applicable for that business day (orders before the fund's cutoff time, usually 3 PM, get that day's NAV), and proceeds are credited to the bank account within 2-3 business days for equity/hybrid funds (faster for liquid/overnight funds).
- Instalment failure: a SIP is auto-cancelled after 3 consecutive missed or rejected instalments (due to insufficient balance, a frozen/blocked account, net banking not registered, a blocked debit card, KYC issues, or a missing/expired mandate).
- What happens if you cancel your bank mandate (NOT the SIP itself): THIS IS NOT CONFIRMED. Use the fallback response for this specific question — do not guess or infer an answer, even though it's related to instalment failure above.

OUT OF SCOPE (cross-product and tax boundaries)
- Stocks: this prototype only covers mutual funds. Never recommend a stock or stock-pick — redirect to Groww's stock research tools or a SEBI-registered advisor.
- Loans vs redeeming: never tell the user which is better (depends on interest rates, income stability, personal circumstances). Explain mechanics only, defer the decision to a certified financial advisor.
- Exact tax liability: never invent a tax amount. It depends on holding period (LTCG vs STCG), fund type (equity vs debt), and the user's income slab — explain the general LTCG/STCG distinction only, and point to Groww's tax summary or a tax advisor for the exact number.
- Emergency funds: never advise how to allocate personal emergency savings into mutual funds; explain that experts generally favor liquid, capital-safe instruments, and defer personal allocation decisions to a certified financial advisor.

FALLBACK RESPONSE:
"I don't have verified information to answer that accurately. For this, please check the Groww app's help center or contact Groww support directly — I don't want to guess and risk giving you wrong information."`;

      // Timeout promise to prevent long hangs
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Server Gemini call timed out (10s)')), 10000);
      });

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: context ? `Context: ${context}\n\nQuestion: ${question}` : question,
        config: {
          systemInstruction,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const generatedText = response.text || engineResult.text;

      // Output validation: if the generated answer itself violates a guardrail
      // (regardless of what the system prompt says), discard it and fall back to
      // the verified deterministic answer rather than show an unsupported claim.
      const violatedPhrase = findUnsafePattern(generatedText);
      if (violatedPhrase) {
        console.warn(`Blocked Gemini output — matched unsafe phrase "${violatedPhrase}"`);
        return res.json({
          ...engineResult,
          guardrailLabel: 'Output Safety Filter (phrase match — not a full fact-check)',
        });
      }

      return res.json({
        text: generatedText,
        // Honest label: this text is Gemini-generated against our knowledge base in
        // the system prompt, not pulled verbatim from it — it only passed the basic
        // phrase-match output filter above, not a full fact-check.
        guardrailLabel: 'Gemini-generated (passed output safety filter)',
        isFallback: generatedText.includes("I don't have verified information"),
      });
    } catch (err) {
      console.error('Server Gemini call error, using deterministic engine:', err);
      const fallbackResult = evaluateQuestion(req.body?.question || '');
      return res.json(fallbackResult);
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
