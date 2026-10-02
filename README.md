# Dark Chaos Carnival — Alpha 0.8.0

A playable horrorcore party-game alpha built around ICP’s Joker’s Cards. Play as Violent J, Shaggy 2 Dope, Ringmaster, The Great Milenko, Jack Jeckel, or The Wraith.

## New character animation in 0.8.0

All six playable characters now have eight movement poses, six attack poses, and two idle poses. Violent J and Shaggy carry and swing hatchets; Ringmaster rakes with his claws, Milenko strikes with his wand, and Jack and The Wraith use spectral attacks. Ground-character walk sheets include distinct wide, passing, and lifted-foot poses. Spirits float.

The swing has anticipation, contact, and recovery. Damage and the impact sound happen 160 ms into the swing, on its contact pose. Movement animation follows actual distance traveled, stops against walls, and holds a lunge pose during a dash. Sprite frames use measured boundaries and grounded pivots instead of equal-grid guesses.

[Open the Sprite Studio](ANIMATION.html) to inspect every pose, slow the animation, or face left. Artwork was created with built-in image generation; exact prompts and atlas metadata are in `assets/sprites/`.

## Easier controls in 0.7.1

Arrow keys move the first player; Space dashes. Auto attack/catch is enabled by default, uses normal attack range and cooldown, and adds a nearby objective marker. It never moves the player or shoves rivals automatically. Turn it off in Controls & settings for manual play. Existing saves keep their progress.

Chill mode has slower bots, reduced hit penalties, and a longer recovery window after a hit. Grand Tour now defaults to Chill with selectable difficulty; Daily Midway stays fixed to Rowdy.

## Grand Tour features

- **Grand Tour:** six attractions in first-deck order, selectable bot difficulty, a complete ending, one crown per character, and an earned Carnival Crown cosmetic.
- **Mastery passbook:** bronze, silver, and gold objective medals for each attraction, best objective counts, play counts, and a visible next goal. Medals reward actual attraction objectives rather than modifier-inflated ticket totals. Local human seats share the passbook.
- **Continue Run:** completed rounds keep their earnings immediately. Closing or leaving a run restarts only the unfinished attraction with the same layout seed. Reloading the final results pays no duplicate rewards. One unfinished run is retained; starting another replaces it.
- **Device behavior:** only the active arena is decoded; paused/results screens stop redrawing; hidden gameplay pauses. Battery mode draws at up to 30 fps while retaining the same 60 Hz gameplay timing. Audio nodes disconnect when finished.
- **Settings and controllers:** independent saved music/effects levels, display preference, reduced shake, and controller navigation through round briefings, results, and pause menus. Start pauses; D-pad selects; A/Cross confirms.

This is an alpha milestone for the local game. It is not a claim of commercial release readiness or completion of the full production design. See `ALPHA.md` for the release boundary and remaining app checks.

## Play

**Play online:** https://kirkcreason-dev.github.io/dark-chaos-carnival/

GitHub Pages publishes the root of `main`. Pushing an update to that branch updates the public game after the Pages deployment finishes. The `.nojekyll` file serves the game as plain static files.

On a computer, open `index.html` in Chrome or Edge with the other files and `assets` folder alongside it. The separate `Dark-Chaos-Carnival.html` edition embeds the game and all images in one file. Neither edition needs an install or build step. Optional web fonts fall back to system fonts offline.

For a local browser preview, run `python3 -m http.server 8765 --bind 127.0.0.1` from this folder and open http://127.0.0.1:8765/. Saves are specific to the browser and address: a local file and the preview do not automatically share progress.

- **Watch Intro:** a skippable five-scene opening beginning with the creator’s supplied CREASO·NORSE logo, followed by new gate art, the six actual first-deck cards, a Violent J/Shaggy reveal, a title logo, and an original sound cue with a 2.2-second studio lead-in. Pause, select a scene, toggle sound, or enter a cup from the title. Reduced-motion settings use manual scene advancement.
- **Play Now:** one click starts a three-round cup. Your first visit includes a playable move / dash / attack warm-up; it can be skipped. Returning players enter the countdown directly.
- **Local Party:** two keyboard players and two bots by default on desktop; phones start with one touch player and three bots. Choose characters and assign gamepads or bots to each seat.
- **Choose your character & cup:** set up a solo game, select any character, choose three or six rounds, and set bot difficulty.
- **Daily Midway:** three seeded attractions with a saved personal best. The route changes with the local date.
- **Practice:** pick any of the six actual cards on the midway.
- **Record vault:** six gameplay secrets plus an archive of 18 releases, actual covers, 258 track entries, and source links.

| Input | Move | Dash | Attack / catch / deflect |
|---|---|---|---|
| Phone / tablet | Left thumbstick | Tap Dash | Automatic; hold action for manual attack |
| Keyboard 1 | Arrow keys | Space | Automatic; Right Shift for manual attack |
| Keyboard 2 | W A S D | Left Shift | Automatic; E for manual attack |
| Standard gamepad | Stick / D-pad | A / Cross | Automatic; X / Square for manual attack |

