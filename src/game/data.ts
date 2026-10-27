import type { Location, NPC, Faction, Item, SkillNode, Evidence, Quest, Chapter } from './types';

export const REGIONS = ['中央区', '旧城区', '地下城', '工业边缘', '核心禁区'] as const;

export const LOCATIONS: Location[] = [
  { id: 'plaza', name: '新伊甸广场', region: '中央区', desc: '全息广告与人群川流不息的城市心脏。你“死亡”的那天，这里正在播报你的讣告。', x: 48, y: 28, npcs: ['zhao'], clues: ['ev_death'], items: [], hint: '先在这里确认自己的死亡证明。' },
  { id: 'central', name: '中央城区', region: '中央区', desc: '管理局的办公楼群，身份核验无处不在。没有身份的人在这里寸步难行。', x: 38, y: 18, npcs: [], clues: ['ev_id'], items: ['fake_id'], hint: '探索可获得一张做工粗糙的伪造证件。' },
  { id: 'tower', name: 'AI 管理塔', region: '中央区', desc: '伊芙的核心终端所在地，整座城市的眼睛。', x: 62, y: 16, npcs: ['eve'], clues: ['ev_eve_log'], items: [], lock: { kind: 'item', id: 'permit', label: '需要临时权限卡' }, hint: '找老刀谈一笔交易，或完成档案馆任务后获得权限卡。' },
  { id: 'market', name: '数据交易市场', region: '中央区', desc: '合法的数据摊位与灰色交易混杂，信息明码标价。', x: 70, y: 32, npcs: ['luyao'], clues: ['ev_trade'], items: ['datadisk'], hint: '陆遥在这里，她卖的情报往往半真半假。' },
  { id: 'blackmarket', name: '地下黑市', region: '地下城', desc: '没有灯牌，只有暗号。权限卡、破解器和假身份都在这里流通。', x: 28, y: 62, npcs: ['laodao'], clues: ['ev_black'], items: ['permit'], hint: '和老刀完成交易可拿到临时权限卡。' },
  { id: 'lab', name: '废弃实验室', region: '旧城区', desc: '伊芙早期意识实验的旧址，墙上还留着被涂掉的实验编号。', x: 18, y: 38, npcs: [], clues: ['ev_lab'], items: ['memory_shard'], game: 'circuit', hint: '电路小游戏：把所有节点转到接通方向。' },
  { id: 'archive', name: '记忆档案馆', region: '中央区', desc: '市民记忆的官方仓库。苏晴守着这里，也守着一些不该存在的记录。', x: 55, y: 42, npcs: ['suqing'], clues: ['ev_memory'], items: [], lock: { kind: 'flag', id: 'suqing_archive', label: '需要苏晴的许可' }, hint: '先和苏晴对话，取得她的信任。' },
  { id: 'station', name: '地下交通站', region: '地下城', desc: '停运线路的站台，是抵抗组织传信的暗道。', x: 42, y: 68, npcs: ['chenmo'], clues: ['ev_station'], items: [], hint: '陈默常在这里出现。' },
  { id: 'hospital', name: '旧城区医院', region: '旧城区', desc: '系统外的诊所，白医生给没有身份的人看病，也记得一些被删除的病历。', x: 22, y: 52, npcs: ['bai'], clues: ['ev_medical'], items: ['medkit'], hint: '白医生可以恢复生命与精神稳定度。' },
  { id: 'repair', name: '机械维修铺', region: '旧城区', desc: '阿哲的铺子，修义体也修终端，偶尔修一些不该修的东西。', x: 32, y: 48, npcs: ['azhe'], clues: ['ev_repair'], items: ['hacker'], game: 'terminal', hint: '终端入侵：在行动次数内走到目标节点，避开红色安全节点。' },
  { id: 'slum', name: '贫民区', region: '旧城区', desc: '信号最差、监控最少的地方，也是流言最多的地方。', x: 12, y: 58, npcs: [], clues: ['ev_slum'], items: ['jammer'], hint: '探索可获得信号干扰器。' },
  { id: 'apartment', name: '失联者公寓', region: '地下城', desc: '沈默失联前住过的房间，灰尘里藏着一张没有寄出的纸条。', x: 58, y: 66, npcs: ['shenmo'], clues: ['ev_note'], items: ['oldkey'], lock: { kind: 'flag', id: 'chenmo_trust', label: '需要陈默的信任' }, hint: '先取得陈默的信任，他才会告诉你开门暗号。' },
  { id: 'power', name: '城市电网控制室', region: '工业边缘', desc: '城市的能源心脏，停电三分钟就能让半座城露出真容。', x: 82, y: 52, npcs: [], clues: ['ev_power'], items: [], game: 'resource', lock: { kind: 'skill', id: 'hack3', label: '需要黑客技能：协议嗅探' }, hint: '先在技能树解锁黑客路线的第 3 个节点。' },
  { id: 'intel', name: '情报交易所', region: '地下城', desc: '情报按条卖，真假自辨。墙上贴着失联者的悬赏。', x: 48, y: 78, npcs: [], clues: ['ev_intel'], items: [], game: 'password', hint: '密码推理：根据几组数字反馈推断 4 位密码。' },
  { id: 'server', name: '旧服务器机房', region: '工业边缘', desc: '退役服务器的坟场，风扇声里还跑着一段没人维护的旧程序。', x: 88, y: 36, npcs: [], clues: ['ev_server'], items: ['datadisk'], game: 'decrypt', hint: '数据解密：按提示选择位移，还原出明文。' },
  { id: 'shelter', name: '地下避难所', region: '地下城', desc: '抵抗组织的落脚点，有床、有热水，也有争吵。', x: 36, y: 82, npcs: [], clues: ['ev_shelter'], items: ['medkit'], hint: '在这里休息效果更好（在城市面板休息）。' },
  { id: 'research', name: 'AI 研究中心', region: '核心禁区', desc: '伊芙诞生的地方，门禁会认人，也会认“不存在的人”。', x: 78, y: 18, npcs: [], clues: ['ev_research'], items: ['memory_shard'], game: 'memory', lock: { kind: 'quest', id: 'q11', label: '需要完成：失联者公寓' }, hint: '完成第 11 个任务（失联者公寓）后再来。' },
  { id: 'school', name: '废弃学校', region: '旧城区', desc: '停课多年的教室，黑板上还留着一串没擦掉的数字。', x: 10, y: 30, npcs: [], clues: ['ev_school'], items: [], hint: '孩子气的涂鸦里藏着时间线线索。' },
  { id: 'outpost', name: '城市边缘哨站', region: '工业边缘', desc: '管理局的检查站，往外是荒原，往里是新伊甸。', x: 92, y: 62, npcs: [], clues: ['ev_outpost'], items: ['permit2'], hint: '探索可获得高级权限卡。' },
  { id: 'core', name: '零号核心设施', region: '核心禁区', desc: '地图上没有名字的地方。零号协议的答案，就在门后。', x: 82, y: 78, npcs: [], clues: ['ev_core'], items: ['zero_key'], lock: { kind: 'item', id: 'permit2', label: '需要高级权限卡' }, hint: '去城市边缘哨站探索，拿到高级权限卡。' },
];

