# Dark Chaos Carnival — Alpha 0.7.1

This milestone completes the local six-attraction loop with a beginning, full tour, ending, persistent mastery, and recovery from interrupted sessions. It is a development alpha, not a production launch label. No changes have been made to the Psychopathic app as part of this milestone.

## The player journey

1. Play Now teaches movement, dash, and attack inside the arena, then starts a quick cup.
2. Grand Tour lets the player choose a character and face all six first-deck attractions in order with Chill bots by default and selectable difficulty. The second deck changes the rules in each round.
3. Every finished attraction saves tickets and objective mastery. Bronze, silver, and gold thresholds are shown on the midway. Better results never erase earlier medals.
4. Win the tour to claim that character’s crown and the Carnival Crown cosmetic. The ending invites another character, mastery goals, records, or the next daily route.
5. Continue Run restores the next uncompleted attraction, the original daily date, and previous standings. An interrupted attraction restarts. A saved final-result screen can be claimed once.

## Alpha scope

- Six attractions, six named characters, six second-deck modifiers, 18 mastery medals, six character crowns, six hidden records, and the existing 18-release archive.
- Solo bots, two shared-keyboard players, or up to four local players with gamepads. Phone controls operate one human seat.
- Full tour, quick/custom cups, daily route, practice, pause, rematch, and saved settings, arrow-key movement, optional automatic attacks/catches/deflections, and objective markers.
- Current sprites retain four distinct movement frames. Character powers and full directional/attack animation are not part of this milestone.
- No online rooms, accounts, cloud saves, shared leaderboards, licensed song recordings, or official-release claim.

## Interruption and storage contract

Completed rounds commit their earnings, mastery, and next-round checkpoint together in one local-storage write. Starting the next attraction takes a checkpoint before gameplay begins. Resuming the same unfinished attraction uses the same per-round random seed. This is a restart of that attraction, not a frame-exact mid-round continuation.

Version 1 saves migrate to version 2 using the same storage key. Ticket totals, valid records, visits, daily bests, cosmetics, and warm-up completion are retained. Unknown or malformed fields are normalized; invalid run checkpoints are ignored. Current daily best history is bounded to 366 dated entries on load.

One unfinished run is stored per browser origin. New-run setup explains that it replaces the old run. Saves do not travel automatically between local files, localhost, a deployed website, or an app webview. Browser data removal deletes local progress. If storage is blocked, a visible message explains that progress lasts only for the session.

## App integration boundary

Host the folder as static files or use the built self-contained HTML. All game assets are included and use relative paths. When embedding, provide a stable origin, JavaScript, local storage, audio following user interaction, and gamepad/fullscreen permissions if those features are offered. Keep the app's close/back control available outside the game frame.

The game pauses on blur, hidden document, page exit, and touch rotation. It does not start playing automatically after the user returns. Completed rounds remain available through Continue Run. These browser behaviors are covered in automated checks; the actual app container still needs validation.

## Before adding it to the production app

The game must be played inside the actual app on physical iPhone and Android devices, including interruptions, sound activation, thumb reach, safe areas, performance over a full tour, saved-run recovery, and exiting back to the app. Gamepad hardware and Safari/Firefox require their own passes. Automated input simulation and desktop viewport resizing cannot establish those results.

The broad production design also calls for online play, deeper catalog coverage, final animation, and fan playtesting. Those are still outstanding. No claim of audience retention, commercial readiness, or official approval follows from this alpha's functional checks.
