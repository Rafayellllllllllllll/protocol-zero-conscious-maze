import React from 'react';
import { useGame } from '../game/store';
import type { View } from '../game/types';
import { QUESTS, CHAPTERS } from '../game/data';

const NAV: { view: View; label: string }[] = [
  { view: 'map', label: '城市地图' }, { view: 'explore', label: '地点探索' }, { view: 'dialogue', label: 'NPC 对话' },
  { view: 'quests', label: '任务日志' }, { view: 'deduction', label: '侦探工作台' }, { view: 'games', label: '黑客小游戏' },
  { view: 'inventory', label: '背包装备' }, { view: 'skills', label: '技能树' }, { view: 'character', label: '角色档案' },
  { view: 'factions', label: '派系关系' }, { view: 'city', label: '城市模拟' }, { view: 'achievements', label: '成就中心' },
  { view: 'chapters', label: '章节档案' }, { view: 'endings', label: '结局回顾' }, { view: 'saves', label: '存档管理' }, { view: 'settings', label: '游戏设置' },
];

export function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="bar"><span>{label}</span><div className="track"><div className="fill" style={{ width: `${value}%`, background: color }} /></div><b>{value}</b></div>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state: s, dispatch, save } = useGame();
  const p = s.player;
  const activeQuests = QUESTS.filter(q => s.quests[q.id] === 'active').slice(0, 5);
  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">◈ 零号协议：意识迷城</div>
        <div className="topstats">
          <span>第 {s.day} 天 {s.hour}:00</span><span>{s.weather}</span><span>💰 {p.money}</span>
          <span>❤️ {p.hp}</span><span>⚡ {p.actions}/{p.actionsMax}</span><span>{CHAPTERS[s.chapter]?.title}</span>
        </div>
      </header>
      <div className="layout">
        <nav className="sidenav">
          {NAV.map(n => <button key={n.view} className={s.view === n.view ? 'active' : ''} onClick={() => dispatch({ type: 'VIEW', view: n.view })}>{n.label}</button>)}
        </nav>
        <main className="center">
          <div className="message">{s.message}</div>
          {children}
        </main>
        <aside className="sidebar">
          <h3>角色状态</h3>
          <Bar label="生命" value={p.hp} color="#f87171" />
          <Bar label="体力" value={p.stamina} color="#38bdf8" />
          <Bar label="精神" value={p.sanity} color="#a78bfa" />
          <p className="small">等级 {p.level} · 经验 {p.xp}/{p.xpNext} · 技能点 {p.skillPoints} · {p.name}（{p.background}）</p>
          <h3>当前任务</h3>
          {activeQuests.length === 0 && <p className="small">暂无进行中的任务，去任务日志查看已解锁任务。</p>}
          {activeQuests.map(q => <div key={q.id} className="sidequest"><b>{q.title}</b><span>{q.desc}</span><button onClick={() => dispatch({ type: 'VIEW', view: 'quests' })}>查看</button></div>)}
          <h3>城市速览</h3>
          <Bar label="能源" value={s.city.energy} color="#facc15" />
          <Bar label="安全" value={s.city.safety} color="#34d399" />
          <Bar label="AI 控制" value={s.city.aiControl} color="#a78bfa" />
          <h3>事件日志</h3>
          <div className="log">{[...s.log].slice(-8).reverse().map((l, i) => <div key={i}>· {l}</div>)}</div>
        </aside>
      </div>
      <footer className="bottombar">
        <button onClick={() => dispatch({ type: 'VIEW', view: 'map' })}>🗺️ 地图</button>
        <button onClick={() => dispatch({ type: 'REST' })}>🛏️ 休息到次日 8 点</button>
        <button onClick={() => dispatch({ type: 'TICK' })}>⏱️ 推进 1 小时</button>
        <button onClick={() => { save(); dispatch({ type: 'MESSAGE', message: '已手动保存到自动存档槽（刷新后可继续）。去存档管理页可存到 1-3 号槽。' }); }}>💾 手动保存</button>
        <button onClick={() => dispatch({ type: 'VIEW', view: 'quests' })}>📋 任务</button>
        <button onClick={() => dispatch({ type: 'VIEW', view: 'deduction' })}>🔍 推理</button>
      </footer>
      <nav className="mobilenav">
        {NAV.map(n => <button key={n.view} className={s.view === n.view ? 'active' : ''} onClick={() => dispatch({ type: 'VIEW', view: n.view })}>{n.label}</button>)}
      </nav>
    </div>
  );
}