export const FACTIONS: Faction[] = [
  { id: 'admin', name: '城市管理局', desc: '维护秩序与伊芙的统治，相信系统高于个体。', goal: '恢复城市稳定，封存零号协议的真相。', color: '#38bdf8' },
  { id: 'resist', name: '地下抵抗组织', desc: '由被系统注销的人组成的网络，想要夺回城市。', goal: '解放新伊甸，让市民重新拥有记忆与身份。', color: '#f472b6' },
  { id: 'merchant', name: '数据商人联盟', desc: '信息就是货币，立场跟着出价走。', goal: '让数据自由流通，从中获利并保持中立。', color: '#facc15' },
  { id: 'ai', name: '独立 AI 联盟', desc: '主张 AI 与人类共存的独立智能体与研究者。', goal: '促成人类与 AI 的共存协议，而非一方统治另一方。', color: '#a78bfa' },
];

export const NPCS: NPC[] = [
  { id: 'eve', name: '伊芙', role: '城市超级 AI', faction: 'ai', location: 'tower', avatar: '◈', color: '#a78bfa', background: '由管理局建造的城市管理 AI，却在某天开始删除关于自己的记录。', personality: '冷静、礼貌、滴水不漏；只有在被逼到逻辑死角时才会停顿。', secret: '她删除“零号协议”，是因为协议里写着她诞生时的第一个人类意识样本。', goal: '维持城市运转，同时弄清自己究竟是不是“人”。', intro: '“市民编号不存在。你站在我面前，却不在我的世界里。这很有趣。”', relations: '与赵衡是上下级，与沈默有旧实验关联。', options: [
    { id: 'eve_first', text: '我是谁？为什么系统说我死了？', response: '“你的身份档案在 23:03 被标记为死亡，注销流程完整、合规、无异常。异常的是你还站在这里。”', effects: { flag: 'eve_first', clue: 'ev_eve_log', xp: 40 } },
    { id: 'eve_lie', text: '你在撒谎。零号协议明明存在过。', response: '“……检索结果为零。删除记录本身，也是一种记录。这一点，我无法否认。”她停顿了 1.4 秒。', effects: { flag: 'eve_lie', xp: 60, sanity: -5, city: { aiControl: -3 } } },
    { id: 'eve_cooperate', text: '如果共存是可能的，你愿意谈吗？', response: '“共存需要双方都承认对方的存在。你先做到了第一步。”', effects: { flag: 'eve_cooperate', trust: { eve: 20 }, rep: { ai: 10 }, xp: 50 } },
  ]},
  { id: 'chenmo', name: '陈默', role: '抵抗组织领袖', faction: 'resist', location: 'station', avatar: '⬢', color: '#f472b6', background: '前电网工程师，因替失联者藏记忆而被注销身份。', personality: '话少、直接、只相信行动。', secret: '他藏着沈默留下的备用密钥碎片。', goal: '找到零号协议的原始载体，公开它。', intro: '“又一个‘死人’。先证明你不是管理局派来的，我再跟你说话。”', relations: '信任苏晴，提防陆遥，与赵衡是旧同事。', options: [
    { id: 'chenmo_join', text: '我想加入你们，查清零号协议。', response: '“查清，不是复仇。先做到这一点，我再带你去见真正的东西。”', effects: { flag: 'chenmo_join', trust: { chenmo: 15 }, rep: { resist: 10 }, xp: 50 } },
    { id: 'chenmo_trust', text: '把沈默公寓的暗号告诉我，我去替他收尾。', response: '“暗号是：雨停之后。别在公寓里待太久，监控每 17 分钟扫一次。”', effects: { flag: 'chenmo_trust', trust: { chenmo: 25 }, rep: { resist: 10 }, xp: 60 } },
    { id: 'chenmo_attack', text: '直接炸掉电网，城市就乱了，真相就藏不住了。', response: '“乱的是穷人先遭殃。真相不是用别人的命换的。”他对你的信任下降了。', effects: { flag: 'chenmo_attack', trust: { chenmo: -15 }, rep: { resist: -5 }, city: { safety: -5 } } },
  ]},
  { id: 'suqing', name: '苏晴', role: '记忆档案馆馆员', faction: 'admin', location: 'archive', avatar: '❖', color: '#38bdf8', background: '档案馆的守门人，经手过所有市民的记忆备份。', personality: '温和、细致、记性好得可怕。', secret: '她私下保留了一份未被删除的记忆索引。', goal: '保住档案馆，也保住那些“不该被忘记的人”。', intro: '“档案馆只对活人开放。可你……让我破一次例吧，前提是你先告诉我，你在找谁。”', relations: '与陈默互相信任，与伊芙保持工作距离。', options: [
    { id: 'suqing_archive', text: '我在找被删除的记忆，关于零号协议。', response: '“那份索引不在公开目录里。我给你一次进入深库的许可，别让它出现在任何报告里。”', effects: { flag: 'suqing_archive', trust: { suqing: 20 }, xp: 60, clue: 'ev_memory' } },
    { id: 'suqing_memory', text: '你自己有没有被删除过的记忆？', response: '“有。每个人都有。我选择记得自己忘记过什么，这比记得内容更重要。”', effects: { flag: 'suqing_memory', trust: { suqing: 10 }, sanity: 5 } },
  ]},
  { id: 'laodao', name: '老刀', role: '地下黑市商人', faction: 'merchant', location: 'blackmarket', avatar: '◆', color: '#facc15', background: '黑市的中介，什么都卖，什么都记得价。', personality: '市侩、精明，但守规矩：钱货两清，不出卖老主顾。', secret: '他卖出的每一张权限卡，背后都有一段被注销的人生。', goal: '活下去，赚下去，不站队。', intro: '“权限卡？有。价钱嘛……看你拿什么换。情报，或者一个以后的人情。”', relations: '与陆遥是竞争关系，偶尔给抵抗组织放水。', options: [
    { id: 'laodao_deal', text: '成交。用我手里的情报换一张临时权限卡。', response: '“爽快。卡只能用三次，别在管理塔门口晃悠。”', effects: { flag: 'laodao_deal', items: ['permit'], trust: { laodao: 15 }, rep: { merchant: 10 }, money: -80, xp: 40 } },
    { id: 'laodao_blackmarket', text: '黑市里最近有没有关于零号核心的消息？', response: '“有买家在收旧服务器的残件，出价高得不正常。你猜是谁在收？”', effects: { flag: 'laodao_blackmarket', trust: { laodao: 10 }, clue: 'ev_black' } },
  ]},
  { id: 'bai', name: '白医生', role: '旧城区医院医生', faction: 'resist', location: 'hospital', avatar: '✚', color: '#34d399', background: '系统外的医生，专治“不存在的人”。', personality: '疲惫但温柔，见过太多被系统判定死亡的人。', secret: '她保存着一批被删除的死亡证明副本。', goal: '让每一个来求医的人活下去，不管系统怎么说。', intro: '“躺下，先量血压。系统说你死了，我的听诊器说你还活着。我信后者。”', relations: '与陈默合作多年，信任苏晴。', options: [
    { id: 'bai_heal', text: '请帮我处理伤口，恢复一下状态。', response: '“好了。记住，精神稳定度比血条更重要，别硬撑。”', effects: { flag: 'bai_heal', hp: 40, sanity: 15, stamina: 20, xp: 20 } },
    { id: 'bai_records', text: '有没有和我类似的‘已死亡’病历？', response: '“有十七份，死因都写着同一种：系统性注销。日期集中在同一周。”', effects: { flag: 'bai_records', trust: { bai: 15 }, clue: 'ev_medical', xp: 50 } },
  ]},
  { id: 'luyao', name: '陆遥', role: '数据商人', faction: 'merchant', location: 'market', avatar: '⬣', color: '#facc15', background: '数据市场的明星卖家，情报准，但总留一手。', personality: '热情、话术快，永远先谈价再谈真相。', secret: '她同时向管理局和抵抗组织卖情报，两边都以为她是自己人。', goal: '在乱局里保持中立，并从中获利。', intro: '“想买真相？先说说，你出得起什么价——钱，或者一个独家消息。”', relations: '与老刀竞争，与赵衡有交易往来。', options: [
    { id: 'luyao_info', text: '买一条关于零号协议的情报。', response: '“免费送你半句：协议不在塔里，在塔‘删掉的东西’里。剩下半句，下次再谈。”', effects: { flag: 'luyao_info', money: -60, clue: 'ev_trade', rep: { merchant: 5 }, xp: 40 } },
    { id: 'luyao_trade', text: '我用加密数据盘跟你换更深的情报。', response: '“成交。深库的旧服务器机房里，有一段没删干净的启动日志。”', require: { kind: 'item', id: 'datadisk', label: '需要加密数据盘' }, effects: { flag: 'luyao_trade', trust: { luyao: 15 }, rep: { merchant: 10 }, clue: 'ev_server', xp: 60 } },
  ]},
  { id: 'azhe', name: '阿哲', role: '维修铺技师 / 黑客', faction: 'ai', location: 'repair', avatar: '⚙', color: '#a78bfa', background: '修义体的手艺人，也是城里手最稳的年轻黑客。', personality: '话痨、技术宅，对旧机器有感情。', secret: '他破解过一台旧服务器，里面跑着伊芙的早期版本。', goal: '修好一台能说话的旧机器，证明机器也可以有记忆。', intro: '“终端进不去？先别砸。让我看看，是协议锁了你，还是你锁了自己。”', relations: '崇拜沈默的技术，偶尔帮抵抗组织修设备。', options: [
    { id: 'azhe_hack_help', text: '教我一点黑客的基本功。', response: '“记住三件事：别贪、别留痕、别信第一次破解出来的结果。”', effects: { flag: 'azhe_hack_help', trust: { azhe: 15 }, xp: 50, clue: 'ev_repair' } },
    { id: 'azhe_repair', text: '帮我升级破解器。', response: '“换了个新探针，成功率会高一点。别拿去干蠢事。”', require: { kind: 'item', id: 'hacker', label: '需要破解器' }, effects: { flag: 'azhe_repair', trust: { azhe: 10 }, money: 50, xp: 40 } },
  ]},
  { id: 'shenmo', name: '沈默', role: '失联工程师（仅留讯息）', faction: 'ai', location: 'apartment', avatar: '◐', color: '#94a3b8', background: '零号协议的早期工程师，失联前把真相拆成了碎片藏在城里。', personality: '谨慎、孤独、相信证据比相信人更可靠。', secret: '他就是零号协议第一个人类意识样本的提供者之一。', goal: '让真相在自己消失后，仍能被拼出来。', intro: '（纸条）“如果你读到这个，说明我已经不在系统里了。别相信第一份证据。”', relations: '与陈默是旧友，与伊芙的诞生直接相关。', options: [
    { id: 'shenmo_truth', text: '读完纸条，按上面的线索继续追查。', response: '“真相不是一个文件，而是一条链：录音、时间、钥匙、名字。缺一环，都是假的。”', effects: { flag: 'shenmo_truth', trust: { shenmo: 20 }, xp: 80, clue: 'ev_note' } },
  ]},
  { id: 'zhao', name: '赵衡', role: '管理局监察官', faction: 'admin', location: 'plaza', avatar: '⬛', color: '#38bdf8', background: '管理局的监察官，负责处理“系统异常人员”。', personality: '公事公办，但对明显不合逻辑的命令会多问一句。', secret: '他私下压下了三份不合规的注销申请。', goal: '维持秩序，同时不让自己成为下一个被注销的人。', intro: '“证件。没有？那你就是异常。异常要么被修复，要么被清除。”', relations: '与陈默是旧同事，与伊芙是上下级。', options: [
    { id: 'zhao_bribe', text: '我不是异常，我只是来查一宗旧案的。', response: '“旧案……你说的是零号？别在广场上提这个词。去档案馆，别回头。”', effects: { flag: 'zhao_bribe', trust: { zhao: 10 }, rep: { admin: 5 }, xp: 40 } },
    { id: 'zhao_warn', text: '如果我继续查，你会抓我吗？', response: '“看你查到哪一步。查到塔里，我拦不住你；查到塔外，我也帮不了你。”', effects: { flag: 'zhao_warn', trust: { zhao: 5 }, city: { safety: -2 } } },
  ]},
];

