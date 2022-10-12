import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export default function middleware(req) {
  const { cookies } = req;
  const verify = cookies.get('loggedin');
  const url = req.url;

  if (
    url.includes('home') ||
    url.includes('exchange') ||
    url.includes('loans') ||
    url.includes('stake')
  ) {
    if (!verify) {
      return NextResponse.redirect('http://localhost:3001/');
    }
  }
  return NextResponse.next();
}
