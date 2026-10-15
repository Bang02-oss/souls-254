import { zite } from 'zitejs/db';
import { ZiteError } from 'zitejs/backend';
import { integrations } from 'zitejs/integrations';

export const ADMIN_EMAIL = 'bang.soul02@gmail.com';

export const one = (v: string | string[] | undefined | null): string | undefined =>
  Array.isArray(v) ? v[0] : v ?? undefined;

export const isAdmin = (email?: string | null) => (email ?? '').toLowerCase() === ADMIN_EMAIL;

export async function getProfile(userId: string) {
  return zite.profiles.findOne({ filters: { user: userId } });
}

export async function requireActive(userId: string) {
  const profile = await getProfile(userId);
  if (!profile) {
    throw new ZiteError({ code: 'FORBIDDEN', message: 'No profile', userFacingMessage: 'Please finish setting up your profile first.' });
  }
  if (profile.blocked) {
    throw new ZiteError({ code: 'FORBIDDEN', message: 'Blocked', userFacingMessage: 'Your account has been blocked.' });
  }
  return profile;
}

export async function profileMap(userIds: (string | undefined)[]) {
  const ids = [...new Set(userIds.filter((x): x is string => !!x))];
  const map: Record<string, { name: string; country: string; photo: string | null }> = {};
  if (!ids.length) return map;
  const { records } = await zite.profiles.findAll({ filters: { user: { in: ids } }, limit: 2000 });
  for (const p of records) {
    const u = one(p.user);
    if (u) map[u] = { name: p.displayName || 'Member', country: p.country || '', photo: p.photo?.[0]?.url ?? null };
  }
  return map;
}

export async function userEmail(userId: string) {
  const { records } = await zite.auth.findAllUsers({ filters: { id: userId }, limit: 1 });
  return records[0]?.email;
}

function b64url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmail(to: string, subject: string, html: string) {
  const { accessToken } = await integrations.get('gmail');
  const safeSubject = subject.replace(/[\r\n]+/g, ' ');
  const raw = b64url(
    `To: ${to}\r\nSubject: =?UTF-8?B?${b64url(safeSubject).replace(/-/g, '+').replace(/_/g, '/')}?=\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`,
  );
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) console.error('Email failed', res.status, await res.text());
}

/** Fire-and-forget alert; never blocks the main action. */
export async function notify(userId: string | undefined, subject: string, text: string, path: string) {
  if (!userId) return;
  try {
    const email = await userEmail(userId);
    if (!email) return;
    const esc = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
    await sendEmail(
      email,
      subject,
      `<p>${esc}</p><p><a href="${process.env.ZITE_APP_URL}${path}">Open Souls 254</a></p>`,
    );
  } catch (e) {
    console.error('notify failed', e);
  }
}
