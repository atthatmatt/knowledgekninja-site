// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sidebar from './src/sidebar.generated.mjs';

// SITE and BASE are set in CI from actions/configure-pages so the
// github.io project URL works now and a later custom domain can use base "/".
const site = process.env.SITE || 'http://localhost:4321';
const rawBase = process.env.BASE || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

// https://astro.build/config
export default defineConfig({
	site,
	base,
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
