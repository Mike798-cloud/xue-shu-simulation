/* 学术人生 · 深度交互与学术社会层
   学科专属操作、NPC关系网、跨年剧情链、时代学科影响。 */
(function(root){'use strict';
const E=root.ALS_ENGINE;if(!E)return;
const base={passTurn:E.passTurn,resolveEvent:E.resolveEvent,interact:E.interact,dialogue:E.dialogue,perform:E.perform,designStudy:E.designStudy,researchMethod:E.researchMethod,revise:E.revise,npcSummary:E.npcSummary,worldOutlook:E.worldOutlook,validate:E.validate,create:E.create,importSave:E.importSave,inherit:E.inherit};
const clamp=(v,a=0,b=100)=>Math.min(b,Math.max(a,Number(v)||0));
const round=v=>Math.round((Number(v)||0)*10)/10;
function hash(v){let h=2166136261;for(const c of String(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function roll(s,salt){return (hash(`${s.seed}|${s.branchId}|${s.generation}|${s.turn}|${salt}`)%100000)/100000}
function log(s,title,detail,tone='info'){s.nextId=(s.nextId||0)+1;s.logs.unshift({id:`master-${s.generation}-${s.nextId}`,year:s.year,season:s.season,turn:s.turn,title,detail,tone});if(s.logs.length>420)s.logs.length=420}
function pairKey(a,b){return [String(a),String(b)].sort().join('|')}
const SCHOOLS=['开放方法派','严谨实证派','解释传统派','应用转化派','长期主义派'];
const CORE_PERSONAS={
 'npc-0':{role:'复核主义者',signature:'先让结果经得起别人重做，再谈漂亮故事。',principle:'可复现性高于短期热度',pressure:'担心团队为了抢发牺牲复核',arc:'复核边界'},
 'npc-1':{role:'田野协调者',signature:'一个站点的结论，不能替所有地方说话。',principle:'长期观察与现场关系同样重要',pressure:'试验站资源总是不够',arc:'站点承诺'},
 'npc-2':{role:'锋芒型新星',signature:'问题如果不够大胆，很快就会被别人定义。',principle:'原创窗口值得承担风险',pressure:'害怕被更快的团队抢先',arc:'抢发与信用'},
 'npc-3':{role:'公共解释者',signature:'研究的边界，也应该被非同行听懂。',principle:'影响力不能以牺牲不确定性为代价',pressure:'机构需要更简单的结论',arc:'公众责任'},
 'npc-4':{role:'沉静方法学者',signature:'坏结果不丢掉，方法才有记忆。',principle:'失败记录属于研究资产',pressure:'长期项目很难获得短期评价',arc:'失败档案'},
 'npc-5':{role:'育人型学者',signature:'学生不是你的延长线。',principle:'培养独立研究者而非复制者',pressure:'教学投入常被低估',arc:'学生独立'},
 'npc-6':{role:'产业跨界者',signature:'能落地不代表可以跳过证据边界。',principle:'真实应用必须保留可追溯验证',pressure:'交付节奏持续挤压验证时间',arc:'落地边界'},
 'npc-7':{role:'开放研究者',signature:'共享方法比占有一个结论更长久。',principle:'开放与可持续必须同时成立',pressure:'独立研究长期缺少稳定资金',arc:'开放生存'}
};
const PERSON_ARCS={
 'npc-0':{minTurn:8,stages:[
  {title:'许川递来一份无法复现的日志',lead:'他没有质疑你的能力，只把三次失败运行并排放在桌上。',options:['暂停冲刺，和他逐项复核','先保留主结论，补做关键复现','认为差异来自环境，继续推进']},
  {title:'复核争议进入组会',lead:'几季后，同样的不稳定结果被另一组遇到。许川希望你公开完整失败记录。',options:['公开失败记录与环境配置','只公布能够稳定复现的部分','等论文决定后再公开']},
  {title:'一套方法规范正在形成',lead:'年轻成员开始沿用你们当年的复核清单。许川问，要不要把它做成团队共同规范。',options:['共同署名并公开规范','保留内部使用，持续修订','让学生重新设计一套']}
 ]},
 'npc-1':{minTurn:10,stages:[
  {title:'田遥要求兑现站点承诺',lead:'合作站点已经为你的研究留出窗口，但实验室资金突然变紧。',options:['优先兑现站点承诺','缩小设计但保留长期连续性','把本季资源转给更快出成果的项目']},
  {title:'一位合作农户质疑研究设计',lead:'田遥转来现场反馈：控制条件很干净，却离真实生产越来越远。',options:['增加参与式对照','坚持严格控制并解释原因','拆成严格试验与真实场景两条线']},
  {title:'站点愿意继续合作五年',lead:'长期合作意味着稳定材料，也意味着每年都要承担沟通和回访成本。',options:['签下长期计划','维持逐年协商','把站点交给学生独立维护']}
 ]},
 'npc-2':{minTurn:12,stages:[
  {title:'沈知夏发现竞争组即将抢发',lead:'她建议把还不完整的结果先送出去，占住问题的定义权。',options:['与她一起加速，但保留最低验证线','拒绝抢发，继续完整验证','主动联系竞争组，谈并行发表']},
  {title:'抢发窗口已经关闭',lead:'另一组先公开了相近结果。真正的区别只剩方法边界和证据质量。',options:['转向更难但更扎实的问题','补充独立证据后正面回应','离开这个热点，保存团队精力']},
  {title:'几年后，领域开始回看早期工作',lead:'沈知夏的论文引用很高，你的工作更慢。评议委员会开始讨论谁真正改变了方法。',options:['共同整理领域时间线','强调自己的可靠性贡献','不参与归功争论']}
 ]},
 'npc-3':{minTurn:16,stages:[
  {title:'顾明澈收到一场公开听证邀请',lead:'他希望你一起出席，把复杂结果解释给非同行。',options:['参加并明确不确定性','只提供书面材料','拒绝露面，避免研究被政治化']},
  {title:'一句话被媒体截成了标题',lead:'原本带条件的判断被传播成确定结论。顾明澈建议立即公开完整说明。',options:['联合澄清并放出证据链','私下联系媒体更正','暂不回应，等待热度过去']},
  {title:'公众仍记得那次争议',lead:'几年后的新议题再次找到你们。过去的处理方式影响了今天的信任。',options:['建立长期公众说明规范','只处理本次议题','把沟通交给机构']}
 ]},
 'npc-4':{minTurn:18,stages:[
  {title:'余松禾保存了一整柜失败实验',lead:'这些记录没有发表价值，却揭示了很多“为什么做不成”。',options:['一起整理为失败档案','挑出最有价值的几个案例','认为维护成本太高，暂不接手']},
  {title:'失败档案救下一个新项目',lead:'团队在旧记录里找到了一个曾被忽略的边界条件。',options:['把失败记录纳入正式方法流程','只用于当前项目','让余松禾独立维护']},
  {title:'年轻成员开始主动提交失败记录',lead:'团队文化已经改变，但记录和整理会持续消耗时间。',options:['设立固定复盘制度','每年集中整理一次','只保留影响最大的失败']}
 ]},
 'npc-5':{minTurn:24,stages:[
  {title:'周芮为一名学生争取独立署名',lead:'这会减少你的直接成果，但学生确实已经能够独立承担论证。',options:['支持学生独立署名','共同署名并明确贡献','要求再完成一轮验证']},
  {title:'学生收到外部团队邀请',lead:'离开会削弱你的团队，却可能让学生真正形成自己的方向。',options:['支持离开并提供推荐','争取留下一个合作课题','建议暂缓一年']},
  {title:'学生开始公开反驳你的旧观点',lead:'周芮认为这是培养成功的证据；也有人觉得团队失去统一方向。',options:['公开回应并欢迎反驳','私下讨论后共同写修正文章','不回应，让学术记录自己说话']}
 ]},
 'npc-6':{minTurn:28,stages:[
  {title:'夏阑带来一个真实部署机会',lead:'项目预算充足，但对方要求在一个季度内进入真实环境。',options:['接受，但设不可跳过的验证门槛','先做小规模灰度试用','拒绝过快部署']},
  {title:'真实用户暴露了实验室里没有的边界',lead:'部署数据和论文结果出现偏差。夏阑要求团队选择：修模型还是修主张。',options:['修正主张并公开边界','优先修系统，暂不改论文结论','暂停部署，重新做基准']},
  {title:'产品线准备长期采用这套方法',lead:'商业成功会带来资源，也可能让团队忽略难以量化的问题。',options:['建立长期独立验证机制','把验证嵌入产品团队','退出维护，回到基础研究']}
 ]},
 'npc-7':{minTurn:32,stages:[
  {title:'贺青的开放项目资金只够半年',lead:'所有代码和材料都公开，但持续维护正在消耗个人生活。',options:['共同申请透明资助','把维护任务拆给社区','缩减开放范围以保证生存']},
  {title:'一家公司愿意长期赞助开放项目',lead:'条件是优先支持它们关心的接口。贺青担心项目方向被悄悄改变。',options:['接受并公开利益边界','只接受基础维护资金','拒绝，继续社区筹资']},
  {title:'开放项目已经成为领域基础设施',lead:'现在的问题不是“要不要开放”，而是谁负责长期治理。',options:['建立多方治理委员会','交给大学机构托管','保持小团队自治']}
 ]}
};

function state(s){
 s.flags=s.flags||{};let m=s.flags.masterpiece;
 if(!m||typeof m!=='object')m=s.flags.masterpiece={};
 m.version=3;
 if(!Number.isFinite(m.lastLabTurn))m.lastLabTurn=-99;
 if(!Array.isArray(m.socialEdges))m.socialEdges=[];
 if(!m.arcState||typeof m.arcState!=='object')m.arcState={};
 if(!Array.isArray(m.arcHistory))m.arcHistory=[];
 if(!m.personArcs||typeof m.personArcs!=='object')m.personArcs={};
 if(!Array.isArray(m.personHistory))m.personHistory=[];
 if(!Number.isFinite(m.lastSocialYear))m.lastSocialYear=s.year-1;
 if(!m.playerSchool)m.playerSchool='未定型';
 if(!Array.isArray(m.labHistory))m.labHistory=[];
 initSocial(s,m);return m
}
function initSocial(s,m=state(s)){let people=s.npcs||[];for(let i=0;i<people.length;i++){let n=people[i],cp=CORE_PERSONAS[n.id];
 if(cp){n.corePersona=true;n.coreRole=cp.role;n.signature=cp.signature;n.principle=cp.principle;n.pressure=cp.pressure;n.personalArc=cp.arc;n.goal=cp.principle;}
 if(!n.school)n.school=SCHOOLS[hash(`${s.seed}|school|${n.id}`)%SCHOOLS.length];if(!n.lineageParent){let older=people.filter(x=>x.id!==n.id&&(x.yearBorn||9999)<(n.yearBorn||0)-3);n.lineageParent=older.length?older[hash(`${n.id}|parent`)%older.length].id:'mentor';}}
 const ensure=(a,b,type,weight)=>{let k=pairKey(a,b),x=m.socialEdges.find(e=>e.key===k);if(!x)m.socialEdges.push({key:k,a:String(a),b:String(b),type,weight:clamp(weight),since:s.year,lastYear:s.year});};
 for(let i=0;i<people.length;i++){let a=people[i],b=people[(i+3)%Math.max(1,people.length)];if(b&&a.id!==b.id)ensure(a.id,b.id,(hash(a.id+b.id)%2?'合作':'竞争'),38+(hash(`${a.id}|${b.id}`)%31));if(a.lineageParent)ensure(a.id,a.lineageParent,'师承',48+(hash(`${a.id}|lineage`)%24));for(const id of (a.coauthors||[])){ensure(a.id,id,'合作',62);let x=m.socialEdges.find(e=>e.key===pairKey(a.id,id));if(x){x.type='合作';x.weight=Math.max(x.weight,62);}}for(const id of (a.rivals||[])){ensure(a.id,id,'竞争',58);let x=m.socialEdges.find(e=>e.key===pairKey(a.id,id));if(x){x.type='竞争';x.weight=Math.max(x.weight,58);}}}
 for(const n of people.slice(0,6))ensure('player',n.id,'同行',35);ensure('player','mentor','师承',clamp(s.mentor?.trust||58));return m}
function edge(s,a,b){let m=state(s),k=pairKey(a,b),x=m.socialEdges.find(e=>e.key===k);if(!x){x={key:k,a:String(a),b:String(b),type:'同行',weight:35,since:s.year,lastYear:s.year};m.socialEdges.push(x)}return x}
function touchEdge(s,id,delta,type){let x=edge(s,'player',id);x.weight=clamp(x.weight+delta);if(type)x.type=type;x.lastYear=s.year;return x}
function nameOf(s,id){if(id==='player')return s.player.name;if(id==='mentor')return s.mentor.name;return (s.npcs||[]).find(x=>x.id===id)?.name||'同行'}
function evolveSocial(s){let m=state(s);if(m.lastSocialYear===s.year)return;m.lastSocialYear=s.year;let edges=m.socialEdges;for(const x of edges){let jitter=(roll(s,`edge-${x.key}`)-.5)*5;x.weight=clamp(x.weight+jitter);if(x.type==='竞争'&&x.weight>72)s.world.competition=clamp((s.world.competition||50)+.5);if(x.type==='合作'&&x.weight>75){let a=(s.npcs||[]).find(n=>n.id===x.a),b=(s.npcs||[]).find(n=>n.id===x.b);if(a)a.reputation=clamp((a.reputation||35)+.5);if(b)b.reputation=clamp((b.reputation||35)+.5);}}
 let allies=edges.filter(x=>(x.a==='player'||x.b==='player')&&x.type!=='竞争'&&x.weight>=68),rivals=edges.filter(x=>(x.a==='player'||x.b==='player')&&x.type==='竞争'&&x.weight>=60),p=E.active(s);if(allies.length>=2&&p&&!p.locked){p.verification=clamp(p.verification+1);log(s,'学术关系网产生协同','长期合作关系带来一轮无需额外刷好感的外部复核。','positive');}if(rivals.length>=2&&p&&!p.locked){p.competition=clamp((p.competition||40)+1.2);log(s,'竞争网络形成压力','两组长期竞争关系同时活跃，你的课题需要更快证明独特价值。','warning');}}
function socialGraphSummary(s){let m=state(s),edges=m.socialEdges.slice().sort((a,b)=>b.weight-a.weight),player=edges.filter(x=>x.a==='player'||x.b==='player'),allies=player.filter(x=>x.type!=='竞争'&&x.weight>=58),rivals=player.filter(x=>x.type==='竞争'&&x.weight>=48);return {allies:allies.length,rivals:rivals.length,player:player.slice(0,6).map(x=>({name:nameOf(s,x.a==='player'?x.b:x.a),type:x.type,weight:round(x.weight)})),network:edges.filter(x=>x.a!=='player'&&x.b!=='player').slice(0,6).map(x=>({a:nameOf(s,x.a),b:nameOf(s,x.b),type:x.type,weight:round(x.weight)}))}}
function disciplineClimate(s){let raw=Number(s.world?.market?.[s.discipline]||0),id=s.world?.currentEvent?.id||'';let bonus={engineering:{'industry-pull':2,'replication-wave':1,'open-science':1,'austerity':-1},agriculture:{'public-need':1,'funding-boom':1,'austerity':-1,'replication-wave':1},humanities:{'public-need':2,'open-science':1,'teaching-reform':1,'austerity':-1}}[s.discipline]?.[id]||0;return Math.max(-2,Math.min(3,raw+bonus))}
function labStatus(s){let m=state(s),p=E.active(s),used=m.lastLabTurn===s.turn,climate=disciplineClimate(s);return {used,climate,history:m.labHistory.slice(-4),profile:p?.disciplineProfile||null}}
function requireLab(s){if(s.done)return '本代学术人生已归档';if(s.currentEvent)return '请先处理当前重要事件';if(s.ap<1)return '本季行动点不足';let p=E.active(s);if(!p||p.locked||p.archived)return '当前没有可执行的活动课题';if(state(s).lastLabTurn===s.turn)return '每季只能进行一次学科专属研究操作';return ''}
function spend(s,cost){if(s.funds+1e-9<cost)return false;s.funds=round(s.funds-cost);s.ap--;return true}
function disciplineLab(s,cfg={}){
 state(s);let reason=requireLab(s);if(reason)return {ok:false,reason};
 let p=E.active(s),m=state(s),climate=disciplineClimate(s),note='',cost=0,profile={};
 if(s.discipline==='engineering'){
  let benchmark=String(cfg.benchmark||''),stressTest=String(cfg.stress||''),priority=String(cfg.priority||''),structured=('benchmark' in cfg)||('stress' in cfg)||('priority' in cfg);
  if(structured){
   if(!benchmark||!stressTest||!priority)return {ok:false,reason:'请完整选择基准目标、压力测试和工程优先级'};
   const baseMap={throughput:[4,2,2],robustness:[2,4,2],efficiency:[2,3,4]};
   const stressMap={cross_device:[0,2,1],noise:[1,2,0],low_power:[0,1,2]};
   const priorityMap={accuracy:[2,0,0],stability:[0,2,0],cost:[0,0,2]};
   let b=baseMap[benchmark],x=stressMap[stressTest],z=priorityMap[priority];
   if(!b||!x||!z)return {ok:false,reason:'请完整选择基准目标、压力测试和工程优先级'};
   let performance=clamp(b[0]+x[0]+z[0],1,5),reliability=clamp(b[1]+x[1]+z[1],1,5),efficiency=clamp(b[2]+x[2]+z[2],1,5);
   cost=round(.42*performance+.38*reliability+.24*efficiency);
   if(!spend(s,cost))return {ok:false,reason:`至少需要${cost}万元研究经费`};
   p.progress=clamp(p.progress+performance*1.05+efficiency*.65+climate*.35);
   p.evidence=clamp(p.evidence+performance*.7+reliability*.75);
   p.verification=clamp(p.verification+reliability*1.55+efficiency*.35);
   p.idea=clamp(p.idea+performance*.42+Math.max(0,performance-reliability)*.35);
   let boundary={cross_device:'跨设备',noise:'噪声扰动',low_power:'低功耗'}[stressTest];
   if(priority==='accuracy'&&reliability<=2){p.setbacks=(p.setbacks||0)+1;s.stress=clamp(s.stress+4);p.verification=clamp(p.verification-2);note=`${boundary}压力测试暴露了高性能方案的不稳定边界。`;}
   else if(priority==='stability'&&reliability>=4&&roll(s,'eng-structured')<.42+.04*climate){p.breakthroughs=(p.breakthroughs||0)+1;p.idea=clamp(p.idea+3);note=`${boundary}条件下的稳定性验证暴露出一个可发表的方法改进。`;}
   else if(priority==='cost'&&efficiency>=4){s.funds=round(s.funds+.35);note='资源约束迫使方案简化，一部分后续维护成本被提前省下。';}
   else note=`围绕${{throughput:'性能吞吐',robustness:'鲁棒性',efficiency:'资源效率'}[benchmark]}完成了${boundary}压力测试。`;
   profile={type:'工程验证矩阵',benchmark,stress:stressTest,priority,performance,reliability,efficiency};
  }else{
   let performance=clamp(cfg.a,1,5),reliability=clamp(cfg.b,1,5),efficiency=clamp(cfg.c,1,5),sum=performance+reliability+efficiency;
   if(sum>11)return {ok:false,reason:'性能、可靠性和效率总投入不能超过11'};
   cost=round(.42*performance+.38*reliability+.24*efficiency);if(!spend(s,cost))return {ok:false,reason:`至少需要${cost}万元研究经费`};
   p.progress=clamp(p.progress+performance*1.15+efficiency*.7+climate*.35);p.evidence=clamp(p.evidence+performance*.75+reliability*.7);p.verification=clamp(p.verification+reliability*1.65+efficiency*.35);p.idea=clamp(p.idea+performance*.45+Math.max(0,performance-reliability)*.4);
   if(performance>=5&&reliability<=2){p.setbacks=(p.setbacks||0)+1;s.stress=clamp(s.stress+4);p.verification=clamp(p.verification-2);note='性能冲高但复现不足，出现一次不稳定回退。';}
   else if(reliability>=4&&efficiency>=3&&roll(s,'eng-lab')<.36+.05*climate){p.breakthroughs=(p.breakthroughs||0)+1;p.idea=clamp(p.idea+3);note='均衡设计让一个隐藏瓶颈暴露出来，形成小型突破。';}
   else note='系统权衡形成了一组可比较的性能—可靠性记录。';
   profile={type:'工程验证',performance,reliability,efficiency};
  }
 }else if(s.discipline==='agriculture'){
  let structured=Array.isArray(cfg.sites),sites=structured?[...new Set(cfg.sites.map(String))].filter(x=>['dry','river','hill'].includes(x)):[];
  let repeats=clamp(cfg.repeats||cfg.b,1,3),control=String(cfg.control||'');
  if(!structured){let siteCount=clamp(cfg.a,1,3);sites=['dry','river','hill'].slice(0,siteCount);control=['adaptive','strict','participatory'][Math.max(0,clamp(cfg.c,1,3)-1)]||'adaptive';}
  if(!sites.length)return {ok:false,reason:'至少选择一个田间站点'};
  if(!['strict','adaptive','participatory'].includes(control))return {ok:false,reason:'请选择田间控制方式'};
  let controls={strict:3,adaptive:2,participatory:1}[control],siteCount=sites.length;
  cost=round(.72*siteCount+.45*repeats+.36*controls);
  if(!spend(s,cost))return {ok:false,reason:`田间试验至少需要${cost}万元经费`};
  p.fieldRecords=p.fieldRecords||[];let seasonKey=`${s.year}-${s.season}`,newSeason=!p.fieldRecords.some(x=>x.season===seasonKey);
  let siteNovelty=sites.filter(site=>!p.fieldRecords.some(x=>(x.sites||[]).includes?.(site))).length;
  p.fieldRecords.push({season:seasonKey,sites:sites.slice(),repeats,control});p.fieldRecords=p.fieldRecords.slice(-12);
  p.progress=clamp(p.progress+siteCount*1.25+repeats*.72+climate*.35);
  p.evidence=clamp(p.evidence+siteCount*1.4+repeats*1.05+(newSeason?1.6:0)+siteNovelty*.8);
  p.verification=clamp(p.verification+controls*1.25+repeats*.62+(siteCount>=2?1.2:0));
  p.methodLevel=clamp((p.methodLevel||20)+siteCount+controls);
  let seasonalRisk=(s.season===3||s.season===0)?-.03:.04;
  if(roll(s,'agr-layout')<.13-seasonalRisk-.025*controls){p.setbacks=(p.setbacks||0)+1;p.evidence=clamp(p.evidence-2);s.stress=clamp(s.stress+3);note='环境波动损失了部分样本，但异常记录被保留下来。';}
  else if(control==='participatory'){s.societal=clamp(s.societal+2);s.network=clamp(s.network+1);note='参与式站点让试验更贴近真实生产，也引入了更多需要解释的现场差异。';}
  else if(siteCount>=2&&newSeason)note='跨站点、跨季次记录形成了真正的环境比较。';
  else note='本季布局提高了精度，但单一环境的边际收益开始下降。';
  profile={type:'田间布局',sites:sites.slice(),repeats,control,seasons:new Set(p.fieldRecords.map(x=>x.season)).size};
 }else{
  let structured=Array.isArray(cfg.sources),sources=structured?[...new Set(cfg.sources.map(String))].filter(x=>['archive','press','oral','letters'].includes(x)):[];
  let thesis=String(cfg.thesis||''),counter=String(cfg.counter||''),legacy=!structured;
  if(legacy){
   let count=clamp(cfg.a,1,4);sources=['archive','press','oral','letters'].slice(0,count);
   thesis=['continuity','rupture','network'][Math.max(0,clamp(cfg.c,1,3)-1)]||'continuity';
   counter=clamp(cfg.b,1,5)>=4?'strong':clamp(cfg.b,1,5)>=2?'context':'none';
  }
  if(!sources.length)return {ok:false,reason:'至少选择一种材料来源'};
  if(!['continuity','rupture','network'].includes(thesis))return {ok:false,reason:'请选择一个待检验的解释框架'};
  if(!['strong','context','none'].includes(counter))return {ok:false,reason:'请选择反证处理方式'};
  let sourceCount=sources.length,counterScore={strong:5,context:3,none:1}[counter],framework={continuity:3,rupture:4,network:4}[thesis];
  cost=round(.19*sourceCount+.15*counterScore+.13*framework);
  if(!spend(s,cost))return {ok:false,reason:`本次档案与资料工作至少需要${cost}万元经费`};
  p.progress=clamp(p.progress+sourceCount*.95+framework*.78+climate*.3);
  p.evidence=clamp(p.evidence+sourceCount*1.35+counterScore*.38);
  p.verification=clamp(p.verification+counterScore*1.45+sourceCount*.3);
  p.theory=clamp(p.theory+framework*1.15+counterScore*.32);
  p.writing=clamp(p.writing+framework*.52);
  if(counter==='none'){s.stress=clamp(s.stress+2);p.verification=clamp(p.verification-1.5);note='论点变得更完整，但你暂时没有真正让反例进入论证。';}
  else if(counter==='strong'&&sourceCount>=3&&roll(s,'hum-map')<.38+.04*climate){p.idea=clamp(p.idea+3);p.breakthroughs=(p.breakthroughs||0)+1;note='强反证迫使原有解释改写，新的论证反而更有力量。';}
  else if(thesis==='network')note='不同材料被组织成相互指向的传播关系，论证不再依赖单一文本。';
  else note='材料来源、解释框架与反证位置被明确写进同一条论证链。';
  profile={type:'论证关系图',sources:sources.slice(),thesis,counter};
 }
 p.disciplineProfile=profile;
 m.lastLabTurn=s.turn;m.labHistory.push({turn:s.turn,year:s.year,discipline:s.discipline,cost,climate,note,profile});m.labHistory=m.labHistory.slice(-12);
 log(s,'学科专属研究操作',`${note} 本次投入${cost}万元；当前学科环境修正为${climate>0?'+'+climate:climate}。`,note.includes('不足')||note.includes('损失')||note.includes('暂时没有')?'warning':'positive');
 return {ok:true,message:note,profile};
}
function disciplineProfileText(profile){
 if(!profile)return '尚未形成本课题的专属研究配置';
 const map={
  benchmark:{throughput:'性能吞吐',robustness:'鲁棒性',efficiency:'资源效率'},
  stress:{cross_device:'跨设备',noise:'噪声扰动',low_power:'低功耗'},
  priority:{accuracy:'精度优先',stability:'稳定优先',cost:'成本优先'},
  site:{dry:'旱地站',river:'河谷站',hill:'丘陵站'},
  control:{strict:'严格控制',adaptive:'自适应控制',participatory:'参与式现场'},
  source:{archive:'档案',press:'报刊',oral:'口述',letters:'私人书信'},
  thesis:{continuity:'连续性解释',rupture:'断裂解释',network:'传播网络'},
  counter:{strong:'强反证',context:'情境反例',none:'暂不引入反证'}
 };
 if(profile.type==='工程验证矩阵')return `${map.benchmark[profile.benchmark]} · ${map.stress[profile.stress]} · ${map.priority[profile.priority]}`;
 if(profile.type==='田间布局')return `${(profile.sites||[]).map(x=>map.site[x]||x).join('＋')} · ${profile.repeats}次重复 · ${map.control[profile.control]||profile.control}`;
 if(profile.type==='论证关系图')return `${(profile.sources||[]).map(x=>map.source[x]||x).join('＋')} → ${map.thesis[profile.thesis]||profile.thesis} · ${map.counter[profile.counter]||profile.counter}`;
 return Object.entries(profile).filter(([k])=>k!=='type').map(([k,v])=>`${k}:${Array.isArray(v)?v.join('/') : v}`).join(' · ');
}

function reviewPlan(s,id){
 let sub=(s.submissions||[]).find(x=>x.id===id);if(!sub)return null;
 if(sub.pointResponseRound!==sub.round){sub.pointResponseRound=sub.round;sub.pointResponses={};}
 if(!sub.pointResponses||typeof sub.pointResponses!=='object')sub.pointResponses={};
 return {status:sub.status,round:sub.round,reports:(sub.report||[]).map((r,i)=>({index:i,name:r.name,comment:r.comment,score:r.score,response:sub.pointResponses[i]||''})),ready:(sub.report||[]).length>0&&(sub.report||[]).every((_,i)=>!!sub.pointResponses[i])};
}
function chooseReviewResponse(s,id,index,mode){
 let sub=(s.submissions||[]).find(x=>x.id===id);if(!sub||!['minor','major'].includes(sub.status))return {ok:false,reason:'当前稿件不需要逐条回复'};
 let plan=reviewPlan(s,id),i=Number(index);if(!Number.isInteger(i)||i<0||i>=plan.reports.length)return {ok:false,reason:'审稿意见不存在'};
 if(!['evidence','scope','clarify'].includes(mode))return {ok:false,reason:'回复方式无效'};
 sub.pointResponses[i]=mode;return {ok:true,message:'这一条审稿意见的回应策略已记录。'};
}
function commitReviewResponse(s,id){
 let sub=(s.submissions||[]).find(x=>x.id===id);if(!sub||!['minor','major'].includes(sub.status))return {ok:false,reason:'当前稿件无法提交逐条回复'};
 if(s.done||s.currentEvent)return {ok:false,reason:'请先处理当前重要事件'};if(s.ap<1)return {ok:false,reason:'行动点不足'};
 let p=(s.projects||[]).find(x=>x.id===sub.projectId),plan=reviewPlan(s,id);if(!p)return {ok:false,reason:'找不到原研究课题'};if(!plan.ready)return {ok:false,reason:'请先逐条选择如何回应全部审稿意见'};if(p.locked)return {ok:false,reason:'该课题另有正在审查的稿件'};
 let counts={evidence:0,scope:0,clarify:0};Object.values(sub.pointResponses).forEach(x=>{if(counts[x]!=null)counts[x]++});
 s.ap--;
 if(counts.evidence){p.evidence=clamp(p.evidence+counts.evidence*6);p.verification=clamp(p.verification+counts.evidence*4.5);s.attributes.rigor=clamp(s.attributes.rigor+counts.evidence*.7);s.stress=clamp(s.stress+counts.evidence*1.2);}
 if(counts.scope){p.scope=clamp((p.scope||80)-counts.scope*5);p.theory=clamp(p.theory+counts.scope*1.7);s.insight=clamp(s.insight+counts.scope*.7);}
 if(counts.clarify){p.writing=clamp(p.writing+counts.clarify*8);s.attributes.expression=clamp(s.attributes.expression+counts.clarify*.6);s.stress=clamp(s.stress+counts.clarify*.8);}
 sub.responseHistory=sub.responseHistory||[];sub.responseHistory.push({round:sub.round,responses:{...sub.pointResponses},year:s.year,season:s.season});
 sub.quality=E.quality(s,p);p.locked=true;sub.round++;sub.status='review';let j=(E.JOURNALS||[]).find(x=>x.id===sub.journalId);sub.due=s.turn+(j?.turns||1);sub.pointResponseRound=sub.round;sub.pointResponses={};
 log(s,'逐条回应审稿意见',`《${sub.title}》完成一轮回复：补证据${counts.evidence}条、收窄主张${counts.scope}条、重写阐释${counts.clarify}条。新版本已经送回编辑部。`,'positive');
 return {ok:true,message:'回复信与修订稿已提交，等待下一轮评议。'};
}
const ARC_DEFS={
 credit:{title:'署名次序与真正贡献',lead:'一项合作成果接近成稿。合作者建议按资历排序，但实际贡献并不完全一致。',eligible:s=>s.turn>=18&&s.network>=32,options:['按贡献重新谈署名','接受传统排序，维持关系','公开贡献声明并共同确认'],follow:'几年后，这篇成果的贡献记录再次成为团队讨论的参照。'},
 engrep:{title:'外部团队无法复现你的性能结果',lead:'公开代码后，一支团队报告关键性能无法稳定复现。社区开始等待你的回应。',eligible:s=>s.discipline==='engineering'&&s.turn>=14,options:['公开全部配置并一起排查','先内部复核再回应','缩小论文主张，承认边界'],follow:'复现争议最终留下了比单次排行榜更持久的方法规范。'},
 agrweather:{title:'异常季节打乱长期试验',lead:'天气偏离常年范围，原有田间设计无法直接比较。你只能保存部分样本。',eligible:s=>s.discipline==='agriculture'&&s.turn>=12,options:['追加站点，接受更高成本','保留异常年并调整统计设计','放弃本季，保护长期可比性'],follow:'这个异常季节后来成为研究中最常被讨论的一组材料。'},
 humsource:{title:'关键材料的出处受到质疑',lead:'同行指出一份核心档案的来源链存在空缺。如果处理不当，整套解释都可能被动摇。',eligible:s=>s.discipline==='humanities'&&s.turn>=12,options:['公开来源链与不确定处','坚持现有解释并寻找旁证','暂时撤下核心论点'],follow:'后来研究者评价这项工作时，首先提到的不是结论，而是你当时如何处理证据边界。'},
 student:{title:'学生提出与你不同的解释',lead:'一名学生在组会上提出了能推翻你部分结论的新思路。团队正在观察你会如何回应。',eligible:s=>s.turn>=44&&(s.students||[]).some(x=>x.status==='在读'),options:['让学生独立署名推进','共同验证，但保留明确分工','要求先按原路线完成任务'],follow:'学生后来形成了自己的研究方向，你当年的回应成了师生关系的一部分。'},
 legacy:{title:'前代理论遭遇新的反证',lead:'第二代研究者发现，导师留下的经典解释在新材料下出现裂缝。维护传统和追求证据发生冲突。',eligible:s=>s.generation>=2&&s.turn>=8,options:['优先复核，再决定是否维护前代','公开修正导师理论','暂时为前代辩护，继续搜集材料'],follow:'这一选择决定了学派是变成教条，还是成为可以自我修正的研究传统。'},
 public:{title:'公众希望你给出一个简单答案',lead:'媒体和合作机构希望把仍有不确定性的结果压缩成一句明确结论。传播机会很大，风险也一样。',eligible:s=>s.turn>=28&&(s.societal>=38||s.career==='public'),options:['明确说明不确定性后再传播','给出强结论以争取影响','拒绝采访，只保留学术文本'],follow:'几年后，这次传播成为公众评价你研究风格的重要依据。'},
 institution:{title:'院系希望你接下一项行政任务',lead:'岗位稳定和研究自由发生冲突。委员会认为你“应该为共同体多做一点”。',eligible:s=>s.career==='academic'&&s.turn>=36&&(s.flags?.degree||0)>=2,options:['接下任务，但明确研究时间边界','拒绝行政任务，保护研究周期','以承担任务换取团队资源'],follow:'几年后，院系仍记得你当时如何处理研究自由与共同责任。'},
 industryethics:{title:'产品窗口早于证据成熟',lead:'团队希望尽快把原型推入真实环境，但关键边界尚未完成验证。',eligible:s=>s.career==='industry'&&s.turn>=24,options:['延后交付，补足关键验证','有限发布并公开风险边界','先上线再补证据'],follow:'真实用户的反馈最终检验了你当年的速度—可靠性取舍。'},
 teachingload:{title:'教学任务突然加码',lead:'一门核心课程临时缺人。接受意味着挤压研究，不接受则可能影响团队关系。',eligible:s=>s.career==='teaching'&&s.turn>=28,options:['接下课程并重构为研究型教学','与同事共同承担课程','明确拒绝，保护研究与休息'],follow:'后来学生和同事都记得这次课程危机里你的选择。'},
 publicpressure:{title:'委托方希望删除不确定性说明',lead:'一份公共研究简报即将发布，合作方认为“太多保留意见会削弱传播效果”。',eligible:s=>s.career==='public'&&s.turn>=24,options:['保留全部不确定性说明','改写成分层风险提示','接受删改换取更大传播'],follow:'这份简报后来成为衡量你公共研究可信度的一次案例。'},
 patron:{title:'独立研究迎来一位大额支持者',lead:'资助能够解决数年的资金焦虑，但对方希望你把研究方向靠近其关注议题。',eligible:s=>s.career==='independent'&&s.turn>=24,options:['接受透明资助并公开边界','只接受小额无条件支持','拒绝资助，坚持完全独立'],follow:'几年后，你的独立性和可持续性都受到这次资助选择的影响。'},
 mentorsunset:{title:'导师开始整理退休档案',lead:'导师把一批未发表笔记和未完成问题交给你。接手它们，也意味着背负一段学术历史。',eligible:s=>s.turn>=40&&(s.mentor?.trust||0)>=55,options:['共同整理并公开可复核材料','选择一个未解问题继续研究','只保存档案，不把它变成自己的路线'],follow:'导师退休后，这批档案成为你与前代研究传统关系的真实见证。'}
};
function arc(s,id){let m=state(s);return m.arcState[id]||(m.arcState[id]={stage:0,status:'new',due:0,choice:null})}
function queueArc(s){if(s.currentEvent||s.done)return false;let m=state(s);for(const [id,d] of Object.entries(ARC_DEFS)){let a=arc(s,id);if(a.status==='waiting'&&s.turn>=a.due){s.currentEvent={id:`MASTER|${id}|2`,title:`${d.title} · 后续`,lead:d.follow,options:['继续承担当初选择的后果','调整做法，修正此前不足'],impact:'跨年剧情会记录早期选择，并改变后续人物与研究状态。'};a.status='pending2';return true;}}
 if(s.turn%3!==0)return false;for(const [id,d] of Object.entries(ARC_DEFS)){let a=arc(s,id);if(a.status==='new'&&d.eligible(s)){s.currentEvent={id:`MASTER|${id}|1`,title:d.title,lead:d.lead,options:d.options,impact:'这一选择将在数年后再次出现。'};a.status='pending1';return true;}}return false}
function applyArcChoice(s,id,stage,i){let m=state(s),a=arc(s,id),p=E.active(s),tone='info';if(stage===1){a.choice=i;a.status='waiting';a.due=s.turn+5+(hash(id)%4);if(id==='credit'){if(i===0){s.network=clamp(s.network+1);s.stress=clamp(s.stress+2);touchEdge(s,'mentor',1,'师承')}if(i===1){s.network=clamp(s.network+3);s.insight=clamp(s.insight-1)}if(i===2){s.openness=clamp(s.openness+4);s.network=clamp(s.network+1)}}if(id==='engrep'&&p){if(i===0){p.verification=clamp(p.verification+5);s.openness=clamp(s.openness+3);s.funds=round(Math.max(0,s.funds-1.2))}if(i===1){p.verification=clamp(p.verification+3);s.stress=clamp(s.stress+2)}if(i===2){p.scope=clamp((p.scope||80)-8);p.reliability=clamp((p.reliability||0)+4)}}if(id==='agrweather'&&p){if(i===0){s.funds=round(Math.max(0,s.funds-2.2));p.evidence=clamp(p.evidence+4);p.verification=clamp(p.verification+2)}if(i===1){p.theory=clamp(p.theory+3);p.verification=clamp(p.verification+3)}if(i===2){p.progress=clamp(p.progress-3);s.stress=clamp(s.stress-1)}}if(id==='humsource'&&p){if(i===0){s.openness=clamp(s.openness+4);p.verification=clamp(p.verification+4)}if(i===1){p.evidence=clamp(p.evidence+3);s.stress=clamp(s.stress+2)}if(i===2){p.scope=clamp((p.scope||80)-7);p.theory=clamp(p.theory+2)}}if(id==='student'){let st=(s.students||[]).find(x=>x.status==='在读');if(st){if(i===0){st.autonomy=clamp((st.autonomy||0)+12);s.teaching=clamp(s.teaching+3)}if(i===1){st.growth=clamp((st.growth||0)+6);s.insight=clamp(s.insight+2)}if(i===2){st.autonomy=clamp((st.autonomy||0)-6);s.stress=clamp(s.stress+2)}}}if(id==='legacy'&&p){if(i===0){p.verification=clamp(p.verification+4);s.insight=clamp(s.insight+2)}if(i===1){p.idea=clamp(p.idea+5);s.network=clamp(s.network-1)}if(i===2){s.network=clamp(s.network+2);p.competition=clamp((p.competition||40)+3)}}if(id==='public'){if(i===0){s.societal=clamp(s.societal+4);s.openness=clamp(s.openness+2)}if(i===1){s.societal=clamp(s.societal+8);s.integrity=clamp(s.integrity-4);s.stress=clamp(s.stress+3);tone='warning'}if(i===2){s.societal=clamp(s.societal-1);s.integrity=clamp(s.integrity+1)}}if(id==='institution'){if(i===0){s.teaching=clamp(s.teaching+3);s.stress=clamp(s.stress+2);s.network=clamp(s.network+1)}if(i===1){s.insight=clamp(s.insight+2);s.network=clamp(s.network-2);if(p)p.progress=clamp(p.progress+3)}if(i===2){s.teaching=clamp(s.teaching+2);s.funds=round(s.funds+1.5);s.stress=clamp(s.stress+3)}}if(id==='industryethics'){if(i===0){if(p)p.verification=clamp(p.verification+5);s.stress=clamp(s.stress+2)}if(i===1){s.societal=clamp(s.societal+4);s.openness=clamp(s.openness+3);if(p)p.progress=clamp(p.progress+2)}if(i===2){s.societal=clamp(s.societal+7);s.integrity=clamp(s.integrity-5);s.stress=clamp(s.stress+4);tone='warning'}}if(id==='teachingload'){if(i===0){s.teaching=clamp(s.teaching+6);s.attributes.expression=clamp(s.attributes.expression+2);s.stress=clamp(s.stress+4)}if(i===1){s.teaching=clamp(s.teaching+3);s.network=clamp(s.network+3);s.stress=clamp(s.stress+2)}if(i===2){s.health=clamp(s.health+2);s.network=clamp(s.network-2);if(p)p.progress=clamp(p.progress+3)}}if(id==='publicpressure'){if(i===0){s.integrity=clamp(s.integrity+2);s.openness=clamp(s.openness+3);s.societal=clamp(s.societal+2)}if(i===1){s.societal=clamp(s.societal+5);s.attributes.expression=clamp(s.attributes.expression+1)}if(i===2){s.societal=clamp(s.societal+8);s.integrity=clamp(s.integrity-6);tone='warning'}}if(id==='patron'){if(i===0){s.funds=round(s.funds+5);s.openness=clamp(s.openness+3);s.network=clamp(s.network+2)}if(i===1){s.funds=round(s.funds+2.5);s.insight=clamp(s.insight+1)}if(i===2){s.integrity=clamp(s.integrity+1);s.stress=clamp(s.stress+2)}}if(id==='mentorsunset'){if(i===0){s.openness=clamp(s.openness+4);s.network=clamp(s.network+2);touchEdge(s,'mentor',4,'师承')}if(i===1){s.insight=clamp(s.insight+4);if(p)p.idea=clamp(p.idea+3);touchEdge(s,'mentor',2,'师承')}if(i===2){s.stress=clamp(s.stress-1);s.openness=clamp(s.openness+1)}}log(s,'跨年抉择｜'+ARC_DEFS[id].title,`你选择了「${ARC_DEFS[id].options[i]}」。这件事不会在本季结束，它会在之后几年再次产生后果。`,tone);}else{a.status='done';if(i===0){s.insight=clamp(s.insight+2);s.network=clamp(s.network+1);if(p)p.verification=clamp(p.verification+1.5);}else{s.stress=clamp(s.stress+1);s.openness=clamp(s.openness+1);if(p)p.theory=clamp(p.theory+1.5);}m.arcHistory.push({id,choice:a.choice,follow:i,year:s.year});log(s,'跨年事件收束｜'+ARC_DEFS[id].title,'早年的决定已经沉淀为研究习惯、人物记忆与学术评价的一部分。','positive');}s.currentEvent=null;return {ok:true,message:'这一选择已写入长期学术史。'}}
function resolveMaster(s,index){let raw=s.currentEvent?.id||'',parts=raw.split('|'),id=parts[1],stage=Number(parts[2]),d=ARC_DEFS[id],i=Number(index);if(!d||![1,2].includes(stage)||!Number.isInteger(i)||i<0||i>=(stage===1?d.options.length:2))return {ok:false,reason:'无法处理这条长期事件'};return applyArcChoice(s,id,stage,i)}

function personArcState(s,id){
 let m=state(s),d=PERSON_ARCS[id];
 if(!d)return null;
 let x=m.personArcs[id];
 if(!x||typeof x!=='object')x=m.personArcs[id]={stage:0,status:'waiting',due:d.minTurn+(hash(`${s.seed}|${id}|arc`)%5),choices:[]};
 if(!Array.isArray(x.choices))x.choices=[];
 if(!Number.isFinite(x.stage))x.stage=0;
 if(!Number.isFinite(x.due))x.due=d.minTurn;
 return x;
}
function queuePersonArc(s){
 if(s.currentEvent||s.done)return false;
 for(const id of Object.keys(PERSON_ARCS)){
  let d=PERSON_ARCS[id],n=(s.npcs||[]).find(x=>x.id===id),x=personArcState(s,id);
  if(!n||n.status==='退休'||x.status==='done'||x.status==='pending'||s.turn<x.due)continue;
  let st=d.stages[x.stage];if(!st){x.status='done';continue;}
  let rel=s.flags?.relations?.[id];if(x.stage>0&&rel&&(rel.bond||0)<18){x.due=s.turn+4;continue;}
  s.currentEvent={id:`PERSON|${id}|${x.stage}`,title:st.title,lead:st.lead,options:st.options,impact:'这段关系会继续发展，并留下可以回看的共同经历。'};
  x.status='pending';return true;
 }
 return false;
}
function personArcEffect(s,id,stage,i){
 let n=(s.npcs||[]).find(x=>x.id===id),r=s.flags?.relations?.[id],p=E.active(s);
 if(r){
  if(i===0){r.bond=clamp((r.bond||0)+5);r.cooperation=clamp((r.cooperation||0)+5);r.dispute=clamp((r.dispute||0)-1);}
  if(i===1){r.bond=clamp((r.bond||0)+2);r.cooperation=clamp((r.cooperation||0)+2);r.dispute=clamp((r.dispute||0)+1);}
  if(i===2){r.bond=clamp((r.bond||0)-1);r.cooperation=clamp((r.cooperation||0)-1);r.dispute=clamp((r.dispute||0)+4);}
  r.memory=(r.memory||[]).slice(-7);r.memory.push({turn:s.turn,kind:'personal-arc',stage,choice:i});
 }
 if(n){n.morale=clamp((n.morale||55)+(i===0?3:i===1?1:-1));n.careerMomentum=clamp((n.careerMomentum||50)+(i===0?2:i===1?1:0));}
 if(id==='npc-0'&&p){p.verification=clamp(p.verification+(i===0?4:i===1?2:-1));s.attributes.rigor=clamp(s.attributes.rigor+(i===0?1.2:.4));if(stage===1&&i===0)s.openness=clamp(s.openness+2);}
 if(id==='npc-1'&&p){p.evidence=clamp(p.evidence+(i===0?4:i===1?2:-1));if(i===0)s.funds=round(Math.max(0,s.funds-1.2));if(stage===1&&i===0)s.societal=clamp(s.societal+2);}
 if(id==='npc-2'&&p){p.idea=clamp(p.idea+(i===0?3:i===1?2:1));p.competition=clamp((p.competition||40)+(i===0?3:i===1?1:-2));s.stress=clamp(s.stress+(i===0?2:i===1?1:-1));}
 if(id==='npc-3'){s.societal=clamp(s.societal+(i===0?4:i===1?2:-1));s.openness=clamp(s.openness+(i===0?2:i===1?1:0));if(i===2)s.integrity=clamp(s.integrity-1);}
 if(id==='npc-4'&&p){p.verification=clamp(p.verification+(i===0?3:i===1?2:0));p.methodLevel=clamp((p.methodLevel||20)+(i===0?3:i===1?1:0));if(i===0)s.insight=clamp(s.insight+2);}
 if(id==='npc-5'){s.teaching=clamp(s.teaching+(i===0?4:i===1?2:0));let st=(s.students||[]).find(x=>x.status==='在读');if(st)st.autonomy=clamp((st.autonomy||40)+(i===0?6:i===1?3:-2));}
 if(id==='npc-6'&&p){if(i===0){p.verification=clamp(p.verification+3);s.funds=round(s.funds+1.2)}if(i===1){s.societal=clamp(s.societal+3);s.funds=round(s.funds+2)}if(i===2){p.progress=clamp(p.progress-1);s.integrity=clamp(s.integrity+1);}}
 if(id==='npc-7'){s.openness=clamp(s.openness+(i===0?4:i===1?2:-1));s.network=clamp(s.network+(i===0?2:i===1?3:0));if(i===0)s.funds=round(s.funds+1);}
}
function resolvePersonArc(s,index){
 let raw=s.currentEvent?.id||'',parts=raw.split('|'),id=parts[1],stage=Number(parts[2]),d=PERSON_ARCS[id],i=Number(index),x=d&&personArcState(s,id);
 if(!d||!x||stage!==x.stage||!Number.isInteger(i)||i<0||i>=d.stages[stage].options.length)return {ok:false,reason:'这段人物经历已经发生变化'};
 let choice=d.stages[stage].options[i];personArcEffect(s,id,stage,i);x.choices.push(i);x.stage++;x.status=x.stage>=d.stages.length?'done':'waiting';x.due=s.turn+5+(hash(`${id}|${stage}|${s.branchId}`)%4);
 let n=(s.npcs||[]).find(z=>z.id===id),m=state(s);
 if(x.status==='done'){
  let rel=s.flags?.relations?.[id],relation=(rel?.cooperation||0)>=55?'长期合作者':(rel?.dispute||0)>=45?'长期论争者':'重要同行';
  if(n){n.personalOutcome=relation;n.currentActivity=`与你完成「${CORE_PERSONAS[id]?.arc||'共同经历'}」的长期回顾`;}
  touchEdge(s,id,(rel?.cooperation||0)>=55?7:(rel?.dispute||0)>=45?-2:3,(rel?.dispute||0)>=45?'竞争':'合作');
  m.personHistory.push({id,year:s.year,choices:x.choices.slice(),outcome:relation});
  log(s,`人物长线收束｜${n?.name||'同行'}`,`多年之后，「${CORE_PERSONAS[id]?.arc||'这段经历'}」成为你们关系里真正留下来的共同记忆。如今你们是${relation}。`,'positive');
 }else{
  if(n)n.currentActivity=`与你共同经历「${d.stages[stage].title}」后的后续变化`;
  log(s,`人物纪事｜${n?.name||'同行'}`,`你选择了「${choice}」。这件事还没有结束。`,i===2?'warning':'info');
 }
 s.currentEvent=null;return {ok:true,message:x.status==='done'?'这段人物经历已经写入学术年鉴。':'这段关系将在之后几年继续发展。'};
}
function corePersonSummary(s,id){
 let cp=CORE_PERSONAS[id],n=(s.npcs||[]).find(x=>x.id===id);if(!cp||!n)return null;
 let x=personArcState(s,id),d=PERSON_ARCS[id],next=x?.status==='done'?'共同经历已收束':x?.stage<d.stages.length?d.stages[x.stage].title:'共同经历已收束';
 return {role:cp.role,signature:cp.signature,principle:cp.principle,pressure:cp.pressure,arc:cp.arc,arcStage:x?.stage||0,arcDone:x?.status==='done',next,outcome:n.personalOutcome||''};
}

function interactionDelta(kind){return {discuss:[3,'同行'],help:[6,'合作'],negotiate:[4,'合作'],debate:[-3,'竞争']}[kind]||[1,'同行']}
function playerSchool(s){let m=state(s),open=s.openness||0,rigor=s.attributes?.rigor||0,soc=s.societal||0;if(open>=72)m.playerSchool='开放方法派';else if(rigor>=72)m.playerSchool='严谨实证派';else if(soc>=65)m.playerSchool='应用转化派';else if(s.discipline==='humanities'&&(s.insight||0)>=62)m.playerSchool='解释传统派';else m.playerSchool='长期主义派';return m.playerSchool}

function rebalanceLiquidity(s){if(!E.releaseState)return;let r=E.releaseState(s),rank=s.flags?.rank||0,students=(s.students||[]).filter(x=>x.status==='在读').length,projects=(s.projects||[]).filter(x=>!x.archived).length,route={academic:0,industry:8,teaching:1,public:3,independent:5}[s.career]||0,target=18+rank*4+students*2.2+Math.max(0,projects-1)*2+route;if(s.funds>target+16){let reserve=round((s.funds-target)*.42);s.funds=round(Math.max(target,s.funds-reserve));r.infrastructure=clamp((r.infrastructure||0)+reserve*1.25);if(r.routeScores?.[s.career]!=null)r.routeScores[s.career]=clamp(r.routeScores[s.career]+reserve*.12);log(s,'研究经费转入长期资产',`${reserve}万元被转入设备、资料、人员合同和后续项目保障。成熟团队不能把全部项目预算当成可随时支出的现金。`,'info');}}

/* wrappers */
E.create=function(opts){let s=base.create(opts);state(s);playerSchool(s);return s};
E.importSave=function(raw){let s=base.importSave(raw);state(s);playerSchool(s);return s};
E.inherit=function(s,id,style){let r=base.inherit(s,id,style);if(r.ok){state(r.state);playerSchool(r.state);}return r};
E.interact=function(s,id,kind){state(s);let r=base.interact(s,id,kind);if(r.ok){let [d,t]=interactionDelta(kind);touchEdge(s,id,d,t);playerSchool(s);}return r};
/* 人物对话内部会调用 E.interact；关系网由 interact 统一记录，避免一次对话重复计分。 */
E.perform=function(s,a){state(s);let r=base.perform(s,a);if(r.ok&&['read','investigate','analyse','verify','write'].includes(a)){let c=disciplineClimate(s),p=E.active(s);if(p&&c!==0){p.progress=clamp(p.progress+c*.12);if(c>0&&a==='verify')p.verification=clamp(p.verification+c*.15);if(c<0&&a==='investigate')s.stress=clamp(s.stress+.25);}}return r};
E.resolveEvent=function(s,index){if(s.currentEvent?.id?.startsWith('PERSON|'))return resolvePersonArc(s,index);if(s.currentEvent?.id?.startsWith('MASTER|'))return resolveMaster(s,index);let r=base.resolveEvent(s,index);if(r?.ok&&!s.currentEvent){if(!queuePersonArc(s))queueArc(s);}return r};
E.passTurn=function(s){state(s);let oldYear=s.year,r=base.passTurn(s);if(!r.ok)return r;state(s);if(s.year!==oldYear){evolveSocial(s);rebalanceLiquidity(s);}playerSchool(s);if(!queuePersonArc(s))queueArc(s);return r};
E.validate=function(s){state(s);let out=base.validate(s)||[],m=state(s);if(m.socialEdges.some(x=>!Number.isFinite(x.weight)||x.weight<0||x.weight>100))out.push('学术关系网权重异常');if(m.lastLabTurn>s.turn)out.push('学科研究操作时间异常');for(const [id,x] of Object.entries(m.personArcs||{})){if(!PERSON_ARCS[id])out.push('未知人物长线');else if(!Number.isFinite(x.stage)||x.stage<0||x.stage>PERSON_ARCS[id].stages.length)out.push('人物长线阶段异常');else if(!Array.isArray(x.choices))out.push('人物长线记录异常');}return out};
if(base.npcSummary)E.npcSummary=function(s,id){let x=base.npcSummary(s,id);if(!x)return x;let n=(s.npcs||[]).find(a=>a.id===id),core=corePersonSummary(s,id);return {...x,school:n?.school||'未定学派',lineage:nameOf(s,n?.lineageParent||'mentor'),core}};
if(base.worldOutlook)E.worldOutlook=function(s){let x=base.worldOutlook(s);return {...x,disciplineOpportunity:disciplineClimate(s),disciplineName:E.DISC[s.discipline]?.short||'本学科'};};
E.disciplineLab=disciplineLab;E.disciplineLabStatus=labStatus;E.disciplineProfileText=disciplineProfileText;E.reviewPlan=reviewPlan;E.chooseReviewResponse=chooseReviewResponse;E.commitReviewResponse=commitReviewResponse;E.socialGraphSummary=socialGraphSummary;E.playerSchool=playerSchool;E.disciplineClimate=disciplineClimate;E.masterpieceState=state;E.corePersonSummary=corePersonSummary;E.PERSON_ARCS=PERSON_ARCS;
})(window);
