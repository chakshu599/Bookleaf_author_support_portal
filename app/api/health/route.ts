import { db } from '@/lib/db'; export async function GET(){await db.user.count();return Response.json({data:{status:'ok'}})}
