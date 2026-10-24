import { Role } from '@prisma/client';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { error } from '@/lib/http';

/** Full admin-only workspace data; internal notes are intentionally absent from author routes. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSession(Role.ADMIN);
  if (response) return response;
  const ticket = await db.ticket.findUnique({
    where: { id: (await params).id },
    include: {
      author: true,
      book: true,
      assignedTo: { select: { email: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { email: true, role: true } } } },
      notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { email: true } } } },
    },
  });
  if (!ticket) return error('Ticket not found', 404, 'NOT_FOUND');
  return Response.json({ data: ticket });
}
