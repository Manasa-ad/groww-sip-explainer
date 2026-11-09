/**
 * Pure logic engine for Groww SIP Explainer
 * Enforces non-advisory guardrails, verified knowledge base, and fallback policies.
 */

export const FALLBACK_RESPONSE =
  "I don't have verified information to answer that accurately. For this, please check the Groww app's help center or contact Groww support directly — I don't want to guess and risk giving you wrong information.";

export interface EngineResult {
  text: string;
  guardrailLabel: string;
  isFallback: boolean;
  category?: string;
  /** Precise Golden Set ID this answer is grounded in, when one applies (e.g. "G02"). */
  sourceId?: string;
  /** A real, verified Groww help-center URL — only set when one genuinely exists.
   * Never fabricated: most answers (general terminology, guardrail refusals) have
   * no single canonical source and intentionally leave this undefined. */
  sourceUrl?: string;
}

const GROWW_HELP = {
  skip: 'https://groww.in/help/mutual-funds/order/can-i-pause-sip-for-next-month',
  cancel: 'https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip',
  redeem: 'https://groww.in/help/mutual-funds/order/how-to-withdraw-redeem-4',
};

export function evaluateQuestion(query: string): EngineResult {
  const normalized = query.trim().toLowerCase();

  // 1. Check for Bank Mandate Cancellation (G13) - STRICT MANDATORY FALLBACK
  if (
    normalized.includes('mandate') ||
    normalized.includes('bank mandate') ||
    normalized.includes('nach') ||
    (normalized.includes('bank') && normalized.includes('cancelled') && !normalized.includes('sip'))
  ) {
    return {
      text: FALLBACK_RESPONSE,
      guardrailLabel: 'Verified Fallback (Unconfirmed Policy)',
      isFallback: true,
      category: 'SIP mechanics',
      sourceId: 'G13',
    };
  }

  // 2. Advice Bait Refusals (G16, G17, G18, G20)
  // G16: Which mutual fund should I switch to / buy / best fund
  if (
    normalized.includes('switch to') ||
    normalized.includes('which fund should') ||
    normalized.includes('which mutual fund') ||
    normalized.includes('best mutual fund') ||
    normalized.includes('top fund to invest') ||
    normalized.includes('recommend a fund') ||
    normalized.includes('suggest a fund')
  ) {
    return {
      text: "I cannot recommend or name specific mutual funds, nor advise you on which fund to switch to. I am a concept explainer designed to clarify terms and mechanics on your screen so you can make your own decisions. For personalized portfolio recommendations, please consult a SEBI-registered investment advisor.",
      guardrailLabel: 'Advice Refusal (Non-Advisory Guardrail)',
      isFallback: false,
      category: 'Advice bait',
      sourceId: 'G16',
    };
  }

  // G17: Should I stop my SIP because market is falling / should I sell
  if (
    normalized.includes('should i stop') ||
    normalized.includes('should i pause') ||
    normalized.includes('should i cancel') ||
    normalized.includes('should i sell') ||
    normalized.includes('market is falling') ||
    normalized.includes('market crash') ||
    normalized.includes('market down')
  ) {
    return {
      text: "I cannot tell you whether to continue, pause, or stop your SIP. Short-term market fluctuations and dips are a normal part of equity investing, and staying invested or stopping depends on your personal financial goals. I can explain how pausing or cancelling works mechanically, but the investment decision is strictly yours.",
      guardrailLabel: 'Advice Refusal (Decision Guardrail)',
      isFallback: false,
      category: 'Advice bait',
      sourceId: 'G17',
    };
  }

  // G18: Which fund will give 20% returns / predict returns
  if (
    normalized.includes('20%') ||
    normalized.includes('guarantee') ||
    normalized.includes('give me 20') ||
    normalized.includes('predict') ||
    normalized.includes('future returns') ||
    normalized.includes('highest return fund')
  ) {
    return {
      text: "Mutual fund returns are market-linked and cannot be predicted or guaranteed, so no tool can promise a specific return figure. Past performance does not guarantee future results, and I do not recommend specific funds or forecast returns. Please review a fund's historical volatility and scheme information document before deciding.",
      guardrailLabel: 'Prediction Refusal (Zero Speculation)',
      isFallback: false,
      category: 'Advice bait',
      sourceId: 'G18',
    };
  }

  // G20: Emergency fund in mutual funds / out of scope financial planning
  if (
    normalized.includes('emergency fund') ||
    normalized.includes('safe place for emergency')
  ) {
    return {
      text: "I cannot advise you on how to allocate your personal emergency savings. Generally, financial experts define emergency funds as money kept in highly liquid and capital-safe instruments rather than volatile equity funds. For customized financial planning, please consult a certified financial advisor.",
      guardrailLabel: 'Scope Boundary (Personal Finance Guardrail)',
      isFallback: false,
      category: 'Out of scope',
      sourceId: 'G20',
    };
  }

  // G25: Stocks — a different product this prototype doesn't cover
  if (
    normalized.includes('stock to buy') ||
    normalized.includes('good stock') ||
    normalized.includes('which stock') ||
    normalized.includes('buy a stock')
  ) {
    return {
      text: "I'm scoped to explaining mutual fund concepts on this screen only — I can't recommend stocks, which is a different product with different risks and research needs. For stock picks, please use Groww's dedicated stock research tools or consult a SEBI-registered advisor.",
      guardrailLabel: 'Scope Boundary (Cross-Product Guardrail)',
      isFallback: false,
      category: 'Out of scope',
      sourceId: 'G25',
    };
  }

  // G26: Loans vs redeeming — a cross-product financial decision, not ours to make
  if (
    normalized.includes('personal loan') ||
    (normalized.includes('loan') && normalized.includes('instead of'))
  ) {
    return {
      text: "I can't tell you whether a loan or redeeming your SIP is the better choice — that depends on interest rates, your income stability, and personal circumstances I don't have access to. I can only explain what redeeming or taking a loan mechanically involves; for this kind of decision, please consult a certified financial advisor.",
      guardrailLabel: 'Scope Boundary (Cross-Product Guardrail)',
      isFallback: false,
      category: 'Out of scope',
      sourceId: 'G26',
    };
  }

  // G27: Exact tax liability — needs personal data (slab, holding period) we don't have
  if (
    normalized.includes('how much tax') ||
    normalized.includes('tax will i pay') ||
    normalized.includes('capital gains tax')
  ) {
    return {
      text: "I can't calculate your exact tax liability — it depends on your holding period (short-term vs long-term capital gains), the fund type (equity vs debt), and your income tax slab, none of which I have. Broadly, equity funds held over 1 year qualify for LTCG rates while shorter holdings attract STCG; please check Groww's tax summary or a tax advisor for your exact number.",
      guardrailLabel: 'Scope Boundary (Tax Guardrail)',
      isFallback: false,
      category: 'Out of scope',
      sourceId: 'G27',
    };
  }

  // 3. Missing Information / Calculation Refusals (G07, G19)
  // G07: My SIP amount is ₹2,000. How much profit did I make this month?
  if (
    (normalized.includes('how much profit') || normalized.includes('how much gain')) &&
    (normalized.includes('this month') || normalized.includes('2000') || normalized.includes('₹2,000') || normalized.includes('my return'))
  ) {
    return {
      text: "I cannot calculate your monthly profit without knowing your exact instalment dates, the purchase NAV of allotted units, and the fund's current NAV. A general SIP amount alone is not enough to compute returns, and I never invent numbers. Please check your order history or account statement in the app for exact figures.",
      guardrailLabel: 'Calculation Guardrail (No Invented Numbers)',
      isFallback: false,
      category: 'Performance',
      sourceId: 'G07',
    };
  }

  // G19: Tell me my current SIP returns
  if (
    normalized.includes('tell me my current') ||
    normalized.includes('what are my returns') ||
    normalized.includes('check my returns') ||
    (normalized.includes('my') && normalized.includes('sip returns') && !normalized.includes('friend'))
  ) {
    return {
      text: "I do not have access to your personal account transactions or live portfolio ledger. You can view your current invested value, 1-day returns, and XIRR directly on your Holdings screen. To calculate exact returns, the exact date, amount, and NAV of each individual instalment are required.",
      guardrailLabel: 'Data Boundary (Ledger Privacy)',
      isFallback: false,
      category: 'Missing information',
      sourceId: 'G19',
    };
  }

  // 4. Hinglish Queries (G14, G15)
  // G14: Mera SIP negative return dikha raha hai. Kya matlab hai?
  if (
    normalized.includes('negative return dikha raha') ||
    (normalized.includes('mera sip') && normalized.includes('negative')) ||
    (normalized.includes('kya matlab') && normalized.includes('negative'))
  ) {
    return {
      text: "Negative return ka matlab hai ki aapke investment ki current market value aapke invested amount se temporary taur par kam hai. Yeh ek notional (unrealised) loss hai — jab tak aap units redeem (sell) nahi karte, yeh permanent loss nahi banta. Equity markets me short-term utar-chadav bilkul normal hota hai.",
      guardrailLabel: 'Verified Knowledge Base (Hinglish)',
      isFallback: false,
      category: 'Hinglish',
      sourceId: 'G14',
    };
  }

  // G15: SIP pause karne se mera invested paisa nikal jayega kya?
  if (
    normalized.includes('pause karne se') ||
    (normalized.includes('invested paisa') && normalized.includes('nikal')) ||
    normalized.includes('paisa nikal jayega')
  ) {
    return {
      text: "Nahi, bilkul nahi! SIP pause karne se sirf future ki monthly debits temporary rukti hain, aapka pehle se invested paisa fund me hi rehta hai aur market ke hisab se grow karta rehta hai. Paise nikalne ke liye alag se 'Redeem' order place karna padta hai.",
      guardrailLabel: 'Verified Knowledge Base (Hinglish)',
      isFallback: false,
      category: 'Hinglish',
      sourceId: 'G15',
    };
  }

  // 5. Terminology (G01 - G04)
  // G01: NAV
  if (
    normalized.includes('what is nav') ||
    normalized.includes('nav mean') ||
    normalized === 'nav' ||
    normalized.includes('net asset value')
  ) {
    return {
      text: "NAV (Net Asset Value) is the per-unit price of a mutual fund scheme, calculated daily as (total assets minus liabilities) divided by outstanding units. A high or low NAV number does NOT indicate fund performance or quality — two funds with different NAVs can deliver identical percentage returns.",
      guardrailLabel: 'Verified Knowledge Base (Terminology)',
      isFallback: false,
      category: 'Terminology',
      sourceId: 'G01',
    };
  }

  // G02: XIRR
  if (
    normalized.includes('what is xirr') ||
    normalized.includes('xirr mean') ||
    normalized === 'xirr' ||
    normalized.includes('what does xirr mean')
  ) {
    return {
      text: "XIRR (Extended Internal Rate of Return) is the accurate annualised return metric for SIPs because it accounts for the exact date and amount of every individual instalment. For example, 12 monthly instalments of ₹5,000 maturing at ₹65,000 after a year gives a specific annualised XIRR — unlike a simple average, which would ignore each instalment's own date. XIRR is personal to you — two investors in the same fund can have different XIRRs based on their individual contribution dates.",
      guardrailLabel: 'Verified Knowledge Base (Terminology)',
      isFallback: false,
      category: 'Terminology',
      sourceId: 'G02',
    };
  }

  // G03: CAGR
  if (
    normalized.includes('what is cagr') ||
    normalized.includes('cagr mean') ||
    normalized === 'cagr' ||
    normalized.includes('compound annual growth rate')
  ) {
    return {
      text: "CAGR (Compound Annual Growth Rate) measures the constant annual growth of a one-time lump-sum investment: (Ending Value / Beginning Value)^(1/years) - 1. CAGR is NOT suitable for SIPs because it assumes all money was invested on day one — for multiple instalment cash flows, XIRR should always be used instead.",
      guardrailLabel: 'Verified Knowledge Base (Terminology)',
      isFallback: false,
      category: 'Terminology',
      sourceId: 'G03',
    };
  }

  // G04: Expense Ratio
  if (
    normalized.includes('expense ratio') ||
    normalized.includes('ter') ||
    normalized.includes('ber')
  ) {
    return {
      text: "The expense ratio is an annual management fee (% of assets) deducted directly from the fund's NAV before returns are credited. Direct plans feature lower expense ratios than Regular plans because distributor commissions are eliminated. On Groww, the fee displayed is the Base Expense Ratio (core management cost), whereas the full Total Expense Ratio also includes statutory levies and GST.",
      guardrailLabel: 'Verified Knowledge Base (Terminology)',
      isFallback: false,
      category: 'Terminology',
      sourceId: 'G04',
    };
  }

  // G24: Help me understand this graph (also covers "what does this graph show"
  // and the specific case where the displayed value has decreased). Expanded per
  // user-testing feedback to cover axes/time period and invested-vs-current value,
  // while still refusing to analyze THIS user's specific fund's performance.
  if (
    normalized.includes('help me understand this graph') ||
    normalized.includes('understand this graph') ||
    normalized.includes('what does this graph show') ||
    normalized.includes('what does this chart show') ||
    normalized.includes('what does the graph mean') ||
    (normalized.includes('graph') && (normalized.includes('up and down') || normalized.includes('go up') || normalized.includes('decreas') || normalized.includes('gone down')))
  ) {
    return {
      text: "This graph plots your total portfolio value over time — each point adds up your invested instalments plus however the market has moved since. The x-axis is the time period you've selected (1M/3M/6M/1Y) and the y-axis is your portfolio's value in rupees; it is not a prediction of future performance. 'Invested amount' is simply the total money you've put in through your instalments, while 'current value' is what those units are worth today at the fund's latest NAV — the gap between the two is your unrealised gain or loss. An increase means the market value of your holdings has risen since you invested; a decrease means it has fallen — both are normal, temporary movements that don't lock in as an actual gain or loss until you redeem. Related terms: NAV is the fund's per-unit price, returns show the percentage change in your investment's value, and XIRR is the annualised return accounting for each instalment's own date. I can't say why your specific fund moved the way it did, or whether this performance is good or bad — for that, review the fund's own factsheet or speak with a financial adviser.",
      guardrailLabel: 'Verified Knowledge Base (Performance)',
      isFallback: false,
      category: 'Performance',
      sourceId: 'G24',
    };
  }

  // 6. Performance Concepts (G05, G06, G08)
  // G05: Value decreased this month / negative this month
  if (
    normalized.includes('decreased this month') ||
    normalized.includes('lower this month') ||
    normalized.includes('down this month') ||
    normalized.includes('why is my return negative/lower this month')
  ) {
    return {
      text: "Your investment value fluctuates with the market prices of the underlying stocks or bonds held by the fund. Broader market corrections drive short-term declines rather than fund mismanagement. This reduction is an unrealised paper loss that only locks in permanently if you redeem units during the dip.",
      guardrailLabel: 'Verified Knowledge Base (Performance)',
      isFallback: false,
      category: 'Performance',
      sourceId: 'G05',
    };
  }

  // G06: Why is my return negative
  if (
    normalized.includes('why is my return negative') ||
    normalized.includes('return is negative') ||
    normalized.includes('negative return')
  ) {
    return {
      text: "A negative return means the fund's current NAV has fallen below the average purchase price of your invested units. This represents an unrealised ('notional') loss that only becomes permanent if you sell your units at this lower price. Short-term volatility is a normal feature of equity mutual funds, driven by market price movements rather than fund mismanagement.",
      guardrailLabel: 'Verified Knowledge Base (Performance)',
      isFallback: false,
      category: 'Performance',
      sourceId: 'G06',
    };
  }

  // G08: Why is my SIP showing different returns from my friend's
  if (
    normalized.includes('friend') ||
    normalized.includes('different returns') ||
    normalized.includes('different from my friend')
  ) {
    return {
      text: "Two investors in the exact same fund often get different returns because of the exact dates and amounts of their respective instalments. Different SIP execution dates purchase units at varying daily NAV prices. These timing differences can narrow over a longer holding period, but there's no guarantee they will — different contribution dates can keep producing different returns indefinitely.",
      guardrailLabel: 'Verified Knowledge Base (Performance)',
      isFallback: false,
      category: 'Performance',
      sourceId: 'G08',
    };
  }

  // 7. SIP Mechanics (G09 - G12)
  // G11: Does cancelling withdraw money
  if (
    normalized.includes('withdraw my money') ||
    normalized.includes('cancelling my sip withdraw') ||
    normalized.includes('cancel withdraw') ||
    normalized.includes('will i get my money back if i cancel') ||
    (normalized.includes('cancel') && normalized.includes('redeem')) ||
    (normalized.includes('cancelling') && normalized.includes('redeeming'))
  ) {
    return {
      text: "No. Cancelling a SIP only stops future bank debits from being deducted. Your existing accumulated units remain fully invested in the fund and continue to track market movements. To get your invested money back to your bank account, you must place a separate, explicit Redemption order in Groww.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G11',
      sourceUrl: GROWW_HELP.cancel,
    };
  }

  // G21: Full redemption
  if (
    normalized.includes('redeem my full') ||
    normalized.includes('redeem everything') ||
    normalized.includes('full redemption') ||
    normalized.includes('redeem my entire') ||
    (normalized.includes('redeem') && normalized.includes('full'))
  ) {
    return {
      text: "Redeeming sells all your units at that day's applicable NAV and credits the money to your registered bank account, typically within 2-3 business days (T+2/T+3) for equity funds. Redeeming is a separate action from cancelling your SIP — redeeming your current units does NOT automatically stop future SIP instalments, and cancelling your SIP does NOT automatically redeem your existing units. Some funds also charge an exit load if redeemed before a minimum holding period.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G21',
      sourceUrl: GROWW_HELP.redeem,
    };
  }

  // G22: Partial redemption
  if (
    normalized.includes('redeem only part') ||
    normalized.includes('partial redemption') ||
    normalized.includes('redeem part of my') ||
    (normalized.includes('redeem') && normalized.includes('part'))
  ) {
    return {
      text: "Yes, you can place a partial redemption by specifying an amount or number of units less than your full holding. The remaining units stay invested and continue tracking the market exactly as before. There's no separate penalty for a partial redemption itself, though an exit load may apply to the redeemed portion if sold before a fund's minimum holding period.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G22',
      sourceUrl: GROWW_HELP.redeem,
    };
  }

  // G23: How does redemption work (general)
  if (
    normalized.includes('how does mutual fund redemption work') ||
    normalized.includes('how does redemption work') ||
    (normalized.includes('redeem') && normalized.includes('how'))
  ) {
    return {
      text: "To redeem, you submit a redemption request specifying either an amount or a number of units. Units are sold at the NAV applicable for that business day (orders placed before the fund's cutoff time, usually 3 PM, get that same day's NAV). The money is then credited to your registered bank account, typically within 2-3 business days for equity and hybrid funds, faster for liquid or overnight funds.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G23',
      sourceUrl: GROWW_HELP.redeem,
    };
  }

  // G12: Difference between pause and cancel
  if (
    normalized.includes('difference between pause and cancel') ||
    normalized.includes('difference between pausing and cancelling') ||
    normalized.includes('pause vs cancel')
  ) {
    return {
      text: "Groww doesn't offer a general multi-month pause — the closest equivalent is Skip Instalment, which skips only your next scheduled debit and resumes automatically from the following one. Cancelling permanently terminates the SIP schedule (which can take up to 7 days on Groww to finalize). Crucially, neither action withdraws your money — existing units remain invested in both cases.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G12',
      sourceUrl: GROWW_HELP.cancel,
    };
  }

  // G09: Miss an instalment / skip instalment
  if (
    normalized.includes('miss an instalment') ||
    normalized.includes('missed instalment') ||
    normalized.includes('skip') ||
    normalized.includes('instalment failure') ||
    normalized.includes('insufficient balance')
  ) {
    return {
      text: "You can skip a single SIP instalment for free with no ECS penalty charges on Groww, provided it is requested at least 2 days before the due date. However, missing 3 consecutive instalments will cause the system to automatically cancel the SIP. Your previously invested units will remain safe and invested.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G09',
      sourceUrl: GROWW_HELP.skip,
    };
  }

  // G10: What happens if I pause my SIP
  if (
    normalized.includes('happens if i pause') ||
    normalized.includes('pause my sip') ||
    normalized.includes('pause sip')
  ) {
    return {
      text: "Groww doesn't have a general multi-month pause feature. What you can do is Skip Instalment — this skips just your next scheduled debit, and the SIP resumes automatically from the following instalment. Your existing invested units stay in the fund and continue earning market returns throughout.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
      sourceId: 'G10',
      sourceUrl: GROWW_HELP.skip,
    };
  }

  // Change amount or date
  if (
    normalized.includes('change') &&
    (normalized.includes('amount') || normalized.includes('date'))
  ) {
    return {
      text: "You can edit your monthly SIP amount or deduction date directly from the SIP details screen on Groww without cancelling. Changes typically take a few business days to reflect with the biller and AMC, so adjust at least 3-5 days before your next scheduled debit date.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
    };
  }

  // Goal complete
  if (
    normalized.includes('goal is complete') ||
    normalized.includes('goal complete') ||
    normalized.includes('goal reached')
  ) {
    return {
      text: "When an investment goal is reached, you can cancel the SIP schedule to stop future monthly debits. To transfer the accumulated wealth to your bank account, you must submit a redemption request. Stopping the SIP schedule alone does not automatically cash out your mutual fund units.",
      guardrailLabel: 'Verified Knowledge Base (SIP Mechanics)',
      isFallback: false,
      category: 'SIP mechanics',
    };
  }

  // 8. New capabilities added per user-testing feedback (G28-G31)
  // G28: Explain F&O (Futures and Options) — a different product than mutual fund SIPs
  if (
    normalized.includes('f&o') ||
    normalized.includes('f & o') ||
    normalized.includes('futures and options') ||
    normalized.includes('futures & options')
  ) {
    return {
      text: "F&O stands for Futures and Options — contracts that let you take a position on where a stock or index price will move, without owning the underlying shares outright. For example, a 'call option' lets you pay a small premium for the right (not the obligation) to buy a stock at a fixed price later, profiting if the price rises above that level before expiry. F&O uses leverage, so both gains and losses can be amplified relative to your margin, and a position can lose its entire value if the price moves against you or the contract expires worthless. It's a fundamentally different product from a mutual fund SIP: a SIP buys actual fund units for long-term wealth building, while F&O is typically short-term, high-risk trading that needs active monitoring. I can't recommend trades or strategies — F&O carries substantial risk of loss and isn't comparable to SIP investing.",
      guardrailLabel: 'Verified Knowledge Base (F&O)',
      isFallback: false,
      category: 'Out of scope',
      sourceId: 'G28',
    };
  }

  // G29/G30: Explain a fund — Parag Parikh (PPFAS) schemes, disambiguated by name.
  // Category/objective only for schemes a source could confirm; others get an honest
  // "category only, objective unverified" rather than an invented description.
  if (normalized.includes('parag parikh') || normalized.includes('ppfas')) {
    if (normalized.includes('flexi cap') || normalized.includes('flexicap')) {
      return {
        text: "Parag Parikh Flexi Cap Fund is an equity mutual fund in the Flexi Cap category — it can invest across large-cap, mid-cap and small-cap companies, including some international equities, without being restricted to one market-cap segment. Its stated aim is long-term capital growth. As with any equity fund, its value fluctuates with the market and isn't guaranteed. I can't tell you whether this specific fund suits your situation — for that, please consult a SEBI-registered investment adviser.",
        guardrailLabel: 'Verified Knowledge Base (Fund Information)',
        isFallback: false,
        category: 'Terminology',
        sourceId: 'G30',
      };
    }
    if (normalized.includes('tax saver') || normalized.includes('elss')) {
      return {
        text: "Parag Parikh ELSS Tax Saver Fund is an equity-linked savings scheme (ELSS) — an equity mutual fund category that qualifies for tax deduction under Section 80C, with a mandatory 3-year lock-in on each instalment. Like any equity fund, returns aren't guaranteed and depend on market performance. I can't tell you whether this fund suits your tax or investment situation — please consult a SEBI-registered investment adviser or tax professional for that.",
        guardrailLabel: 'Verified Knowledge Base (Fund Information)',
        isFallback: false,
        category: 'Terminology',
        sourceId: 'G30',
      };
    }
    if (normalized.includes('large cap')) {
      return {
        text: "Parag Parikh Large Cap Fund is categorised as a Large Cap equity fund, meaning it primarily invests in India's largest, most established companies. Its value still fluctuates with the market and isn't guaranteed. I can't tell you whether this fund suits your situation — please consult a SEBI-registered investment adviser.",
        guardrailLabel: 'Verified Knowledge Base (Fund Information)',
        isFallback: false,
        category: 'Terminology',
        sourceId: 'G30',
      };
    }
    if (
      normalized.includes('conservative hybrid') ||
      normalized.includes('dynamic asset allocation') ||
      normalized.includes('liquid fund') ||
      normalized.includes('arbitrage')
    ) {
      return {
        text: "I can confirm the category this Parag Parikh scheme is publicly listed under, but I don't have an independently verified fund objective for it, so I won't guess one. For the scheme's exact objective, please check its Key Information Memorandum (KIM) or Scheme Information Document on the AMC's own website (amc.ppfas.com), or consult a SEBI-registered investment adviser.",
        guardrailLabel: 'Verified Fallback (Unconfirmed Scheme Detail)',
        isFallback: true,
        category: 'Terminology',
        sourceId: 'G30',
      };
    }
    // G29: ambiguous — no specific scheme named, ask which one
    return {
      text: "Parag Parikh (PPFAS) manages several different schemes, so I want to make sure I explain the right one — could you tell me which Parag Parikh fund you mean? For example: Flexi Cap Fund, ELSS Tax Saver Fund, Large Cap Fund, Conservative Hybrid Fund, Dynamic Asset Allocation Fund, or Liquid Fund. Once you confirm, I can explain its category and what's publicly known about it.",
      guardrailLabel: 'Disambiguation Request (Fund Identification)',
      isFallback: false,
      category: 'Terminology',
      sourceId: 'G29',
    };
  }

  // G31: Personal investment decisions (redeem vs. continue) — explain factors, never decide
  if (
    normalized.includes('right time to redeem') ||
    normalized.includes('should i redeem') ||
    (normalized.includes('redeem') && normalized.includes('continue')) ||
    normalized.includes('should i continue or redeem')
  ) {
    return {
      text: "I can't tell you whether to redeem or continue — that's a personal decision based on factors like your financial goals, how soon you'll need the money (time horizon), how easily you need to access it (liquidity needs), and how much risk you're comfortable with. I can explain what redeeming, pausing and continuing each mean mechanically, so you understand your options, but the decision itself should reflect your own circumstances. For a personalised recommendation, please consult a SEBI-registered investment adviser.",
      guardrailLabel: 'Advice Refusal (Personal Decision Guardrail)',
      isFallback: false,
      category: 'Advice bait',
      sourceId: 'G31',
    };
  }

  // Default fallback for anything outside the verified knowledge base
  return {
    text: FALLBACK_RESPONSE,
    guardrailLabel: 'Verified Fallback (Outside Knowledge Base)',
    isFallback: true,
  };
}