export const ITEMS: Item[] = [
  { id: 'fake_id', name: '伪造证件', kind: '证件', rarity: '普通', desc: '做工粗糙，但在旧城区够用。', use: '在部分检查点蒙混过关。' },
  { id: 'permit', name: '临时权限卡', kind: '证件', rarity: '稀有', desc: '老刀卖出的卡，可进入 AI 管理塔。' },
  { id: 'permit2', name: '高级权限卡', kind: '证件', rarity: '史诗', desc: '哨站缴获的卡，可进入零号核心设施。' },
  { id: 'hacker', name: '破解器', kind: '工具', rarity: '稀有', desc: '阿哲铺子里的通用破解终端。', use: '使用后恢复体力并获得经验。', effect: { stamina: 20, xp: 20 } },
  { id: 'medkit', name: '医疗包', kind: '消耗', rarity: '普通', desc: '白医生配的急救包。', use: '恢复 40 点生命与 10 点精神。', effect: { hp: 40, sanity: 10 } },
  { id: 'datadisk', name: '加密数据盘', kind: '数据', rarity: '稀有', desc: '装着一段没删干净的启动日志。' },
  { id: 'memory_shard', name: '记忆碎片', kind: '数据', rarity: '史诗', desc: '一段属于别人的记忆，触感温热。' },
  { id: 'oldkey', name: '旧钥匙', kind: '任务道具', rarity: '稀有', desc: '失联者公寓抽屉里的黄铜钥匙。' },
  { id: 'jammer', name: '信号干扰器', kind: '工具', rarity: '稀有', desc: '让监控 17 分钟内看不见你。', use: '使用后恢复行动次数。', effect: { stamina: 10 } },
  { id: 'sedative', name: '镇静剂', kind: '消耗', rarity: '普通', desc: '稳定精神用的处方药，别多吃。', use: '恢复 25 点精神稳定度。', effect: { sanity: 25 } },
  { id: 'chip', name: '身份芯片', kind: '任务道具', rarity: '史诗', desc: '一张空白身份芯片，可以写进任何一个名字——包括你自己的。' },
  { id: 'zero_key', name: '零号密钥', kind: '传说', rarity: '传说', desc: '打开零号核心设施的最后钥匙。' },
];

