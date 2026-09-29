'use strict';
window.CARNIVAL = {
  "booths": [
    {
      "id": "carnage",
      "card": "Carnival of Carnage",
      "title": "Carnage: Hatchet Havoc",
      "short": "Hatchet<br>Havoc",
      "icon": "✷",
      "color": "#f388b2",
      "tagline": "THE DUMMIES ARE COMING TO LIFE.",
      "rule": "Smash the possessed carnival dummies before they reach you. Move, dash, and attack. Chain kills quickly for a bigger payout.",
      "tip": "E / Right Shift: attack. Dummies pay 5 tickets. Keep a kill chain alive for bonus points.",
      "secret": "The Juggla",
      "hint": "Destroy 8 possessed dummies in Hatchet Havoc. Find the record behind the main gate.",
      "source": "Carnival of Carnage",
      "sourceUrl": "https://music.apple.com/us/song/1198895177"
    },
    {
      "id": "ringmaster",
      "card": "Ringmaster",
      "title": "Chicken Huntin’",
      "short": "Chicken<br>Huntin’",
      "icon": "◎",
      "color": "#edbb79",
      "tagline": "THE RINGMASTER WANTS HIS PRIZES BACK.",
      "rule": "Chase the escaped carnival chickens. Attack close to catch one, then carry it to the glowing coop. Rivals can make you drop your catch.",
      "tip": "E / Right Shift: catch. Bring a chicken to your colored coop for 8 tickets.",
      "secret": "Chicken Huntin’",
      "hint": "Catch and deliver 3 chickens in Chicken Huntin’. Look behind the curtain for a record.",
      "source": "Ringmaster",
      "sourceUrl": "https://music.apple.com/us/song/1525404618"
    },
    {
      "id": "riddle",
      "card": "Riddle Box",
      "title": "Riddle Box: Final Turn",
      "short": "The Final<br>Turn",
      "icon": "?",
      "color": "#bbdf75",
      "tagline": "TURN THE CRANK. FACE THE FLOOR.",
      "rule": "The Riddle Box calls a symbol. Reach its matching floor before the chamber opens. Attack rivals to shove them toward a bad decision.",
      "tip": "Match the symbol before the floor falls. E / Right Shift shoves rivals. Safe judgments pay 4.",
      "secret": "Toy Box",
      "hint": "Survive 3 correct judgments in Final Turn, then collect the record.",
      "source": "Riddle Box",
      "sourceUrl": "https://music.apple.com/us/song/598730884"
    },
    {
      "id": "milenko",
      "card": "The Great Milenko",
      "title": "Milenko’s Halls of Illusions",
      "short": "Halls of<br>Illusions",
      "icon": "◇",
      "color": "#b391ed",
      "tagline": "THE REFLECTION WANTS OUT.",
      "rule": "Collect true relics and smash the haunted mirrors. Some prizes are illusions. Dash to expose them. Watch for the reflection following you.",
      "tip": "E / Right Shift: shatter nearby mirrors for 6 tickets. Real relics have a solid gold center.",
      "secret": "Hokus Pokus",
      "hint": "Collect 8 true relics in Halls of Illusions. Dash near the hidden glint to reveal the record.",
      "source": "The Great Milenko",
      "sourceUrl": "https://music.apple.com/us/song/1440912437"
    },
    {
      "id": "jeckel",
      "card": "The Amazing Jeckel Brothers",
      "title": "Jeckel Brothers: Sin Toss",
      "short": "Sin<br>Toss",
      "icon": "Ⅱ",
      "color": "#ffad71",
      "tagline": "JACK PLAYS DIRTY. KEEP THE FIRE MOVING.",
      "rule": "Catch the oncoming fire with a dash, or strike it with your attack. Every deflection earns tickets. More fire joins the act as the round heats up.",
      "tip": "Dash or attack a fireball to return it for 3 tickets. Fireball hits cost 3.",
      "secret": "Play With Me",
      "hint": "Deflect 3 fireballs with a dash or attack in Sin Toss. Then find the record.",
      "source": "The Amazing Jeckel Brothers",
      "sourceUrl": "https://music.apple.com/us/song/1443826156"
    },
    {
      "id": "wraith",
      "card": "The Wraith",
      "title": "Wraith’s Crossing",
      "short": "Wraith’s<br>Crossing",
      "icon": "☾",
      "color": "#8bdddf",
      "tagline": "CARRY THE LIGHT. CROSS THE PIT.",
      "rule": "Collect blue souls, then bring them to the lit gate. Carry up to 5. Avoid the moving Hell’s Pit shadows.",
      "tip": "Only banked souls score: 3 tickets each. Getting hit drops your carried souls.",
      "secret": "Walk into the Light",
      "hint": "Deliver 8 souls to the gate in Wraith’s Crossing. The path will reveal a record.",
      "source": "The Wraith: Shangri-La",
      "sourceUrl": "https://music.apple.com/us/album/walk-into-the-light/1202351283?i=1202351358"
    }
  ],
  "modifiers": [
    {
      "id": "boom",
      "card": "Bang! Pow! Boom!",
      "name": "Three beats to trouble",
      "icon": "✷",
      "text": "Three marked blast circles erupt every 9 seconds. Their countdown gives everyone time to get clear."
    },
    {
      "id": "pop",
      "card": "The Mighty Death Pop!",
      "name": "Pop-up payday",
      "icon": "✦",
      "text": "Every 10 seconds, three bonus prizes pop into the arena. Grab them before your rivals."
    },
    {
      "id": "link",
      "card": "The Marvelous Missing Link",
      "name": "Lost / Found",
      "icon": "∞",
      "text": "The arena alternates LOST and FOUND. During FOUND, attraction objectives and prizes pay double."
    },
    {
      "id": "fury",
      "card": "Fearless Fred Fury",
      "name": "Fight back",
      "icon": "ϟ",
      "text": "A hit instantly refills your dash. Everyone’s dash recharges faster, keeping the contest close."
    },
    {
      "id": "bedlam",
      "card": "Yum Yum Bedlam",
      "name": "Beautiful trouble",
      "icon": "❋",
      "text": "A tempting garden blooms in the center: objectives completed inside pay double, but vines slow your movement."
    },
    {
      "id": "naught",
      "card": "The Naught",
      "name": "The vanishing act",
      "icon": "○",
      "text": "Every 12 seconds, loose prizes disappear for 3 seconds. Dummies and chickens turn spectral; rivals and hazards stay visible."
    }
  ],
  "colors": [
    "#d4ef74",
    "#f388b2",
    "#8bdddf",
    "#bd9aec"
  ],
  "names": [
    "Violent J",
    "Shaggy 2 Dope",
    "Ringmaster",
    "Milenko"
  ],
  "personalities": [
    "The Duke of the Wicked",
    "The Southwest Strangla",
    "The show belongs to him",
    "Master of illusions"
  ],
  "characters": [
    {
      "id": "violent-j",
      "name": "Violent J",
      "short": "VIOLENT J",
      "sheet": "icp",
      "row": 0,
      "role": "THE DUKE OF THE WICKED",
      "flavor": "Heavy swings. Loud entrances. A hatchet in hand.",
      "card": "carnage"
    },
    {
      "id": "shaggy",
      "name": "Shaggy 2 Dope",
      "short": "SHAGGY 2 DOPE",
      "sheet": "icp",
      "row": 1,
      "role": "THE SOUTHWEST STRANGLA",
      "flavor": "Soda in one hand. Trouble in the other.",
      "card": "ringmaster"
    },
    {
      "id": "ringmaster",
      "name": "Ringmaster",
      "short": "RINGMASTER",
      "sheet": "hosts",
      "row": 0,
      "role": "THE SECOND JOKER’S CARD",
      "flavor": "Gold claws and a crooked grin. The show is his.",
      "card": "ringmaster"
    },
    {
      "id": "milenko",
      "name": "The Great Milenko",
      "short": "MILENKO",
      "sheet": "hosts",
      "row": 1,
      "role": "THE FOURTH JOKER’S CARD",
      "flavor": "Follow the wand. Question what you see.",
      "card": "milenko"
    },
    {
      "id": "jack",
      "name": "Jack Jeckel",
      "short": "JACK JECKEL",
      "sheet": "spirits",
      "row": 0,
      "role": "THE SINISTER",
      "flavor": "A soul’s sins become a dangerous juggling act.",
      "card": "jeckel"
    },
    {
      "id": "wraith",
      "name": "The Wraith",
      "short": "THE WRAITH",
      "sheet": "spirits",
      "row": 1,
      "role": "THE SIXTH JOKER’S CARD",
      "flavor": "One card. Two exhibits. A final crossing.",
      "card": "wraith"
    }
  ]
};
