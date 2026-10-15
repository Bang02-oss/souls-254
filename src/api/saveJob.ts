import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one, requireActive } from '../lib/server';

export default createEndpoint({
  description: 'Creates or edits a job posted by the signed-in client',
  authenticated: true,
  inputSchema: z.object({
    id: z.string().optional(),
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string(),
    skills: z.array(z.string()),
    budget: z.number().positive(),
    dueDate: z.string(),
  }),
  outputSchema: z.object({ id: z.string() }),
  execute: async ({ input, context }) => {
    const profile = await requireActive(context.user.id);
    if (profile.role !== 'Client') throw new ZiteError({ code: 'FORBIDDEN', message: 'role', userFacingMessage: 'Only clients can post jobs.' });
    const record = {
      title: input.title,
      description: input.description,
      category: input.category,
      skillsNeeded: input.skills,
      budget: input.budget,
      dueDate: input.dueDate,
    };
    if (input.id) {
      const j = await zite.jobs.findOne({ id: input.id });
      if (!j || one(j.client) !== context.user.id) throw new ZiteError({ code: 'FORBIDDEN', message: 'owner', userFacingMessage: 'You can only edit your own jobs.' });
      await zite.jobs.update({ id: j.id, record });
      return { id: j.id };
    }
    const created = await zite.jobs.create({ record: { ...record, status: 'Open', client: context.user.id, paid: false } });
    return { id: created.id };
  },
});
