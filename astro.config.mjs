// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sidebar from './src/sidebar.generated.mjs';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	integrations: [
		starlight({
			title: 'Knowledge Kninja',
			description: 'A taxonomy of AI knowledge-base concepts.',
			sidebar,
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
