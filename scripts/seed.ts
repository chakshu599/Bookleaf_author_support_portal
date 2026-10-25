import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import data from '../prisma/bookleaf_sample_data.json';
const db = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'Bookleaf@123', 12);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bookleaf.demo';
  await db.user.upsert({ where: { email: adminEmail }, update: { role: Role.ADMIN, passwordHash: hash }, create: { email: adminEmail, passwordHash: hash, role: Role.ADMIN } });
  for (const source of data.authors) {
    const user = await db.user.upsert({ where: { email: source.email }, update: { passwordHash: hash, role: Role.AUTHOR }, create: { email: source.email, passwordHash: hash, role: Role.AUTHOR } });
    await db.author.upsert({ where: { id: source.author_id }, update: { userId: user.id, name: source.name, phone: source.phone, city: source.city, joinedDate: new Date(source.joined_date) }, create: { id: source.author_id, userId: user.id, name: source.name, phone: source.phone, city: source.city, joinedDate: new Date(source.joined_date) } });
    for (const book of source.books) {
      await db.book.upsert({ where: { id: book.book_id }, update: { authorId: source.author_id, title: book.title, genre: book.genre, isbn: book.isbn, publicationDate: book.publication_date ? new Date(book.publication_date) : null, status: book.status, mrp: book.mrp, totalCopiesSold: book.total_copies_sold, totalRoyaltyEarned: book.total_royalty_earned, royaltyPaid: book.royalty_paid, royaltyPending: book.royalty_pending, lastRoyaltyPayoutDate: book.last_royalty_payout_date ? new Date(book.last_royalty_payout_date) : null, authorRoyaltyPerCopy: book.author_royalty_per_copy, availableOn: book.available_on, printPartner: book.print_partner }, create: { id: book.book_id, authorId: source.author_id, title: book.title, genre: book.genre, isbn: book.isbn, publicationDate: book.publication_date ? new Date(book.publication_date) : null, status: book.status, mrp: book.mrp, totalCopiesSold: book.total_copies_sold, totalRoyaltyEarned: book.total_royalty_earned, royaltyPaid: book.royalty_paid, royaltyPending: book.royalty_pending, lastRoyaltyPayoutDate: book.last_royalty_payout_date ? new Date(book.last_royalty_payout_date) : null, authorRoyaltyPerCopy: book.author_royalty_per_copy, availableOn: book.available_on, printPartner: book.print_partner } });
    }
  }
  console.log(`Seeded ${data.authors.length} authors and admin.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