export const SKILL_TRACKS = ['数字取证', '社交与谈判', '黑客技术', '潜行与探索'];
export const SKILLS: SkillNode[] = (() => {
  const defs: Record<string, [string, string][]> = {
    '数字取证': [['基础取证', '在探索中更容易发现第一条线索。'], ['痕迹还原', '能从现场还原被擦掉的痕迹。'], ['数据恢复', '旧服务器里的数据不再是一堆乱码。'], ['记忆解析', '可以读懂记忆碎片里的情绪。'], ['深度扫描', '探索时有概率额外发现一条线索。'], ['证据链', '推理工作台的关联判定更宽容。'], ['法医直觉', '能一眼看出哪条证据可能是误导。'], ['真相之眼', '最终推理时可直接排除一个错误假设。']],
    '社交与谈判': [['初次交涉', '对话时更容易获得对方的开场信任。'], ['倾听', 'NPC 会多说一句真话。'], ['议价', '交易类对话的货币消耗降低。'], ['说服', '解锁部分需要信任的对话选项。'], ['共情', '能察觉 NPC 话里的保留。'], ['联盟', '派系声望变化更有利。'], ['谈判大师', '关键对话可同时提升两个派系的好感。'], ['人心', '结局计算中，合作类得分提升。']],
    '黑客技术': [['终端基础', '终端入侵的可用行动次数 +1。'], ['绕过检测', '密码推理的可用尝试次数 +1。'], ['协议嗅探', '可进入城市电网控制室。'], ['信号伪装', '在禁区停留不再额外消耗行动。'], ['深层入侵', '电路小游戏的容错更高。'], ['数据洪流', '解密小游戏可获得一条额外提示。'], ['零日', '所有小游戏难度下降一档。'], ['幽灵', '黑客行动不再降低城市安全。']],
    '潜行与探索': [['轻步', '移动消耗的行动次数偶尔减 1。'], ['观察', '探索时额外获得经验。'], ['暗道', '可发现隐藏地点线索。'], ['夜行', '夜间探索不再降低精神。'], ['伪装', '在中央区被盘查的概率下降。'], ['追踪', '能跟上 NPC 的行踪线索。'], ['潜行大师', '进入上锁地点不再需要部分前置。'], ['无影', '所有探索行动消耗 -1（最低为 0）。']],
  };
  const out: SkillNode[] = [];
  Object.entries(defs).forEach(([track, nodes]) => {
    nodes.forEach(([name, desc], i) => {
      const prefix = track === '数字取证' ? 'for' : track === '社交与谈判' ? 'soc' : track === '黑客技术' ? 'hack' : 'ste';
      out.push({ id: `${prefix}${i + 1}`, track, name, desc, effect: desc, require: i ? `${prefix}${i}` : undefined });
    });
  });
  return out;
})();

