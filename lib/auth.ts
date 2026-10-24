import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import { error } from '@/lib/http';
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'development-only-change-me-please');
export type Session = { userId:string; role:Role; authorId?:string };
export async function createToken(session:Session) { return new SignJWT(session).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret()); }
export async function currentSession():Promise<Session|null> { try { const token=(await cookies()).get('bookleaf_session')?.value; if(!token) return null; return (await jwtVerify(token,secret())).payload as unknown as Session; } catch { return null; } }
export async function requireSession(role?:Role) { const session=await currentSession(); if(!session) return {session:null,response:error('Authentication required',401,'UNAUTHENTICATED')}; if(role && session.role!==role) return {session:null,response:error('You do not have access to this resource',403,'FORBIDDEN')}; return {session,response:null}; }
export async function sessionForUser(userId:string):Promise<Session> { const user=await db.user.findUniqueOrThrow({where:{id:userId},include:{author:true}}); return {userId:user.id,role:user.role,authorId:user.author?.id}; }
