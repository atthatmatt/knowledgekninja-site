---
title: Taxonomy
description: The Knowledge Kninja taxonomy of AI knowledge-base concepts, with Crockford base32 addresses.
slug: taxonomy
---


This is the Knowledge Kninja taxonomy: Matthew Maier's map of concepts for AI knowledge bases. Each topic has its own page, and this taxonomy is the table of contents. This is KK Taxonomy v0.1, a draft.

The addresses and concept records come from the kk-taxonomy canon. This site is one consumer of that taxonomy.

## How addresses work

Every topic has an address in Crockford base32: the digits 0-9 and the letters A-Z, minus I, L, O and U. Addresses are built from 3-character segments, nested by concatenation:

- `001` is a top-level topic: [Knowledge foundations](/001/).
- `001001` is a child of `001`: [Information vs knowledge](/001001/).

The address is the page's id and its URL (`/001001/`). The label is a name that can change later without breaking links. See [Taxonomy and addressing](/002006/) (`002006`) for the full scheme.

## Rules

- **Permanent:** an address is a stable id.
- **Never reused:** a retired address is never given to another topic.
- **Moved to:** a moved topic keeps its old id as deprecated, with a "moved to" pointer.
- **Related:** a topic links to topics in other branches with `related:`.

These rules are proposed in the source draft. Facets as suffixes (for example `003-reference`) are part of the scheme but not yet implemented.

## Badges

- **Core:** the topic is central to the KK thesis: agentic system design is a KMS with a tool call; user-owned front door; KB optimized to feed context; raw records vs cooked memories; traces as records.
- **Proposed:** the topic is a new address assigned to a later note and not yet part of v0.1.

## All topics

Start at [Knowledge foundations](/001/) (`001`), or pick a topic below.

<!-- tree:start -->
<!-- tree:end -->
