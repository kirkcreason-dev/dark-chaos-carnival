# Validation — Alpha 0.8.0

Checked in a desktop browser using real page interaction, keyboard events, read-only state snapshots, and rendered screenshots. Automated simulation accelerates time; it does not stand in for human playtesting.

## Sprite and combat checks in 0.8.0

All eight automated suites pass. New checks validate all 96 source rectangles against the actual PNG dimensions and RGBA format; eight movement indices; six attack phases; captured facing; no damage during wind-up; contact-frame damage; exactly one hit per swing; paused pending attacks; and no footsteps while pushing against a wall. Existing full-tour, save recovery, six-attraction arrow-only scoring, touch, controller, audio, and intro checks still pass.

The raw generated PNGs were inspected, their alpha channels measured, and frame boundaries and pivots mapped explicitly. The first new walk sheets did not have enough passing-pose variation; a second set was generated for the four ground characters. They are still stylized generated artwork with anatomy drift, not a claim of realistic final animation.

Browser checks rendered all six characters, played Hatchet Havoc to results, accepted arrow/dash inputs, and checked thumbstick/dash behavior at 390 × 844. The sprite studio showed all movement/attack/idle source images loaded and contact poses composited over a dark background. No browser console errors appeared during the game checks. Phone coverage is desktop viewport simulation, not hardware validation.

## Easier controls in 0.7.1

The keyboard regression completes the warm-up with arrow movement and Space, then scores in all six attractions using arrow events with no pointer input or attack key. It checks the assistance toggle, Right Shift manual attack, saved settings and existing-run restoration, independent player-two WASD/Left Shift controls, scroll prevention, pause on focus loss, Chill Grand Tour default, and fixed Rowdy daily mode. Browser verification resumed an existing saved cup, accepted ArrowRight and Space from the focused arena, displayed automatic deflections and an objective marker, and produced no console errors. These are functional checks, not human difficulty ratings.

## Alpha 0.7 checks

The existing intro, desktop, and touch suites pass with the new save and loading flow. New checks complete the six-attraction Grand Tour using ordinary registered pointer handlers, reload an unfinished attraction, resume after a finished round, and recover the final result screen. They verify that completed-round payouts and crown awards are not duplicated, old saves migrate, malformed checkpoints are rejected, and failed storage still permits a session.

Mastery thresholds and medal retention are checked independently of ticket modifiers. The six-character crown award path is checked using a persisted final-results fixture; that fixture is not presented as a human-played win. The normal simulated full-tour test follows the real scoring and input loop.

A second pair of simulations starts from the same checkpoint in 60 fps and battery modes, then compares player state and elapsed gameplay time. Battery mode renders fewer frames with identical game results. Paused and hidden states stop drawing/advancing. Only one active arena texture remains after each transition. Failed-art and injected rendering-error checks confirm a recoverable screen. The renderer-failure message in the test log is expected fault injection, not an unhandled suite failure.

Controller tests use a sparse gamepad slot, navigate menu buttons, confirm with A, pause with Start, avoid a held confirmation becoming an accidental dash, and handle disconnect/reconnect. The audio graph test verifies separate music/effects buses, mute/resume, remembered levels, and cleanup of finished nodes.

Real browser interaction verified Grand Tour setup, loading, briefings, timed gameplay, results, the next attraction, pause, and a reload restoring the next saved attraction. Views were inspected at 1280 × 720, 390 × 844, and 844 × 390. Portrait results keep the mastery summary and continue button readable. Music and battery settings were changed through the real controls and retained after reload. The rebuilt self-contained HTML opened and resumed a saved attraction with its embedded arena and characters. No browser errors were observed. These are desktop-browser checks at phone sizes, not physical-phone or app-container validation.

## Creator logo in build 0.6

The supplied logo is byte-for-byte identical to the attachment. The intro now contains five scenes, with 2.2 seconds for the studio credit and the original sound cue delayed by the same duration. The existing intro handler checks were updated to cover the studio hold, all scene boundaries, pause/seek, and final Play Now handoff.

## Intro checks in build 0.5

All three generated assets were visually inspected; character and title PNG alpha channels contain transparent pixels. The original PCM WAV is 14.5 seconds, mono, 22,050 Hz, with peak amplitude below full scale.

The browser showed the full sequence reaching the title, actual six-card layout, character art composited over the environment, pause/resume controls, manual scene selection, and the Play Now handoff. Desktop, portrait phone, and landscape phone layouts were inspected at 1280 × 720, 390 × 844, and 844 × 390. A fade-in issue when pausing immediately was corrected so paused scenes remain visible. No browser errors appeared during these checks.

An independent Node check exercises the intro's actual handlers: timed scene advancement, pause and seek, mute/unmute, visibility-loss pause, reduced-motion manual progression, skipping while images load, image-load failure recovery, and Play Now handoff. It does not modify the game's progress or scoring.

## Phone controls in build 0.4

Added an analog thumbstick, held contextual action, and single-tap dash with cooldown feedback. Independent pointer IDs allow movement and actions at once. Controls reset on pointer cancellation, capture loss, pause, scene changes, resizing, rotation, blur, and visibility loss. Phone layout reserves thumb areas outside the arena, includes safe-area padding, and offers scrollable full-screen briefings/results. The local-party default becomes one human with bots when phone controls are enabled.