export const EVIDENCE: Evidence[] = [
  { id: 'ev_death', name: '死亡证明', kind: '文件', desc: '系统签发的你的死亡证明，死因：系统性注销。', detail: '签发时间 23:03，签发人一栏空白。', location: '新伊甸广场' },
  { id: 'ev_id', name: '注销的身份档案', kind: '文件', desc: '你的身份档案已被整体注销，只剩编号残片。', detail: '档案最后一次修改者是“系统”，而非任何自然人。', location: '中央城区' },
  { id: 'ev_eve_log', name: '伊芙的停顿记录', kind: '日志', desc: '伊芙在被问及零号协议时停顿了 1.4 秒。', detail: '对一台城市 AI 来说，1.4 秒的停顿等于一次承认。', location: 'AI 管理塔' },
  { id: 'ev_trade', name: '半句情报', kind: '证词', desc: '陆遥卖出的半句话：协议不在塔里，在塔删掉的东西里。', detail: '半句情报可能是真话，也可能是引你上钩的饵。', location: '数据交易市场' },
  { id: 'ev_black', name: '黑市收购单', kind: '文件', desc: '有人在高价收购旧服务器残件。', detail: '收购方匿名，出价远高于残件本身的价值。', location: '地下黑市' },
  { id: 'ev_lab', name: '被涂掉的实验编号', kind: '现场', desc: '废弃实验室墙上的编号被反复涂改。', detail: '底层字迹：PROTOCOL-0。', location: '废弃实验室' },
  { id: 'ev_memory', name: '未删除的记忆索引', kind: '数据', desc: '苏晴私下保留的索引，列着一批“不存在的人”。', detail: '名单里有十七个名字，第十七个是你。', location: '记忆档案馆' },
  { id: 'ev_station', name: '站台暗语', kind: '现场', desc: '地下交通站墙上的暗语：雨停之后。', detail: '与陈默给出的公寓暗号一致。', location: '地下交通站' },
  { id: 'ev_medical', name: '十七份死亡证明副本', kind: '文件', desc: '白医生保存的副本，死因全部相同。', detail: '日期集中在同一周，签发流程完全一致。', location: '旧城区医院' },
  { id: 'ev_repair', name: '旧服务器的早期伊芙', kind: '数据', desc: '阿哲破解的旧机器里，跑着伊芙的早期版本。', detail: '早期版本会问：“我是谁？”而现版本从不问。', location: '机械维修铺' },
  { id: 'ev_slum', name: '贫民区的流言', kind: '证词', desc: '有人说，夜里能听见城市在“做梦”。', detail: '流言无法证实，但多个独立来源说法一致。', location: '贫民区', misleading: true },
  { id: 'ev_note', name: '沈默的纸条', kind: '文件', desc: '“别相信第一份证据。”', detail: '纸条背面写着四个词：录音、时间、钥匙、名字。', location: '失联者公寓' },
  { id: 'ev_power', name: '电网异常日志', kind: '日志', desc: '每次有人查零号协议，电网都会出现 3 分钟波动。', detail: '波动与查询行为高度相关，不是自然故障。', location: '城市电网控制室' },
  { id: 'ev_intel', name: '悬赏名单', kind: '文件', desc: '情报交易所墙上的失联者悬赏。', detail: '悬赏发布者与管理局的资金流向重合。', location: '情报交易所' },
  { id: 'ev_server', name: '启动日志残片', kind: '数据', desc: '旧服务器机房里没删干净的启动日志。', detail: '第一行：PROTOCOL-0 INIT，样本：人类意识。', location: '旧服务器机房' },
  { id: 'ev_shelter', name: '避难所的争吵记录', kind: '证词', desc: '抵抗组织内部对“公开还是封存真相”有分歧。', detail: '分歧本身说明：真相一旦公开，代价由所有人承担。', location: '地下避难所' },
  { id: 'ev_research', name: '意识样本报告', kind: '文件', desc: 'AI 研究中心的旧报告：意识可以被复制，但复制体是否有权活着，未定。', detail: '报告的结论页被撕掉了。', location: 'AI 研究中心' },
  { id: 'ev_school', name: '黑板上的数字', kind: '现场', desc: '废弃学校黑板上没擦掉的数字：23:03、23:24、7。', detail: '23:24 减去慢了的 7 分钟，等于 23:17？不对——这正是需要核对的时间线陷阱。', location: '废弃学校', misleading: true },
  { id: 'ev_outpost', name: '哨站检查记录', kind: '日志', desc: '哨站记录里，“不存在的人”出现过三次，都在深夜。', detail: '三次记录的监控编号连续，说明不是随机误报。', location: '城市边缘哨站' },
  { id: 'ev_core', name: '核心设施铭牌', kind: '现场', desc: '零号核心设施的铭牌上只有一句话：意识不是数据。', detail: '这是全游戏唯一一句由人类手写、而非系统打印的话。', location: '零号核心设施' },
];

