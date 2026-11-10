import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const COOKIE = 'daily_brief_session';
const secret = () => process.env.AUTH_SECRET || 'development-only-change-me';
function encode(value: string) { return Buffer.from(value).toString('base64url'); }
function sign(value: string) { return crypto.createHmac('sha256', secret()).update(value).digest('base64url'); }
export function createSession(userId: string) { const payload = encode(JSON.stringify({ sub: userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })); return `${payload}.${sign(payload)}`; }
function verifySession(token?: string) { if (!token) return null; const [payload, signature] = token.split('.'); const expected = payload ? sign(payload) : ''; if (!payload || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return data.exp > Date.now() ? data.sub as string : null; } catch { return null; } }
export function setSession(userId: string) { cookies().set(COOKIE, createSession(userId), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 }); }
export function clearSession() { cookies().set(COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 }); }
export async function getCurrentUser() { const id = verifySession(cookies().get(COOKIE)?.value); if (!id) return null; await connectToDatabase(); return UserModel.findById(id).select('name email preferredCategories createdAt').lean(); }
