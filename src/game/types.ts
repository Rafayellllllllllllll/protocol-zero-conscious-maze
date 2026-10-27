export type Region = '中央区' | '旧城区' | '地下城' | '工业边缘' | '核心禁区';
export type QuestType = '主线' | '支线' | '个人' | '探索' | '隐藏';
export type QuestStatus = 'locked' | 'active' | 'done' | 'failed';
export type View = 'map' | 'explore' | 'dialogue' | 'quests' | 'deduction' | 'games' | 'inventory' | 'skills' | 'character' | 'factions' | 'city' | 'achievements' | 'saves' | 'settings' | 'endings' | 'chapters';

export interface Lock { kind: 'item' | 'flag' | 'quest' | 'trust' | 'skill'; id: string; value?: number; label: string }
export interface Location {
  id: string; name: string; region: Region; desc: string; x: number; y: number;
  npcs: string[]; clues: string[]; items: string[]; game?: string;
  lock?: Lock; hint?: string;
}
export interface DialogueOption {
  id: string; text: string; response: string;
  require?: Lock; effects?: Effect; once?: boolean;
}
export interface Effect {
  trust?: Record<string, number>; rep?: Record<string, number>;
  city?: Partial<City>; items?: string[]; money?: number; xp?: number;
  flag?: string; sanity?: number; hp?: number; stamina?: number; clue?: string;
}
export interface NPC {
  id: string; name: string; role: string; faction: string; location: string;
  avatar: string; color: string; background: string; personality: string; secret: string; goal: string;
  intro: string; options: DialogueOption[]; relations: string;
}
export interface Faction { id: string; name: string; desc: string; goal: string; color: string }
export interface Objective { kind: 'flag' | 'visit' | 'evidence' | 'item' | 'game' | 'quest'; id: string; text: string }
export interface Quest {
  id: string; title: string; type: QuestType; chapter: number; giver: string; location?: string;
  desc: string; prereq?: string[]; objectives: Objective[]; reward: Effect & { skillPoints?: number };
  failNote?: string;
}
export interface Evidence {
  id: string; name: string; kind: string; desc: string; detail: string; location: string; misleading?: boolean;
}
export interface Item {
  id: string; name: string; kind: string; rarity: '普通' | '稀有' | '史诗' | '传说';
  desc: string; use?: string; effect?: Effect;
}
export interface SkillNode {
  id: string; track: string; name: string; desc: string; effect: string; require?: string;
}
export interface Chapter { id: number; title: string; desc: string; scenes: string[]; unlock: string }
export interface EndingDef {
  id: string; title: string; desc: string; score: (s: GameState) => number; hidden?: boolean;
}
export interface Achievement { id: string; title: string; desc: string; check: (s: GameState) => boolean }
export interface City { energy: number; safety: number; trust: number; aiControl: number; resistance: number; pollution: number }
export interface Player {
  name: string; background: string; level: number; xp: number; xpNext: number; skillPoints: number;
  hp: number; hpMax: number; stamina: number; sanity: number;
  int: number; obs: number; neg: number; tech: number; money: number; actions: number; actionsMax: number;
}
export interface GameState {
  started: boolean; player: Player; day: number; hour: number; weather: string;
  locationId: string; chapter: number; view: View;
  visited: Record<string, number>; explored: string[];
  inventory: Record<string, number>; equipped: string[];
  skills: string[]; quests: Record<string, QuestStatus>; questProgress: Record<string, string[]>;
  npcTrust: Record<string, number>; factionRep: Record<string, number>;
  evidence: string[]; links: { a: string; b: string; reason: string }[];
  deductionDone: boolean; deductionResult: string;
  city: City; choices: string[]; flags: string[]; gamesWon: string[];
  achievements: string[]; endingsSeen: string[]; ending: string | null;
  log: string[]; message: string; dialogueNpc: string | null; selectedGame: string | null;
  settings: { animations: boolean; largeText: boolean };
  playCount: number;
}
export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
