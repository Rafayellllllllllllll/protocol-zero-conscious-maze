import React, { useState } from 'react';
import { useGame } from '../game/store';

function WinButton({ id }: { id: string }) {
  const { dispatch } = useGame();
  return <button className="primary" onClick={() => dispatch({ type: 'GAME_WIN', id })}>确认胜利并领取奖励</button>;
}
function Circuit() {
  const [rots, setRots] = useState([90, 0, 180, 90]);
  const targets = [0, 90, 180, 270];
  const arrows = ['→', '↓', '←', '↑'];
  const win = rots.every((r, i) => r === targets[i]);
  return <div className="card"><h3>电路连接</h3><p className="small">操作：点节点旋转 90°。目标信号路径方向依次是：→ ↓ ← ↑（即节点 1 朝右、节点 2 朝下、节点 3 朝左、节点 4 朝上）。全部对齐即接通。</p>
    <div className="row">{rots.map((r, i) => <button key={i} className="tile" onClick={() => setRots(rots.map((x, j) => j === i ? (x + 90) % 360 : x))}>{arrows[r / 90]}<span>节点 {i + 1}</span></button>)}</div>
    <p>{win ? '✅ 电路已接通！' : '电路未接通，继续旋转节点。'}</p>{win && <WinButton id="circuit" />}</div>;
}
function Password() {
  const { state: s } = useGame();
  const [guess, setGuess] = useState(''); const [tries, setTries] = useState<string[]>([]);
  const max = 8 + (s.skills.includes('hack2') ? 1 : 0);
  const secret = '2413';
  const check = () => {
    if (!/^\d{4}$/.test(guess)) return;
    let bulls = 0, cows = 0;
    guess.split('').forEach((d, i) => { if (d === secret[i]) bulls++; else if (secret.includes(d)) cows++; });
    setTries([...tries, `${guess} → ${bulls} 个位置正确，${cows} 个数字正确但位置不对`]);
    setGuess('');
  };
  const won = tries.some(t => t.startsWith('2413'));
  return <div className="card"><h3>密码推理</h3><p className="small">操作：输入 4 位数字猜测。反馈规则：位置和数字都对计 1 个“位置正确”；数字对但位置不对计 1 个“数字正确”。可用尝试 {max} 次（黑客技能“绕过检测”+1 次）。难度只影响尝试次数，不会生成无解题目；答案固定且可通过反馈逐步排除。</p>
    <input value={guess} maxLength={4} onChange={e => setGuess(e.target.value.replace(/\D/g, ''))} placeholder="4 位数字" />
    <button disabled={won || tries.length >= max} onClick={check}>提交猜测（剩余 {max - tries.length} 次）</button>
    {tries.map((t, i) => <p key={i} className="small">{t}</p>)}
    {won && <><p>✅ 密码正确：2413，终端已打开。</p><WinButton id="password" /></>}
    {!won && tries.length >= max && <p>❌ 尝试次数用完。点“重置”重来，反馈会保留在上一轮里供你复盘——先点重置再重新推理。</p>}
    <button onClick={() => setTries([])}>重置</button></div>;
}
function Terminal() {
  const { state: s } = useGame();
  const [pos, setPos] = useState<[number, number]>([0, 0]); const [moves, setMoves] = useState(0); const [dead, setDead] = useState(false);
  const max = 12 + (s.skills.includes('hack1') ? 1 : 0);
  const security = new Set(['1,2', '2,2', '3,1']);
  const win = pos[0] === 4 && pos[1] === 4;
  const move = (dx: number, dy: number) => {
    if (win || dead || moves >= max) return;
    const np: [number, number] = [pos[0] + dx, pos[1] + dy];
    if (np[0] < 0 || np[0] > 4 || np[1] < 0 || np[1] > 4) return;
    setPos(np); setMoves(moves + 1);
    if (security.has(`${np[0]},${np[1]}`)) setDead(true);
  };
  return <div className="card"><h3>终端入侵</h3><p className="small">操作：用方向键从左上角起点走到右下角目标。红色格是安全节点，踩中即被发现；行动上限 {max} 次（黑客技能“终端基础”+1 次）。路径是事先验证可达的：先向右、再向下绕开红色格即可。</p>
    <div className="grid5">{Array.from({ length: 25 }, (_, i) => { const x = i % 5, y = Math.floor(i / 5); const isPos = pos[0] === x && pos[1] === y; const isSec = security.has(`${x},${y}`); return <div key={i} className={`cell ${isPos ? 'me' : ''} ${isSec ? 'sec' : ''}`}>{isPos ? '你' : x === 0 && y === 0 ? '起点' : x === 4 && y === 4 ? '目标' : isSec ? '⚠️' : ''}</div>; })}</div>
    <div className="row"><button onClick={() => move(0, -1)}>↑</button><button onClick={() => move(0, 1)}>↓</button><button onClick={() => move(-1, 0)}>←</button><button onClick={() => move(1, 0)}>→</button><button onClick={() => { setPos([0, 0]); setMoves(0); setDead(false); }}>重置</button></div>
    <p className="small">已用行动 {moves}/{max} · 位置 ({pos[0]},{pos[1]})</p>
    {dead && <p>❌ 踩中安全节点，被系统发现了。点重置重来。</p>}
    {win && <><p>✅ 已抵达目标节点，入侵成功。</p><WinButton id="terminal" /></>}
    {!win && !dead && moves >= max && <p>❌ 行动次数用完。点重置重来。</p>}</div>;
}
function MemoryGame() {
  const frags = [{ id: 'rec', text: '录音 23:03' }, { id: 'log', text: '启动日志残片' }, { id: 'key', text: '黄铜钥匙' }, { id: 'note', text: '沈默的纸条' }, { id: 'name', text: '名字：沈默' }];
  const [seq, setSeq] = useState<string[]>([]); const [msg, setMsg] = useState('');
  const correct = ['rec', 'log', 'key', 'note', 'name'];
  const check = () => { if (seq.join(',') === correct.join(',')) setMsg('win'); else setMsg('顺序不对。提示：先是时间（录音），再是机器的记录（启动日志），然后是实物（钥匙），最后是人的话（纸条）与名字。'); };
  return <div className="card"><h3>记忆重建</h3><p className="small">操作：按顺序点碎片，排成一条可信的时间链；点错可点“清空”重排。线索：录音先于日志，钥匙在纸条之前，名字是最后一环。</p>
    <div className="row">{frags.map(f => <button key={f.id} disabled={seq.includes(f.id)} onClick={() => setSeq([...seq, f.id])}>{f.text}</button>)}</div>
    <p className="small">当前顺序：{seq.map(id => frags.find(f => f.id === id)?.text).join(' → ') || '（未选）'}</p>
    <button onClick={check}>检查顺序</button><button onClick={() => { setSeq([]); setMsg(''); }}>清空</button>
    {msg === 'win' ? <><p>✅ 记忆链完整：录音 → 启动日志 → 钥匙 → 纸条 → 名字。</p><WinButton id="memory" /></> : msg ? <p>❌ {msg}</p> : null}</div>;
}
function Decrypt() {
  const [shift, setShift] = useState(0);
  const cipher = 'SURWRFRO-0';
  const decode = cipher.split('').map(ch => { if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(((ch.charCodeAt(0) - 65 - shift + 26) % 26) + 65); return ch; }).join('');
  const win = shift === 3;
  return <div className="card"><h3>数据解密</h3><p className="small">操作：选择位移，还原密文。线索：加密时每个字母都向后移了 3 位，所以解密要向前移 3 位。密文：{cipher}</p>
    <div className="row"><input type="range" min={0} max={25} value={shift} onChange={e => setShift(Number(e.target.value))} /><b>位移 {shift}</b></div>
    <p>解密结果：<b>{decode}</b></p>
    {win ? <><p>✅ 解密成功：PROTOCOL-0。</p><WinButton id="decrypt" /></> : <p>还不是可读的明文，继续调位移。</p>}</div>;
}
function Resource() {
  const [counts, setCounts] = useState([0, 0, 0]);
  const tasks = [{ name: '破解终端', e: 30, t: 3, a: 2, p: 40 }, { name: '恢复电网', e: 40, t: 4, a: 3, p: 50 }, { name: '伪装身份', e: 20, t: 2, a: 2, p: 30 }];
  const totals = tasks.reduce((acc, tk, i) => ({ e: acc.e + tk.e * counts[i], t: acc.t + tk.t * counts[i], a: acc.a + tk.a * counts[i], p: acc.p + tk.p * counts[i] }), { e: 0, t: 0, a: 0, p: 0 });
  const win = totals.p >= 100 && totals.e <= 100 && totals.t <= 10 && totals.a <= 8;
  const [msg, setMsg] = useState('');
  return <div className="card"><h3>资源规划</h3><p className="small">限制：能源 ≤100、时间 ≤10、行动 ≤8；目标：总进度 ≥100。提示：三项任务各做 1 次正好是能源 90、时间 9、行动 7、进度 120——这就是一组可行解，你也可以自己试别的组合。</p>
    {tasks.map((tk, i) => <div key={tk.name} className="row"><span>{tk.name}（能源 {tk.e} / 时间 {tk.t} / 行动 {tk.a} / 进度 {tk.p}）</span><button onClick={() => setCounts(counts.map((c, j) => j === i ? Math.max(0, c - 1) : c))}>-</button><b>{counts[i]}</b><button onClick={() => setCounts(counts.map((c, j) => j === i ? Math.min(2, c + 1) : c))}>+</button></div>)}
    <p className="small">合计：能源 {totals.e}/100 · 时间 {totals.t}/10 · 行动 {totals.a}/8 · 进度 {totals.p}/100</p>
    <button onClick={() => setMsg(win ? 'win' : totals.p < 100 ? '进度不足 100，先加任务。' : '有资源超限了：能源、时间或行动有一项超过上限。')}>检查方案</button>
    {msg === 'win' ? <><p>✅ 方案可行，任务全部完成。</p><WinButton id="resource" /></> : msg ? <p>❌ {msg}</p> : null}</div>;
}

