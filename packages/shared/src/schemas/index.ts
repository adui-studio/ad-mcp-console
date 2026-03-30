import { z } from 'zod';

export const transportTypeSchema = z.enum(['stdio', 'streamable_http']);
