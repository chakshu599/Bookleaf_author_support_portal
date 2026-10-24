import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import data from '../prisma/bookleaf_sample_data.json';
const db=new PrismaClient();
async function main(){
 const hash=await bcrypt.hash(process.env.DEMO_PASSWORD!,12);
 await db.internalNote.deleteMany(); await db.ticketMessage.deleteMany(); await db.ticket.deleteMany(); await db.book.deleteMany(); await db.author.deleteMany(); await db.user.deleteMany();
 for(const source of data.authors){
  const user=await db.user.create({data:{email:source.email,passwordHash:hash,role:Role.AUTHOR}});
  await db.author.create({data:{id:source.author_id,userId:user.id,name:source.name,phone:source.phone,city:source.city,joinedDate:new Date(source.joined_date),books:{create:source.books.map(book=>({id:book.book_id,title:book.title,genre:book.genre,isbn:book.isbn,publicationDate:book.publication_date?new Date(book.publication_date):null,status:book.status,mrp:book.mrp,totalCopiesSold:book.total_copies_sold,totalRoyaltyEarned:book.total_royalty_earned,royaltyPaid:book.royalty_paid,royaltyPending:book.royalty_pending,lastRoyaltyPayoutDate:book.last_royalty_payout_date?new Date(book.last_royalty_payout_date):null,authorRoyaltyPerCopy:book.author_royalty_per_copy,availableOn:book.available_on,printPartner:book.print_partner}))}}});
 }
 await db.user.create({data:{email:process.env.ADMIN_EMAIL||'admin@bookleaf.demo',passwordHash:hash,role:Role.ADMIN}});
 console.log(`Seeded ${data.authors.length} authors, 18 books, and one admin.`);
}
main().catch((error)=>{ console.error(error); process.exitCode=1; }).finally(()=>db.$disconnect());
