// Generates topic pages, the sidebar, and the /taxonomy/ tree from the
// kk-taxonomy submodule at taxonomy/records/. Not from folders.
// Runs automatically before `npm run dev` and `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recordsDir = path.join(root, 'taxonomy/records');
const docsDir = path.join(root, 'src/content/docs');
const templateFile = path.join(root, 'src/templates/taxonomy.md');
const outSidebar = path.join(root, 'src/sidebar.generated.mjs');
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ADDRESS_RE = /^(?:[0-9A-HJKMNP-TV-Z]{3})+$/;

if (!fs.existsSync(recordsDir)) {
	console.error('taxonomy/records not found. Clone with --recurse-submodules, or run: git submodule update --init');
	process.exit(1);
}

function parseFrontmatter(text) {
	const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
	if (!m) throw new Error('missing frontmatter');
	const data = {};
	const lines = m[1].split(/\r?\n/);
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) { i++; continue; }
		const kv = line.match(/^(\w+):\s*(.*)$/);
		if (!kv) { i++; continue; }
		const key = kv[1];
		const raw = kv[2].trim();
		if (raw === '' && i + 1 < lines.length && /^\s+- /.test(lines[i + 1])) {
			const arr = [];
			i++;
			while (i < lines.length && /^\s+- /.test(lines[i])) {
				let v = lines[i].replace(/^\s+- /, '').trim();
				try { v = JSON.parse(v); } catch { /* bare scalar */ }
				arr.push(v);
				i++;
			}
			data[key] = arr;
			continue;
		}
		if (raw === '') { data[key] = ''; i++; continue; }
		try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
		i++;
	}
	return { data, body: (m[2] || '').trim() };
}

const cmp = (a, b) => {
	for (let i = 0; i < Math.min(a.length, b.length); i++) {
		const d = CROCKFORD.indexOf(a[i]) - CROCKFORD.indexOf(b[i]);
		if (d) return d;
	}
	return a.length - b.length;
};

const files = fs.readdirSync(recordsDir).filter((f) => f.endsWith('.md'));
const pages = [];
for (const file of files) {
	const text = fs.readFileSync(path.join(recordsDir, file), 'utf8');
	const { data, body } = parseFrontmatter(text);
	if (!data.address) throw new Error(`${file}: missing address`);
	pages.push({
		address: data.address,
		label: data.label,
		scope: data.scope,
		core: !!data.core,
		parent: data.parent ?? null,
		related: Array.isArray(data.related) ? data.related : [],
		status: data.status || 'active',
		moved_to: data.moved_to || null,
		notes: body,
		file,
	});
}

