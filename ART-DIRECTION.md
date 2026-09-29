# Dark Chaos Carnival — art and animation

Build 0.2 uses actual Joker’s Card covers in the menus, archive, and round briefings. The cast and stages are new generated game adaptations of researched visual references. They are not official ICP production assets.

## Visual direction

A mature, inked horror-comic carnival: black and blood red, tarnished gold, dirty neon, cracked wood, stitched cloth, painted faces, and theatrical supernatural horror. Distinguish every room through its card’s imagery and colors. Keep the playing floor readable; put elaborate decoration around the edges. Use colored ground rings and player numbers to separate identical character choices.

The music sketch uses heavy kick and snare, sub-bass, a minor organ, and detuned accents. This is original synthesis, not sampled ICP music. Impacts, glass, swipes, and frantic chicken calls have separate sound effects.

## Animation requirement from the creator

**Always draw different leg poses for walking characters.** A walk requires contact, passing, opposite-foot contact, and opposite passing poses. Both legs must be visible enough to read the weight transfer. Keep scale and the planted-foot baseline consistent, with opposing arm movement. Do not present repeated standing art as a walk cycle.

The first sheets repeated their leading leg. They were regenerated and revised with explicit near/far-leg instructions. Current gameplay advances a character’s four-frame loop according to traveled distance rather than the global clock; a stopped character stops stepping. Dummies and chickens also use four-frame sheets. Jack and Wraith use floating spirit poses. Lobby portraits preview their loop on hover; reduced-motion settings suppress that preview.

These are still prototype loops. Production needs eight or more coherent poses, separate idle and attack clips, properly authored directional animation, planted-foot review in motion, and artist cleanup. The four-frame loop should not be described as finished realistic animation.

## Assets and provenance

All bitmap generation used the built-in image generation tool. Transparent sheets use four equal columns and two equal rows. Rebuild prompts, including revisions, are in `asset-prompts.json`.

| File | Source / mode | Use |
|---|---|---|
| `assets/carnival.png` | Original text-to-image generation | Midway title environment |
| `assets/sprites/icp.png` | Image generation/edit from the official artist portrait and subsequent sheet revisions | Violent J and Shaggy 2 Dope; four walking frames each |
| `assets/sprites/hosts.png` | Image generation/edit from actual Ringmaster and green Milenko covers | Ringmaster and Milenko; four walking frames each |
| `assets/sprites/spirits.png` | Image generation using actual Jeckel and Wraith covers | Jack Jeckel and The Wraith; four spirit poses each |
| `assets/sprites/props.png` | Image generation using Riddle Box art and the established style | Open/closed Riddle Box, dummy, chicken, mirror, flame, soul, soda bottle |
| `assets/sprites/creatures.png` | Image generation/edit using the prop sheet | Dummy walk and chicken run loops |
| `assets/arenas/carnage.png` | Original environment generation | Abandoned street carnival, ominous clown gate |
| `assets/arenas/ringmaster.png` | Reference-based generation | Red tent and gold Ringmaster host |
| `assets/arenas/riddle.png` | Reference-based generation | Riddle Box judgment chamber |
| `assets/arenas/milenko.png` | Reference-based generation | Green-purple haunted hall of mirrors |
| `assets/arenas/jeckel.png` | Reference-based generation | Flame theater with the actual Jack motif |
| `assets/arenas/wraith.png` | Reference-based generation | Shangri-La / Hell’s Pit crossing |
| `assets/cards/*.jpg` | Downloaded actual artwork from Apple’s cover URLs for label-linked albums | Eighteen covers; exact URLs in `catalog-sources.json` |

The official artist portrait was found on [Psychopathic’s artists page](https://www.psychopathicrecords.com/artists). Card art and release identities were traced through [Psychopathic’s music catalog](https://www.psychopathicrecords.com/music). The Jeckel merch reference was additionally checked against the [official ICP store](https://shop.insaneclownposse.com/). Artwork derivatives remain concept material pending an official partnership.

No vector placeholder avatars remain in the playable cast. Actual album covers are preserved as source images; generated arena murals and full-body spirit designs are interpretations. The animation sheets, painted environments, and original cover files are separate assets so they can be replaced or refined independently.

## Intro assets — build 0.5

`assets/intro/gates.png` is a new moonlit entrance plate; `duo.png` is a transparent Violent J / Shaggy foreground illustration derived from the official artist portrait and the established sprite style; `title.png` is a transparent distressed title treatment. Both figures use different staggered leg poses. This is static reveal art, not another walking sheet. All three were created with built-in image generation; exact prompts are in `assets/intro/prompts.json`. Transparency was verified from the PNG alpha channels.

The opening reuses the six actual first-deck covers in a separate scene. `arrival.wav` is an original 14.5-second synthesized cue with gate creak, minor organ, bells, bass hits, and a title swell. No ICP recording or performer voice is used. The running intro is layered HTML/CSS/JavaScript, not a rendered video.

## Creator credit — build 0.6

The supplied CREASO·NORSE logo opens the intro for 2.2 seconds, centered above “PRESENTS”. `assets/intro/creaso-norse.png` preserves the attachment byte-for-byte, with no redrawing, recoloring, stretching, or cropping. The source is 444 × 90 pixels and is displayed at or below that CSS size. `arrival-studio.wav` adds silence before the original cue so the gate and title timings remain aligned.
