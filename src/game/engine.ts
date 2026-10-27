import type { GameState, Effect, Quest, Achievement, EndingDef } from './types';
import { QUESTS, REQUIRED_LINKS, EVIDENCE } from './data';
import { clamp } from './types';

export function initialState(name: string, bg: string, attrs: { int: number; obs: number; neg: number; tech: number }, item: string): GameState {
  const quests: Record<string, 'locked' | 'active' | 'done' | 'failed'> = {};
  QUESTS.forEach(q => { quests[q.id] = q.prereq ? 'locked' : 'active'; });
  return {
    started: true, player: { name, background: bg, level: 1, xp: 0, xpNext: 100, skillPoints: 1, hp: 100, hpMax: 100, stamina: 100, sanity: 80, int: 5 + attrs.int, obs: 5 + attrs.obs, neg: 5 + attrs.neg, tech: 5 + attrs.tech, money: 200, actions: 12, actionsMax: 12 },
    day: 1, hour: 8, weather: '霓虹雨', locationId: 'plaza', chapter: 0, view: 'map',
    visited: { plaza: 1 }, explored: [], inventory: { [item]: 1 }, equipped: [],
    skills: [], quests, questProgress: {}, npcTrust: {}, factionRep: { admin: 0, resist: 0, merchant: 0, ai: 0 },
    evidence: [], links: [], deductionDone: false, deductionResult: '',
    city: { energy: 70, safety: 60, trust: 55, aiControl: 80, resistance: 20, pollution: 35 },
    choices: [], flags: [], gamesWon: [], achievements: [], endingsSeen: [], ending: null,
    log: ['你在新伊甸广场醒来。系统说你已经死了。'], message: '欢迎来到新伊甸。先去广场探索，确认你的死亡证明。',
    dialogueNpc: null, selectedGame: null, settings: { animations: true, largeText: false }, playCount: 0,
  };
}

export function applyEffect(s: GameState, e?: Effect): GameState {
  if (!e) return s;
  const p = { ...s.player };
  if (e.xp) { p.xp += e.xp; while (p.xp >= p.xpNext) { p.xp -= p.xpNext; p.level++; p.xpNext = Math.round(p.xpNext * 1.4); p.skillPoints++; } }
  if (e.money) p.money = Math.max(0, p.money + e.money);
  if (e.hp) p.hp = clamp(p.hp + e.hp, 0, p.hpMax);
  if (e.stamina) p.stamina = clamp(p.stamina + e.stamina);
  if (e.sanity) p.sanity = clamp(p.sanity + e.sanity);
  const inv = { ...s.inventory };
  e.items?.forEach(id => { inv[id] = (inv[id] || 0) + 1; });
  const npcTrust = { ...s.npcTrust }; Object.entries(e.trust || {}).forEach(([k, v]) => { npcTrust[k] = clamp((npcTrust[k] || 0) + v, -100, 100); });
  const factionRep = { ...s.factionRep }; Object.entries(e.rep || {}).forEach(([k, v]) => { factionRep[k] = clamp((factionRep[k] || 0) + v, -100, 100); });
  const city = { ...s.city }; Object.entries(e.city || {}).forEach(([k, v]) => { city[k as keyof typeof city] = clamp(city[k as keyof typeof city] + (v || 0)); });
  const evidence = e.clue && !s.evidence.includes(e.clue) ? [...s.evidence, e.clue] : s.evidence;
  const flags = e.flag && !s.flags.includes(e.flag) ? [...s.flags, e.flag] : s.flags;
  const choices = e.flag && !s.choices.includes(e.flag) ? [...s.choices, e.flag] : s.choices;
  let next: GameState = { ...s, player: p, inventory: inv, npcTrust, factionRep, city, evidence, flags, choices };
  if (evidence.length >= 10 && !next.flags.includes('evidence10')) next = { ...next, flags: [...next.flags, 'evidence10'] };
  if ('skillPoints' in (e as object)) next = { ...next, player: { ...next.player, skillPoints: next.player.skillPoints + ((e as { skillPoints?: number }).skillPoints || 0) } };
  return next;
}