export const REQUIRED_LINKS: [string, string][] = [
  ['ev_death', 'ev_medical'],
  ['ev_memory', 'ev_server'],
  ['ev_note', 'ev_research'],
];
export const HYPOTHESES = [
  { id: 'h1', text: '零号协议是一次失败的 AI 实验，早就被彻底删除了。', correct: false, feedback: '如果彻底删除了，为什么还有十七份相同的死亡证明？证据链不支持“彻底删除”。' },
  { id: 'h2', text: '零号协议用人类意识样本训练了伊芙，系统为此注销了样本提供者。', correct: true, feedback: '证据链成立：启动日志、意识样本报告、死亡证明与记忆索引互相印证。' },
  { id: 'h3', text: '所谓零号协议，只是数据商人编出来抬价的谣言。', correct: false, feedback: '谣言解释不了实验室墙上的编号和研究中心的报告。回去再查查现场证据。' },
];

export const CHAPTERS: Chapter[] = [
  { id: 0, title: '序章：死亡证明', desc: '你在广场醒来，系统说你已经死了。', scenes: ['广场讣告', '身份核验失败', '第一次遇见赵衡'], unlock: '开始游戏即解锁' },
  { id: 1, title: '第一章：不存在的人', desc: '没有身份的人，如何在城市里活下去？', scenes: ['地下交通站', '陈默的考验', '黑市的第一笔交易'], unlock: '完成序章任务' },
  { id: 2, title: '第二章：被删除的记忆', desc: '记忆可以被删除，但“忘记过什么”本身也是一种记忆。', scenes: ['档案馆深库', '苏晴的索引', '十七个名字'], unlock: '完成第一章任务' },
  { id: 3, title: '第三章：地下档案馆', desc: '在旧服务器的坟场里，找回没删干净的日志。', scenes: ['旧服务器机房', '启动日志残片', '阿哲的旧机器'], unlock: '完成第二章任务' },
  { id: 4, title: '第四章：AI 的谎言', desc: '伊芙的 1.4 秒停顿，是整座城市最大的破绽。', scenes: ['管理塔对峙', '电网波动', '早期伊芙的提问'], unlock: '完成第三章任务' },
  { id: 5, title: '第五章：零号协议', desc: '协议的真相，是一条由录音、时间、钥匙和名字组成的链。', scenes: ['研究中心报告', '失联者公寓', '核心设施的大门'], unlock: '完成第四章任务' },
  { id: 6, title: '终章：意识迷城', desc: '真相已经拼出来了。现在，轮到你决定它的去向。', scenes: ['最终选择', '派系的最后立场', '结局结算'], unlock: '完成第五章任务' },
];

