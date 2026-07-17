# Changelog

## [0.17.0](https://github.com/mfozmen/groomie/compare/v0.16.0...v0.17.0) (2026-07-17)

### Features

* **groomie:** file paths move to a closing block at the end of the message ([#50](https://github.com/mfozmen/groomie/issues/50)) ([6cde8ca](https://github.com/mfozmen/groomie/commit/6cde8ca423167670ab76048472c50fc28b03413a))

## [0.16.0](https://github.com/mfozmen/groomie/compare/v0.15.0...v0.16.0) (2026-07-17)

### Features

* **groomie:** persona vocabulary — config ## Personas, source-traceable roles, "user" default ([#49](https://github.com/mfozmen/groomie/issues/49)) ([9f32524](https://github.com/mfozmen/groomie/commit/9f32524292a678f675a9f4e0ef8fa20601d6e1ec)), closes [#47](https://github.com/mfozmen/groomie/issues/47)

## [0.15.0](https://github.com/mfozmen/groomie/compare/v0.14.0...v0.15.0) (2026-07-16)

### Features

* **groomie:** hard story-boundary rules — five solution leaks named as NEVERs ([#47](https://github.com/mfozmen/groomie/issues/47)) ([4c0bf6b](https://github.com/mfozmen/groomie/commit/4c0bf6b518269ab8ab9ce2d03421d10327d2dad8))
* **groomie:** self-review pass after every groom + standalone /groomie:review ([#48](https://github.com/mfozmen/groomie/issues/48)) ([cd90f6b](https://github.com/mfozmen/groomie/commit/cd90f6bb48ab27048751349d9d79c58f3cb31826))

## [0.14.0](https://github.com/mfozmen/groomie/compare/v0.13.0...v0.14.0) (2026-07-16)

### Features

* **groomie:** epic titles lead with a verb, in Title Case ([#46](https://github.com/mfozmen/groomie/issues/46)) ([473e822](https://github.com/mfozmen/groomie/commit/473e8222d4064c1fc3f5e85990a38ba960c9e542))

## [0.13.0](https://github.com/mfozmen/groomie/compare/v0.12.0...v0.13.0) (2026-07-16)

### Features

* **groomie:** /groomie:push — idempotent Jira write-back ([#42](https://github.com/mfozmen/groomie/issues/42)) ([e42b66c](https://github.com/mfozmen/groomie/commit/e42b66cc9f514e3862b049c6393b7503387d06a1))
* **groomie:** richer bug format (### B#) + remove the affects model ([#44](https://github.com/mfozmen/groomie/issues/44)) ([d74e229](https://github.com/mfozmen/groomie/commit/d74e22932fd31278dd0032267e8c902e46f510a6))

## [0.12.0](https://github.com/mfozmen/groomie/compare/v0.11.0...v0.12.0) (2026-07-16)

### Features

* **groomie:** mermaid diagram labels use full wrapped titles ([#41](https://github.com/mfozmen/groomie/issues/41)) ([49fe290](https://github.com/mfozmen/groomie/commit/49fe2903c997db085e39b17d620e175bef6d1d9e))

## [0.11.0](https://github.com/mfozmen/groomie/compare/v0.10.0...v0.11.0) (2026-07-14)

### Features

* **groomie:** customize by conversation + output language ([#40](https://github.com/mfozmen/groomie/issues/40)) ([63a03c2](https://github.com/mfozmen/groomie/commit/63a03c2045a54076fd944257eec36039df5cee6c))

## [0.10.0](https://github.com/mfozmen/groomie/compare/v0.9.0...v0.10.0) (2026-07-14)

### Features

* **groomie:** per-issue output folder <KEY>/ ([#39](https://github.com/mfozmen/groomie/issues/39)) ([bb00e85](https://github.com/mfozmen/groomie/commit/bb00e854252ea9674bc90a70aed1b5b3c66c9bb1))

## [0.9.0](https://github.com/mfozmen/groomie/compare/v0.8.0...v0.9.0) (2026-07-09)

### Features

* **groomie:** per-project customization via groomie.config.md ([#38](https://github.com/mfozmen/groomie/issues/38)) ([6feccfc](https://github.com/mfozmen/groomie/commit/6feccfcd2e2167816c390af38445bcb0a5bc721a))

## [0.8.0](https://github.com/mfozmen/groomie/compare/v0.7.0...v0.8.0) (2026-07-09)

### Features

* **groomie:** revise an existing breakdown in place ([#37](https://github.com/mfozmen/groomie/issues/37)) ([b0384c1](https://github.com/mfozmen/groomie/commit/b0384c169f6fc0627fa32f031b704783c41ea79a))

## [0.7.0](https://github.com/mfozmen/groomie/compare/v0.6.1...v0.7.0) (2026-07-08)

### Features

* **visualizer:** render the breakdown with Graphviz instead of ELK + React Flow ([#36](https://github.com/mfozmen/groomie/issues/36)) ([2fbbf1d](https://github.com/mfozmen/groomie/commit/2fbbf1d70bd86ed8ecc7bbc61454567cd4778398))

## [0.6.1](https://github.com/mfozmen/groomie/compare/v0.6.0...v0.6.1) (2026-07-08)

### Bug Fixes

* **visualizer:** show every blocker link (revert transitive reduction) + hide handles ([#35](https://github.com/mfozmen/groomie/issues/35)) ([4669c86](https://github.com/mfozmen/groomie/commit/4669c86f4b5170a4dc4574fa2c66219ac2ee43c7))

## [0.6.0](https://github.com/mfozmen/groomie/compare/v0.5.0...v0.6.0) (2026-07-07)

### Features

* **visualizer:** transitive-reduce blocks edges + round routed corners ([#34](https://github.com/mfozmen/groomie/issues/34)) ([7cc00fe](https://github.com/mfozmen/groomie/commit/7cc00fe8a94dd64125d8ada4f26f5d93b8fc4b68))

### Bug Fixes

* **visualizer:** offset routed edges by their ELK container, not zero ([#33](https://github.com/mfozmen/groomie/issues/33)) ([2c66b19](https://github.com/mfozmen/groomie/commit/2c66b1963fbef62d10596f23d9a4506e1ac7c751))

## [0.5.0](https://github.com/mfozmen/groomie/compare/v0.4.1...v0.5.0) (2026-07-07)

### Features

* **visualizer:** route edges around nodes with ELK's orthogonal router ([#32](https://github.com/mfozmen/groomie/issues/32)) ([026b42f](https://github.com/mfozmen/groomie/commit/026b42f2d3f7a1c2274da5835d4c6b660808669b))

## [0.4.1](https://github.com/mfozmen/groomie/compare/v0.4.0...v0.4.1) (2026-07-07)

## [0.4.0](https://github.com/mfozmen/groomie/compare/v0.3.3...v0.4.0) (2026-07-07)

### Features

* **groomie:** faithful groomie agent + forbid general-purpose delegation ([#30](https://github.com/mfozmen/groomie/issues/30)) ([cf0f94d](https://github.com/mfozmen/groomie/commit/cf0f94dc96c7539ee66243040ab2133d98a5b832))

## [0.3.3](https://github.com/mfozmen/groomie/compare/v0.3.2...v0.3.3) (2026-07-07)

## [0.3.2](https://github.com/mfozmen/groomie/compare/v0.3.1...v0.3.2) (2026-07-06)

## [0.3.1](https://github.com/mfozmen/groomie/compare/v0.3.0...v0.3.1) (2026-07-06)

### Bug Fixes

* **visualizer:** size nodes to content, label & separate the edges ([#26](https://github.com/mfozmen/groomie/issues/26)) ([a83c37b](https://github.com/mfozmen/groomie/commit/a83c37b6f60b6fbddc426438e513436e76388f0f))

## [0.3.0](https://github.com/mfozmen/groomie/compare/v0.2.0...v0.3.0) (2026-07-03)

### Features

* ship a standalone interactive <KEY>-groomed.html for end users ([#25](https://github.com/mfozmen/groomie/issues/25)) ([6a98b69](https://github.com/mfozmen/groomie/commit/6a98b6963a60f542eadddf970f369c63e13758fc))

## [0.2.0](https://github.com/mfozmen/groomie/compare/v0.1.0...v0.2.0) (2026-07-03)

### Features

* **commands:** mode subcommands /groomie:full and /groomie:stories ([08be50f](https://github.com/mfozmen/groomie/commit/08be50f7ed0c45bb0a61ef1a395cf6cd77ed0df5))
* **skill:** add a mermaid diagram to the groomed output ([b1439bc](https://github.com/mfozmen/groomie/commit/b1439bcdf13164cdd1f111bddfdd188d8864f5fb))
* **skill:** emit a machine-readable JSON graph alongside the markdown ([299083e](https://github.com/mfozmen/groomie/commit/299083e5df8457ee48a9aa2ccbfdadc024276b4c))
* **visualizer:** emit a portable offline HTML from a groomed.json ([0383b4b](https://github.com/mfozmen/groomie/commit/0383b4b78fe02311c1b951d1e8e91767ca7d2653))
* **visualizer:** React Flow + ELK graph app ([825989e](https://github.com/mfozmen/groomie/commit/825989e343cdfaeb9e437c9bf79d5a8d61167a8b))

### Bug Fixes

* **visualizer:** friendly emit errors + unit-test path resolution ([3b1cc63](https://github.com/mfozmen/groomie/commit/3b1cc63dfc1ef6ef0aa57530f17113f38fef4889))
* **visualizer:** harden emit-html against $ trap, overwrite, and cwd ([2730666](https://github.com/mfozmen/groomie/commit/2730666017b4c9dadf99c235f10b594fea3f03e8))
* **visualizer:** make graph->flow->ELK pipeline resilient to dangling refs ([21800c6](https://github.com/mfozmen/groomie/commit/21800c6bdb42416b63af37986ad30132ddd4f87d))
* **visualizer:** unique list keys (content+index) ([e45dad2](https://github.com/mfozmen/groomie/commit/e45dad29654b15f76b28cbcee384329bc6852769))

## 0.1.0 (2026-07-02)

### Features

* add grooming modes (--full default / --stories / --estimate) + consistency rule ([f938a22](https://github.com/mfozmen/groomie/commit/f938a223293326e353f81414f869b42928a9d958))
* INVEST one-responsibility stories, imperative tasks, titled blocking refs ([3d4bd3b](https://github.com/mfozmen/groomie/commit/3d4bd3bc424837f0e86186b9d603512a9b48d913))
* jira-style keys, blocks/is-blocked-by, real personas, multi-epic ([28b8f24](https://github.com/mfozmen/groomie/commit/28b8f24ea492a8c7dfa18f94f901c87366d421f1))
* save the groomed breakdown to a file, not just print it ([4e2fb83](https://github.com/mfozmen/groomie/commit/4e2fb83bf5bd79d064960abc3931b7575e1aa5c1))
* scaffold groomie plugin ([d3af31c](https://github.com/mfozmen/groomie/commit/d3af31c259fc9f91531cc916e17aba857cca311a))

### Bug Fixes

* address pre-push review findings ([e4aa148](https://github.com/mfozmen/groomie/commit/e4aa14890a7893172987befeba69125dbbbecf4a))

All notable changes to Groomie are documented here. This file is maintained
automatically by [release-it](https://github.com/release-it/release-it) from
[Conventional Commits](https://www.conventionalcommits.org/).
