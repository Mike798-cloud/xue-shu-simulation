/* 学术人生 · 成熟玩法层：季度策略 / 非行动点决策 / 研究风险 / 人物性格 / 岗位压力 / 多周目兼容 */
(function(root){'use strict';
const E=root.ALS_ENGINE;
const clamp=(x,a=0,b=100)=>Math.min(b,Math.max(a,Math.round((+x||0)*10)/10));
const round=x=>Math.round((+x||0)*10)/10;
const base={
 create:E.create,import:E.importSave,pass:E.passTurn,resolve:E.resolveEvent,perform:E.perform,
 interact:E.interact,dialogue:E.dialogue,method:E.researchMethod,design:E.designStudy,respond:E.respondWork,
 revise:E.revise,degree:E.applyDegree,rank:E.applyRank,recruit:E.recruit,inherit:E.inherit,retire:E.retire,validate:E.validate
};
const STRATEGIES={
 balanced:{name:'稳中求进',icon:'衡',desc:'没有额外偏科，适合观察局势。',hint:'稳定，不额外增加压力。'},
 discovery:{name:'押注突破',icon:'破',desc:'分析与探索更容易出现新意，但高强度科研增加压力。',hint:'创新收益↑，压力↑。'},
 rigor:{name:'证据优先',icon:'证',desc:'复核、方法与可靠性更强，推进速度稍慢。',hint:'可靠性↑，速度略慢。'},
 relations:{name:'经营关系',icon:'交',desc:'人物互动与合作回报更高，但科研爆发较少。',hint:'关系收益↑。'},
 recovery:{name:'修整蓄力',icon:'息',desc:'休养收益明显增强，科研产出略低。',hint:'健康恢复↑，研究速度↓。'},
 career:{name:'冲刺履历',icon:'评',desc:'写作、基金与教学表现更集中，适合答辩或评审前。',hint:'履历收益↑，压力↑。'}
};
const NPC_TYPES=[
 {id:'method',name:'方法主义者',likes:['discuss','debate'],hates:['help'],desc:'尊重证据与清晰论证，对空泛寒暄反应一般。'},
 {id:'resource',name:'资源协调者',likes:['negotiate','help'],hates:['debate'],desc:'重视交换与履约，合作条件谈清楚比情绪更重要。'},
 {id:'competitive',name:'锋芒竞争者',likes:['debate','negotiate'],hates:['help'],desc:'欣赏有实力的对手，也会抢占相近研究方向。'},
 {id:'warm',name:'共同体型学者',likes:['help','discuss'],hates:['debate'],desc:'愿意长期合作，但很在意团队中的公平和尊重。'}
];
const INBOX=[
 {id:'equipment',title:'共享设备排期撞车',lead:'关键设备只剩一个时段，你和另一组都想使用。',options:[
  ['付费加开夜间时段',{funds:-1.2,stress:3,progress:5}],['和对方协商轮换',{network:2,progress:2,verification:2}],['改用低成本替代方案',{funds:.2,progress:-1,insight:2}]
 ]},
 {id:'conference',title:'一封临时会议邀请',lead:'一场小型学术会议邀请你汇报尚未成熟的工作。',options:[
  ['自费参会并公开讨论',{funds:-1.0,network:4,stress:2,openness:2}],['只提交海报，控制暴露范围',{funds:-.4,network:2,writing:2}],['婉拒，继续完成证据',{verification:2,stress:-1}]
 ]},
 {id:'data',title:'同行请求共享研究材料',lead:'对方希望拿到一部分原始材料进行比较研究。',options:[
  ['连同方法说明一起开放',{network:3,openness:4,stress:1}],['签订边界清晰的有限共享',{network:2,verification:2}],['暂时拒绝，先保护未发表工作',{insight:1,network:-1}]
 ]},
 {id:'weekend',title:'连续数周没有真正休息',lead:'周末到了。实验、朋友和睡眠都在争夺同一段时间。',options:[
  ['彻底休息一天',{health:4,stress:-6}],['整理研究笔记再休息',{insight:2,stress:-2,writing:1}],['继续赶进度',{progress:4,stress:5,health:-2}]
 ]},
 {id:'seminar',title:'组会上的尖锐质疑',lead:'一位同行当众指出你的结论可能超出证据范围。',options:[
  ['承认边界并约定复核',{verification:3,integrity:1,network:1}],['现场用证据回应',{theory:2,stress:2}],['回避争论，之后再处理',{stress:-1,network:-1}]
 ]},
 {id:'family',title:'生活安排与研究期限冲突',lead:'现实生活里出现了一件不能完全忽视的事情。',options:[
  ['暂缓研究处理生活',{health:3,stress:-4,progress:-2}],['重新安排时间，两边都顾',{stress:2,execution:1}],['继续冲刺研究期限',{progress:3,stress:5,health:-1}]
 ]}
];
const MATURE_EVENTS={
 burnout:{title:'身体发出明确警告',lead:'连续高压工作后，你已经无法靠意志维持原来的节奏。',options:['申请一个季度的主动减负','向导师或团队求助，重新分工','继续硬撑，赌这段时间能熬过去']},
 contract:{title:'岗位年度考核亮起黄灯',lead:'院系认为你这一周期的代表性贡献不足。继续原路线并非一定安全。',options:['暂缓晋升，集中完成代表作','主动承担教学与共同体工作','寻找新的机构或职业路线']},
 scoop:{title:'相近成果被同行抢先公开',lead:'竞争团队先一步发表了与你相近的结果。你的原稿仍有价值，但必须重新定义贡献。',options:['补充复核，突出可靠性差异','立刻转向未解决的细分问题','联系对方，讨论联合延伸研究']},
 grant:{title:'连续基金失利后的选择',lead:'几次未中标让研究预算开始吃紧。你需要改变申请策略。',options:['缩小研究规模，先做扎实先期结果','联合申请，用一部分独立性换资源','继续押注高风险大项目']},
 student:{title:'学生想脱离你的研究框架',lead:'你指导的学生希望独立开展一个与你观点不同的课题。',options:['支持独立发展，并保留讨论关系','要求先完成团队既定任务','共同设计一个既独立又可衔接的计划']},
 health:{title:'身体已经不能按原计划工作',lead:'长时间透支后，医生明确建议你降低负荷。继续硬撑不会只是多一点压力。',options:['接受一个季度的医疗休整','缩减工作并把部分任务交给同伴','仍按原计划推进，承担进一步恶化风险']}
};
function h(salt){let x=2166136261;for(const c of String(salt)){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x>>>0}
function roll(s,salt){return (h([s.seed,s.generation,s.turn,s.year,salt].join('|'))%10000)/10000}
function log(s,title,detail,tone='info'){
 s.nextId=(s.nextId||0)+1;s.logs.unshift({id:'mature-'+s.generation+'-'+s.nextId,year:s.year,season:s.season,turn:s.turn,title,detail,tone});
 if(s.logs.length>420)s.logs.length=420;
}
function project(s){return E.active(s)}
function applyPatch(s,p={}){let q=project(s);for(const [k,v] of Object.entries(p)){
  if(k==='funds')s.funds=Math.max(0,round(s.funds+v));
  else if(k==='stress')s.stress=clamp(s.stress+v);
  else if(k==='health')s.health=clamp(s.health+v);
  else if(k==='network'){let dv=v>0?v*Math.max(.28,1-s.network/125):v;s.network=clamp(s.network+dv);}
  else if(k==='openness')s.openness=clamp(s.openness+v);
  else if(k==='integrity')s.integrity=clamp(s.integrity+v);
  else if(k==='insight')s.insight=clamp(s.insight+v);
  else if(k==='teaching'){let dv=v>0?v*Math.max(.30,1-s.teaching/120):v;s.teaching=clamp(s.teaching+dv);}
  else if(k==='execution')s.attributes.execution=clamp(s.attributes.execution+v);
  else if(k==='expression')s.attributes.expression=clamp(s.attributes.expression+v);
  else if(k==='rigor')s.attributes.rigor=clamp(s.attributes.rigor+v);
  else if(k==='creativity')s.attributes.creativity=clamp(s.attributes.creativity+v);
  else if(q&&['progress','evidence','verification','theory','writing','idea'].includes(k))q[k]=clamp(q[k]+v);
 }}
function init(s){if(!s||!s.player)return s;s.flags=s.flags||{};let m=s.flags.mature;
 if(!m||typeof m!=='object')m=s.flags.mature={};
 if(!Number.isFinite(m.morale))m.morale=64;
 if(!Number.isFinite(m.burnout))m.burnout=0;
 if(!Number.isFinite(m.jobSecurity))m.jobSecurity=62;
 if(!Number.isFinite(m.grantFailures))m.grantFailures=0;
 if(!Number.isFinite(m.lastContractReview))m.lastContractReview=-100;
 if(!Number.isFinite(m.lastHealthCrisis))m.lastHealthCrisis=-100;
 if(!Array.isArray(m.delayed))m.delayed=[];
 if(!Array.isArray(m.milestones))m.milestones=[];
 if(!m.term||m.term.turn!==s.turn)m.term={turn:s.turn,strategy:'balanced',locked:false,afterHours:false,inbox:null,inboxResolved:false,personDecision:null,personResolved:false,actions:{research:0,social:0,career:0,rest:0,teaching:0},promise:null,preSettled:false};
 if(typeof m.term.personResolved!=='boolean')m.term.personResolved=false;
 if(typeof m.term.preSettled!=='boolean')m.term.preSettled=false;
 for(const n of s.npcs||[]){let r=s.flags.relations?.[n.id];if(!r)continue;if(!r.persona){let t=NPC_TYPES[h(n.id+'|'+s.seed)%NPC_TYPES.length];r.persona=t.id;r.favor=Number.isFinite(r.favor)?r.favor:0;r.memory=r.memory||[];}if(!Number.isFinite(n.careerLevel))n.careerLevel=Math.min(4,Math.max(0,Math.floor((s.year-(n.yearBorn||1998)-25)/7)));}
 let mr=s.flags.relations?.mentor;if(mr&&!mr.persona){mr.persona=s.mentor.style.includes('严谨')?'method':s.mentor.style.includes('团队')?'warm':'resource';mr.favor=mr.favor||0;mr.memory=mr.memory||[];}
 for(const p of s.projects||[]){if(!Number.isFinite(p.competition))p.competition=clamp((s.world?.competition||50)*.55+25);if(!Number.isFinite(p.setbacks))p.setbacks=0;if(!Number.isFinite(p.breakthroughs))p.breakthroughs=0;if(!Number.isFinite(p.lastRiskTurn))p.lastRiskTurn=-100;}
 return s;
}
function term(s){init(s);return s.flags.mature.term}
function setStrategy(s,id){let t=term(s);if(!STRATEGIES[id])return {ok:false,reason:'未知季度策略'};if(t.locked||s.ap<actionCapacity(s))return {ok:false,reason:'本季已有行动，策略只能在季度开始时确定'};t.strategy=id;return {ok:true,message:'本季策略改为「'+STRATEGIES[id].name+'」。'};}
function choosePromise(s,id){let t=term(s);if(t.locked||s.ap<actionCapacity(s))return {ok:false,reason:'季度承诺必须在开始行动前确定'};if(t.promise)return {ok:false,reason:'本季承诺已经确定'};if(!['research','relations','recovery','career'].includes(id))return {ok:false,reason:'未知承诺'};t.promise=id;return {ok:true,message:'本季承诺已记录，季度结束时会根据实际行动结算。'};}
function actionCat(action){if(['read','investigate','analyse','verify','write'].includes(action))return 'research';if(['collab'].includes(action))return 'social';if(['grant'].includes(action))return 'career';if(['teach','mentorship'].includes(action))return 'teaching';if(action==='rest')return 'rest';return null;}
function record(s,cat){let t=term(s);t.locked=true;if(cat)t.actions[cat]=(t.actions[cat]||0)+1;}
function strategyAfterAction(s,action){let t=term(s),q=project(s),id=t.strategy;
 if(id==='discovery'&&q&&['investigate','analyse'].includes(action)){q.idea=clamp(q.idea+2);q.theory=clamp(q.theory+1);s.stress=clamp(s.stress+1.5)}
 if(id==='rigor'&&q&&['read','verify'].includes(action)){q.verification=clamp(q.verification+2);q.evidence=clamp(q.evidence+1);if(action==='read')q.progress=clamp(q.progress-1)}
 if(id==='relations'&&action==='collab'){s.network=clamp(s.network+2);s.stress=clamp(s.stress-1)}
 if(id==='recovery'){if(action==='rest'){s.health=clamp(s.health+3);s.stress=clamp(s.stress-3)}else if(q&&['investigate','analyse','verify','write'].includes(action))q.progress=clamp(q.progress-1)}
 if(id==='career'&&['write','grant','teach'].includes(action)){s.attributes.expression=clamp(s.attributes.expression+.7);s.stress=clamp(s.stress+1)}
}
function ensureInbox(s){let t=term(s);if(t.inbox||t.inboxResolved||s.done)return;if(s.turn===0||s.turn%2!==0)return;let ix=h(s.seed+'|inbox|'+s.generation+'|'+s.turn)%INBOX.length;t.inbox=INBOX[ix].id;}
function inboxData(s){ensureInbox(s);let t=term(s);return t.inbox?INBOX.find(x=>x.id===t.inbox):null;}
function resolveInbox(s,index){let t=term(s),d=inboxData(s),i=Number(index);if(!d)return {ok:false,reason:'本季没有待处理来信'};if(t.inboxResolved)return {ok:false,reason:'本季来信已经处理'};if(!Number.isInteger(i)||i<0||i>=d.options.length)return {ok:false,reason:'无效选择'};let [label,patch]=d.options[i];applyPatch(s,patch);t.inboxResolved=true;t.inbox=null;t.inboxChoice={id:d.id,index:i,label};mature(s).delayed.push({due:s.turn+4,type:'inbox',title:d.title,label});log(s,'本季来信｜'+d.title,'你选择了「'+label+'」。它不会占用行动点，但后果会留在之后的季度。',i===2?'warning':'info');return {ok:true,message:'来信已处理：'+label};}

function ensurePersonDecision(s){let t=term(s);if(t.personDecision||t.personResolved||s.done||s.turn<5||s.turn%4!==1)return;let ids=['mentor',...(s.npcs||[]).map(x=>x.id)];if(!ids.length)return;let id=ids[h(s.seed+'|person-letter|'+s.generation+'|'+s.turn)%ids.length],rel=relationState(s,id);if(!rel)return;let npc=id==='mentor'?{name:s.mentor.name}:((s.npcs||[]).find(x=>x.id===id)||{name:'同行'});let options;
 if(rel.persona.id==='method')options=[['把原始材料和方法表发给对方',{verification:3,stress:1},3,2],['约一次方法争论，只讨论证据',{theory:2,insight:2,stress:2},1,1],['礼貌拒绝，优先完成自己的工作',{progress:2,network:-1},-1,0]];
 else if(rel.persona.id==='resource')options=[['接受联合申请，明确资源和署名边界',{funds:1.4,network:2,stress:2},2,4],['只交换一项设备时段',{verification:2,funds:.4},1,2],['保持独立，不进入这次合作',{insight:1,network:-1},-1,0]];
 else if(rel.persona.id==='competitive')options=[['接受公开讨论，用结果说话',{idea:2,theory:2,stress:3},0,1],['提出交叉复核，把竞争变成可比较的研究',{verification:3,network:1,stress:1},2,3],['不跟进，让对方先走自己的路线',{progress:1,network:-1,stress:-1},-1,0]];
 else options=[['一起组织小型读书会或学生讨论',{teaching:3,network:2,stress:1},4,3],['帮对方完成一次共同体工作',{network:2,stress:2},3,2],['这季度实在忙，诚实说明并延期',{stress:-1},0,0]];
 t.personDecision={id,npcName:npc.name,persona:rel.persona.name,state:rel.state,options,title:`${npc.name}主动联系了你`,lead:`${npc.name}（${rel.persona.name}）发来消息。你们目前是「${rel.state}」，这次回应会影响以后是否愿意与你共享机会。`};}
function personDecisionData(s){ensurePersonDecision(s);return term(s).personDecision;}
function resolvePersonDecision(s,index){let t=term(s),d=personDecisionData(s),i=Number(index);if(!d)return {ok:false,reason:'本季没有待回应的人物消息'};if(t.personResolved)return {ok:false,reason:'本季人物消息已经处理'};if(!Number.isInteger(i)||i<0||i>=d.options.length)return {ok:false,reason:'无效选择'};let [label,patch,bond,coop]=d.options[i];applyPatch(s,patch);let raw=s.flags.relations?.[d.id];if(raw){raw.bond=clamp((raw.bond||0)+bond);raw.cooperation=clamp((raw.cooperation||0)+coop);if(i===2&&bond<0)raw.dispute=clamp((raw.dispute||0)+2);raw.memory=(raw.memory||[]).slice(-6);raw.memory.push({turn:s.turn,kind:'主动来信',choice:i});}if(d.id==='mentor'&&raw)s.mentor.trust=clamp(s.mentor.trust+bond*.4);t.personResolved=true;t.personDecision=null;t.personChoice={id:d.id,index:i,label};mature(s).delayed.push({due:s.turn+6,type:'person-decision',title:d.title,label,id:d.id,index:i});log(s,'人物来信｜'+d.npcName,`你回应：「${label}」。人物关系不只是一条好感值，这次选择会进入后续合作记忆。`,i===2?'warning':'info');return {ok:true,message:'已回应 '+d.npcName+'：'+label};}
function afterHours(s,id){let t=term(s);if(t.afterHours)return {ok:false,reason:'本季余暇已经安排'};if(s.ap>1)return {ok:false,reason:'行动点接近耗尽后才能安排季末余暇'};if(!['sleep','journal','dinner'].includes(id))return {ok:false,reason:'未知余暇安排'};
 if(id==='sleep')applyPatch(s,{stress:-4,health:2});
 if(id==='journal')applyPatch(s,{insight:2,writing:1,stress:1});
 if(id==='dinner'){if(s.funds<.3)return {ok:false,reason:'经费不足，无法承担本次聚会开支'};applyPatch(s,{funds:-.3,network:2,stress:-1});}
 t.afterHours=id;log(s,'季末余暇',id==='sleep'?'你决定提前休息，让身体真正停下来。':id==='journal'?'你留下了一页研究反思，把失败和疑问写清楚。':'你参加了一次小范围聚会，学术关系也需要真实相处。','positive');return {ok:true,message:'季末余暇已安排。'};}
function promiseResult(s){let t=term(s),id=t.promise;if(!id)return;let a=t.actions,ok=id==='research'?a.research>=3:id==='relations'?a.social>=1:id==='recovery'?a.rest>=2:id==='career'?(a.career+a.teaching)>=2:false;
 if(ok){if(id==='research')applyPatch(s,{insight:2});if(id==='relations')applyPatch(s,{network:2});if(id==='recovery')applyPatch(s,{health:2,stress:-2});if(id==='career')applyPatch(s,{expression:1,teaching:1});mature(s).morale=clamp(mature(s).morale+1.5);log(s,'季度承诺完成','你兑现了季度开始时给自己的承诺。','positive');}
 else {mature(s).morale=clamp(mature(s).morale-2);log(s,'季度承诺未完成','计划没有完全兑现。没有额外惩罚，但你的心气受到一点影响。','warning');}}
function researchRisk(s){let q=project(s),t=term(s);if(!q||q.locked||q.archived||q.lastRiskTurn===s.turn)return;q.lastRiskTurn=s.turn;let plan=s.flags.plans?.[q.id]||'unset',research=t.actions.research||0;
 q.competition=clamp(q.competition+(s.world?.competition-50)*.025+Math.max(0,research-2)*.4);
 if(research<2)return;
 if(plan==='bold'){
  let r=roll(s,'bold-'+q.id);if(r<.15&&q.verification>=18){q.idea=clamp(q.idea+7);q.theory=clamp(q.theory+6);q.breakthroughs++;applyPatch(s,{stress:3,insight:2});log(s,'意外突破｜'+q.title,'高风险路线得到一条真正有价值的异常线索。创新提高，但后续仍需验证。','positive');}
  else if(r>.86){q.progress=clamp(q.progress-5);q.evidence=clamp(q.evidence-4);q.setbacks++;applyPatch(s,{stress:6});log(s,'研究受挫｜'+q.title,'大胆方案没有得到预期证据，部分工作需要重做。','warning');}
 }
 if(plan==='rush'&&q.writing>=45&&q.verification<28&&roll(s,'rush-'+q.id)<.24){q.scope=clamp(q.scope-6);q.setbacks++;applyPatch(s,{stress:4});log(s,'快速路线暴露薄弱环节','稿件推进很快，但复核不足已经开始限制主张范围。','warning');}
 if(plan==='rigor'&&q.verification>=25&&roll(s,'rigor-'+q.id)<.18){q.evidence=clamp(q.evidence+4);q.progress=clamp(q.progress+2);log(s,'稳健复核获得回报','一项原本不起眼的复核结果让研究更可靠。','positive');}
 if(q.competition>=72&&q.outputIds.length===0&&(s.year-q.startYear)>=3&&roll(s,'scoop-'+q.id)<.16&&!s.currentEvent){queueEvent(s,'scoop',{projectId:q.id});q.competition=clamp(q.competition-12);}
}
function mature(s){init(s);return s.flags.mature}
function actionCapacity(s){init(s);let m=mature(s);return (s.health<30||m.burnout>=70)?4:6;}
function updateBurnout(s){let m=mature(s),a=term(s).actions;let overload=(a.research||0)+(a.career||0)+(a.teaching||0);
 if(s.stress>=75)m.burnout=clamp(m.burnout+5+Math.max(0,overload-3)*2);else if(s.stress<=45)m.burnout=clamp(m.burnout-5-(a.rest||0)*2);else m.burnout=clamp(m.burnout-(a.rest||0)*2+1);
 if(s.health<45)m.burnout=clamp(m.burnout+4);if((a.rest||0)>0)m.morale=clamp(m.morale+1);if(s.stress>80)m.morale=clamp(m.morale-3);if(s.health<35)m.morale=clamp(m.morale-2);
 if(m.burnout>=70){log(s,'过劳警报','长期疲惫正在压缩你的有效时间。下一季最多只能稳定安排4点行动，除非先恢复。','warning');}
 if(m.burnout>=88&&!s.currentEvent)queueEvent(s,'burnout');
 if(s.health<=18&&s.turn-m.lastHealthCrisis>=8&&!s.currentEvent){m.lastHealthCrisis=s.turn;queueEvent(s,'health');}
}
function updateJobSecurity(s){let m=mature(s);if((s.flags.degree||0)<2||s.career!=='academic'||s.turn<32)return;if(s.turn-m.lastContractReview<8)return;m.lastContractReview=s.turn;
 let recent=s.papers.filter(p=>s.year-p.year<=3),quality=recent.reduce((a,p)=>a+(p.quality||0),0)/Math.max(1,recent.length),score=quality*.35+E.reputation(s)*.35+s.teaching*.15+s.network*.15-(s.stress>80?8:0);
 if(score>=55)m.jobSecurity=clamp(m.jobSecurity+9);else if(score>=45)m.jobSecurity=clamp(m.jobSecurity+2);else m.jobSecurity=clamp(m.jobSecurity-14);
 log(s,'岗位年度考核',`本周期综合评价 ${round(score)}；岗位稳定度 ${round(m.jobSecurity)}。${score<45?'院系要求你在下一个考核周期拿出更清晰的代表性贡献。':'当前岗位总体稳定。'}`,score<45?'warning':'info');
 if(m.jobSecurity<=28&&!s.currentEvent)queueEvent(s,'contract');
}
function maybeGrantCrisis(s){let m=mature(s);if(m.grantFailures>=3&&s.funds<8&&!s.currentEvent){queueEvent(s,'grant');m.grantFailures=0;}}
function maybeStudentEvent(s){if(!s.currentEvent&&s.students?.some(x=>x.status==='在读'&&x.autonomy>=65)&&s.turn>=40&&roll(s,'student-event')<.12)queueEvent(s,'student');}
function queueEvent(s,type,data={}){let d=MATURE_EVENTS[type];if(!d||s.currentEvent)return false;s.currentEvent={id:'MATURE-'+type,title:d.title,lead:d.lead,options:d.options,impact:'决定会沿着研究、关系或职业安全继续发酵。',meta:data};return true;}
function resolveMature(s,index){let e=s.currentEvent,type=e?.id?.slice(7),i=Number(index),d=MATURE_EVENTS[type];if(!d||!Number.isInteger(i)||i<0||i>=d.options.length)return {ok:false,reason:'无效事件选择'};let q=project(s),m=mature(s),tone='info';
 if(type==='burnout'){
  if(i===0){applyPatch(s,{health:14,stress:-20,progress:-3});m.burnout=clamp(m.burnout-30);m.morale=clamp(m.morale+4)}
  if(i===1){applyPatch(s,{network:2,stress:-11});m.burnout=clamp(m.burnout-18);if(q)q.progress=clamp(q.progress+1)}
  if(i===2){applyPatch(s,{progress:5,stress:8,health:-8});m.burnout=clamp(m.burnout+8);tone='warning'}
 }
 if(type==='contract'){
  if(i===0){m.jobSecurity=clamp(m.jobSecurity+6);applyPatch(s,{stress:4});if(q){q.writing=clamp(q.writing+5);q.progress=clamp(q.progress+3)}}
  if(i===1){m.jobSecurity=clamp(m.jobSecurity+9);applyPatch(s,{teaching:6,stress:2});}
  if(i===2){m.jobSecurity=clamp(m.jobSecurity+3);applyPatch(s,{network:5,stress:3});s.flags.mature.externalSearch=true;}
 }
 if(type==='scoop'){
  if(i===0){if(q){q.verification=clamp(q.verification+9);q.idea=clamp(q.idea-2)}applyPatch(s,{stress:3})}
  if(i===1){if(q){q.idea=clamp(q.idea+5);q.progress=clamp(q.progress-5);q.scope=clamp(q.scope-5)}applyPatch(s,{insight:3,stress:5})}
  if(i===2){applyPatch(s,{network:5,stress:2});if(q)q.verification=clamp(q.verification+3)}
 }
 if(type==='grant'){
  if(i===0){if(q){q.scope=clamp(q.scope-9);q.verification=clamp(q.verification+3)}applyPatch(s,{stress:-2})}
  if(i===1){applyPatch(s,{network:5,funds:2,openness:2});}
  if(i===2){if(q)q.idea=clamp(q.idea+5);applyPatch(s,{stress:6});m.grantFailures=1;tone='warning'}
 }
 if(type==='health'){
  if(i===0){applyPatch(s,{health:28,stress:-22,progress:-5});m.burnout=clamp(m.burnout-35);m.morale=clamp(m.morale+3)}
  if(i===1){applyPatch(s,{health:17,stress:-12,network:1,progress:-2});m.burnout=clamp(m.burnout-22)}
  if(i===2){applyPatch(s,{health:-9,stress:8,progress:4});m.burnout=clamp(m.burnout+12);m.morale=clamp(m.morale-5);tone='warning'}
 }
 if(type==='student'){
  let st=s.students.find(x=>x.status==='在读');if(st){if(i===0){st.autonomy=clamp(st.autonomy+12);st.growth=clamp(st.growth+4);applyPatch(s,{teaching:3})}if(i===1){st.autonomy=clamp(st.autonomy-7);st.growth=clamp(st.growth+1);applyPatch(s,{stress:2})}if(i===2){st.autonomy=clamp(st.autonomy+6);st.growth=clamp(st.growth+6);applyPatch(s,{stress:1})}}
 }
 log(s,'关键抉择｜'+d.title,'你选择了「'+d.options[i]+'」。这一决定会进入个人年鉴。',tone);m.delayed.push({due:s.turn+5,type:'mature-event',event:type,index:i});s.currentEvent=null;return {ok:true,message:'决定已记录，后果会继续发展。'};}
function delayed(s){let m=mature(s),remain=[];for(const x of m.delayed){if(x.due>s.turn){remain.push(x);continue}if(x.type==='inbox')log(s,'旧日安排的回声',`关于「${x.title}」的选择已经成为实验室里默认的合作方式。`,'info');else if(x.type==='person-decision'){let raw=s.flags.relations?.[x.id];if(raw&&x.index!==2){raw.cooperation=clamp((raw.cooperation||0)+1);log(s,'人物关系的后续',`几季前的回应「${x.label}」被对方再次提起。一次合作不会立刻改变人生，但持续履约会累积信任。`,'positive');}else log(s,'人物关系的后续',`你当时选择「${x.label}」。这段关系暂时没有进一步推进。`,'info');}else if(x.type==='mature-event'){
  if(x.event==='contract'&&x.index===2)applyPatch(s,{network:2});
  if(x.event==='scoop'&&x.index===1&&project(s))project(s).idea=clamp(project(s).idea+2);
  if(x.event==='student'&&x.index===0)applyPatch(s,{teaching:2});
  log(s,'长期后果显现','几个季度前的关键决定开始影响今天的资源、关系或研究方向。',x.index===2?'warning':'positive');
 }}m.delayed=remain;}
function relationState(s,id){init(s);let r=s.flags.relations?.[id];if(!r)return null;let t=NPC_TYPES.find(x=>x.id===r.persona)||NPC_TYPES[0];let state=r.dispute>=45?'公开竞争':r.bond>=72&&r.cooperation>=55?'长期盟友':r.cooperation>=45?'合作伙伴':r.bond<32?'疏远':'普通同行';return {...r,persona:t,state};}
function deadlines(s){init(s);let out=[],d=E.degreeStatus(s),r=E.rankStatus(s),q=project(s),m=mature(s);if(!d.done)out.push({tone:d.qualified?'good':'warn',title:d.title,text:d.qualified?'条件已满足，可以主动申请。':`常规期限：第${d.due/4}学年；不会自动毕业。`});else if(!r.max)out.push({tone:r.eligible?'good':'info',title:'岗位评审',text:r.eligible?`可申请${r.next}，本期预计${r.places}个岗位。`:`继续准备${r.next}的代表性材料。`});if(!q&&!s.done)out.push({tone:'warn',title:'没有当前课题',text:'研究行动无法继续，请在研究卷宗中建立或重新打开一个问题。'});if(q&&q.competition>=65)out.push({tone:'warn',title:'竞争升温',text:`当前课题竞争压力 ${Math.round(q.competition)}，拖延可能损失原创优势。`});if(s.stress>=72||m.burnout>=60)out.push({tone:'danger',title:'身心负荷',text:`压力${Math.round(s.stress)} · 过劳${Math.round(m.burnout)}，继续冲刺会压缩下一季有效行动。`});if(s.submissions.some(x=>['major','minor','rejected'].includes(x.status)))out.push({tone:'warn',title:'稿件待处理',text:'存在审稿决定尚未回应。'});return out.slice(0,4);}
/* ---- wrappers ---- */
E.create=function(opts){let s=base.create(opts);init(s);ensureInbox(s);return s;};
E.importSave=function(raw){let s=base.import(raw);init(s);ensureInbox(s);return s;};
E.perform=function(s,a){init(s);let before=s.papers.length,r=base.perform(s,a);if(!r.ok)return r;record(s,actionCat(a));strategyAfterAction(s,a);let m=mature(s),q=project(s);if(m.morale<25&&q&&['read','investigate','analyse','verify','write'].includes(a)){q.progress=clamp(q.progress-1);s.stress=clamp(s.stress+1);r.message+=' 低落的心气让这次工作格外吃力。';}if(a==='grant'){if(/未中标/.test(r.message||''))m.grantFailures++;else if(/获资助/.test(r.message||''))m.grantFailures=0;}if(a==='rest')m.burnout=clamp(m.burnout-5);return r;};
E.interact=function(s,id,kind){init(s);let r=base.interact(s,id,kind);if(!r.ok)return r;record(s,'social');let rel=relationState(s,id);if(rel){if(rel.persona.likes.includes(kind)){rel.bond=clamp(rel.bond+2);rel.cooperation=clamp(rel.cooperation+2)}if(rel.persona.hates.includes(kind)){rel.dispute=clamp(rel.dispute+3);rel.bond=clamp(rel.bond-1)}let raw=s.flags.relations[id];raw.bond=rel.bond;raw.cooperation=rel.cooperation;raw.dispute=rel.dispute;raw.memory=(raw.memory||[]).slice(-5);raw.memory.push({turn:s.turn,kind});}return r;};
if(base.dialogue)E.dialogue=function(s,id,topic,opt){init(s);let r=base.dialogue(s,id,topic,opt);if(r.ok)record(s,'social');return r;};
if(base.method)E.researchMethod=function(s,a){init(s);let r=base.method(s,a);if(r.ok){record(s,'research');strategyAfterAction(s,'verify')}return r;};
if(base.design)E.designStudy=function(s,a,b,c){init(s);let r=base.design(s,a,b,c);if(r.ok){record(s,'research');let q=project(s);if(q&&term(s).strategy==='discovery'){q.idea=clamp(q.idea+2);s.stress=clamp(s.stress+1)}}return r;};
if(base.respond)E.respondWork=function(s,id,mode){init(s);let r=base.respond(s,id,mode);if(r.ok)record(s,'research');return r;};
E.revise=function(s,id,mode){init(s);let r=base.revise(s,id,mode);if(r.ok)record(s,'research');return r;};
E.applyDegree=function(s){init(s);let before=s.flags.degree,r=base.degree(s);if(r.ok){record(s,'career');if(s.flags.degree>before){mature(s).morale=clamp(mature(s).morale+9);mature(s).milestones.push({turn:s.turn,type:'degree',title:(s.flags.degree===1?'硕士':'博士')+'学位答辩通过'});}}return r;};
E.applyRank=function(s,mode){init(s);let before=s.flags.rank,r=base.rank(s,mode);if(r.ok){record(s,'career');if(s.flags.rank>before){mature(s).morale=clamp(mature(s).morale+7);mature(s).jobSecurity=clamp(mature(s).jobSecurity+12);mature(s).milestones.push({turn:s.turn,type:'rank',title:'岗位评审通过 · '+s.position});}else mature(s).morale=clamp(mature(s).morale-3);}return r;};
E.recruit=function(s){init(s);let r=base.recruit(s);if(r.ok)record(s,'teaching');return r;};
E.retire=function(s){init(s);return base.retire(s);};
E.inherit=function(s,id,style){let r=base.inherit(s,id,style);if(r.ok){init(r.state);r.state.flags.mature.morale=66;r.state.flags.mature.burnout=0;r.state.flags.mature.jobSecurity=60;ensureInbox(r.state)}return r;};
E.resolveEvent=function(s,i){if(s.currentEvent?.id?.startsWith('MATURE-'))return resolveMature(s,i);return base.resolve(s,i);};
E.passTurn=function(s){init(s);ensureInbox(s);ensurePersonDecision(s);let t=term(s);if(t.inbox&&!t.inboxResolved)return {ok:false,reason:'还有一封本季重要来信未处理。可以选择任一回应，包括暂缓或拒绝。'};if(t.personDecision&&!t.personResolved)return {ok:false,reason:'还有一条人物消息等待回应。任何选项都可以，包括婉拒。'};if(!t.preSettled){promiseResult(s);researchRisk(s);updateBurnout(s);maybeGrantCrisis(s);t.preSettled=true;}if(s.currentEvent)return {ok:false,reason:'季度结算前出现新的重要事件，请先处理。'};let beforePapers=s.papers.length,beforeAwards=s.awards.length,r=base.pass(s);if(!r.ok)return r;init(s);let mm=mature(s);s.ap=Math.min(s.ap,actionCapacity(s));mm.morale=clamp(mm.morale+(68-mm.morale)*.08-(s.stress>=72?1:0));delayed(s);if(s.papers.length>beforePapers){mature(s).morale=clamp(mature(s).morale+5);mature(s).milestones.push({turn:s.turn,type:'paper',title:'新的正式成果被接收'});}if(s.awards.length>beforeAwards){mature(s).morale=clamp(mature(s).morale+4);mature(s).milestones.push({turn:s.turn,type:'award',title:'获得荣誉 · '+s.awards[s.awards.length-1]});}mature(s).milestones=mature(s).milestones.slice(-12);updateJobSecurity(s);maybeStudentEvent(s);ensureInbox(s);ensurePersonDecision(s);return r;};
E.validate=function(s){init(s);let p=base.validate(s)||[],m=mature(s);if(m.burnout<0||m.burnout>100)p.push('过劳值越界');if(m.morale<0||m.morale>100)p.push('心气值越界');if(m.jobSecurity<0||m.jobSecurity>100)p.push('岗位稳定度越界');if(!STRATEGIES[term(s).strategy])p.push('季度策略无效');return p;};
E.setTermStrategy=setStrategy;E.chooseTermPromise=choosePromise;E.resolveInbox=resolveInbox;E.afterHours=afterHours;E.inboxData=inboxData;E.personDecisionData=personDecisionData;E.resolvePersonDecision=resolvePersonDecision;E.deadlines=deadlines;E.relationState=relationState;E.termState=term;E.matureState=mature;E.actionCapacity=actionCapacity;E.STRATEGIES=STRATEGIES;E.NPC_TYPES=NPC_TYPES;
})(window);
