import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export function error(message:string,status=400, code='BAD_REQUEST') { return NextResponse.json({error:{code,message}},{status}); }
export function handleError(e:unknown) { if(e instanceof ZodError) return error(e.issues.map(x=>x.message).join('; ')); console.error(e); return error('An unexpected error occurred',500,'INTERNAL_ERROR'); }
