/* 整合版扩展：来自前期版本的独立方法验证、同行学术世界、知识回应与二周目研究遗产；保持卷宗版原有职业/界面规则 */
(function(root){'use strict';
const E=root.ALS_ENGINE;
const base={create:E.create,load:E.importSave,turn:E.passTurn,select:E.selectProject,inherit:E.inherit,ready:E.ready,submit:E.submit,validate:E.validate,career:E.changeCareer};
const clamp=(n,lo=0,hi=100)=>Math.min(hi,Math.max(lo,n));
const info={engineering:[['bench','完成对照基准','确定适当基线与评估指标'],['replication','完成独立复现','在不同环境重做测试']],agriculture:[['station','补充田间站点','收集来自独立地点的材料'],['season','跨季节复验','需要在不同季节行动']],humanities:[['source','核查独立史料','独立来源而非重复抄录'],['counter','寻找反向证据','专门挑战自己原有解释']]};
function log(s,title,detail,tone='info'){
 s.nextId=(s.nextId||0)+1;
 s.logs.unshift({id:'mix-'+s.generation+'-'+s.nextId,year:s.year,season:s.season,turn:s.turn,title,detail,tone});
 if(s.logs.length>420)s.logs.length=420;
}
function init(s){
 if(!s||!Array.isArray(s.projects))return s;
 if(!s.flags||typeof s.flags!=='object')s.flags={};
 if(!Array.isArray(s.worldWorks))s.worldWorks=[];
 if(!Array.isArray(s.worldLinks))s.worldLinks=[];
 if(!Array.isArray(s.flags.researchEchoes))s.flags.researchEchoes=[];
 if(!s.flags.extraArcs||typeof s.flags.extraArcs!=='object')s.flags.extraArcs={};
 for(const p of s.projects){
   if(!p.methods){const oldReady=p.progress>=50&&p.evidence>=32&&p.writing>=50&&p.verification>=20;
     p.methods={benchmark:0,replicate:0,stations:[],seasons:[],sources:0,counter:0,grandfathered:oldReady};}
   if(!Array.isArray(p.methods.stations))p.methods.stations=Array.isArray(p.methods.fieldSites)?p.methods.fieldSites.slice():[];
   if(!Array.isArray(p.methods.seasons))p.methods.seasons=Array.isArray(p.methods.fieldSeasons)?p.methods.fieldSeasons.slice():[];
   if(!Number.isFinite(p.methods.benchmark))p.methods.benchmark=0;
   if(!Number.isFinite(p.methods.replicate))p.methods.replicate=0;
   if(!Number.isFinite(p.methods.sources))p.methods.sources=0;
   if(!Number.isFinite(p.methods.counter))p.methods.counter=0;
   for(const field of ['stations','seasons'])if(!Array.isArray(p.methods[field]))p.methods[field]=[];
   if(!Array.isArray(p.workResponses))p.workResponses=[];
 }
 for(const n of s.npcs||[]){if(!Array.isArray(n.researchHistory))n.researchHistory=[];
   if(!Number.isFinite(n.lastWorldWork))n.lastWorldWork=-100;
 }
 return s;
}
function methodReady(s,p){init(s);if(!p)return false;const m=p.methods;if(m.grandfathered)return true;
 if(s.discipline==='engineering')return m.benchmark>=1&&m.replicate>=1;
 if(s.discipline==='agriculture')return m.stations.length>=2&&m.seasons.length>=2;
 return m.sources>=2&&m.counter>=1;
}
function methodProgress(s,p){init(s);if(!p)return [];
 const m=p.methods;
 if(s.discipline==='engineering')return [['基准测试',m.benchmark,1],['独立复现',m.replicate,1]];
 if(s.discipline==='agriculture')return [['独立站点',m.stations.length,2],['不同季节',m.seasons.length,2]];
 return [['独立史料',m.sources,2],['反证论证',m.counter,1]];
}
function researchMethod(s,action){init(s);let p=E.active(s);
 if(s.done||s.currentEvent)return {ok:false,reason:'请先处理当前事件'};
 if(!p||p.locked||p.archived)return {ok:false,reason:'请先选择可用的、未锁定的课题'};
 if(!(info[s.discipline]||[]).some(x=>x[0]===action))return {ok:false,reason:'此研究方法不适用当前学科'};
 if(s.ap<1)return {ok:false,reason:'本季行动点不足'};
 const m=p.methods;let cost=s.discipline==='agriculture'?1.8:s.discipline==='engineering'?1.2:0.7;
 if(s.funds<cost)return {ok:false,reason:`本操作需要${cost}万元，请先争取经费`};
 if(action==='bench'&&m.benchmark>=1||action==='replication'&&m.replicate>=1||action==='station'&&m.stations.length>=2||action==='source'&&m.sources>=2||action==='counter'&&m.counter>=1)return {ok:false,reason:'该项基础研究核验已经满足，不可反复刷取'};
 if(action==='season'&&m.seasons.includes(s.season))return {ok:false,reason:'本季度已采集过该季次，需要等待其他季节'};
 s.ap--;s.funds=Math.round((s.funds-cost)*10)/10;
 let desc='';
 if(action==='bench'){m.benchmark=1;p.evidence=clamp(p.evidence+7);p.progress=clamp(p.progress+5);desc='完成与既有方法的同条件基准比较';}
 if(action==='replication'){m.replicate=1;p.verification=clamp(p.verification+10);p.evidence=clamp(p.evidence+5);desc='独立环境重做了关键结论';}
 if(action==='station'){m.stations.push('站点'+(m.stations.length+1));p.evidence=clamp(p.evidence+6);p.verification=clamp(p.verification+3);desc='新增独立试验站点';}
 if(action==='season'){m.seasons.push(s.season);p.verification=clamp(p.verification+8);p.evidence=clamp(p.evidence+5);desc='记录一个此前尚未覆盖的季节数据';}
 if(action==='source'){m.sources++;p.evidence=clamp(p.evidence+7);p.theory=clamp(p.theory+3);desc='考证了具有不同出处的文献证据';}
 if(action==='counter'){m.counter=1;p.verification=clamp(p.verification+9);p.theory=clamp(p.theory+5);desc='主动检验与自身论点相冲突的材料';}
 s.stress=clamp(s.stress+2);
 log(s,'学科方法核验｜'+p.title,desc+'；已留下不可重复使用的核验记录。','positive');
 return {ok:true,message:desc};
}
function generateWorld(s){init(s);if(s.turn%4!==0||s.done)return;
 const npcs=s.npcs||[];if(!npcs.length)return;
 const year=s.year;
 for(let j=0;j<Math.min(3,npcs.length);j++){
   const n=npcs[(Math.floor(year/2)+j*3+s.generation)%npcs.length];
   if(n.lastWorldWork>=s.turn-4)continue;
   const rnd=((s.rng>>>0)+s.turn*1237+j*1163)>>>0;
   if(rnd%4===0)continue;
   let topics=E.TOPICS[s.discipline];let ix=(rnd>>>5)%topics.length;
   const title=topics[ix][0];
   s.nextId=(s.nextId||0)+1;
   const w={id:'world-'+s.generation+'-'+s.nextId,npcId:n.id,author:n.name,title:title+'：'+['独立证据','方法辨析','研究进展','争议复核'][(rnd>>>9)%4],topic:title,year,turn:s.turn,method:['系统对照','严谨复核','应用验证','开放讨论'][(rnd>>>13)%4],rigor:45+(rnd%38),impact:26+((rnd>>>7)%55)};
   s.worldWorks.push(w);n.lastWorldWork=s.turn;n.papers=(n.papers||0)+1;n.researchHistory.push(w.id);
   if(s.worldWorks.length>120)s.worldWorks.shift();
   if(s.turn%8===0)log(s,'学界新发表｜'+n.name,`《${w.title}》：${w.method}。可在人物卷宗中选择复现、反驳或借鉴。`);
 }
}
function respondWork(s,id,mode){init(s);if(s.done||s.currentEvent)return {ok:false,reason:'请先处理当前事件'};
 if(!['replicate','challenge','extend'].includes(mode))return {ok:false,reason:'回应类型无效'};
 const w=s.worldWorks.find(z=>z.id===id),p=E.active(s);if(!w||!p||p.locked||p.archived)return {ok:false,reason:'需要有效同行成果和可用课题'};
 if(s.ap<1)return {ok:false,reason:'本季行动点不足'};
 const key=id+':'+mode;
 if(p.workResponses.includes(key))return {ok:false,reason:'此课题已进行同类回应，不可重复刷取'};
 const cost=mode==='replicate'?0.9:0.3;
 if(s.funds<cost)return {ok:false,reason:'经费不足'};
 s.ap--;s.funds=Math.max(0,Math.round((s.funds-cost)*10)/10);p.workResponses.push(key);
 let related=p.title===w.topic||p.title===w.title.split('：')[0];
 const n=s.npcs.find(x=>x.id===w.npcId),delta=related?1:.55;
 if(mode==='replicate'){p.verification=clamp(p.verification+Math.round(12*delta));p.evidence=clamp(p.evidence+Math.round(7*delta));if(n)n.trust=clamp(n.trust+4)}
 if(mode==='challenge'){p.theory=clamp(p.theory+Math.round(12*delta));p.scope=clamp(p.scope-4);s.insight=clamp(s.insight+3);if(n)n.trust=clamp(n.trust-4)}
 if(mode==='extend'){p.progress=clamp(p.progress+Math.round(12*delta));p.idea=clamp(p.idea+3);s.network=clamp(s.network+3);if(n)n.trust=clamp(n.trust+2)}
 s.worldLinks.push({workId:id,questionId:p.id,mode,year:s.year});
 log(s,'回应同行论文',`你对${w.author}的《${w.title}》开展了${mode==='replicate'?'独立复现':mode==='challenge'?'证据反驳':'方法延伸'}。该关系将保留在学术档案。`,'positive');
 return {ok:true,message:'已形成实际科研回应，影响课题与同行关系。'};
}
const arcs=[
 {id:'open',turn:15,title:'开放数据还是独占研究材料',lead:'一位同行提出共享数据，希望共同发表；但这可能让竞争者提前知道你的思路。',options:['公开数据与方法','仅向指定团队开放','暂时保密，继续独立推进'],follow:'先前的材料开放方式影响了领域对你工作的信任。'},
 {id:'pressure',turn:27,title:'毕业与重大突破的两难',lead:'研究进展与毕业期限发生冲突。导师建议缩小主张，但你可能失去突破空间。',options:['缩小主张，保住时间','继续深挖，承担延期风险','合作分担问题，分享成果'],follow:'毕业季的那个抉择逐渐显现长期后果。'},
 {id:'team',turn:49,title:'科研团队的署名争议',lead:'一位年轻合作者认为其贡献被低估，要求重新核查作者排序。',options:['按贡献记录调整署名','保持原安排并正式解释','请第三方调解'],follow:'团队记住了你面对署名争议的处理方式。'}
];
function arcTurn(s){init(s);
 for(const item of s.flags.researchEchoes.filter(z=>z.due<=s.turn)){
   const x=arcs.find(z=>z.id===item.id);if(!x)continue;
   if(item.choice===0){s.openness=clamp(s.openness+2);s.network=clamp(s.network+2)}
   if(item.choice===1){s.insight=clamp(s.insight+3);s.stress=clamp(s.stress+2)}
   if(item.choice===2){s.stress=clamp(s.stress-2);s.network=clamp(s.network+2)}
   log(s,'旧日选择的回响',x.follow);
 }
 s.flags.researchEchoes=s.flags.researchEchoes.filter(z=>z.due>s.turn);
 if(s.currentEvent)return;
 for(const x of arcs)if(s.turn>=x.turn&&!s.flags.extraArcs[x.id]&&s.turn<=x.turn+3){
   s.currentEvent={id:'MERGE-'+x.id,title:x.title,lead:x.lead,options:x.options};
   s.flags.extraArcs[x.id]='进行中';return;
 }
}
function resolveArc(s,i){const e=s.currentEvent;
 if(!e||!e.id.startsWith('MERGE-'))return {ok:false,reason:'没有对应事件'};
 const a=arcs.find(x=>'MERGE-'+x.id===e.id);if(!a||!Number.isInteger(i)||i<0||i>=a.options.length)return {ok:false,reason:'无效选项'};
 if(i===0){s.network=clamp(s.network+4);s.stress=clamp(s.stress+4);s.openness=clamp(s.openness+3)}
 else if(i===1){s.insight=clamp(s.insight+3);s.stress=clamp(s.stress+5)}
 else {s.network=clamp(s.network+2);s.mentor.trust=clamp(s.mentor.trust+2);s.stress=clamp(s.stress-2)}
 s.flags.extraArcs[a.id]=true;s.flags.researchEchoes.push({id:a.id,choice:i,due:s.turn+6});
 log(s,'关键抉择｜'+a.title,`你选择了「${a.options[i]}」，影响将在未来继续显现。`);
 s.currentEvent=null;return {ok:true,message:'抉择已记录，后果将在未来显现。'};
}
function legacyChoice(s,mode){init(s);const l=s.flags.legacyResearch;
 if(!l||l.status!=='待决定')return {ok:false,reason:'没有待处理的上一代研究遗产'};
 if(!['continue','challenge','audit'].includes(mode))return {ok:false,reason:'未知传承方向'};
 if(s.done||s.currentEvent||s.ap<1)return {ok:false,reason:'本季尚不能处理这份遗产'};
 const p=E.active(s);if(!p)return {ok:false,reason:'没有研究课题'};
 s.ap--;l.status='已决定';l.choice=mode;
 if(mode==='continue'){p.progress=clamp(p.progress+12);p.theory=clamp(p.theory+9);s.mentor.trust=clamp(s.mentor.trust+5)}
 if(mode==='challenge'){p.idea=clamp(p.idea+12);p.theory=clamp(p.theory+5);s.stress=clamp(s.stress+6)}
 if(mode==='audit'){p.verification=clamp(p.verification+13);p.evidence=clamp(p.evidence+9);s.openness=clamp(s.openness+4)}
 log(s,'学术传承｜'+(mode==='continue'?'继续导师研究':mode==='challenge'?'挑战前代理论':'复核未发表证据'),`来自${l.mentor}的未完课题已经影响了这代人的研究道路。`,'positive');
 return {ok:true,message:'已确定学术传承路线，收益与代价生效。'};
}
E.create=function(x){return init(base.create(x))};
E.importSave=function(raw){
 let v=typeof raw==='string'?JSON.parse(raw):JSON.parse(JSON.stringify(raw));
 if(!v||typeof v!=='object'||Array.isArray(v)||!v.player||!['engineering','agriculture','humanities'].includes(v.discipline))throw Error('存档格式不正确');
 if(!Number.isInteger(v.schemaVersion)||v.schemaVersion<3||v.schemaVersion>6)throw Error('存档版本不支持');
 for(const x of ['projects','papers','npcs','logs','submissions','students'])if(!Array.isArray(v[x])||v[x].length>10000)throw Error('存档缺少或损坏：'+x);
 for(const x of ['ap','funds','health','stress','year','season','generation'])if(!Number.isFinite(v[x]))throw Error('存档数值异常：'+x);
 if(v.ap<0||v.ap>6||v.funds<0||v.health<0||v.health>100||v.stress<0||v.stress>100||v.generation<1||v.generation>8||v.year<2020||v.year>9999)throw Error('存档边界异常');
 const legacyAP=v.schemaVersion!==4;
 if(v.schemaVersion>4){
   v.flags=v.flags||{};
   if(!Number.isFinite(v.flags.degree))v.flags.degree=v.flags.degrees?.doctor?2:v.flags.degrees?.master?1:0;
   v.schemaVersion=4;
 }
 if(legacyAP)v.ap=Math.min(6,v.ap+4);
 return init(base.load(v));
};
E.passTurn=function(s){init(s);let r=base.turn(s);if(r.ok){generateWorld(s);arcTurn(s)}return r};
E.resolveEvent=(function(prev){return function(s,i){if(s.currentEvent?.id.startsWith('MERGE-'))return resolveArc(s,i);return prev(s,i)}})(E.resolveEvent);
E.selectProject=function(s,id){let r=base.select(s,id);if(r.ok)init(s);return r};
E.ready=function(s,p){init(s);return base.ready(s,p)&&methodReady(s,p)};
E.submit=function(s,j,t,ab){init(s);if(!methodReady(s,E.active(s)))return {ok:false,reason:'缺少学科方法核验，先完成本学科必要的对照、复现或来源证明。'};return base.submit(s,j,t,ab)};
E.inherit=function(s,id,style){init(s);let r=base.inherit(s,id,style);if(r.ok){init(r.state);r.state.worldWorks=s.worldWorks.filter(w=>w.year<=r.state.year).slice(-45).map(x=>({...x}));
  r.state.flags.legacyResearch={mentor:s.player.name,status:'待决定',choice:null,question:s.projects.find(x=>x.id===s.activeProject)?.title||s.projects[0]?.title||'未完成问题'};
  log(r.state,'前代导师遗产',`你获得了${s.player.name}留下的研究笔记，可以继承、质疑或重新审计。`,'positive');}
 return r};
E.changeCareer=function(s,track){init(s);if(s.flags.degree<2&&!(s.flags.degree>=1&&['industry','public','independent'].includes(track)))return {ok:false,reason:'需先完成相应学位阶段或选择适合硕士的职业路线'};return base.career(s,track)};
E.validate=function(s){init(s);let probs=base.validate(s);
 for(const w of s.worldWorks)if(!w||!Number.isInteger(w.year)||w.year>s.year||typeof w.id!=='string')probs.push('同行成果记录异常');
 return probs};
E.mergeInit=init;E.researchMethod=researchMethod;E.methodReady=methodReady;E.methodProgress=methodProgress;E.methodActions=info;E.respondWork=respondWork;E.legacyChoice=legacyChoice;
})(window);
