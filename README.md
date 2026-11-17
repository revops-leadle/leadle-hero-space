# leadle-hero-space

Static hosting (GitHub Pages) for the leadlehq.com solutions-page hero animation and its fallback image.
Each release is a versioned file; a new version is a new file plus a new integrity hash registered in Webflow.
Source and build: `Marketing/output/hero-motion-space/build_dist.py` in the Leadle workspace.


## Releases
- v1.0.0: solutions pages (Outbound OS, RevOps as a Service, Founder On Call).
- v1.1.0: adds /partnerships, /clients, /blog and /ai-agents (hero selector is chosen per page). Same fallback image.


## leadle-hero-ribbon v1.0.0 (18 Nov 2026)

Ribbon hero for the three nav-linked solutions pages: `leadle-hero-ribbon.v1.0.0.min.js` (braid / loop / unroll chosen from the path) with stills `hero-ribbon-{braid,loop,unroll}.v1.webp`. Built from `Marketing/output/hero-motion-space/leadle-hero-ribbon.html` by `build_dist_ribbon.py`.
