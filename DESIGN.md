# Dark Chaos Carnival

**Game concept and production direction · Updated October 1, 2026**

Alpha 0.7 adds a complete six-card Grand Tour with character crowns, objective mastery medals, round checkpoints, saved sound/display settings, and controller-operated round menus. The following broader production concept remains the long-term design; `ALPHA.md` and `README.md` describe the current shipped local build.

**Bring your homies. Leave with bragging rights.**

A wicked multiplayer party game where the Joker’s Cards run the attractions, the records hide the secrets, and your friends make every visit different. Win absurd carnival contests, interfere with one another, find things only a fan would recognize, and return for another trip through the midway.

Status: independent playable concept. An official ICP release is the intended partnership outcome; no license, endorsement, recording rights, or artist participation has been secured. Every new game rule and narrative premise below is a proposal, not ICP canon.

## The game we should make

Build a **four-player party game with local and private online play**, quick rounds, expressive movement, and a persistent carnival full of discoveries. Solo bots make it playable when friends are unavailable. Target desktop PC first; evaluate consoles after the online and controller experience works reliably. The browser prototype also supports phones through a thumbstick and two action buttons; a native mobile release remains a separate production decision.

The product needs to satisfy two audiences at once: a Juggalo should recognize care and specificity; their friend who knows nothing about ICP should understand the next game in ten seconds. Knowing lyrics must never be necessary to win a competitive round.

The central fantasy is belonging in this strange place. The Carnival’s hosts can be menacing, funny, mysterious, and judgmental. They should not all become interchangeable villains to defeat. The current cast is Violent J, Shaggy 2 Dope, Ringmaster, The Great Milenko, Jack Jeckel, and The Wraith. The first two use the official artist portrait as a visual reference; the spirits use the actual cover designs. These are generated game adaptations, not official production art. A future custom-character system can supplement this recognizable cast.

### Four pillars

1. **The homies make the show.** Playful interference, rescue opportunities, team switches, and close finishes produce stories worth retelling. Everyone stays involved after a mistake.
2. **The references do something.** A record changes an attraction, a character offers a challenge, a hidden passage reveals an album connection. Decorating generic minigames with cover art is not enough.
3. **The Carnival has range.** Comedy, unease, spectacle, tenderness, temptation, judgment, and hope belong beside the wicked imagery. The Wraith’s two exhibits should feel meaningfully different.
4. **Return for a new experience.** Rotating routes, mastery, friends’ challenges, and discoveries bring people back. Rewards persist; missing a day does not erase progress.

## What is actually playable in build 0.4

Six first-deck attractions and six second-deck rule modifiers, with actual album covers, six playable named characters, six painted environments, five transparent sprite sheets, and an archive of 18 releases / 258 track entries. The archive covers both Joker’s Card decks and selected sideshows; it is not the entire ICP discography. Track links lead to the official catalog destinations. It does not contain the recordings.

Play Now leads directly into a first-visit interactive warm-up and then a three-round introductory cup: Carnage, Riddle Box, and Jeckel. Completing or skipping the warm-up is remembered. Custom solo and local-party setup retain the full attraction selection. Mouse movement and target-based attacks work alongside the original keyboard/gamepad controls; keyboard input immediately takes over. On-screen objectives show the score gap and the current attraction task.

A cup chooses three or six 55-second attractions. Up to two people share a keyboard; gamepads support additional local players; bots fill unused seats. Move, dash, and attack. Holding attack repeats swings; chicken catching, mirror breaking, deflecting fire, and shoving opponents use the same button in different situations. Damage loses tickets and permits a quick recovery. No one waits out an elimination.

Carnage uses two-hit possessed dummies and a 3.2-second kill-chain window; Ringmaster uses moving chickens that must be caught and carried to the player’s coop; Milenko releases dangerous reflections from broken mirrors. Riddle Box judges safe symbols, Jeckel adds more bouncing fire, and Wraith requires banking carried souls. Second-deck cards change hazards, scoring, speed, or visibility.

The six characters share movement and attack statistics. Chill, Rowdy, and Wicked bots vary reaction time, speed, and attack rate; Daily Midway fixes Rowdy difficulty. Ordinary attacks shove rather than drain tickets, and a dash collision can still steal one. Their identities, portraits, animation, and visual effects differ. This keeps local competition readable; unique powers need a deliberate balancing pass, not untested advantages attached to fan favorites.