A Node simulation loaded the actual touch controls and game, then dispatched pointer events through their registered handlers. It completed the move/dash/attack warm-up using simultaneous contacts, scored and finished in all six attractions, and checked deadzone behavior, extra-finger ownership, brief taps, held attack, non-repeating dash, cooldown, touch takeover from pointer destinations, release/cancellation, lost capture, app switching, and rotation. The desktop pointer/keyboard warm-up, six attractions, three-round cup, and rematch suite also passed with the new touch module loaded but disabled.

The in-app browser was inspected at 390 × 844, 375 × 667, and 844 × 390. Arena, scores, and thumb controls fit without scrolling during play; portrait results and briefings remained readable. Browser pointer dragging moved the character using the thumbstick, and clicking Dash produced a visible cooldown. These checks use desktop rendering and simulated touch handlers, not physical iPhone/Android hardware or a Safari compatibility claim.

The same-network preview returned HTTP 200 on the computer’s LAN address and port 8766. It serves the game directory only; cross-device connectivity depends on the local network and computer remaining available.

## Earlier playability checks from build 0.3

The in-app browser was used for the actual first-play flow: Play Now loaded the arena, clicking the marked ground advanced the move lesson, the dash button advanced the dash lesson, and clicking the dummy completed the attack lesson. Starting the cup reset practice scores. Reloading and choosing Play Now skipped the completed lesson and entered a timed round. The larger stage, visible controls, and score placement were inspected at the app’s 1280 × 720 viewport.

An independent Node simulation exercised the game’s registered input handlers without changing game state directly. It verified pointer movement, targeted attacks/catches, keyboard takeover, pause/resume, the warm-up and its score reset, tutorial skipping, a complete three-round cup, direct rematch, and completion of all six attractions. The pointer-controlled human scored in every attraction, including dummy kills, chicken deliveries, mirror breaks, and fireball deflections. These are functional results, not a substitute for a person judging the game’s feel.

Daily difficulty is fixed to Rowdy; custom matches offer Chill, Rowdy, and Wicked. Character sprite sampling was corrected at the boundary between the two atlas rows to avoid stray pixels from another character. The scene now sorts players, creatures, and mirrors together by ground position.

## Earlier checks retained from build 0.2


- All six attractions finish and produce finite, nonnegative scores. Bots pursue their respective objectives. Three- and six-round cups, standings, rematches, and tied placement logic remain functional.
- Simultaneous keyboard movement, buffered quick dash presses, repeated attacks, movement-driven animation state, pause/resume, and focus-loss pause work.
- Four local control seats work with two keyboard layouts and two simulated controllers. Sparse controller slots remain assigned correctly; disconnect pauses and reconnect resumes.
- All six named characters can be selected and enter their attraction with the correct identity and sprite sheet.
- Possessed dummies can be destroyed, chickens can be caught and delivered, mirrors shatter and release surviving hostile reflections, safe judgments score, fireballs can be deflected, and carried souls can be banked.
- All six record secrets were earned using keyboard inputs and normal gameplay conditions; the complete set survived reload. No state-mutation shortcut was used to earn those records.
- Daily runs finish, save personal bests and run counts, reproduce the same date’s route, and change the combined route/rules across tested dates. Cup progress and selected cosmetic appearance survive reload.
- The actual album archive has 18 release entries and 258 track entries. Cover images, detail dialogs, track links, and modal dismissal work.
- All six arenas were rendered and visually inspected. At the tested 1440 × 900 viewport, the arena, rule strip, scores, and controls fit without vertical scrolling. Narrow home-page layout does not overflow horizontally.
- The self-contained HTML starts a playable match with network requests blocked. Images and game logic load from the file. External catalog links and optional web fonts still require connectivity.
- No browser exceptions were observed in the full-cup, progression, controller, archive, character, mirror, or packaging checks.

## Changes caught during the rebuild

The initial sprite sheets repeated their leading leg; grounded character sheets were regenerated with distinct contact/passing poses and revised near/far-leg instructions. Runtime animation now advances with distance traveled. A mirror reflection was initially destroyed by the attack that spawned it; the order was corrected and a test observed a surviving reflection. The garden’s visual center was aligned with its scoring and movement area. The match layout was adjusted to keep scores and controls visible on a desktop viewport.

## Limits

This is functional and visual verification, not proof of enjoyment, authenticity, retention, or sales. No fan study or multiplayer room playtest has occurred. Real controller hardware, Safari/Firefox coverage, physical mobile gameplay, online networking, and accessibility beyond the implemented keyboard/reduced-shake features remain unverified or out of scope.

The generated character art now includes eight movement poses and separate attack and idle clips. Full directional sets, consistent anatomy across every frame, and production-quality foot planting still require animator cleanup. Audio is an original synthesized sketch and has not been professionally mixed or mastered. The six characters currently share gameplay statistics.

The build is local multiplayer with bots. There is no online service, account system, global leaderboard, or full-discography completion claim. Official status and production distribution are not established by these tests.
