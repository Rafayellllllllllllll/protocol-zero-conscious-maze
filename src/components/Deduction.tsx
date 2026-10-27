import { useState } from 'react';
import { useGame } from '../game/store';
import { EVIDENCE, REQUIRED_LINKS, HYPOTHESES } from '../game/data';
import { requiredLinksDone, evidenceById } from '../game/engine';

export default function DeductionView() {
  const { state: s, dispatch } = useGame();
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [reason, setReason] = useState('');
  const [hyp, setHyp] = useState('');
  const owned = EVIDENCE.filter(e => s.evidence.includes(e.id));
  const requiredDone = requiredLinksDone(s);
  const submit = () => {
    const h = HYPOTHESES.find(x => x.id === hyp);
    if (!h) { dispatch({ type: 'MESSAGE', message: '请先选择一个假设。' }); return; }
    if (!requiredDone) { dispatch({ type: 'DEDUCT_FAIL', feedback: '关键关联未齐全：还差死亡证明↔十七份副本、记忆索引↔启动日志、沈默纸条↔意识样本报告中的某一条。先回去调查，不要只靠猜。' }); return; }
    if (s.evidence.length < 5) { dispatch({ type: 'DEDUCT_FAIL', feedback: '证据不足（少于 5 条），结论站不住脚。先多探索几个地点。' }); return; }
    if (h.correct) dispatch({ type: 'DEDUCT_OK' }); else dispatch({ type: 'DEDUCT_FAIL', feedback: h.feedback });
  };
  return (
    <div>
      <h2>侦探工作台</h2>
      <p className="small">已收集证据 {owned.length} 条。选两条证据、写清关联理由、点“建立关联”。三条关键关联全部成立 + 至少 5 条证据，才能提交假设；选错会给出具体反驳，而不是直接判对。</p>
      <h3>证据列表</h3>
      {owned.length === 0 && <p className="small">还没有证据。去地点探索，或和 NPC 对话获得线索。</p>}
      <div className="grid">{owned.map(e => <div key={e.id} className="card"><b>{e.name}</b> · {e.kind}<p>{e.desc}</p><p className="small">{e.detail} · 来源：{e.location}{e.misleading ? ' · ⚠️ 可能是误导线索' : ''}</p></div>)}</div>
      <h3>证据关联画布</h3>
      <div className="row">
        <select value={a} onChange={e => setA(e.target.value)}><option value="">证据 A</option>{owned.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        <select value={b} onChange={e => setB(e.target.value)}><option value="">证据 B</option>{owned.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        <input placeholder="关联理由（例如：签发流程完全一致）" value={reason} onChange={e => setReason(e.target.value)} />
        <button disabled={!a || !b || a === b || !reason.trim()} onClick={() => dispatch({ type: 'LINK', a, b, reason })}>建立关联</button>
      </div>
      <p className="small">已建立关联 {s.links.length} 条 · 关键关联完成：{REQUIRED_LINKS.map(([x, y]) => `${evidenceById(x)?.name}↔${evidenceById(y)?.name}：${s.links.some(l => (l.a === x && l.b === y) || (l.a === y && l.b === x)) ? '✅' : '○'}`).join('；')}</p>
      {s.links.map((l, i) => <div key={i} className="card small">{evidenceById(l.a)?.name} ↔ {evidenceById(l.b)?.name}：{l.reason}</div>)}
      <h3>案件时间线</h3>
      <div className="card small">
        <p>23:03 —— 你的死亡证明签发，签发人空白。</p>
        <p>同一周 —— 十七份死因相同的死亡证明副本出现。</p>
        <p>之后 —— 实验室编号被涂改，研究中心报告的结论页被撕掉。</p>
        <p>现在 —— 你站在广场上，系统说你不存在。</p>
        <p>⚠️ 注意：废弃学校黑板上的“23:24 减 7 分钟”是一条容易误算的线索——先核对原始记录，不要直接把它当成结论。</p>
      </div>
      <h3>可证伪的假设（选一个提交）</h3>
      {HYPOTHESES.map(h => (
        <label key={h.id} className="row card"><input type="radio" name="hyp" checked={hyp === h.id} onChange={() => setHyp(h.id)} /><span>{h.text}</span></label>
      ))}
      <button className="primary" onClick={submit}>提交推理结论</button>
      {s.deductionResult && <p>{s.deductionResult}</p>}
      {s.deductionDone && <p>✅ 最终推理已成立，任务日志里的“最终推理”可以完成了。去结局回顾页查看算分。</p>}
    </div>
  );
}
