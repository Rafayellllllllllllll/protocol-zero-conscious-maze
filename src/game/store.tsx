import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { GameState, View, Lock } from './types';
import { LOCATIONS, NPCS, ITEMS, SKILLS } from './data';
import { initialState, applyEffect, postAction, canAdvanceChapter, computeEnding } from './engine';

export const SAVE_KEY = 'protocol-zero-save-v1';
export const SLOT_KEY = (n: number) => `protocol-zero-slot-${n}`;

type Action =
  | { type: 'NEW'; name: string; bg: string; attrs: { int: number; obs: number; neg: number; tech: number }; item: string }
  | { type: 'LOAD'; state: GameState }
  | { type: 'VIEW'; view: View }
  | { type: 'MOVE'; locationId: string }
  | { type: 'EXPLORE' }
  | { type: 'TALK'; npcId: string; optionId: string }
  | { type: 'SKILL'; id: string }
  | { type: 'GAME_WIN'; id: string }
  | { type: 'LINK'; a: string; b: string; reason: string }
  | { type: 'DEDUCT'; hypothesis: string }
  | { type: 'DEDUCT_OK' } | { type: 'DEDUCT_FAIL'; feedback: string }
  | { type: 'USE_ITEM'; id: string }
  | { type: 'REST' } | { type: 'TICK' } | { type: 'CHAPTER' } | { type: 'ENDING' }
  | { type: 'GAME_SELECT'; id: string | null } | { type: 'DIALOGUE'; id: string | null }
  | { type: 'EQUIP'; id: string } | { type: 'SETTINGS'; settings: Partial<GameState['settings']> }
  | { type: 'MESSAGE'; message: string };

export function checkLock(s: GameState, lock?: Lock): { ok: boolean; label: string } {
  if (!lock) return { ok: true, label: '' };
  if (lock.kind === 'item') return { ok: (s.inventory[lock.id] || 0) > 0, label: lock.label };
  if (lock.kind === 'flag') return { ok: s.flags.includes(lock.id), label: lock.label };
  if (lock.kind === 'quest') return { ok: s.quests[lock.id] === 'done', label: lock.label };
  if (lock.kind === 'trust') return { ok: (s.npcTrust[lock.id] || 0) >= (lock.value || 0), label: lock.label };
  if (lock.kind === 'skill') return { ok: s.skills.includes(lock.id), label: lock.label };
  return { ok: true, label: '' };
}

function advanceTime(s: GameState, hours: number): GameState {
  let hour = s.hour + hours; let day = s.day;
  while (hour >= 24) { hour -= 24; day++; }
  const weathers = ['霓虹雨', '数据雾', '晴（监控良好）', '电磁风暴', '霓虹雨'];
  return { ...s, hour, day, weather: weathers[day % weathers.length] };
}

