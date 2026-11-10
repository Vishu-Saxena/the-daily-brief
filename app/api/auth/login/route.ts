import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { setSession } from '@/lib/auth';
import { databaseErrorMessage } from '@/lib/db-errors';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    await connectToDatabase();
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    setSession(String(user._id));
    return NextResponse.json({ user: { name: user.name, email: user.email } });
  } catch (error) { console.error('login', error); return NextResponse.json({ error: databaseErrorMessage(error) || 'Unable to sign in. Check your database connection.' }, { status: 500 }); }
}
