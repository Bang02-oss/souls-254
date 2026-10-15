import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getProfile } from '../lib/server';

export default createEndpoint({
  description: 'Creates or updates the signed-in user profile',
  authenticated: true,
  inputSchema: z.object({
    displayName: z.string().min(1),
    role: z.enum(['Client', 'Freelancer']),
    country: z.string(),
    bio: z.string(),
    skills: z.array(z.string()),
    hourlyRate: z.number().nullable(),
    photoUrl: z.string().nullable(),
  }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    if (!input.displayName.trim()) throw new ZiteError({ code: 'BAD_REQUEST', message: 'name', userFacingMessage: 'Please enter your name.' });
    const existing = await getProfile(context.user.id);
    const record = {
      displayName: input.displayName.trim(),
      user: context.user.id,
      // role is fixed after first save
      role: existing?.role || input.role,
      country: input.country,
      bio: input.bio,
      skills: input.skills,
      hourlyRate: input.hourlyRate,
      photo: input.photoUrl ? [{ url: input.photoUrl }] : null,
    };
    if (existing) await zite.profiles.update({ id: existing.id, record });
    else await zite.profiles.create({ record: { ...record, blocked: false } });
    return { ok: true };
  },
});
