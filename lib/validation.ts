import { z } from 'zod';
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(8).max(128)});
export const createTicketSchema=z.object({bookId:z.string().nullable().optional(),subject:z.string().trim().min(3).max(140),description:z.string().trim().min(10).max(5000)});
export const manageTicketSchema=z.object({status:z.enum(['OPEN','IN_PROGRESS','RESOLVED','CLOSED']).optional(),category:z.enum(['ROYALTY_PAYMENTS','ISBN_METADATA','PRINTING_QUALITY','DISTRIBUTION_AVAILABILITY','BOOK_STATUS_PRODUCTION','GENERAL_INQUIRY']).optional(),priority:z.enum(['CRITICAL','HIGH','MEDIUM','LOW']).optional(),assignToSelf:z.boolean().optional(),note:z.string().trim().min(1).max(2000).optional()});
export const replySchema=z.object({body:z.string().trim().min(1).max(5000)});
