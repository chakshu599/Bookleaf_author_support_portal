import { db } from '@/lib/db'; import { requireSession } from '@/lib/auth'; import { Role } from '@prisma/client';
export async function GET(){const {session,response}=await requireSession(Role.AUTHOR);if(response)return response; const books=await db.book.findMany({where:{authorId:session!.authorId},orderBy:{title:'asc'}});return Response.json({data:books});}
