export const CATEGORIES = [
  'Writing', 'Translation', 'Graphic Design', 'Web & App Development', 'Video Editing',
  'Social Media Marketing', 'Data Entry', 'Virtual Assistance', 'Transcription',
  'Customer Support', 'Tutoring', 'Voice-over',
];
export const SKILLS = ['English', 'Swahili', 'Canva', 'Photoshop', 'WordPress', 'React', 'Excel', 'Premiere Pro'];
export const PAYMENT_METHODS = ['M-Pesa', 'PayPal', 'Bank Transfer', 'Other'] as const;

export const money = (n: number | null | undefined) =>
  `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const shortDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const errMsg = (e: unknown) =>
  (e as { userFacingMessage?: string })?.userFacingMessage || (e as Error)?.message || 'Something went wrong';
