'use strict';
// Save migration and progression rules stay independent of rendering and input.
window.CarnivalProgress = (() => {
  const ids = ['carnage', 'ringmaster', 'riddle', 'milenko', 'jeckel', 'wraith'];
  const goals = {
    carnage: { stat: 'kills', label: 'dummies smashed', tiers: [4, 10, 18] },
    ringmaster: { stat: 'delivered', label: 'chickens delivered', tiers: [2, 4, 7] },
    riddle: { stat: 'safes', label: 'safe judgments', tiers: [3, 6, 9] },
    milenko: { stat: 'pickups', label: 'true relics collected', tiers: [5, 10, 18] },
    jeckel: { stat: 'deflects', label: 'fireballs returned', tiers: [4, 10, 18] },
    wraith: { stat: 'banked', label: 'souls delivered', tiers: [6, 12, 20] }
  };
  const medalNames = ['Unranked', 'Bronze', 'Silver', 'Gold'];
  const integer = (v, max = 1000000000) => Number.isFinite(Number(v)) ? Math.max(0, Math.min(max, Math.floor(Number(v)))) : 0;
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const object = v => v && typeof v === 'object' && !Array.isArray(v);
  const empty = () => ({ version: 2, tickets: 0, secrets: [], days: [], daily: {}, cups: 0, look: 'classic', reduced: false, learnedControls: false, sound: true, music: .65, effects: .8, graphics: 'full', autoAction: true, mastery: {}, tourWins: [], tourVisits: 0, checkpoint: null });

  function checkpoint(raw) {
    if (!object(raw) || raw.version !== 1 || !object(raw.match) || !Array.isArray(raw.seats) || raw.seats.length !== 4) return null;
    const m = raw.match, modes = ['solo', 'party', 'daily', 'practice', 'tour'];
    if (!modes.includes(m.mode) || !date(m.day) || !['chill', 'rowdy', 'wicked'].includes(m.level)) return null;
    if (!Array.isArray(m.route) || ![1, 3, 6].includes(m.route.length) || !m.route.every(n => Number.isInteger(n) && n >= 0 && n < 6) || new Set(m.route).size !== m.route.length) return null;
    if (!Array.isArray(m.mods) || m.mods.length !== m.route.length || !m.mods.every(n => Number.isInteger(n) && n >= 0 && n < 6)) return null;
    if (!Number.isInteger(m.roundIndex) || m.roundIndex < 0 || m.roundIndex > m.route.length || !Number.isInteger(m.seed) || m.seed < 0 || m.seed > 4294967295) return null;
    const human = raw.seats.filter(s => object(s) && s.control !== 'cpu');
    if (!human.length || new Set(human.map(s => s.control)).size !== human.length) return null;
    if (!raw.seats.every(s => object(s) && Number.isInteger(s.character) && s.character >= 0 && s.character < 6 && /^(cpu|key[12]|pad[0-3])$/.test(s.control))) return null;
    if (!['totals', 'raw'].every(k => Array.isArray(m[k]) && m[k].length === 4 && m[k].every(n => Number.isInteger(n) && n >= 0 && n <= 1000000000))) return null;
    if (!Array.isArray(m.roundHistory) || m.roundHistory.length !== m.roundIndex || !m.roundHistory.every((r, i) => object(r) && r.booth === ids[m.route[i]] && Array.isArray(r.scores) && r.scores.length === 4 && r.scores.every(n => Number.isInteger(n) && n >= 0 && n <= 1000000))) return null;
    if (m.mode === 'daily' && (m.route.length !== 3 || human.length !== 1 || raw.seats[0].control === 'cpu' || m.level !== 'rowdy')) return null;
    if (m.mode === 'tour' && (m.route.join() !== '0,1,2,3,4,5' || human.length !== 1 || raw.seats[0].control === 'cpu')) return null;
    return { version: 1, seats: raw.seats.map(s => ({ character: s.character, control: s.control })), match: { mode: m.mode, day: m.day, seed: m.seed, quick: !!m.quick, level: m.level, roundIndex: m.roundIndex, route: [...m.route], mods: [...m.mods], totals: [...m.totals], raw: [...m.raw], roundHistory: m.roundHistory.map(r => ({ booth: r.booth, scores: [...r.scores] })), done: false } };
  }

  function normalize(raw) {
    const s = empty();
    if (!object(raw) || ![1, 2].includes(raw.version)) return s;
    s.tickets = integer(raw.tickets); s.cups = integer(raw.cups); s.tourVisits = integer(raw.tourVisits);
    s.secrets = [...new Set(Array.isArray(raw.secrets) ? raw.secrets.filter(v => ids.includes(v)) : [])];
    s.days = [...new Set(Array.isArray(raw.days) ? raw.days.filter(date) : [])].sort();
    if (object(raw.daily)) for (const key of Object.keys(raw.daily).filter(date).sort().slice(-366)) {
      if (object(raw.daily[key])) s.daily[key] = { best: integer(raw.daily[key].best), runs: integer(raw.daily[key].runs) };
    }
    s.reduced = raw.reduced === true; s.learnedControls = raw.learnedControls === true; s.sound = raw.sound !== false;
    for (const k of ['music', 'effects']) if (typeof raw[k] === 'number' && Number.isFinite(raw[k])) s[k] = Math.max(0, Math.min(1, raw[k]));
    s.graphics = raw.graphics === 'battery' ? 'battery' : 'full';
    s.autoAction = raw.autoAction !== false;
    for (const id of ids) if (object(raw.mastery?.[id])) s.mastery[id] = { best: integer(raw.mastery[id].best, 1000000), score: integer(raw.mastery[id].score, 1000000), plays: integer(raw.mastery[id].plays) };
    s.tourWins = [...new Set(Array.isArray(raw.tourWins) ? raw.tourWins.filter(n => Number.isInteger(n) && n >= 0 && n < 6) : [])];
    s.look = ['classic', 'neon', 'royal', 'crowned'].includes(raw.look) ? raw.look : 'classic';
    if (s.look === 'neon' && s.tickets < 100 || s.look === 'royal' && s.tickets < 300 || s.look === 'crowned' && !s.tourWins.length) s.look = 'classic';
    s.checkpoint = checkpoint(raw.checkpoint);
    return s;
  }

  function medal(id, value) { return goals[id].tiers.filter(n => value >= n).length; }
  function recordRound(save, id, humans) {
    const goal = goals[id], old = save.mastery[id] || { best: 0, score: 0, plays: 0 };
    const value = Math.max(...humans.map(p => integer(p[goal.stat]))), score = Math.max(...humans.map(p => integer(p.score)));
    const next = { best: Math.max(old.best, value), score: Math.max(old.score, score), plays: old.plays + 1 };
    save.mastery[id] = next;
    const earned = medal(id, next.best), previous = medal(id, old.best);
    return { value, earned, previous, newMedal: earned > previous, next: goal.tiers[earned] ?? null, label: goal.label };
  }
  return { empty, normalize, checkpoint, goals, medal, medalNames, recordRound };
})();
