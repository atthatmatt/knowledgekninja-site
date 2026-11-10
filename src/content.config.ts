import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Crockford base32: 0-9, A-Z minus I, L, O, U; 3-character segments.
const address = z.string().regex(/^(?:[0-9A-HJKMNP-TV-Z]{3})+$/, 'Crockford base32, 3-char segments');

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				address: address.optional(),
				label: z.string().optional(),
				scope: z.string().optional(),
				core: z.boolean().default(false),
				parent: address.nullable().optional(),
				related: z.array(address).default([]),
				proposed: z.boolean().default(false),
			}),
		}),
	}),
};