const GAMES = [
  { id: 'circuit', name: '电路连接', desc: '旋转节点，接通信号。', comp: Circuit, where: '废弃实验室' },
  { id: 'password', name: '密码推理', desc: '按反馈推断 4 位密码。', comp: Password, where: '情报交易所' },
  { id: 'terminal', name: '终端入侵', desc: '有限行动内抵达目标，避开安全节点。', comp: Terminal, where: '机械维修铺' },
  { id: 'memory', name: '记忆重建', desc: '把碎片排成正确的时间链。', comp: MemoryGame, where: 'AI 研究中心' },
  { id: 'decrypt', name: '数据解密', desc: '按替换规则还原密文。', comp: Decrypt, where: '旧服务器机房' },
  { id: 'resource', name: '资源规划', desc: '在能源/时间/行动限制下完成任务。', comp: Resource, where: '城市电网控制室' },
];

export default function GamesView() {
  const { state: s, dispatch } = useGame();
  const current = GAMES.find(g => g.id === s.selectedGame);
  return (
    <div>
      <h2>黑客小游戏（6 种，全部可验证规则）</h2>
      <p className="small">每种游戏都有操作说明、胜负判断与错误反馈；胜利奖励只结算一次，但可以重玩。已赢 {s.gamesWon.length}/6。</p>
      {!current && <div className="grid">{GAMES.map(g => <div key={g.id} className="card"><b>{g.name}</b> {s.gamesWon.includes(g.id) ? '✅ 已赢' : ''}<p>{g.desc}</p><p className="small">关联地点：{g.where}</p><button onClick={() => dispatch({ type: 'GAME_SELECT', id: g.id })}>开始玩</button></div>)}</div>}
      {current && <div><button onClick={() => dispatch({ type: 'GAME_SELECT', id: null })}>← 回游戏列表</button><div key={current.id} style={{ marginTop: 12 }}>{React.createElement(current.comp)}</div></div>}
    </div>
  );
}
