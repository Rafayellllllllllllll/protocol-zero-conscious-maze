import React from 'react';
import { useGame, loadSlot, SLOT_KEY } from '../game/store';
import { QUESTS, ITEMS, SKILLS, SKILL_TRACKS, FACTIONS, NPCS, CHAPTERS, LOCATIONS } from '../game/data';
import { objectiveDone, canAdvanceChapter, computeEnding, ACHIEVEMENTS, ENDINGS } from '../game/engine';
import { Bar } from './Layout';

export function QuestView() {
  const { state: s, dispatch } = useGame();
  const types = ['主线', '支线', '个人', '探索', '隐藏'] as const;
  return (
    <div>
      <h2>任务日志（共 30 个）</h2>
      <p className="small">已完成 {Object.values(s.quests).filter(v => v === 'done').length} / 30 · 当前章节：{CHAPTERS[s.chapter]?.title}</p>
      <button className="primary" disabled={!canAdvanceChapter(s)} onClick={() => dispatch({ type: 'CHAPTER' })}>{canAdvanceChapter(s) ? '▶ 推进到下一章' : '本章主线未全部完成，暂不能推进章节'}</button>
      {types.map(t => (
        <div key={t}><h3>{t}</h3>
          {QUESTS.filter(q => q.type === t).map(q => {
            const st = s.quests[q.id];
            return (
              <div key={q.id} className="card">
                <b>{q.title}</b> · {st === 'done' ? '✅ 已完成' : st === 'active' ? '▶ 进行中' : '🔒 未解锁（需先完成前置任务）'}
                <p>{q.desc}</p>
                <p className="small">委托：{q.giver}{q.location ? ` · 地点：${LOCATIONS.find(l => l.id === q.location)?.name || q.location}` : ''}</p>
                <ul>{q.objectives.map((o, i) => <li key={i}>{objectiveDone(s, o) ? '✅' : '○'} {o.text}</li>)}</ul>
                <p className="small">奖励：{q.reward.xp ? `${q.reward.xp} 经验 ` : ''}{q.reward.money ? `${q.reward.money} 货币 ` : ''}{q.reward.skillPoints ? `${q.reward.skillPoints} 技能点 ` : ''}{q.reward.items ? `物品：${q.reward.items.map(id => ITEMS.find(i => i.id === id)?.name).join('、')} ` : ''}</p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function InventoryView() {
  const { state: s, dispatch } = useGame();
  return (
    <div>
      <h2>背包与装备</h2>
      <p className="small">点击物品查看详情；可消耗类物品点“使用”会真正生效，任务道具则提示其用途。</p>
      <div className="grid">
        {ITEMS.map(it => {
          const n = s.inventory[it.id] || 0;
          return (
            <div key={it.id} className={`card ${n ? '' : 'dim'}`}>
              <b>{it.name}</b> · {it.kind} · {it.rarity} · 数量 {n} {s.equipped.includes(it.id) ? '· 已装备' : ''}
              <p>{it.desc}</p><p className="small">{it.use || '剧情/解锁用道具。'}</p>
              <button disabled={!n} onClick={() => dispatch({ type: 'USE_ITEM', id: it.id })}>使用</button>{' '}
              <button disabled={!n} onClick={() => dispatch({ type: 'EQUIP', id: it.id })}>{s.equipped.includes(it.id) ? '卸下' : '装备'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SkillView() {
  const { state: s, dispatch } = useGame();
  return (
    <div>
      <h2>技能树（4 条路线 × 8 节点）</h2>
      <p className="small">技能点：{s.player.skillPoints} · 已解锁 {s.skills.length}/32。节点必须按顺序解锁；部分技能会真实影响地点进入、小游戏次数和对话选项。</p>
      {SKILL_TRACKS.map(t => (
        <div key={t}><h3>{t}</h3><div className="grid">
          {SKILLS.filter(x => x.track === t).map(node => {
            const unlocked = s.skills.includes(node.id);
            const preOk = !node.require || s.skills.includes(node.require);
            return (
              <div key={node.id} className={`card ${unlocked ? 'on' : ''}`}>
                <b>{node.name}</b> {unlocked ? '✅' : ''}<p>{node.desc}</p>
                <p className="small">{node.require ? `前置：${SKILLS.find(x => x.id === node.require)?.name}` : '起点节点'} · 消耗 1 技能点</p>
                <button disabled={unlocked || !preOk || s.player.skillPoints <= 0} onClick={() => dispatch({ type: 'SKILL', id: node.id })}>{unlocked ? '已解锁' : !preOk ? '需要前置' : '解锁'}</button>
              </div>
            );
          })}
        </div></div>
      ))}
    </div>
  );
}

export function CharacterView() {
  const { state: s } = useGame(); const p = s.player;
  return (
    <div>
      <h2>角色档案</h2>
      <div className="card"><b>{p.name}</b> · {p.background}<p>等级 {p.level} · 经验 {p.xp}/{p.xpNext} · 技能点 {p.skillPoints}</p>
        <Bar label="生命" value={p.hp} color="#f87171" /><Bar label="体力" value={p.stamina} color="#38bdf8" /><Bar label="精神" value={p.sanity} color="#a78bfa" />
        <p>智力 {p.int} · 观察力 {p.obs} · 交涉 {p.neg} · 技术 {p.tech} · 货币 {p.money} · 行动 {p.actions}/{p.actionsMax}</p>
        <p className="small">第 {s.day} 天 {s.hour}:00 · {s.weather} · 当前位置：{LOCATIONS.find(l => l.id === s.locationId)?.name}</p>
        <p className="small">重要选择记录：{s.choices.join('、') || '暂无'}</p>
      </div>
      <h3>人物档案（已见过的 NPC）</h3>
      {NPCS.filter(n => s.npcTrust[n.id] !== undefined || n.location === s.locationId).map(n => (
        <div key={n.id} className="card"><b>{n.name}</b> · {n.role} · 信任 {s.npcTrust[n.id] || 0}<p>{n.background}</p><p className="small">{n.relations}</p></div>
      ))}
    </div>
  );
}

export function FactionView() {
  const { state: s } = useGame();
  return (
    <div>
      <h2>派系关系</h2>
      <p className="small">帮一个派系可能损害另一个派系的信任；声望达到关键阈值会影响对话、地点与结局。当前声望为 -100 到 100。</p>
      {FACTIONS.map(f => (
        <div key={f.id} className="card">
          <b style={{ color: f.color }}>{f.name}</b> · 声望 {s.factionRep[f.id] || 0}
          <p>{f.desc}</p><p className="small">目标：{f.goal}</p>
          <p className="small">成员：{NPCS.filter(n => n.faction === f.id).map(n => n.name).join('、')}</p>
          <Bar label="声望" value={(s.factionRep[f.id] || 0) + 100 > 200 ? 100 : Math.max(0, ((s.factionRep[f.id] || 0) + 100) / 2)} color={f.color} />
        </div>
      ))}
    </div>
  );
}

export function CityView() {
  const { state: s, dispatch } = useGame(); const c = s.city;
  const advice = c.energy < 40 ? '能源偏低：完成电网相关任务或避免破坏设施。' : c.safety < 40 ? '安全偏低：多帮居民、少用激进手段。' : c.aiControl > 90 ? 'AI 控制极高：结局更倾向 AI 接管，试着和抵抗组织或独立 AI 谈谈。' : '城市状态尚可，继续按主线推进。';
  return (
    <div>
      <h2>城市模拟面板</h2>
      <p className="small">没有后台计时器：所有变化都由你的行动、任务奖励和对话选择驱动。休息与推进时间不会自动涨数值，只恢复你的行动次数。</p>
      <Bar label="能源供应" value={c.energy} color="#facc15" /><Bar label="城市安全" value={c.safety} color="#34d399" /><Bar label="居民信任" value={c.trust} color="#38bdf8" /><Bar label="AI 控制程度" value={c.aiControl} color="#a78bfa" /><Bar label="抵抗组织影响力" value={c.resistance} color="#f472b6" /><Bar label="数据污染程度" value={c.pollution} color="#f87171" />
      <p>{advice}</p>
      <div className="actions">
        <button onClick={() => dispatch({ type: 'REST' })}>🛏️ 休息（恢复行动，次日 8 点）</button>
        <button onClick={() => dispatch({ type: 'TICK' })}>⏱️ 推进 1 时间单位</button>
        <button onClick={() => dispatch({ type: 'VIEW', view: 'map' })}>🗺️ 去城市里行动</button>
      </div>
    </div>
  );
}

export function AchievementView() {
  const { state: s } = useGame();
  return (
    <div>
      <h2>成就中心（{s.achievements.length}/{ACHIEVEMENTS.length}）</h2>
      <div className="grid">{ACHIEVEMENTS.map(a => <div key={a.id} className={`card ${s.achievements.includes(a.id) ? 'on' : 'dim'}`}><b>{s.achievements.includes(a.id) ? '🏆' : '○'} {a.title}</b><p>{a.desc}</p></div>)}</div>
    </div>
  );
}

export function ChapterView() {
  const { state: s } = useGame();
  return (
    <div>
      <h2>章节档案</h2>
      {CHAPTERS.map(ch => (
        <div key={ch.id} className={`card ${s.chapter === ch.id ? 'on' : ch.id < s.chapter ? '' : 'dim'}`}>
          <b>{ch.title}</b> · {ch.id < s.chapter ? '已完成' : ch.id === s.chapter ? '进行中' : '未解锁'}
          <p>{ch.desc}</p><p className="small">场景：{ch.scenes.join('、')}</p><p className="small">解锁条件：{ch.unlock}</p>
        </div>
      ))}
    </div>
  );
}

export function EndingView() {
  const { state: s, dispatch } = useGame();
  const { ending, scores } = computeEnding(s);
  const canFinish = s.quests['q14'] === 'done';
  return (
    <div>
      <h2>结局回顾与结算</h2>
      <p className="small">结局不是只看最后一次选择：它由重要选择、证据完整度、派系声望和城市状态共同算分，分数最高的结局胜出。隐藏结局需要 15 条以上证据 + 沈默的纸条 + 空白身份芯片。</p>
      <p>当前按你的状态算分最高的结局是：<b>{ending.title}</b></p>
      {scores.map(sc => <div key={sc.id} className="card"><b>{sc.title}</b> · 得分 {sc.score}{s.endingsSeen.includes(sc.id) ? ' · 已达成' : ''}<p>{ENDINGS.find(e => e.id === sc.id)?.desc}</p></div>)}
      {!canFinish && <p className="small">要正式结算结局，请先完成最终推理任务（q14）。你也可以先在这里预览算分，但结算按钮在任务完成前不可用——避免“点一下就出结局”。</p>}
      <button className="primary" disabled={!canFinish} onClick={() => dispatch({ type: 'ENDING' })}>{canFinish ? '结算结局' : '结算结局（需先完成最终推理）'}</button>
      {s.ending && <div className="card on"><h3>已达成结局：{ENDINGS.find(e => e.id === s.ending)?.title}</h3><p>{ENDINGS.find(e => e.id === s.ending)?.desc}</p><p className="small">本局已达成结局：{s.endingsSeen.map(id => ENDINGS.find(e => e.id === id)?.title).join('、')}</p><p className="small">新周目提示：开新游戏会重置当前这一局的结局图鉴（自动存档也会被覆盖），请先在存档管理页把本局存到 1-3 号槽；以后读取那个槽，就能恢复本局的结局记录。</p></div>}
    </div>
  );
}

export function SaveView() {
  const { dispatch, save } = useGame();
  const [msg, setMsg] = React.useState('');
  const slots = [1, 2, 3].map(n => ({ n, data: loadSlot(n) }));
  return (
    <div>
      <h2>存档管理</h2>
      <p className="small">自动存档：每次行动后自动写入浏览器本地，刷新后点“继续游戏”即可恢复。手动槽：1-3 号槽互不覆盖。</p>
      {msg && <p>{msg}</p>}
      <div className="actions">
        <button className="primary" onClick={() => { save(); setMsg('已保存到自动存档槽。'); }}>保存到自动存档</button>
        <button onClick={() => { localStorage.removeItem('protocol-zero-save-v1'); [1, 2, 3].forEach(n => localStorage.removeItem(SLOT_KEY(n))); setMsg('所有本地存档已清除（本局仍在内存中，刷新后将回到主菜单）。'); }}>重置全部存档</button>
      </div>
      {slots.map(sl => (
        <div key={sl.n} className="card">
          <b>存档槽 {sl.n}</b>
          {sl.data ? <p className="small">{sl.data.player.name} · 第 {sl.data.day} 天 · {CHAPTERS[sl.data.chapter]?.title} · 等级 {sl.data.player.level}</p> : <p className="small">空槽</p>}
          <button onClick={() => { save(sl.n); setMsg(`已保存到存档槽 ${sl.n}。`); }}>保存当前进度到此槽</button>{' '}
          <button disabled={!sl.data} onClick={() => { const d = loadSlot(sl.n); if (d) { dispatch({ type: 'LOAD', state: d }); setMsg(`已读取存档槽 ${sl.n}。`); } }}>读取此槽</button>{' '}
          <button disabled={!sl.data} onClick={() => { localStorage.removeItem(SLOT_KEY(sl.n)); setMsg(`已删除存档槽 ${sl.n}。`); }}>删除此槽</button>
        </div>
      ))}
    </div>
  );
}

export function SettingsView() {
  const { state: s, dispatch } = useGame();
  return (
    <div>
      <h2>游戏设置</h2>
      <label className="row"><input type="checkbox" checked={s.settings.animations} onChange={e => dispatch({ type: 'SETTINGS', settings: { animations: e.target.checked } })} /> 开启动画效果（关闭后页面更简洁、更省电）</label>
      <label className="row"><input type="checkbox" checked={s.settings.largeText} onChange={e => dispatch({ type: 'SETTINGS', settings: { largeText: e.target.checked } })} /> 大字模式（手机端更易读）</label>
      <p className="small">当前设置会随存档一起保存。本游戏无登录、无远程 API、无后台计时器；所有进度只在你的浏览器本地。</p>
      <button onClick={() => dispatch({ type: 'MESSAGE', message: '设置已保存（随下一次自动存档写入）。' })}>确认设置</button>
    </div>
  );
}
