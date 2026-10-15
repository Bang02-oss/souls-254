import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { one, profileMap } from '../lib/server';

export default createEndpoint({
  description: 'Lists open jobs with optional search, category and skill filters',
  inputSchema: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    skill: z.string().optional(),
    limit: z.number().optional(),
  }),
  outputSchema: z.any(),
  execute: async ({ input }) => {
    const filters: Record<string, unknown> = { status: 'Open' };
    if (input.category) filters.category = input.category;
    const { records } = await zite.jobs.findAll({ filters, limit: 2000 });
    const q = (input.search ?? '').toLowerCase().trim();
    let jobs = records.filter(
      (j) =>
        (!q || (j.title ?? '').toLowerCase().includes(q) || (j.description ?? '').toLowerCase().includes(q)) &&
        (!input.skill || (j.skillsNeeded ?? []).includes(input.skill)),
    );
    jobs.sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));
    if (input.limit) jobs = jobs.slice(0, input.limit);
    const names = await profileMap(jobs.map((j) => one(j.client)));
    return {
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title ?? '',
        description: j.description ?? '',
        category: j.category ?? '',
        skills: (j.skillsNeeded ?? []) as string[],
        budget: j.budget ?? 0,
        dueDate: j.dueDate ?? null,
        created: j.created ?? null,
        clientName: names[one(j.client) ?? '']?.name ?? 'Client',
        clientCountry: names[one(j.client) ?? '']?.country ?? '',
      })),
    };
  },
});
