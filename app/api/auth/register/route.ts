import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { databaseErrorMessage } from '@/lib/db-errors';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || String(password || '').length < 8) return NextResponse.json({ error: 'Enter a name, a valid email, and a password of at least 8 characters.' }, { status: 400 });
    await connectToDatabase();
    if (await UserModel.exists({ email: normalizedEmail })) return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    const user = await UserModel.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    return NextResponse.json({ user: { name: user.name, email: user.email } }, { status: 201 });
  } catch (error) { console.error('register', error); return NextResponse.json({ error: databaseErrorMessage(error) || 'Unable to create your account. Check your database connection.' }, { status: 500 }); }
}