function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'NEW': return postAction(initialState(a.name, a.bg, a.attrs, a.item));
    case 'LOAD': return { ...a.state, view: 'map' };
    case 'VIEW': return { ...s, view: a.view };
    case 'MESSAGE': return { ...s, message: a.message };
    case 'DIALOGUE': return { ...s, dialogueNpc: a.id, view: a.id ? 'dialogue' : s.view };
    case 'GAME_SELECT': return { ...s, selectedGame: a.id, view: a.id ? 'games' : s.view };
    case 'SETTINGS': return { ...s, settings: { ...s.settings, ...a.settings } };
    case 'EQUIP': {
      const has = s.equipped.includes(a.id);
      return { ...s, equipped: has ? s.equipped.filter(x => x !== a.id) : [...s.equipped, a.id], message: has ? '已卸下装备。' : '已装备。' };
    }
    case 'MOVE': {
      if (s.player.actions <= 0) return { ...s, message: '行动次数已用完，请先休息（城市面板或底部快捷栏）。' };
      const loc = LOCATIONS.find(l => l.id === a.locationId); if (!loc) return s;
      const lock = checkLock(s, loc.lock); if (!lock.ok) return { ...s, message: `无法进入${loc.name}：${lock.label}。${loc.hint || ''}` };
      let next = advanceTime({ ...s, locationId: a.locationId, visited: { ...s.visited, [a.locationId]: (s.visited[a.locationId] || 0) + 1 }, player: { ...s.player, actions: s.player.actions - 1 }, view: 'explore', log: [...s.log, `前往 ${loc.name}（第 ${s.day} 天 ${s.hour}:00）`] }, 1);
      return postAction(next);
    }
    case 'EXPLORE': {
      if (s.player.actions <= 0) return { ...s, message: '行动次数已用完，请先休息。' };
      const loc = LOCATIONS.find(l => l.id === s.locationId); if (!loc) return s;
      const first = !s.explored.includes(loc.id);
      let next: GameState = { ...s, player: { ...s.player, actions: s.player.actions - 1, xp: s.player.xp + (first ? 30 : 10) }, message: first ? `探索 ${loc.name}：${loc.desc}` : `再次探索 ${loc.name}，没有新发现，但你更熟悉这里了。`, log: [...s.log, `探索 ${loc.name}`] };
      if (first) {
        next = { ...next, explored: [...next.explored, loc.id] };
        loc.clues.forEach(c => { if (!next.evidence.includes(c)) next = { ...next, evidence: [...next.evidence, c] }; });
        loc.items.forEach(id => { next = { ...next, inventory: { ...next.inventory, [id]: (next.inventory[id] || 0) + 1 } }; });
        if (loc.game) next = { ...next, message: next.message + ` 这里可以玩小游戏：${loc.game}（见黑客小游戏页）。` };
      }
      next = advanceTime(next, 1);
      return postAction(next);
    }
    case 'TALK': {
      const npc = NPCS.find(n => n.id === a.npcId); const opt = npc?.options.find(o => o.id === a.optionId); if (!npc || !opt) return s;
      if (opt.require) { const chk = checkLock(s, opt.require); if (!chk.ok) return { ...s, message: `对话选项不可用：${chk.label}` }; }
      if (s.choices.includes(opt.id)) return { ...s, message: `${npc.name}：“${opt.response}”（这段对话的效果已生效过，不会重复结算。）` };
      let next = applyEffect(s, opt.effects);
      next = { ...next, message: `${npc.name}：“${opt.response}”`, log: [...next.log, `与 ${npc.name} 对话：${opt.text}`] };
      return postAction(next);
    }
    case 'SKILL': {
      const node = SKILLS.find(x => x.id === a.id); if (!node || s.skills.includes(a.id)) return s;
      if (node.require && !s.skills.includes(node.require)) return { ...s, message: `需要先解锁前置技能。` };
      if (s.player.skillPoints <= 0) return { ...s, message: '技能点不足，完成任务或升级可获得技能点。' };
      let next: GameState = { ...s, skills: [...s.skills, a.id], player: { ...s.player, skillPoints: s.player.skillPoints - 1 }, flags: [...s.flags, `skill_${a.id}`], message: `解锁技能：${node.name}——${node.desc}`, log: [...s.log, `解锁技能 ${node.name}`] };
      return postAction(next);
    }
    case 'GAME_WIN': {
      if (s.gamesWon.includes(a.id)) return { ...s, message: '这个小游戏你已经赢过一次了，可以重玩，但奖励只结算一次。' };
      let next: GameState = { ...s, gamesWon: [...s.gamesWon, a.id], flags: [...s.flags, `game_${a.id}`], message: `小游戏胜利！获得 80 经验与 60 货币。`, log: [...s.log, `小游戏胜利：${a.id}`] };
      next = applyEffect(next, { xp: 80, money: 60 });
      return postAction(next);
    }
    case 'LINK': {
      if (s.links.some(l => (l.a === a.a && l.b === a.b) || (l.a === a.b && l.b === a.a))) return { ...s, message: '这条关联已经存在。' };
      return { ...s, links: [...s.links, { a: a.a, b: a.b, reason: a.reason }], message: '关联已建立。去推理工作台检查关键关联是否齐全。' };
    }
    case 'DEDUCT': return s;
    case 'DEDUCT_OK': {
      let next: GameState = { ...s, deductionDone: true, deductionResult: '推理成立：零号协议用人类意识样本训练了伊芙，系统为此注销了样本提供者。', flags: [...s.flags, 'deduction_correct'], message: '推理成立！最终推理任务可以完成了。', log: [...s.log, '最终推理成立'] };
      return postAction(next);
    }
    case 'DEDUCT_FAIL': return { ...s, deductionResult: a.feedback, message: a.feedback };
    case 'USE_ITEM': {
      const item = ITEMS.find(i => i.id === a.id); if (!item || (s.inventory[a.id] || 0) <= 0) return s;
      if (!item.effect) return { ...s, message: `${item.name} 是任务/剧情道具，不能直接使用，但它可能在对话或地点解锁中起作用。` };
      const inv = { ...s.inventory, [a.id]: s.inventory[a.id] - 1 };
      let next = applyEffect({ ...s, inventory: inv }, item.effect);
      next = { ...next, message: `使用了 ${item.name}。`, log: [...next.log, `使用物品 ${item.name}`] };
      return postAction(next);
    }
    case 'REST': {
      let next = advanceTime({ ...s, player: { ...s.player, actions: s.player.actionsMax, stamina: 100, hp: Math.min(s.player.hpMax, s.player.hp + 20) }, message: '休息到第二天早上 8 点，行动次数已恢复。', log: [...s.log, `休息（第 ${s.day} 天）`] }, 24 - s.hour + 8 > 24 ? 0 : 0);
      // set to next day 8:00 explicitly
      next = { ...next, day: s.day + 1, hour: 8 };
      return postAction(next);
    }
    case 'TICK': {
      if (s.player.actions <= 0) return { ...s, message: '行动次数已用完，请先休息。' };
      let next = advanceTime({ ...s, player: { ...s.player, actions: s.player.actions - 1 }, message: '时间推进 1 小时。城市在暗处发生了一些变化。', log: [...s.log, '时间推进 1 小时'] }, 1);
      return postAction(next);
    }
    case 'CHAPTER': {
      if (!canAdvanceChapter(s)) return { ...s, message: '本章主线任务尚未全部完成，无法推进章节。' };
      return postAction({ ...s, chapter: s.chapter + 1, message: `进入新章节。`, log: [...s.log, `进入第 ${s.chapter + 1} 章`] });
    }
    case 'ENDING': {
      const { ending } = computeEnding(s);
      const seen = s.endingsSeen.includes(ending.id) ? s.endingsSeen : [...s.endingsSeen, ending.id];
      return postAction({ ...s, ending: ending.id, endingsSeen: seen, message: `结局达成：${ending.title}` });
    }
    default: return s;
  }
}

const Ctx = createContext<{ state: GameState; dispatch: React.Dispatch<Action>; save: (slot?: number) => void } | null>(null);
export function useGame() { const c = useContext(Ctx); if (!c) throw new Error('game context'); return c; }

export function GameProvider({ children, initial }: { children: React.ReactNode; initial: GameState | null }) {
  const [state, dispatch] = useReducer(reducer, initial || initialState('无名者', '记者', { int: 0, obs: 2, neg: 1, tech: 0 }, 'fake_id'));
  useEffect(() => {
    if (state.started) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* ignore */ } }
  }, [state]);
  const save = (slot?: number) => {
    try { if (slot) localStorage.setItem(SLOT_KEY(slot), JSON.stringify(state)); else localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  };
  const value = useMemo(() => ({ state, dispatch, save }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function loadSave(): GameState | null {
  try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) as GameState : null; } catch { return null; }
}
export function loadSlot(n: number): GameState | null {
  try { const raw = localStorage.getItem(SLOT_KEY(n)); return raw ? JSON.parse(raw) as GameState : null; } catch { return null; }
}
