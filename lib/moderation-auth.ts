export function isModerationAdmin(user: { email?: string } | null | undefined) {
  if (!user?.email) return false;
  const allowedEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  return allowedEmails.includes(user.email.toLowerCase());
}
