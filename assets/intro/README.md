# Dark Chaos Carnival — intro asset kit

The creator’s CREASO·NORSE logo, three generated illustrations, six existing Joker's Card cover references, and an original sound cue for the game's five-scene opening. Use **Watch Intro** on the midway to play it. Play Now still starts a cup directly.

| File | Specification | Use |
|---|---|---|
| `creaso-norse.png` | 444 × 90 PNG, supplied by the creator | Studio splash; copied without changes |
| `arrival-studio.wav` | 16.7 seconds; original cue with 2.2 seconds of leading silence | Soundtrack aligned after the studio splash |
| `gates.png` | 1672 × 941, RGB PNG | Full-screen environment; slow push toward the gates |
| `duo.png` | 1536 × 1024, RGBA PNG | Transparent Violent J / Shaggy 2 Dope foreground reveal |
| `title.png` | 1536 × 1024, RGBA PNG | Transparent Dark Chaos Carnival title treatment |
| `arrival.wav` | 14.5 seconds, 22,050 Hz, 16-bit mono PCM | Original synthesized creak, organ, bells, bass impacts and title swell |
| `prompts.json` | Exact image-generation requests and references | Reproduction and art direction |

The PNG cutouts retain alpha and soft colored edge light. Composite with normal alpha blending over a dark background. Do not color-key black: that would remove details in the clothes and lettering. Character faces, shoes and props remain inside the source image. Both figures have distinct staggered leg poses; this still illustration is not a walk cycle.

## Storyboard

| Time | Scene | Copy / movement |
|---|---|---|
| 0–2.2 seconds | CREASO·NORSE | Creator-supplied logo centered, followed by “PRESENTS”. |
| 2.2–5.2 seconds | Gates | “Welcome to the other side.” Slow camera push. |
| 5.2–9.2 seconds | First deck | “Six cards. One wicked cup.” Six original covers reveal in order. |
| 9.2–12.7 seconds | The duo | “Bring your homies.” Violent J and Shaggy rise into view. |
| 12.7 seconds onward | Title | Logo resolves; “Play Now” starts the cup. Audio fades out by 16.7 seconds. |

Runtime: `intro.js` plus the cinematic section in `index.html` and intro rules in `styles.css`. The game asset resolver embeds the images and sound into the self-contained HTML edition. Skip and Escape close the intro. Pause, Next Scene, scene buttons, and arrow keys let viewers inspect it. Leaving the page pauses playback. Reduced motion starts paused with manual scene controls. Portrait uses a three-by-two card layout; landscape and desktop use six cards across.

## Provenance

`creaso-norse.png` is the creator-supplied logo, copied byte-for-byte from their attachment. It is not an AI regeneration; the screenshot’s original proportions and background are retained.

The three illustrations were made with the built-in image generation tool. The duo uses the existing official artist-photo reference and the game's earlier sprites for identity and visual continuity. The title is a new game concept logo. The covers are the same actual artwork already documented in the project's `RESEARCH.md` and `catalog-sources.json`, not regenerated substitutes. The asset ZIP includes the six source covers under `cards/` and their catalog source records in `card-sources.json`.

The audio was composed and rendered through deterministic synthesis. There are no sampled songs, lyrics, cloned voices, or performer recordings. This is concept material, not official ICP production artwork or proof of endorsement.
