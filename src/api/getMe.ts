import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { getProfile, isAdmin } from '../lib/server';

export default createEndpoint({
  description: "Returns the signed-in user's profile and admin status",
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    const p = await getProfile(context.user.id);
    return {
      isAdmin: isAdmin(context.user.email),
      email: context.user.email,
      profile: p
        ? {
            id: p.id,
            displayName: p.displayName ?? '',
            role: (p.role ?? 'Freelancer') as string,
            country: p.country ?? '',
            bio: p.bio ?? '',
            skills: (p.skills ?? []) as string[],
            hourlyRate: p.hourlyRate ?? null,
            photo: p.photo?.[0]?.url ?? null,
            blocked: !!p.blocked,
          }
        : null,
    };
  },
});