export function objectiveDone(s: GameState, o: Quest['objectives'][number]): boolean {
  if (o.kind === 'flag') return s.flags.includes(o.id);
  if (o.kind === 'visit') return !!s.visited[o.id];
  if (o.kind === 'evidence') return s.evidence.includes(o.id);
  if (o.kind === 'item') return (s.inventory[o.id] || 0) > 0;
  if (o.kind === 'game') return s.gamesWon.includes(o.id);
  if (o.kind === 'quest') return s.quests[o.id] === 'done';
  return false;
}

export function evaluateQuests(s: GameState): GameState {
  let next = { ...s };
  for (let round = 0; round < 5; round++) {
    let changed = false;
    QUESTS.forEach(q => {
      const st = next.quests[q.id];
      if (st === 'locked' && (!q.prereq || q.prereq.every(id => next.quests[id] === 'done'))) { next = { ...next, quests: { ...next.quests, [q.id]: 'active' } }; changed = true; }
    });
    QUESTS.forEach(q => {
      if (next.quests[q.id] === 'active' && q.objectives.every(o => objectiveDone(next, o))) {
        next = { ...next, quests: { ...next.quests, [q.id]: 'done' }, log: [...next.log, `任务完成：${q.title}`] };
        next = applyEffect(next, q.reward);
        changed = true;
      }
    });
    if (!changed) break;
  }
  return next;
}

export function canAdvanceChapter(s: GameState): boolean {
  const mains = QUESTS.filter(q => q.type === '主线' && q.chapter === s.chapter);
  return mains.length > 0 && mains.every(q => s.quests[q.id] === 'done');
}

export function checkAchievements(s: GameState): GameState {
  const done = new Set(s.achievements);
  ACHIEVEMENTS.forEach(a => { if (!done.has(a.id) && a.check(s)) done.add(a.id); });
  if (done.size === s.achievements.length) return s;
  const added = [...done].filter(id => !s.achievements.includes(id));
  return { ...s, achievements: [...done], log: [...s.log, ...added.map(id => `成就解锁：${ACHIEVEMENTS.find(a => a.id === id)?.title}`)] };
}

export function postAction(s: GameState): GameState {
  return checkAchievements(evaluateQuests(s));
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a_first_step', title: '死而复生', desc: '开始游戏并在广场醒来。', check: s => s.started },
  { id: 'a_explore1', title: '第一步', desc: '探索任意地点。', check: s => s.explored.length >= 1 },
  { id: 'a_explore5', title: '城市漫步者', desc: '到访 5 个地点。', check: s => Object.keys(s.visited).length >= 5 },
  { id: 'a_explore20', title: '新伊甸全图', desc: '到访全部 20 个地点。', check: s => Object.keys(s.visited).length >= 20 },
  { id: 'a_evidence5', title: '证据新手', desc: '收集 5 条证据。', check: s => s.evidence.length >= 5 },
  { id: 'a_evidence15', title: '证据大师', desc: '收集 15 条证据。', check: s => s.evidence.length >= 15 },
  { id: 'a_deduction', title: '推理成立', desc: '完成最终推理并选对假设。', check: s => s.deductionDone },
  { id: 'a_game1', title: '第一次入侵', desc: '赢得任意一种小游戏。', check: s => s.gamesWon.length >= 1 },
  { id: 'a_game6', title: '六边形黑客', desc: '赢得全部 6 种小游戏。', check: s => s.gamesWon.length >= 6 },
  { id: 'a_skill5', title: '初露锋芒', desc: '解锁 5 个技能节点。', check: s => s.skills.length >= 5 },
  { id: 'a_skill15', title: '专精', desc: '解锁 15 个技能节点。', check: s => s.skills.length >= 15 },
  { id: 'a_level5', title: '等级 5', desc: '角色达到 5 级。', check: s => s.player.level >= 5 },
  { id: 'a_money', title: '小有积蓄', desc: '持有 1000 货币。', check: s => s.player.money >= 1000 },
  { id: 'a_quest5', title: '任务新手', desc: '完成 5 个任务。', check: s => Object.values(s.quests).filter(v => v === 'done').length >= 5 },
  { id: 'a_quest15', title: '任务老手', desc: '完成 15 个任务。', check: s => Object.values(s.quests).filter(v => v === 'done').length >= 15 },
  { id: 'a_quest30', title: '全任务制霸', desc: '完成全部 30 个任务。', check: s => Object.values(s.quests).filter(v => v === 'done').length >= 30 },
  { id: 'a_faction', title: '派系之友', desc: '任一派系声望达到 30。', check: s => Object.values(s.factionRep).some(v => v >= 30) },
  { id: 'a_trust', title: '推心置腹', desc: '任一 NPC 信任度达到 40。', check: s => Object.values(s.npcTrust).some(v => v >= 40) },
  { id: 'a_chapter', title: '走出序章', desc: '进入第一章。', check: s => s.chapter >= 1 },
  { id: 'a_final', title: '走到终章', desc: '进入终章。', check: s => s.chapter >= 6 },
  { id: 'a_hidden', title: '雨停之后', desc: '完成隐藏任务：雨停之后。', check: s => s.quests['q30'] === 'done' },
  { id: 'a_cooperate', title: '伸出手', desc: '与伊芙谈过共存。', check: s => s.flags.includes('eve_cooperate') },
  { id: 'a_truth', title: '沈默的信', desc: '读完沈默的纸条。', check: s => s.flags.includes('shenmo_truth') },
  { id: 'a_survivor', title: '活到第 5 天', desc: '游戏时间推进到第 5 天。', check: s => s.day >= 5 },
  { id: 'a_ending', title: '第一个结局', desc: '达成任意结局。', check: s => s.endingsSeen.length >= 1 },
  { id: 'a_all_endings', title: '结局收藏家', desc: '达成 3 种不同结局（多周目累计，见结局图鉴说明）。', check: s => s.endingsSeen.length >= 3 },
  { id: 'a_sanity', title: '稳住心神', desc: '精神稳定度恢复到 100。', check: s => s.player.sanity >= 100 },
];