For the first human seat, click the ground to move, click an enemy or object to approach and attack/catch it, and right-click to dash. Keyboard movement cancels the mouse destination. Catching a chicken by mouse automatically sends you back to your coop; you can override movement at any time. The action buttons provide another way to attack and dash.

Phone controls appear automatically on touchscreens and narrow screens. You can also enable them in the lobby. Move with your left thumb; nearby attacks, catches, and deflections are automatic by default. Manual action and dash buttons remain available; dash has a visible cooldown ring. The stick has a deadzone and supports simultaneous touches. Lifting a finger stops its control; interruption, rotation, or leaving play releases all touches. Portrait and landscape work, with the arena and scores above or between the controls. Landscape gives the arena more room.

P or Escape pauses. Leaving the browser pauses automatically. Sound starts after entering a match and can be muted in the match toolbar. Fullscreen is available in the desktop toolbar. Reduce screen shake in the lobby. Phone layouts and touch event handling have been checked; physical iPhone and Android browser testing is still needed.

## The six attractions

1. **Hatchet Havoc:** smash possessed dummies with two hits, chain kills, and avoid the crowd closing in.
2. **Chicken Huntin’:** catch chickens and carry them to your colored coop; opponents can make you drop one.
3. **Riddle Box: Final Turn:** read the symbol, reach safe floor, and shove rivals as the box judges the arena.
4. **Halls of Illusions:** shatter haunted mirrors, fight their reflections, and dash to expose false prizes.
5. **Sin Toss:** strike or dash into fireballs to return them for points. More fire arrives as the round progresses.
6. **Wraith’s Crossing:** carry souls to the lit gate and avoid Hell’s Pit shadows. Only delivered souls score.

Rounds last 55 seconds. Three or six rounds make a cup. Each place awards 5 / 3 / 2 / 1 cup points, with shared points for ties. The six second-deck cards add scoring, danger, movement, or visibility changes.

## Permanent progress

Records save immediately when collected. Tickets and mastery save after each completed round. Continue Run preserves the remaining cup route, characters, inputs, completed scores, and original daily date; the unfinished attraction restarts. A completed run clears its checkpoint. All local human seats share the device’s passbook. Earn cosmetic glows at 100 and 300 tickets, and the Carnival Crown look by winning a Grand Tour. Every character can earn a tour crown. Days played is cumulative, not a streak; missing a day loses nothing. Daily scores are personal, with no online leaderboard or server validation.

## Scope and status

Actual covers and researched character adaptations are included in this local concept. The game is not an official or endorsed release. It embeds no ICP recordings, lyrics, or cloned voices. Its music is an original synthesized 84 BPM horrorcore score.

This is a playable local alpha: local multiplayer, bots, new art, eight-pose character movement and dedicated attacks, six distinct objectives, and saved progression. Choose Chill, Rowdy, or Wicked bots. Daily runs use fixed Rowdy difficulty so attempts use the same rules. Standard attacks shove opponents; dash collisions can steal one ticket.

Online rooms, the full discography, unique character powers, full directional animation and further anatomy cleanup, commercial collaboration, and real fan playtesting remain work to do. Functional tests do not establish that people love it or will return daily.

## Files

- `index.html`, `styles.css`, `content.js`, `game.js`, `touch-controls.js`, `progress.js`, `animation.js`, `audio.js`, `library.js`, `catalog.js`, `intro.js`: runnable game.
- `assets/`: six painted arenas, new character atlases and a corrected Shaggy swing frame, plus the retained original sprite sheets, actual cover images, and title art.
- `DESIGN.md`: complete concept, catalog expansion, daily return loop, market proposition, and production plan.
- `RESEARCH.md`, `catalog-sources.json`: sources and exact included catalog editions.
- `ANIMATION.html`: inspect movement, attacks, and idle poses at adjustable speed.
- `ART-DIRECTION.md`, `asset-prompts.json`: asset provenance and animation requirements.
- `VALIDATION.md`: verified behavior and remaining limits.

Physical controllers still need hardware testing; automated checks simulate their inputs and disconnects. Shared keyboards may limit simultaneous keys. No telemetry or accounts are included.

## Development and packaging

The game has no runtime dependencies and does not require a package install. Use Node.js 18 or newer for the existing functional checks:

```sh
npm test
```

Build the self-contained HTML edition and source ZIP with Python 3:

```sh
npm run build
```

Generated files go into `dist/`, which is excluded from Git: `Dark-Chaos-Carnival.html` and `Dark-Chaos-Carnival-Alpha.zip`. The repository contains all game images and audio; no external asset download is required to play. Optional web fonts use system fallbacks offline.

## Open on a phone

Start a local-network preview with `python3 -m http.server 8766 --bind 0.0.0.0` in this game folder. On a phone sharing the computer’s network, open `http://<computer-LAN-IP>:8766/`. Keep the computer and server running. The loopback address `127.0.0.1` only works on the computer hosting the server. Browser progress remains local to each device and address.

The intro assets and storyboard are documented in `assets/intro/README.md`. This repository publishes the public game through GitHub Pages after each successful push to `main`.
