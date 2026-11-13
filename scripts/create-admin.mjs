import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase());

if (!email || !password || !process.env.MONGODB_URI) {
  console.error('Set ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD, and MONGODB_URI before provisioning the admin account.');
  process.exit(1);
}
if (!adminEmails.includes(email)) {
  console.error('Add the bootstrap email to ADMIN_EMAILS before provisioning.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('The admin password must be at least 8 characters.');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  preferredCategories: { type: [String], default: [] },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, family: 4, appName: 'daily-brief-admin-setup' });
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    { $set: { name: 'Admin', email, passwordHash }, $setOnInsert: { preferredCategories: [] } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
  console.log(`Admin account provisioned for ${email}. Password stored as a bcrypt hash.`);
} catch (error) {
  const name = error instanceof Error ? error.name : 'unknown error';
  const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? `, ${error.code}` : '';
  const serverIssues = error && typeof error === 'object' && 'reason' in error && error.reason && typeof error.reason === 'object' && 'servers' in error.reason && error.reason.servers instanceof Map
    ? [...error.reason.servers.entries()].map(([address, server]) => `${address}: ${server.error?.code || server.error?.name || 'unavailable'}`).join('; ')
    : '';
  console.error(`Admin provisioning failed (${name}${code})${serverIssues ? `: ${serverIssues}` : ''}. Check MongoDB connectivity and retry.`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