Round placement pays 5 / 3 / 2 / 1 cup points. Ties share placement, and tied cup leaders share the crown. Daily routes, personal bests, cumulative days played, six earned records, two cosmetic glows, pause, reduced shake, fullscreen, and an original synthesized 84 BPM horrorcore sketch are implemented. Local progress follows the date captured when a run begins.

The four-frame ground-character loops use different leg poses and distance-driven playback. Jack and Wraith use supernatural motion. These remain generated prototype animations, not production-quality directional sets, attack animation, or finished skeletal rigs. The revised animation requirements are recorded in ART-DIRECTION.md.

Online sessions, accounts, cloud saves, trusted leaderboards, licensed recordings, and artist performances are not implemented. Touch controls now support one local human alongside bots, with responsive portrait and landscape layouts. Simulated controller tests pass; physical hardware testing and real group playtests remain necessary.

## Both decks, with a purpose for every card

The first deck has six cards; The Wraith’s Shangri-La and Hell’s Pit are two exhibits of the same card. The second deck includes The Marvelous Missing Link’s Lost / Found pair as one card. Psychopathic’s own announcement identifies **The Naught as the sixth card of the second deck**. Its release is listed as August 12, 2025. [Psychopathic announcement](https://www.psychopathicrecords.com/news), [label music catalog](https://www.psychopathicrecords.com/music). The broader card grouping was cross-checked against the [Dark Carnival overview](https://en.wikipedia.org/wiki/Dark_Carnival_%28Insane_Clown_Posse%29).

The following mechanics are original interpretations for discussion with ICP. The prototype’s second deck supplies rule modifiers; the proposed full game gives each of those cards its own attraction too.

| Card | Playable now | Proposed full-game treatment |
|---|---|---|
| Carnival of Carnage | **Hatchet Havoc:** possessed dummies, melee swings, and kill-chain bonuses. | Expand the possessed attraction into varied enemy waves, interactive traps, and team finishers. |
| Ringmaster | **Chicken Huntin’:** chase, catch, carry, deliver, and knock catches out of rivals’ hands. | The main tent and cup host; moving coops, audience reactions, and escalating show trials. |
| Riddle Box | **Final Turn:** reach the called symbol before the wrong floor tiles fall. | A judgment attraction built around readable choices, bluffing, and a dramatic reveal. |
| The Great Milenko | **Halls of Illusions:** break mirrors, fight escaping reflections, and expose false prizes. | A hall of illusions with false paths, temptation, doubles, and opportunities to trick rivals. |
| The Amazing Jeckel Brothers | **Sin Toss:** strike or dash-deflect fireballs; the arena fills with more fire over time. | A juggling arena where players pass dangerous objects and choose whether to cooperate or betray. |
| The Wraith | **Wraith’s Crossing:** carry souls to the light while avoiding moving pits. | Two connected exhibits: a warm, cooperative Shangri-La celebration and a severe Hell’s Pit challenge. |
| Bang! Pow! Boom! | Three telegraphed blast circles erupt periodically. | **Fuse Parade:** a chain-reaction chase through an exploding midway. Placement and timing matter more than random damage. |
| The Mighty Death Pop! | Bonus prizes burst into the arena. | **Last Balloon Standing:** pump, pass, and pop risk balloons; bank a modest reward or keep playing for a bigger one. |
| The Marvelous Missing Link | LOST / FOUND alternates normal and double-value prizes. | **Find Your Homie:** paired navigation where one player sees clues the other needs; rotate partners between rounds. |
| Fearless Fred Fury | Taking a hit recharges your dash; dash recovery is faster. | **Fight Back:** a comeback arena where a setback creates a clear counterattack opportunity. Skill decides whether it pays off. |
| Yum Yum Bedlam | A central garden offers double-value prizes but slows movement. | **Bedlam Garden:** a tempting garden of valuable blooms and readable vine traps; greed changes your escape route. |
| The Naught | Uncollected prizes periodically vanish, while hazards and players remain visible. | **Nothing Left Behind:** platforms and possessions vanish in a memory-and-rescue contest. Final lore framing needs artist review. |

## Catalog-wide discovery

Treat this as a living content ledger with separate fields for release, edition, track, character, source evidence, proposed use, implementation status, owner/clearance, and ICP approval. Do not casually call every release a Joker’s Card, confuse original recordings with remixes, or assume that one label agreement covers every edition and collaborator.

“All the albums” should mean that every agreed release has a thoughtful place in the game, not a promise that every track becomes a separate minigame. Before a licensed production starts, reconcile the ledger against the approved masters, liner notes, artwork, and catalog supplied by the rights holders. The current archive verifies 258 track entries across 18 linked editions. The broader map below is still a proposal; it does not verify every edition, single, or bonus track. See RESEARCH.md and catalog-sources.json for the exact included releases.

| Catalog branch | Proposed role |
|---|---|
| Beverly Kills 50187 | A neighborhood sideshow with hidden addresses and a compact chase attraction. |
| The Terror Wheel | A wheel-powered arena whose visible sectors announce the next hazard. |
| Tunnel of Love | A two-person boat course where partners alternately steer and trigger gates. |
| Bizaar / Bizzar | Paired, mirrored booths. Solving a clue on one side changes a rule on the other. |
| The Calm / The Tempest / Eye of the Storm | A weather arc: a quiet hub, a chaotic storm coaster, and short weather-remix contests. |
| House of Wax | Freeze-and-pose hide-and-seek among suspicious exhibits. |
| The Phantom: X-tra Spooky Edition material | A night-time ghost hunt with visible evidence and optional scare intensity. |
| Flip the Rat | A mischievous guide for a vent-racing sideshow, subject to character approval. |
| Yum Yum’s Lure / Wicked Vic / Pug Ugly / Woh the Weeping Weirdo | Garden side paths, character encounters, and a linked discovery trail. |
| Forgotten Freshness series / B-sides / rare tracks | A record-shop archive: clues lead to remixed challenges and annotated discoveries. Edition and track provenance must remain explicit. |
| Hallowicked / holiday releases | Seasonal atmosphere and themed cups. Completed collections remain available after their featured window. |
| Early Inner City Posse / Dog Beats material | An approved historical archive wing, with context rather than retroactively invented Dark Carnival canon. |
| Collaborations, solo releases, and other acts | A separately agreed expansion boundary. Their appearance requires their own creative and rights decisions. |

Release-family discovery is informed by the [discography index](https://en.wikipedia.org/wiki/Insane_Clown_Posse_discography), [official label catalog](https://www.psychopathicrecords.com/music), and [artist catalog on Apple Music](https://music.apple.com/us/artist/insane-clown-posse/266434). These are research starting points; the production ledger should defer to licensed source material.

### The first six secrets

These are implemented song-title discoveries. They do not play the recordings or reproduce the lyrics. A challenge makes a record appear; the player still needs to find it. The vault supplies a hint before discovery.

| Song reference | Earn the discovery |
|---|---|
| [The Juggla](https://music.apple.com/us/song/1198895177) — Carnival of Carnage | Destroy eight dummies in Hatchet Havoc, then collect the record. |
| [Chicken Huntin’](https://music.apple.com/us/song/1525404618) — Ringmaster | Deliver three chickens to your coop, then recover the record. This refers to the Ringmaster track, not the later remix. |
| [Toy Box](https://music.apple.com/us/song/598730884) — Riddle Box | Survive three correct symbol judgments and find the record. |
| [Hokus Pokus](https://music.apple.com/us/song/1440912437) — The Great Milenko | Collect 8 real potions, then dash near the glint to expose the record. |
| [Play With Me](https://music.apple.com/us/song/1443826156) — The Amazing Jeckel Brothers | Deflect three fireballs, then collect the record. |
| Walk into the Light — The Wraith: Shangri-La | Bank 8 souls at the light, then find the record. The linked edition uses “Walk into the Light.” [Track metadata](https://music.apple.com/us/album/walk-into-the-light/1202351283?i=1202351358). |

Future discoveries should have three layers: an immediately recognizable reference, a clue connecting two attractions, and a community mystery whose solution reveals an actual playable reward. Add spoiler controls and a “show stronger hint” option. A player should not need to leave the game for a walkthrough just to finish the collection.

## Why someone comes back tomorrow

The important question is whether players want another visit without being prompted. Retention features are hypotheses until real Juggalos play repeatedly.

| Cadence | Player promise | Concrete design | Build status |
|---|---|---|---|
| Next round | “I can beat my homie at this one.” | Short rounds, recoverable mistakes, different skills tested, quick results and rematch. | Implemented locally. |
| Tomorrow | “What did the Carnival deal today?” | Three seeded attractions, new modifiers, a personal best, a compact completion page. | Implemented using local date and local storage. |
| This week | “We can crack that clue together.” | A linked mystery across booths; a weekend cup with a distinct ruleset. | Planned. |
| Over months | “This carnival feels like ours.” | Persistent record discoveries, paint and outfit collections, a customizable hangout, friend challenges. | Vault and two looks implemented; broader systems planned. |

For production, Daily Midway uses a published UTC reset, a countdown, and an archive so regional time zones do not fracture shared routes. The prototype deliberately uses the local calendar and has no server authority. An online daily leaderboard needs server-validated results or replay validation; a client seed by itself does not prevent cheating.

Make the daily route solvable in roughly four minutes, allow unlimited attempts, and keep the best result. Earn archive unlocks through accumulated visits or achievements; never require a perfect attendance streak. A returning player should see what is interesting today, not a wall of expired prizes. Keep cosmetic rewards separate from competitive power.

### First-week content proposal

This schedule is a hand-authored production example, not a claim about the prototype’s current procedural route.

| Visit | Featured route / reveal | Reason to share it |
|---|---|---|
| 1 | Carnival of Carnage → Riddle Box → Wraith | A welcoming first cup and the first record hint. |
| 2 | Ringmaster → Jeckel Brothers → Milenko | A deflected fireball can reverse a round in one second. |
| 3 | Lost / Found partner cup | The friend with the clue needs the friend with the timing. |
| 4 | Bizaar / Bizzar mirror mystery | Two groups compare discoveries and open a side booth. |
| 5 | Bedlam Garden greed challenge | The biggest pile of prizes is also the worst place to get trapped. |
| 6 | Terror Wheel / Tempest remix | A weather-and-hazard combination that changes familiar tactics. |
| 7 | Weekend Family Cup | A celebratory cup recap and a community-unlocked attraction variant. |

## Make it feel like it belongs to Juggalos

Pay a small advisory group drawn from different eras of the fandom to review tone, references, spelling, music selections, and whether the game feels welcoming. Include women and newer fans alongside longtime collectors. This is creative collaboration, not a trivia exam or unpaid marketing labor.

Recruit playtest groups who already hang out together. Watch the room: who laughs, who understands the joke, who feels excluded, who asks to play again? A reference that gets recognition but makes the game worse should be redesigned.

Commission artists who understand the visual culture. Use the generated concept art to establish mood, then agree on final art direction and production authorship with the official team. The commercial game needs distinct character silhouettes, full animation, expressive reactions, and environments that feel specific to each attraction.

Use voice performances recorded with the artists if agreed. Do not substitute cloned voices. Separate music, effects, host dialogue, and licensed tracks in the mixer. A streamer setting should replace uncleared broadcast material with a cleared alternate soundtrack rather than silencing the whole game.

Proposed narrative frame: the gates open for one more night, and the player’s crew has a pass through the entire Carnival. The hosts test the group in their own ways. Competition produces mischief; cooperation can open secrets. A shared celebration pays off the journey. This framing needs ICP’s creative approval before becoming a story claim.

## How to make it marketable

Lead with a playable social moment. The strongest trailer sequence is a ten-second reversal: someone grabs a jackpot, a friend bumps them into a hazard, the third player saves a nearly lost run, and the final result produces an argument and a laugh. Follow that with the unmistakable Carnival identity and a glimpse of a deep-cut secret.

**Working store hook:** “Bring your homies into the Dark Carnival. Battle through wicked party games, bend the rules with the Joker’s Cards, and uncover secrets buried across ICP’s world.” This is draft positioning, not a published endorsement.

The adjacent party-game market already contains local/online minigame collections with bots; [Pummel Party’s developer store page](https://store.steampowered.com/app/880940/Pummel_Party/) is a useful comparison. Our differentiation must come from the licensed world, meaningful discovery, musical direction, and the feeling of a fan gathering. An ICP skin alone is not enough.

Test a **$14.99–$19.99 one-time purchase** proposition against actual launch scope and willingness to pay. This is a pricing hypothesis, not a revenue forecast. Keep all launch attractions playable without randomized purchases; sell clearly described optional cosmetics or substantial expansions only if the community wants them. Do not split friend groups by requiring every player to buy a map pack just to join a host.

Begin with a free public demo only after the right to distribute it is clear. Possible approved channels include ICP’s own channels, a Gathering play booth, Juggalo creators, horror-party creators, and four-player friend-group sessions. These are proposed channels, not secured placements. Capture wishlists and demo-to-purchase intent with explicit consent; do not treat followers as guaranteed buyers.

A useful demo offers three polished attractions, one surprising hidden path, and enough replay value that people request a second cup. Content announcements should show new things to do. A long list of references is not a trailer.

## Evidence we need before scaling up

Run an initial qualitative playtest with 12–20 people in existing friend groups. Use a mix of longtime fans, newer fans, and nonfans invited by their friends. Follow it with a seven-day closed test of at least 50 consenting players if the first test is promising. These sample sizes are planning choices, not statistical guarantees.

| Question | Measure / proposed gate | What to change if it fails |
|---|---|---|
| Do new players understand it? | At least 80% complete the first attraction without facilitator help. | Simplify controls, hints, and visual priorities. |
| Is the cup fun immediately? | At least 60% of groups voluntarily start another cup during the session. | Improve the weakest minigames and round pacing before adding rewards. |
| Do people want to return? | Observe unprompted next-day and day-seven returns; initially test hypotheses of D1 ≥35% and D7 ≥15%. | Interview returners and nonreturners; these are goals, not industry benchmarks or proven results. |
| Does it feel like ICP? | Fans can name three meaningful references and rate authenticity at least 4/5 on average. | Rework shallow references with the advisory group. |
| Can nonfans join the party? | Compare first-cup comprehension and rematch choice across fan and nonfan groups. | Remove lore knowledge from competitive requirements. |
| Is online play viable? | Complete sessions under realistic latency, packet loss, and disconnect conditions. | Fix networking before marketing online scale. |

Track starts, completions, voluntary rematches, attraction quit rates, discovered records, and daily-route completion. Use minimal, disclosed telemetry in later test builds; the delivered prototype has no analytics service. Do not present synthetic test results as evidence that people love the game.

## A credible production path

**Phase 1 — prove the party.** Playtest this prototype; improve the three strongest attractions; tune bots, feedback, character silhouettes, accessibility, and round pacing. Exit only when people want another cup without prompting. The current six attractions test ideas; they are not six production-ready games.

**Phase 2 — secure the official collaboration.** Prepare a short pitch, a gameplay reel, this prototype, fan-test evidence, an asset ledger, a platform plan, and an agreement proposal. Discuss ICP/Psychopathic creative approval, brand use, card/character art, performers, distribution, royalties, marketing, and ongoing content. Verify recording and composition permissions separately; the [U.S. Copyright Office explains that the musical work and its recording are distinct works](https://copyright.gov/history/copyright-exhibit/artifacts/). Include music use in gameplay, trailers, broadcasts, and archives in the scope discussed with the relevant owners.

**Phase 3 — production-quality slice.** Three fully realized minigames, a small navigable midway, private online rooms, local controllers, reconnect behavior, one cross-attraction mystery, polished original audio or cleared music, accessible menus, and a real daily service. A game-specific engine decision follows a technical spike; the browser concept is a fast test bed, not a promise about shipping technology.

**Phase 4 — grow the catalog.** A proposed launch scope is 12 card attractions plus six sideshows, six card modifiers, solo bots, local and private online cups, a record vault, and an evergreen daily archive. If quality or funding cannot support 18 distinct attractions, narrow the launch scope transparently and keep comprehensive catalog discovery as a separate commitment. Do not pad the launch with cosmetic reskins counted as new games.

**Phase 5 — earn a launch.** External testing, stability, controller coverage, accessibility review, performance targets, support tooling, privacy decisions, platform requirements, release approval, and a finished demo. Budget and schedule require a staffed team, an agreed rights scope, and a networking plan; this document does not invent a shipping date or cost.

The first staffing conversation should cover a gameplay lead, a networking engineer, an artist/animator, a designer/producer, audio support, and QA. Some roles can overlap in a small team. Artist approvals and licenses can become the critical path, so run them alongside the gameplay work once the pitch is concrete.

## What remains unresolved

The creator’s relationship with ICP/Psychopathic; licensing scope and availability; preferred platforms; budget and team; acceptable content rating and tone; track selection and stems; permitted distribution of demos; public versus private online sessions; cloud progress and moderation; final full-catalog inclusion boundary; and approval ownership.

None of those uncertainties prevents testing the core party game now. They do prevent honestly describing this build as an official release or promising that all music, art, and references are commercially cleared.
