import { NextResponse } from 'next/server'; export async function POST(){const r=NextResponse.json({data:{ok:true}});r.cookies.set('bookleaf_session','',{path:'/',maxAge:0});return r;}