const byAddr = new Map(pages.map((p) => [p.address, p]));
const errors = [];
for (const p of pages) {
	if (!ADDRESS_RE.test(p.address)) errors.push(`${p.address}: invalid address format`);
	if (p.parent && !byAddr.has(p.parent)) errors.push(`${p.address}: parent ${p.parent} not found`);
	if (p.parent && !p.address.startsWith(p.parent)) errors.push(`${p.address}: does not nest under ${p.parent}`);
	for (const r of p.related) if (!byAddr.has(r)) errors.push(`${p.address}: related ${r} not found`);
	if (p.status === 'deprecated') {
		if (!p.moved_to) errors.push(`${p.address}: deprecated but missing moved_to`);
		else if (!byAddr.has(p.moved_to)) errors.push(`${p.address}: moved_to ${p.moved_to} not found`);
	}
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

const kidsOf = (address) => pages.filter((c) => c.parent === address).sort((a, b) => cmp(a.address, b.address));
const link = (addr) => {
	const p = byAddr.get(addr);
	return `[${p.address} ${p.label}](/${p.address}/)`;
};

function yamlScalar(value) {
	return JSON.stringify(value);
}

function topicPage(p) {
	const proposed = p.status === 'proposed';
	const fm = [
		'---',
		`title: ${yamlScalar(`${p.address} ${p.label}`)}`,
		`description: ${yamlScalar(p.scope)}`,
		`address: ${yamlScalar(p.address)}`,
		`slug: ${yamlScalar(p.address)}`,
		`label: ${yamlScalar(p.label)}`,
		`scope: ${yamlScalar(p.scope)}`,
		`core: ${p.core ? 'true' : 'false'}`,
		`parent: ${p.parent == null ? 'null' : yamlScalar(p.parent)}`,
		`related: ${JSON.stringify(p.related)}`,
		`proposed: ${proposed ? 'true' : 'false'}`,
		'---',
		'',
	].join('\n');

	const bits = [`**Address:** \`${p.address}\``];
	if (p.core) bits.push('**Core**');
	if (proposed) bits.push('**Proposed**');
	if (p.status === 'deprecated') bits.push('**Deprecated**');
	if (p.parent) bits.push(`**Parent:** ${link(p.parent)}`);
	const parts = [bits.join(' · '), '', `**Scope:** ${p.scope}`];
	if (p.status === 'deprecated' && p.moved_to) {
		parts.push('', `**Moved to:** ${link(p.moved_to)}`);
	}
	const kids = kidsOf(p.address);
	if (kids.length) {
		parts.push('', '## Children', '', ...kids.map((c) => `- ${link(c.address)}`));
	}
	if (p.related.length) {
		parts.push('', '## Related', '', ...p.related.map((r) => `- ${link(r)}`));
	}
	if (p.notes) {
		parts.push('', p.notes);
	}
	return fm + parts.join('\n') + '\n';
}

fs.mkdirSync(docsDir, { recursive: true });
for (const existing of fs.readdirSync(docsDir)) {
	if (existing === 'index.md') continue;
	if (/\.mdx?$/.test(existing)) fs.unlinkSync(path.join(docsDir, existing));
}
for (const p of pages) {
	fs.writeFileSync(path.join(docsDir, `${p.address}.md`), topicPage(p));
}

const item = (p) => ({
	label: `${p.address} ${p.label}`,
	link: `/${p.address}/`,
	...(p.status === 'proposed' ? { badge: { text: 'proposed', variant: 'caution' } } : {}),
	...(p.status === 'deprecated' ? { badge: { text: 'deprecated', variant: 'danger' } } : {}),
});

function node(p) {
	const kids = kidsOf(p.address);
	if (!kids.length) return item(p);
	return {
		label: `${p.address} ${p.label}`,
		collapsed: true,
		items: [item(p), ...kids.map(node)],
	};
}

const tops = pages.filter((p) => !p.parent).sort((a, b) => cmp(a.address, b.address));
const sidebar = [{ label: 'Taxonomy', link: '/taxonomy/' }, ...tops.map(node)];
fs.writeFileSync(outSidebar, `// Generated by scripts/generate-from-taxonomy.mjs. Do not edit.\nexport default ${JSON.stringify(sidebar, null, '\t')};\n`);

if (!fs.existsSync(templateFile)) {
	console.error(`missing taxonomy template: ${path.relative(root, templateFile)}`);
	process.exit(1);
}
const line = (p, depth) => {
	const tags = [
		p.core ? 'Core' : null,
		p.status === 'proposed' ? 'Proposed' : null,
		p.status === 'deprecated' ? 'Deprecated' : null,
	].filter(Boolean);
	const kids = kidsOf(p.address);
	return [`${'  '.repeat(depth)}- [${p.address} ${p.label}](/${p.address}/)${tags.length ? ` (${tags.join(', ')})` : ''}`, ...kids.map((k) => line(k, depth + 1))].join('\n');
};
const tree = tops.map((t) => line(t, 0)).join('\n');
const template = fs.readFileSync(templateFile, 'utf8');
if (!template.includes('<!-- tree:start -->') || !template.includes('<!-- tree:end -->')) {
	console.error('taxonomy template is missing tree:start / tree:end markers');
	process.exit(1);
}
const taxonomyPage = template.replace(/<!-- tree:start -->[\s\S]*<!-- tree:end -->/, `<!-- tree:start -->\n${tree}\n<!-- tree:end -->`);
fs.writeFileSync(path.join(docsDir, 'taxonomy.md'), taxonomyPage);

console.log(`generate: ${tops.length} top-level, ${pages.length} records -> docs, sidebar, taxonomy tree`);
