import { useGame, checkLock } from '../game/store';
import { LOCATIONS, NPCS, REGIONS, EVIDENCE } from '../game/data';

export function MapView() {
  const { state: s, dispatch } = useGame();
  return (
    <div>
      <h2>城市地图 · 新伊甸</h2>
      <p className="small">点击地点移动（消耗 1 行动、推进 1 小时）。上锁地点会显示解锁条件；已到访地点显示 ✓，已探索显示探索进度。</p>
      <div className="map">
        {LOCATIONS.map(l => {
          const lock = checkLock(s, l.lock);
          const visited = s.visited[l.id] || 0;
          return (
            <button key={l.id} className={`mapnode ${s.locationId === l.id ? 'here' : ''} ${!lock.ok ? 'locked' : ''}`} style={{ left: `${l.x}%`, top: `${l.y}%` }} onClick={() => dispatch({ type: 'MOVE', locationId: l.id })} title={`${l.name} · ${l.region}`}>
              <span className="dot">{!lock.ok ? '🔒' : visited ? '✓' : '●'}</span><span className="mname">{l.name}</span>
            </button>
          );
        })}
      </div>
      <div className="loclist">
        {REGIONS.map(r => (
          <div key={r} className="region">
            <h3>{r}（{LOCATIONS.filter(l => l.region === r && s.visited[l.id]).length}/{LOCATIONS.filter(l => l.region === r).length} 已到访）</h3>
            {LOCATIONS.filter(l => l.region === r).map(l => {
              const lock = checkLock(s, l.lock);
              return (
                <div key={l.id} className="locrow">
                  <div><b>{l.name}</b> {s.visited[l.id] ? `· 到访 ${s.visited[l.id]} 次` : ''} {s.explored.includes(l.id) ? '· 已探索' : ''} {!lock.ok ? `· 🔒 ${lock.label}` : ''}<p>{l.desc}</p></div>
                  <button onClick={() => dispatch({ type: 'MOVE', locationId: l.id })} disabled={!lock.ok}>{s.locationId === l.id ? '当前位置' : '前往'}</button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExploreView() {
  const { state: s, dispatch } = useGame();
  const loc = LOCATIONS.find(l => l.id === s.locationId)!;
  const npcs = NPCS.filter(n => n.location === loc.id);
  const clues = loc.clues.map(id => EVIDENCE.find(e => e.id === id)!).filter(Boolean);
  return (
    <div>
      <h2>{loc.name} <span className="small">· {loc.region}</span></h2>
      <p>{loc.desc}</p>
      <p className="small">到访 {s.visited[loc.id] || 0} 次 · {s.explored.includes(loc.id) ? '已探索' : '未探索'} · 本地线索：{clues.map(c => c.name).join('、') || '无'}</p>
      <div className="actions">
        <button className="primary" onClick={() => dispatch({ type: 'EXPLORE' })}>🔍 探索这里（消耗 1 行动）</button>
        {loc.game && <button onClick={() => dispatch({ type: 'GAME_SELECT', id: loc.game as string })}>🎮 玩这里的小游戏</button>}
        <button onClick={() => dispatch({ type: 'VIEW', view: 'map' })}>🗺️ 回地图</button>
      </div>
      <h3>这里的人</h3>
      {npcs.length === 0 && <p className="small">这里没有常驻 NPC，去别处找找。</p>}
      {npcs.map(n => (
        <div key={n.id} className="npcrow">
          <div className="avatar" style={{ background: n.color }}>{n.avatar}</div>
          <div><b>{n.name}</b> · {n.role}<p>{n.intro}</p><p className="small">信任度：{s.npcTrust[n.id] || 0}</p></div>
          <button onClick={() => dispatch({ type: 'DIALOGUE', id: n.id })}>对话</button>
        </div>
      ))}
      <h3>已发现的线索（本地点）</h3>
      {clues.filter(c => s.evidence.includes(c.id)).map(c => <div key={c.id} className="card"><b>{c.name}</b> · {c.kind}<p>{c.desc}</p><p className="small">{c.detail} {c.misleading ? '⚠️ 这条线索可能是误导，先核对时间线。' : ''}</p></div>)}
      {clues.filter(c => s.evidence.includes(c.id)).length === 0 && <p className="small">还没有在这里发现线索——点“探索这里”试试。</p>}
    </div>
  );
}

export function DialogueView() {
  const { state: s, dispatch } = useGame();
  if (!s.dialogueNpc) {
    return (<div><h2>NPC 对话</h2><p className="small">先选一个人对话，或去地点探索页找常驻 NPC。</p>{NPCS.map(n => (<div key={n.id} className="npcrow"><div className="avatar" style={{ background: n.color }}>{n.avatar}</div><div><b>{n.name}</b> · {n.role}<p className="small">常驻：{n.location}</p></div><button onClick={() => dispatch({ type: 'DIALOGUE', id: n.id })}>对话</button></div>))}</div>);
  }
  const npc = NPCS.find(n => n.id === s.dialogueNpc) || NPCS[0];
  return (
    <div>
      <div className="npcrow big">
        <div className="avatar" style={{ background: npc.color }}>{npc.avatar}</div>
        <div><h2>{npc.name}</h2><p>{npc.role} · 信任度 {s.npcTrust[npc.id] || 0}</p><p>{npc.background}</p><p className="small">个性：{npc.personality}</p><p className="small">目标：{npc.goal}</p><p className="small">与其他人的关系：{npc.relations}</p></div>
      </div>
      <p className="quote">{npc.intro}</p>
      <h3>选择你的回应（每条对话的效果只结算一次，重复对话只会重读回答）</h3>
      {npc.options.map(o => {
        const chk = o.require ? checkLock(s, o.require) : { ok: true, label: '' };
        const done = s.choices.includes(o.id);
        return (
          <div key={o.id} className="card">
            <p>{o.text} {done ? '（已谈过）' : ''} {!chk.ok ? `· 🔒 ${chk.label}` : ''}</p>
            <button disabled={!chk.ok} onClick={() => dispatch({ type: 'TALK', npcId: npc.id, optionId: o.id })}>{done ? '重读回答' : '说这句话'}</button>
          </div>
        );
      })}
      {s.flags.includes('shenmo_truth') && npc.id === 'shenmo' && <p className="small">隐藏信息已解锁：沈默的秘密——{npc.secret}</p>}
      {(s.npcTrust[npc.id] || 0) >= 20 && <p className="small">隐藏信息（信任 ≥20 解锁）：{npc.secret}</p>}
      <button onClick={() => dispatch({ type: 'VIEW', view: 'explore' })}>结束对话，回地点</button>
    </div>
  );
}
