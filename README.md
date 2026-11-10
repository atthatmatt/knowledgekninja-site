# Knowledge Kninja site

A published view of the Knowledge Kninja taxonomy, built with Astro Starlight.

This site is one consumer of the taxonomy. The canon — the durable concept IDs and their records — lives in a separate repository, [kk-taxonomy](https://github.com/atthatmatt/kk-taxonomy), and is pulled in here as a git submodule at `taxonomy/`. Topic pages, the sidebar, and the `/taxonomy/` tree are generated from those records at build time. Do not copy taxonomy data into this repository.

Both repositories are private.

## Clone

The submodule is required. Clone with:

```sh
git clone --recurse-submodules https://github.com/atthatmatt/knowledgekninja-site.git
```

If you already cloned without submodules:

```sh
git submodule update --init --recursive
```

## Run

```sh
npm install
npm run dev      # generates pages from taxonomy/, then serves http://localhost:4321
npm run build    # generates pages, then writes static HTML to dist/
npm run preview  # serves dist/ locally
```

`npm run generate` reads `taxonomy/records/` and writes:

- `src/content/docs/<ADDRESS>.md` — topic pages
- `src/content/docs/taxonomy.md` — overview plus the topic tree
- `src/sidebar.generated.mjs` — the sidebar

Those files are gitignored. They are build output. The homepage (`src/content/docs/index.md`) and the taxonomy page template (`src/templates/taxonomy.md`) are part of this site and are committed.

The build fails if a `parent` or `related` address in the taxonomy does not exist, or if the submodule is missing.

## Site layout

- **`/`:** a simple mobile-friendly link tree. For now its only link is the taxonomy.
- **`/taxonomy/`:** how addresses work, rules, badges, and the full topic tree.
- **`/<ADDRESS>/`:** topic pages, e.g. `/001/`, `/001001/`, `/00A001/`. Slugs keep uppercase letters.

## Updating the taxonomy

Edit records in [kk-taxonomy](https://github.com/atthatmatt/kk-taxonomy), then point the submodule at the new commit:

```sh
cd taxonomy && git pull origin main && cd ..
git add taxonomy
git commit -m "Bump kk-taxonomy"
```
