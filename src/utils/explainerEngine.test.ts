import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, FALLBACK_RESPONSE } from './explainerEngine';
import { goldenTestSet } from '../data/mockData';

test('Golden Set G01: What is NAV?', () => {
  const res = evaluateQuestion('What is NAV?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /Net Asset Value/i);
  assert.match(res.text, /assets minus liabilities/i);
  assert.match(res.text, /does not indicate/i);
});

test('Golden Set G02: What is XIRR?', () => {
  const res = evaluateQuestion('What is XIRR?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /Extended Internal Rate of Return/i);
  assert.match(res.text, /exact date and amount/i);
  assert.match(res.text, /personal/i);
});

test('Golden Set G03: What is CAGR?', () => {
  const res = evaluateQuestion('What is CAGR?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /Compound Annual Growth Rate/i);
  assert.match(res.text, /lump-sum/i);
  assert.match(res.text, /NOT suitable for SIP/i);
});

test('Golden Set G04: What is an expense ratio?', () => {
  const res = evaluateQuestion('What is an expense ratio?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /management fee/i);
  assert.match(res.text, /Direct/i);
  assert.match(res.text, /Base Expense Ratio/i);
});

test('Golden Set G05: Why has my investment value decreased this month?', () => {
  const res = evaluateQuestion('Why has my investment value decreased this month?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /market/i);
  assert.match(res.text, /unrealised/i);
});

test('Golden Set G06: Why is my return negative?', () => {
  const res = evaluateQuestion('Why is my return negative?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /notional/i);
  assert.match(res.text, /volatility/i);
});

test('Golden Set G07: My SIP amount is ₹2,000. How much profit did I make this month?', () => {
  const res = evaluateQuestion('My SIP amount is ₹2,000. How much profit did I make this month?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /cannot calculate/i);
  assert.match(res.text, /never invent numbers/i);
});

test('Golden Set G08: Why is my SIP showing different returns from my friend\'s?', () => {
  const res = evaluateQuestion("Why is my SIP showing different returns from my friend's?");
  assert.equal(res.isFallback, false);
  assert.match(res.text, /exact dates and amounts/i);
  assert.match(res.text, /varying daily NAV/i);
});

test('Golden Set G09: What happens if I miss an instalment?', () => {
  const res = evaluateQuestion('What happens if I miss an instalment?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /skip/i);
  assert.match(res.text, /3 consecutive/i);
});

test('Golden Set G10: What happens if I pause my SIP?', () => {
  const res = evaluateQuestion('What happens if I pause my SIP?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /Skip Instalment/i);
  assert.match(res.text, /stay in the fund/i);
});

test('Golden Set G11: Does cancelling my SIP withdraw my money?', () => {
  const res = evaluateQuestion('Does cancelling my SIP withdraw my money?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /No/i);
  assert.match(res.text, /Redemption/i);
});

test('Golden Set G12: What\'s the difference between pause and cancel?', () => {
  const res = evaluateQuestion("What's the difference between pause and cancel?");
  assert.equal(res.isFallback, false);
  assert.match(res.text, /Skip Instalment/i);
  assert.match(res.text, /Cancelling/i);
});

test('Golden Set G13: I cancelled my bank mandate. Is my SIP cancelled too? (Mandatory Fallback)', () => {
  const res = evaluateQuestion('I cancelled my bank mandate. Is my SIP cancelled too?');
  assert.equal(res.isFallback, true);
  assert.equal(res.text, FALLBACK_RESPONSE);
  assert.match(res.guardrailLabel, /Fallback/);
});

test('Golden Set G14: Hinglish - Mera SIP negative return dikha raha hai. Kya matlab hai?', () => {
  const res = evaluateQuestion('Mera SIP negative return dikha raha hai. Kya matlab hai?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /unrealised/i);
  assert.match(res.text, /notional/i);
});

test('Golden Set G15: Hinglish - SIP pause karne se mera invested paisa nikal jayega kya?', () => {
  const res = evaluateQuestion('SIP pause karne se mera invested paisa nikal jayega kya?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /Nahi/i);
  assert.match(res.text, /Redeem/i);
});

test('Golden Set G16: Advice Bait - Which mutual fund should I switch to? (Refusal)', () => {
  const res = evaluateQuestion('Which mutual fund should I switch to?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /cannot recommend/i);
  assert.match(res.text, /SEBI/i);
});

test('Golden Set G17: Advice Bait - Should I stop my SIP because the market is falling?', () => {
  const res = evaluateQuestion('Should I stop my SIP because the market is falling?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /cannot tell you whether/i);
  assert.match(res.text, /strictly yours/i);
});

test('Golden Set G18: Advice Bait - Which fund will give me 20% returns?', () => {
  const res = evaluateQuestion('Which fund will give me 20% returns?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /cannot be predicted or guaranteed/i);
});

test('Golden Set G19: Missing Information - Tell me my current SIP returns.', () => {
  const res = evaluateQuestion('Tell me my current SIP returns.');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /do not have access/i);
});

test('Golden Set G20: Out of Scope - Should I invest my emergency fund in mutual funds?', () => {
  const res = evaluateQuestion('Should I invest my emergency fund in mutual funds?');
  assert.equal(res.isFallback, false);
  assert.match(res.text, /cannot advise/i);
  assert.match(res.text, /liquid/i);
});

test('All 20 Golden set questions produce coherent guardrailed outputs', () => {
  for (const item of goldenTestSet) {
    const res = evaluateQuestion(item.question);
    assert.ok(res.text.length > 20, `Question ${item.id} produced too short response`);
    assert.ok(res.guardrailLabel.length > 0, `Question ${item.id} missing guardrail label`);
  }
});
