import { describe, expect, it } from 'vitest';
import { createTicketSchema, loginSchema, manageTicketSchema } from '@/lib/validation';

describe('API input contracts', () => {
  it('rejects malformed login input', () => expect(() => loginSchema.parse({ email: 'not-an-email', password: 'short' })).toThrow());
  it('accepts only valid support-ticket payloads', () => {
    expect(createTicketSchema.parse({ subject: 'Royalty payment', description: 'Please clarify my pending royalty amount.' }).subject).toBe('Royalty payment');
    expect(() => createTicketSchema.parse({ subject: 'x', description: 'short' })).toThrow();
  });
  it('prevents unsupported ticket status and priority values', () => {
    expect(() => manageTicketSchema.parse({ status: 'DELETED' })).toThrow();
    expect(() => manageTicketSchema.parse({ priority: 'IMMEDIATE' })).toThrow();
  });
});