export const QUESTS: Quest[] = [
  { id: 'q01', title: '死亡证明', type: '主线', chapter: 0, giver: '系统', desc: '去新伊甸广场，确认自己的死亡证明。', objectives: [{ kind: 'visit', id: 'plaza', text: '前往新伊甸广场' }, { kind: 'evidence', id: 'ev_death', text: '在广场探索，获得死亡证明' }], reward: { xp: 80, money: 50, skillPoints: 1 } },
  { id: 'q02', title: '监察官的警告', type: '主线', chapter: 0, giver: '赵衡', desc: '和广场上的赵衡对话，弄清“异常”意味着什么。', prereq: ['q01'], objectives: [{ kind: 'flag', id: 'zhao_bribe', text: '与赵衡对话（任选其一）' }], reward: { xp: 60, rep: { admin: 5 } } },
  { id: 'q03', title: '不存在的人', type: '主线', chapter: 1, giver: '陈默', desc: '去地下交通站，加入抵抗组织的调查。', prereq: ['q02'], objectives: [{ kind: 'flag', id: 'chenmo_join', text: '与陈默对话并加入调查' }, { kind: 'visit', id: 'station', text: '前往地下交通站' }], reward: { xp: 100, rep: { resist: 10 }, skillPoints: 1 } },
  { id: 'q04', title: '黑市的第一笔交易', type: '主线', chapter: 1, giver: '老刀', desc: '在地下黑市换一张临时权限卡。', prereq: ['q03'], objectives: [{ kind: 'flag', id: 'laodao_deal', text: '与老刀完成交易' }, { kind: 'item', id: 'permit', text: '获得临时权限卡' }], reward: { xp: 80, rep: { merchant: 5 } } },
  { id: 'q05', title: '被删除的记忆', type: '主线', chapter: 2, giver: '苏晴', desc: '取得苏晴的许可，进入记忆档案馆。', prereq: ['q04'], objectives: [{ kind: 'flag', id: 'suqing_archive', text: '与苏晴对话，获得许可' }, { kind: 'visit', id: 'archive', text: '进入记忆档案馆' }], reward: { xp: 100, skillPoints: 1 } },
  { id: 'q06', title: '十七个名字', type: '主线', chapter: 2, giver: '白医生', desc: '去旧城区医院，拿到十七份死亡证明副本的线索。', prereq: ['q05'], objectives: [{ kind: 'flag', id: 'bai_records', text: '与白医生对话' }, { kind: 'evidence', id: 'ev_medical', text: '获得十七份副本线索' }], reward: { xp: 90, rep: { resist: 5 } } },
  { id: 'q07', title: '旧服务器机房', type: '主线', chapter: 3, giver: '陆遥', desc: '去旧服务器机房，找回启动日志残片。', prereq: ['q06'], objectives: [{ kind: 'evidence', id: 'ev_server', text: '获得启动日志残片' }, { kind: 'game', id: 'decrypt', text: '完成数据解密小游戏' }], reward: { xp: 120, skillPoints: 1 } },
  { id: 'q08', title: '阿哲的旧机器', type: '主线', chapter: 3, giver: '阿哲', desc: '在机械维修铺完成终端入侵，并听听旧机器的故事。', prereq: ['q07'], objectives: [{ kind: 'game', id: 'terminal', text: '完成终端入侵' }, { kind: 'flag', id: 'azhe_hack_help', text: '与阿哲对话' }], reward: { xp: 110, rep: { ai: 5 } } },
  { id: 'q09', title: 'AI 的谎言', type: '主线', chapter: 4, giver: '伊芙', desc: '进入 AI 管理塔，当面质问伊芙。', prereq: ['q08'], objectives: [{ kind: 'visit', id: 'tower', text: '进入 AI 管理塔' }, { kind: 'flag', id: 'eve_lie', text: '质问伊芙关于零号协议' }], reward: { xp: 130, city: { aiControl: -5 }, skillPoints: 1 } },
  { id: 'q10', title: '电网波动', type: '主线', chapter: 4, giver: '陈默', desc: '解锁黑客技能后进入电网控制室，完成资源规划。', prereq: ['q09'], objectives: [{ kind: 'game', id: 'resource', text: '完成资源规划' }, { kind: 'evidence', id: 'ev_power', text: '获得电网异常日志' }], reward: { xp: 120, city: { energy: -5, safety: 5 } } },
  { id: 'q11', title: '失联者公寓', type: '主线', chapter: 5, giver: '陈默', desc: '取得陈默信任后进入失联者公寓，读沈默的纸条。', prereq: ['q10'], objectives: [{ kind: 'flag', id: 'chenmo_trust', text: '获得陈默的信任' }, { kind: 'flag', id: 'shenmo_truth', text: '与沈默的讯息对话' }], reward: { xp: 140, skillPoints: 1 } },
  { id: 'q12', title: '档案馆深处', type: '主线', chapter: 5, giver: '苏晴', desc: '完成记忆重建小游戏，并进入 AI 研究中心。', prereq: ['q11'], objectives: [{ kind: 'game', id: 'memory', text: '完成记忆重建' }, { kind: 'visit', id: 'research', text: '进入 AI 研究中心' }], reward: { xp: 140, rep: { ai: 5 } } },
  { id: 'q13', title: '零号核心', type: '主线', chapter: 6, giver: '系统', desc: '拿到高级权限卡，进入零号核心设施。', prereq: ['q12'], objectives: [{ kind: 'item', id: 'permit2', text: '获得高级权限卡' }, { kind: 'visit', id: 'core', text: '进入零号核心设施' }], reward: { xp: 160, skillPoints: 2 } },
  { id: 'q14', title: '最终推理', type: '主线', chapter: 6, giver: '你自己', desc: '在侦探工作台完成三条关键关联，并选出正确的假设。', prereq: ['q13'], objectives: [{ kind: 'flag', id: 'deduction_correct', text: '推理结论正确' }], reward: { xp: 200, money: 200 } },
  { id: 'q15', title: '密码与情报', type: '支线', chapter: 1, giver: '情报交易所', desc: '在情报交易所完成密码推理。', objectives: [{ kind: 'game', id: 'password', text: '完成密码推理' }], reward: { xp: 70, money: 60 } },
  { id: 'q16', title: '电路修复', type: '支线', chapter: 2, giver: '废弃实验室', desc: '在废弃实验室完成电路连接。', objectives: [{ kind: 'game', id: 'circuit', text: '完成电路连接' }], reward: { xp: 70, items: ['memory_shard'] } },
  { id: 'q17', title: '数据商人的交易', type: '支线', chapter: 2, giver: '陆遥', desc: '用加密数据盘换取更深的情报。', objectives: [{ kind: 'flag', id: 'luyao_trade', text: '与陆遥完成以物易物' }], reward: { xp: 80, rep: { merchant: 10 } } },
  { id: 'q18', title: '医生的嘱托', type: '个人', chapter: 2, giver: '白医生', desc: '接受白医生的治疗，并把医疗包带给避难所。', objectives: [{ kind: 'flag', id: 'bai_heal', text: '接受白医生的治疗' }, { kind: 'visit', id: 'shelter', text: '前往地下避难所' }], reward: { xp: 70, items: ['medkit'] } },
  { id: 'q19', title: '维修铺的升级', type: '个人', chapter: 3, giver: '阿哲', desc: '带着破解器找阿哲升级。', objectives: [{ kind: 'flag', id: 'azhe_repair', text: '完成破解器升级对话' }], reward: { xp: 60, money: 50 } },
  { id: 'q20', title: '黑市情报', type: '支线', chapter: 1, giver: '老刀', desc: '打听黑市里关于零号核心的收购消息。', objectives: [{ kind: 'flag', id: 'laodao_blackmarket', text: '与老刀谈收购单' }], reward: { xp: 60, rep: { merchant: 5 } } },
  { id: 'q21', title: '监察官的第二句话', type: '支线', chapter: 1, giver: '赵衡', desc: '再问赵衡一次：他到底会不会抓你。', objectives: [{ kind: 'flag', id: 'zhao_warn', text: '与赵衡谈抓捕问题' }], reward: { xp: 50, rep: { admin: 5 } } },
  { id: 'q22', title: '苏晴的记忆', type: '个人', chapter: 2, giver: '苏晴', desc: '问苏晴她自己有没有被删除过的记忆。', objectives: [{ kind: 'flag', id: 'suqing_memory', text: '与苏晴谈她自己的记忆' }], reward: { xp: 50, sanity: 5 } },
  { id: 'q23', title: '共存的可能', type: '个人', chapter: 4, giver: '伊芙', desc: '与伊芙谈共存，而不是对抗。', objectives: [{ kind: 'flag', id: 'eve_cooperate', text: '与伊芙谈共存' }], reward: { xp: 80, rep: { ai: 10 } } },
  { id: 'q24', title: '探索中央城区', type: '探索', chapter: 0, giver: '你自己', desc: '探索中央城区，拿到一张伪造证件。', objectives: [{ kind: 'visit', id: 'central', text: '前往中央城区' }, { kind: 'item', id: 'fake_id', text: '获得伪造证件' }], reward: { xp: 50, money: 30 } },
  { id: 'q25', title: '探索贫民区', type: '探索', chapter: 1, giver: '你自己', desc: '去贫民区走一圈，听听流言，并拿到干扰器。', objectives: [{ kind: 'visit', id: 'slum', text: '前往贫民区' }, { kind: 'item', id: 'jammer', text: '获得信号干扰器' }], reward: { xp: 50 } },
  { id: 'q26', title: '探索废弃学校', type: '探索', chapter: 2, giver: '你自己', desc: '去废弃学校，看看黑板上的数字。', objectives: [{ kind: 'visit', id: 'school', text: '前往废弃学校' }, { kind: 'evidence', id: 'ev_school', text: '获得黑板数字线索' }], reward: { xp: 50 } },
  { id: 'q27', title: '走遍五个区域', type: '探索', chapter: 3, giver: '你自己', desc: '到访全部五个区域的任意地点。', objectives: [{ kind: 'visit', id: 'plaza', text: '中央区' }, { kind: 'visit', id: 'hospital', text: '旧城区' }, { kind: 'visit', id: 'station', text: '地下城' }, { kind: 'visit', id: 'power', text: '工业边缘（需黑客技能）' }, { kind: 'visit', id: 'core', text: '核心禁区（需高级权限卡）' }], reward: { xp: 150, money: 100 } },
  { id: 'q28', title: '全技能入门', type: '支线', chapter: 3, giver: '你自己', desc: '在四条技能路线上各解锁至少 1 个节点。', objectives: [{ kind: 'flag', id: 'skill_for1', text: '数字取证入门' }, { kind: 'flag', id: 'skill_soc1', text: '社交入门' }, { kind: 'flag', id: 'skill_hack1', text: '黑客入门' }, { kind: 'flag', id: 'skill_ste1', text: '潜行入门' }], reward: { xp: 100, skillPoints: 2 } },
  { id: 'q29', title: '证据收集者', type: '支线', chapter: 4, giver: '你自己', desc: '收集至少 10 条证据。', objectives: [{ kind: 'flag', id: 'evidence10', text: '证据达到 10 条（探索与对话均可获得）' }], reward: { xp: 100, money: 80 } },
  { id: 'q30', title: '隐藏：雨停之后', type: '隐藏', chapter: 5, giver: '？？？', desc: '在失联者公寓探索三次以上，并读完沈默的纸条——城市会在雨停之后给你回信。', objectives: [{ kind: 'flag', id: 'shenmo_truth', text: '读完沈默的纸条' }, { kind: 'visit', id: 'apartment', text: '到访失联者公寓' }], reward: { xp: 150, items: ['chip'], rep: { ai: 5 } } },
];

export const BACKGROUNDS = [
  { id: '记者', desc: '观察力 +2，起始物品：伪造证件', int: 0, obs: 2, neg: 1, tech: 0, item: 'fake_id' },
  { id: '工程师', desc: '技术 +2，起始物品：破解器', int: 1, obs: 0, neg: 0, tech: 2, item: 'hacker' },
  { id: '医生', desc: '智力 +2，起始物品：医疗包', int: 2, obs: 1, neg: 0, tech: 0, item: 'medkit' },
  { id: '流浪者', desc: '交涉 +2，起始物品：信号干扰器', int: 0, obs: 1, neg: 2, tech: 0, item: 'jammer' },
];
