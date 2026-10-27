import { useState } from 'react';
import { useGame, loadSave } from '../game/store';
import { BACKGROUNDS } from '../game/data';

export default function MainMenu({ onStart }: { onStart: () => void }) {
  const { dispatch } = useGame();
  const [name, setName] = useState('无名者');
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [mode, setMode] = useState<'menu' | 'new'>('menu');
  const hasSave = !!loadSave();
  return (
    <div className="menu">
      <div className="particles" aria-hidden>✦　·　✦　·　✦　·　✦　·　✦</div>
      <h1>零号协议<span>意识迷城</span></h1>
      <p className="tagline">新伊甸说你已经死了。但你还站在这里。</p>
      <p className="intro">纯前端单机 RPG：7 章主线、20 个地点、9 名 NPC、4 大派系、30 个任务、6 种黑客小游戏、25 项成就、6 种结局。进度只存在你的浏览器本地，刷新后可继续。</p>
      {mode === 'menu' && (
        <div className="menuBtns">
          {hasSave && <button className="primary" onClick={() => { const s = loadSave(); if (s) { dispatch({ type: 'LOAD', state: s }); onStart(); } }}>继续游戏</button>}
          <button className="primary" onClick={() => setMode('new')}>新游戏</button>
          <button onClick={() => { alert('玩法提示：先去广场探索拿死亡证明，再按任务日志一步步走。行动次数用完就休息。推理要先在工作台连出 3 条关键关联，再提交假设。'); }}>玩法说明</button>
        </div>
      )}
      {mode === 'new' && (
        <div className="create card">
          <label>你的名字<input value={name} onChange={e => setName(e.target.value || '无名者')} /></label>
          <div className="bggrid">
            {BACKGROUNDS.map(b => (
              <button key={b.id} className={bg.id === b.id ? 'active' : ''} onClick={() => setBg(b)}>
                <b>{b.id}</b><span>{b.desc}</span>
              </button>
            ))}
          </div>
          <div className="menuBtns">
            <button className="primary" onClick={() => { dispatch({ type: 'NEW', name, bg: bg.id, attrs: { int: bg.int, obs: bg.obs, neg: bg.neg, tech: bg.tech }, item: bg.item }); onStart(); }}>开始醒来</button>
            <button onClick={() => setMode('menu')}>返回</button>
          </div>
        </div>
      )}
      <p className="small">建议游玩路线：广场 → 地下交通站 → 地下黑市 → 记忆档案馆 → 旧服务器机房 → AI 管理塔 → 失联者公寓 → 零号核心设施 → 侦探工作台提交最终推理 → 结局回顾。</p>
    </div>
  );
}