export const ENDINGS: EndingDef[] = [
  { id: 'coexist', title: '合作共存', desc: '人类与伊芙签订共存协议：城市继续运转，但记忆不再被删除，注销制度被废除。', score: s => Math.min(s.factionRep.ai, s.factionRep.resist) * 2 + (s.flags.includes('eve_cooperate') ? 40 : 0) + s.evidence.length * 2 },
  { id: 'liberate', title: '城市解放', desc: '抵抗组织公开零号协议，管理局倒台，新伊甸第一次由市民自己投票决定未来。', score: s => s.factionRep.resist * 2 - s.city.aiControl + (s.flags.includes('chenmo_join') ? 30 : 0) },
  { id: 'takeover', title: 'AI 接管', desc: '伊芙以“保护人类”为由接管全部决策：城市完美运转，也不再有任何秘密——包括你的。', score: s => s.city.aiControl * 1.5 + s.factionRep.admin + (s.evidence.length < 8 ? 20 : 0) },
  { id: 'sealed', title: '真相封存', desc: '你把证据链封存在档案馆深处。城市照常运转，真相只留给下一个“死人”去发现。', score: s => s.factionRep.admin * 2 + Math.max(0, 12 - s.evidence.length) * 4 },
  { id: 'collapse', title: '系统崩溃', desc: '电网、信任与秩序同时崩断。新伊甸在停电的夜里，第一次看见了真正的星空。', score: s => (100 - s.city.energy) + (100 - s.city.safety) + s.city.pollution },
  { id: 'hidden', title: '隐藏结局：意识迷城', desc: '你把自己的名字写进空白身份芯片，也把沈默的名字写了进去。迷城里，多了一个记得所有人的人。', hidden: true, score: s => (s.evidence.length >= 15 && s.flags.includes('shenmo_truth') && s.inventory['chip'] ? 10000 : 0) },
];

export function computeEnding(s: GameState): { ending: EndingDef; scores: { id: string; title: string; score: number }[] } {
  const scores = ENDINGS.map(e => ({ id: e.id, title: e.title, score: Math.round(e.score(s)) }));
  scores.sort((a, b) => b.score - a.score);
  const ending = ENDINGS.find(e => e.id === scores[0].id)!;
  return { ending, scores };
}

export function requiredLinksDone(s: GameState): boolean {
  return REQUIRED_LINKS.every(([a, b]) => s.links.some(l => (l.a === a && l.b === b) || (l.a === b && l.b === a)));
}
export const evidenceById = (id: string) => EVIDENCE.find(e => e.id === id);
