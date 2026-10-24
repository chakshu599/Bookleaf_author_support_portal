import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
const {createCompletion}=vi.hoisted(()=>({createCompletion:vi.fn()}));
vi.mock('openai',()=>({default:class {chat={completions:{create:createCompletion}}}}));
import {analyzeTicket,classify,draftReply,ticketClassificationSchema} from '@/lib/ai/ticket-ai';
beforeEach(()=>{createCompletion.mockReset().mockResolvedValue({choices:[]});});
afterEach(()=>vi.unstubAllEnvs());
describe('ticket AI fallback',()=>{
	it('classifies all six BookLeaf categories deterministically',()=>{
		const cases=[
			['royalty payout question','ROYALTY_PAYMENTS'],
			['incorrect ISBN metadata','ISBN_METADATA'],
			['misprinted blurry pages','PRINTING_QUALITY'],
			['book unavailable on Amazon','DISTRIBUTION_AVAILABILITY'],
			['typesetting status update','BOOK_STATUS_PRODUCTION'],
			['general account question','GENERAL_INQUIRY'],
		] as const;
		for(const [text,category] of cases) expect(classify(text).category).toBe(category);
			expect(classify('Payment for blurry printed pages').category).toBe('PRINTING_QUALITY');
			expect(classify('I have a question about a payment').category).toBe('GENERAL_INQUIRY');
	});
	it('validates classification enums and confidence bounds',()=>{
		expect(ticketClassificationSchema.safeParse({category:'ISBN_METADATA',priority:'HIGH',confidence:0.8,reason:'ISBN does not match the supplied book.'}).success).toBe(true);
		expect(ticketClassificationSchema.safeParse({category:'UNKNOWN',priority:'HIGH',confidence:0.8,reason:'Invalid category.'}).success).toBe(false);
		expect(ticketClassificationSchema.safeParse({category:'ISBN_METADATA',priority:'URGENT',confidence:0.8,reason:'Invalid priority.'}).success).toBe(false);
		expect(ticketClassificationSchema.safeParse({category:'ISBN_METADATA',priority:'HIGH',confidence:1.1,reason:'Out of range.'}).success).toBe(false);
		expect(ticketClassificationSchema.safeParse({category:'ISBN_METADATA',priority:'HIGH',confidence:0.8,reason:''}).success).toBe(false);
	});
	it('uses Groq with both subject and description and validates its structured result',async()=>{
		vi.stubEnv('GROQ_API_KEY','test-key');
		vi.stubEnv('GROQ_MODEL','configured-test-model');
		createCompletion.mockResolvedValueOnce({choices:[{message:{content:JSON.stringify({category:'ROYALTY_PAYMENTS',priority:'HIGH',confidence:0.92,reason:'The author reports an overdue royalty payout.'})}}]});
		const result=await analyzeTicket('Where is my payment?','The royalty payout has not arrived after the expected date.',null);
		expect(result).toMatchObject({category:'ROYALTY_PAYMENTS',priority:'HIGH',confidence:0.92,source:'groq'});
		const request=createCompletion.mock.calls[0][0];
		expect(request.model).toBe('configured-test-model');
		expect(request.messages[1].content).toContain('Where is my payment?');
		expect(request.messages[1].content).toContain('royalty payout has not arrived');
	});
	it('keeps a damaged-page ticket in printing quality even if Groq mislabels it',async()=>{
		vi.stubEnv('GROQ_API_KEY','test-key');
		createCompletion.mockResolvedValueOnce({choices:[{message:{content:JSON.stringify({category:'ROYALTY_PAYMENTS',priority:'HIGH',confidence:0.9,reason:'Payment is mentioned.'})}}]});
		const result=await analyzeTicket('Pages in my printed book are damaged','I received copies with pages printed unclearly and a few pages appearing damaged. Please advise what photographs you need.',null);
		expect(result).toMatchObject({category:'PRINTING_QUALITY',priority:'HIGH',source:'rules'});
		expect(result.reason).toContain('photos');
	});
	it('falls back when Groq returns fields outside the application schema',async()=>{
		vi.stubEnv('GROQ_API_KEY','test-key');
		createCompletion.mockResolvedValueOnce({choices:[{message:{content:JSON.stringify({category:'OTHER',priority:'URGENT',confidence:1.4,reason:''})}}]});
		const result=await analyzeTicket('Wrong ISBN','The ISBN on the book is incorrect.',null);
		expect(result).toMatchObject({category:'ISBN_METADATA',priority:'HIGH',source:'fallback'});
	});
	it('flags ISBN issues high',()=>expect(classify('Wrong ISBN on Amazon').priority).toBe('HIGH'));
	it('creates empathetic KB grounded response',async()=>expect((await draftReply('print issue','pages blurry',null)).draft).toContain('clear photos'));
});
