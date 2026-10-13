/* 学术人生·卷宗版：规则升级层 / 所有数据在本地处理 */
(function(root){'use strict';
const E=root.ALS_ENGINE;
const base={create:E.create,load:E.importSave,pass:E.passTurn,resolve:E.resolveEvent,perform:E.perform,submit:E.submit,revise:E.revise,inherit:E.inherit,recruit:E.recruit};
const bound=x=>Math.max(0,Math.min(100,Math.round(x*10)/10));
const names=['青年研究员','讲师／青年研究员','副教授／副研究员','教授／研究员','资深学术领军者'];
const plans={
 engineering:[['快速原型','进展快、证据薄弱、后期补测成本高','rush'],['严谨复现','速度较慢，独立核验更可靠','rigor'],['原创架构','高风险、创新潜力高','bold']],
 agriculture:[['单站快试','短期成本低，跨季推断较弱','rush'],['多站轮测','跨站积累稳健，但占用经费','rigor'],['探索异常品种','风险高、潜在发现大','bold']],
 humanities:[['短篇新论','写作速度快，材料覆盖有限','rush'],['多源考据','查验耗时，论证更稳健','rigor'],['重建解释框架','争议大，可能打开新问题','bold']]
};
const storylines=[
{id:'mentor',start:3,title:'导师希望你调整选题',intro:'组会上，导师认为当前课题不够稳妥。你在日记里记下这次分歧。',options:['暂时听从，换取毕业支持','拿出材料据理力争','寻找联合指导人'],follow:'两年前的组会争论，再次影响你的研究计划。'},
{id:'rival',start:9,title:'同领域团队先行公布结果',intro:'同行在预印本上发表了与你相近的结果。对方尚未充分复现。',options:['公开复现实验并补充证据','转向一个未被回答的细分问题','主动提出合作'],follow:'这场抢发风波成为学术圈持续讨论的案例。'},
{id:'grant',start:19,title:'重要资助机会只有一次',intro:'院里通知，本期仅剩一个研究资助名额，你的申请正与同门竞争。',options:['提交成熟方案','押注高风险的原创假设','寻求跨组联合申请'],follow:'基金申请结果改变了你的实验计划。'},
{id:'authorship',start:33,title:'团队出现署名分歧',intro:'一位年轻合作者认为自己承担了关键验证，却没有得到足够认可。',options:['重新核查贡献并调整署名','坚持最初约定并解释依据','交由第三方共同协调'],follow:'署名分歧的处理方式影响团队信任。'},
{id:'legacy',start:69,title:'学生质疑你最重要的理论',intro:'一名学生发现旧成果的适用条件比你当年声称的更窄。',options:['邀请学生共同发表修正','鼓励学生独立提出反例','暂时搁置，优先处理其他项目'],follow:'学派的下一代开始拥有独立的声音。'}
];
function init(s){
 if(!s.flags||typeof s.flags!=='object')s.flags={};
 if(!Number.isFinite(s.ap))s.ap=6;
 if(!Number.isFinite(s.flags.rank))s.flags.rank=0;
 if(!Number.isFinite(s.flags.degree))s.flags.degree= s.turn>=28?2:s.turn>=12?1:0; // 旧存档迁移保留旧阶段，新的绝不自动毕业
 if(s.flags.degree>=1&&!Number.isFinite(s.flags.masterTurn))s.flags.masterTurn=Math.min(s.turn,12);
 if(s.flags.degree>=2&&!Number.isFinite(s.flags.doctorTurn))s.flags.doctorTurn=Math.min(s.turn,28);
 if(!Number.isFinite(s.flags.lastRankTurn))s.flags.lastRankTurn=-40;
 if(!s.flags.relations||typeof s.flags.relations!=='object')s.flags.relations={};
 if(!s.flags.plans||typeof s.flags.plans!=='object')s.flags.plans={};
 if(!s.flags.story||typeof s.flags.story!=='object')s.flags.story={};
 if(!s.flags.actions||typeof s.flags.actions!=='object')s.flags.actions={};
 if(!Number.isFinite(s.flags.degreeLastTry))s.flags.degreeLastTry=-12;
 if(!s.flags.storyPromises)s.flags.storyPromises=[];
 for(let npc of s.npcs||[]){if(!s.flags.relations[npc.id])s.flags.relations[npc.id]={bond:Math.min(85,Math.max(25,npc.trust||48)),cooperation:20,dispute:0,met:0,goal: npc.papers>1?'追求代表作':'争取项目经费'};}
 if(!s.flags.relations.mentor)s.flags.relations.mentor={bond:s.mentor.trust,cooperation:30,dispute:0,met:0,goal:'培养值得信任的研究者'};
 for(let p of s.projects||[]){if(!s.flags.plans[p.id])s.flags.plans[p.id]='unset';if(!Number.isFinite(p.strategyUsed))p.strategyUsed=0;if(!Number.isFinite(p.designCount))p.designCount=Number.isFinite(p.lastDesignTerm)?1:((s.flags.degree||0)>=1?1:0);}
 s.position=title(s);return s;
}
function title(s){const t=s.flags?.degree??0;if(t===0)return s.turn>=12?'硕士研究生 · 延期中':'硕士研究生';if(t===1&&!['academic','teaching'].includes(s.career))return {industry:'产业研发员',public:'公共研究助理',independent:'独立研究者'}[s.career]||'研究助理';if(t===1)return s.turn>=28?'博士研究生 · 延期中':'博士研究生';if(s.career==='industry')return ['产业研发员','资深研发工程师','研发负责人','首席科学家','产业科研领军者'][s.flags.rank]||'研发负责人';if(s.career==='teaching')return ['助教／研究助理','讲师','高级讲师','教学教授','教育学术领军者'][s.flags.rank]||'讲师';if(s.career==='independent')return '独立研究者';if(s.career==='public')return ['公共研究助理','公共研究员','高级公共研究员','中心主任','公共学术领军者'][s.flags.rank]||'公共研究员';return names[s.flags.rank]||names[0]}
function degreeStatus(s){let d=s.flags.degree,p=[...s.projects].sort((a,b)=>(b.progress+b.evidence+b.theory+b.verification)-(a.progress+a.evidence+a.theory+a.verification))[0]||E.active(s);if(d===2)return {done:true,title:'博士学位已取得'};let due=d===0?12:28;let cond=d===0?[
 ['已达到常规学期',s.turn>=11],['至少完成1轮正式研究设计',!!p&&(p.designCount||0)>=1],['课题研究推进≥65',!!p&&p.progress>=65],['独立证据≥44',!!p&&p.evidence>=44],['研究方法与理论≥32',!!p&&p.theory>=32],['答辩稿写作≥45',!!p&&p.writing>=45],['导师信任≥40',s.mentor.trust>=40]
 ]:[['硕士学位已获得',s.flags.degree===1],['博士研究周期≥26季',s.turn>=26],['至少完成2轮正式研究设计',!!p&&(p.designCount||0)>=2],['完成本学科关键方法核验',!!p&&(!E.methodReady||E.methodReady(s,p))],['研究推进≥78',!!p&&p.progress>=78],['可复核证据≥64',!!p&&p.evidence>=64],['独立复核≥38',!!p&&p.verification>=38],['论文／完整学位论证',s.papers.length>=1||!!p&&p.theory>=72&&p.writing>=66],['导师信任≥40',s.mentor.trust>=40]];
 return {done:false,title:d===0?'硕士论文答辩':'博士学位答辩',due,project:p,conditions:cond,qualified:cond.every(x=>x[1])};}
function applyDegree(s){init(s);if(s.done||s.currentEvent)return {ok:false,reason:'请先处理当前事件'};const v=degreeStatus(s);if(v.done)return {ok:false,reason:'学位阶段已完成'};if(!v.qualified)return {ok:false,reason:'尚有答辩条件未完成，请对照清单准备。'};if(s.ap<2)return {ok:false,reason:'答辩需要2行动点'};if(s.turn-s.flags.degreeLastTry<2)return {ok:false,reason:'评议仍在冷却期，请再准备一个学期'};s.ap-=2;s.flags.degreeLastTry=s.turn;let p=v.project||E.active(s),q=p?E.quality(s,p):{Q:45,R:45,C:45};let panel=Math.sin((s.turn+1)*19.731+(s.rng%997))*5;const raw=16+0.22*s.attributes.expression+0.18*s.attributes.rigor+0.22*q.Q+0.13*s.mentor.trust+0.11*s.insight+0.10*(p?.verification||0)-0.15*s.stress+panel;const score=Math.max(0,Math.min(100,raw));const diffAdj=s.difficulty==='challenge'?4:s.difficulty==='relaxed'?-2:0;const need=(s.flags.degree===0?66:72)+diffAdj;
 if(score<need) {s.stress=bound(s.stress+8);s.flags.degreeFailures=(s.flags.degreeFailures||0)+1;let weak=q.R<55?'评议认为证据链仍不够稳固':s.attributes.expression<48?'现场陈述没有把核心贡献讲清楚':s.stress>70?'高压状态影响了答辩表现':'委员会要求进一步收窄主张并补充解释';s.logs.unshift({id:'degree-fail-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'学位答辩需要修改',detail:`综合评议 ${Math.round(score*10)/10}/${need}。${weak}。你保留当前研究，不会清空进度，可在后续季度再次申请。`,tone:'warning'});return {ok:true,message:`答辩未通过（${Math.round(score*10)/10}/${need}）：${weak}`};}
 s.flags.degree++;if(s.flags.degree===1){s.flags.masterTurn=s.turn;s.funds+=2;s.stress=bound(s.stress-5)}else{s.flags.doctorTurn=s.turn;s.funds+=5;s.flags.rank=0;s.flags.lastRankTurn=s.turn;s.stress=bound(s.stress-7)}s.position=title(s);s.logs.unshift({id:'degree-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'学位答辩通过',detail:`综合评议 ${Math.round(score*10)/10}/${need}。经过正式委员会评议，你获得了${s.flags.degree===1?'硕士':'博士'}学位。`,tone:'positive'});return {ok:true,message:`${s.flags.degree===1?'硕士':'博士'}学位答辩通过（${Math.round(score*10)/10}）！`};}
function rankStatus(s){const n=s.flags.rank||0,academic=s.career==='academic';if(s.flags.degree<2 && !(s.flags.degree>=1&&['industry','public'].includes(s.career)))return {eligible:false,requirements:[['学位或职业路线资格',false]],next:'学术岗位'};if(n>=4)return {max:true,next:'学术终身荣誉'};
 const papers=s.papers||[], pubs=papers.length, quality=papers.filter(x=>x.quality>=57).length,rep=E.reputation(s),grads=s.students.filter(x=>x.status==='毕业').length;
 let cond=[['距上次晋升达到任职周期',s.turn-s.flags.lastRankTurn>=(n===0?4:n===1?12:16)],['科研信誉达到评审标准',rep>=([42,53,64,73][n])],['代表成果达到要求',quality>=([1,2,3,5][n])],['教学或社会贡献',s.teaching+s.societal*.45>=([20,35,50,65][n])],['学术诚信≥70',s.integrity>=70]];
 if(n>=2)cond.push(['培养学生或开放贡献',grads>=n-1||s.openness>=73]);
 if(n>=3)cond.push(['形成长期代表性贡献',s.papers.some(x=>x.historical)||(s.awards?.length||0)>=3||grads>=3]);
 let cooldown=Math.max(0,4-(s.turn-(s.flags.lastRankAttempt??-100)));return {max:false,next:title({...s,flags:{...s.flags,rank:n+1}}),requirements:cond,eligible:cond.every(x=>x[1]),cooldown,canApply:cond.every(x=>x[1])&&cooldown===0,places:rankCandidates(s).places,applicants:rankCandidates(s).applicants,rivals:rankCandidates(s).rivals,portfolio:rankPortfolio(s)};
}
function rankCandidates(s){
 const n=s.flags.rank||0,total=[9,11,10,8][n]||8,places=[3,2,2,1][n]||1;
 const npcs=s.npcs||[],base=[50,62,72,78.5][n]||78.5;
 const rivals=Array.from({length:total},(_,i)=>{
  let v=npcs[(i+n*3+s.turn)%Math.max(1,npcs.length)]||{name:'未知申请人',papers:0,activity:0};
  let noise=Math.sin((i+1)*67.123+(s.turn+1)*3.765+(s.rng%997))*.5+.5;
  let score=base+(noise-.5)*21+(s.world?.competition-50)*.13+(s.difficulty==='challenge'?3:0)+Math.min(4,(v.papers||0)*.7);
  return {name:v.name,score:Math.round(score*10)/10,focus:v.topic||'独立研究'};
 });
 return {rivals,places,applicants:total};
}
function rankPortfolio(s,mode='balanced'){
 let qual=s.papers.filter(p=>p.quality>=57);
 let quality=qual.reduce((a,p)=>a+p.quality,0)/Math.max(1,qual.length),rep=E.reputation(s);
 let historical=s.papers.filter(p=>p.historical).length,grads=s.students.filter(x=>x.status==='毕业').length;
 let legacy=Math.min(8,historical*2.2+(s.awards?.length||0)*1.25+grads*1.05+(s.openness>=78?1:0));
 return Math.round((rep*.37+quality*.30+s.teaching*.12+s.attributes.expression*.09+s.network*.06+legacy +
  (mode==='research'?quality*.065-s.teaching*.045:mode==='teaching'?s.teaching*.065-quality*.045:0))*10)/10;
}
function applyRank(s,mode){init(s);
 if(s.done||s.currentEvent)return {ok:false,reason:'重要事件尚未处理'};
 const status=rankStatus(s);if(status.max)return {ok:false,reason:'已经达到最高岗位等级'};
 if(!status.eligible)return {ok:false,reason:'评审材料尚未达到资格门槛'};
 if(s.ap<2||s.funds<1)return {ok:false,reason:'评审需要2行动点与1万材料经费'};
 if(s.turn-(s.flags.lastRankAttempt??-100)<4)return {ok:false,reason:'本年度已经参加岗位评审'};
 if(!['balanced','research','teaching'].includes(mode))return {ok:false,reason:'无效的评审材料类型'};
 const score=rankPortfolio(s,mode), {rivals,places}=rankCandidates(s);
 const cutoff=([50,62,73,82][s.flags.rank])+(s.difficulty==='challenge'?4:s.difficulty==='relaxed'?-3:0);
 const above=rivals.filter(x=>x.score>=score).length;
 const passed=score>=cutoff&&above<places;
 s.ap-=2;s.funds=Math.max(0,Math.round((s.funds-1)*10)/10);s.flags.lastRankAttempt=s.turn;
 const nearest=rivals.slice().sort((a,b)=>b.score-a.score),limit=nearest[places-1]?.score||cutoff;
 const reason=score<cutoff?'申请材料尚未达到该级别的学术贡献最低线':`本期${places}个岗位，已有${above}名竞争者的综合材料分高于你`;
 s.flags.lastReview={year:s.year,score,cutoff,places,above,limit,mode,passed,rivals:nearest.slice(0,Math.min(4,nearest.length))};
 if(passed){s.flags.rank++;s.flags.lastRankTurn=s.turn;s.funds+=3;s.position=title(s);
 s.logs.unshift({id:'rank-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'职称评审通过',detail:`你的申请材料得分${score}，本期${places}个岗位；与实际竞争者排名后成功入选。`,tone:'positive'});
 return {ok:true,message:`评审通过：${s.position}。`}}
 s.stress=bound(s.stress+9);s.flags.rankFailures=(s.flags.rankFailures||0)+1;
 s.logs.unshift({id:'rank-fail-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'岗位评审未通过',detail:`个人得分${score}，通过线${cutoff.toFixed(1)}，本期${places}个岗位。${reason}。你保留现有岗位，可加强代表成果或申请其他方向。`,tone:'warning'});
 return {ok:true,message:'本次未入选：'+reason};
}

function selectPlan(s,mode){init(s);if(s.done||s.currentEvent)return {ok:false,reason:'先处理当前事件'};let p=E.active(s);if(!p)return {ok:false,reason:'没有活跃研究课题'};if(!['rush','rigor','bold'].includes(mode))return {ok:false,reason:'无效研究方案'};if(s.flags.plans[p.id]===mode)return {ok:false,reason:'已经采用这一方案'};if(Number.isFinite(p.strategyLastTurn)&&s.turn-p.strategyLastTurn<2)return {ok:false,reason:'研究方案变更至少间隔两个季度，避免通过反复切换刷取进展'};if(s.ap<1)return {ok:false,reason:'研究方案变更消耗1行动点'};if(s.funds<1)return {ok:false,reason:'至少需要1万元用于设计'};s.ap--;s.funds=Math.round((s.funds-1)*10)/10;s.flags.plans[p.id]=mode;p.strategyLastTurn=s.turn;p.strategyUsed=(p.strategyUsed||0)+1;
 if(mode==='rush'){p.progress=bound(p.progress+16);p.writing=bound(p.writing+7);p.verification=bound(p.verification-8);s.stress=bound(s.stress+4)}
 if(mode==='rigor'){p.evidence=bound(p.evidence+12);p.verification=bound(p.verification+9);p.progress=bound(p.progress+4);s.stress=bound(s.stress+5)}
 if(mode==='bold'){p.idea=bound(p.idea+10);p.theory=bound(p.theory+9);p.progress=bound(p.progress-6);s.stress=bound(s.stress+9)}
 s.logs.unshift({id:'plan-'+s.turn+'-'+p.id,year:s.year,season:s.season,turn:s.turn,title:'研究方案已调整',detail:`针对《${p.title}》采用${{rush:'快速试验',rigor:'严谨复核',bold:'探索突破'}[mode]}策略；速度、证据和风险发生取舍。`,tone:'info'});return {ok:true,message:'研究方案已实施，后续研究收益将不同。'};
}
function disciplineReady(s,p){
 if(!p||!E._baseReady(s,p))return false;
 const num=p.evidenceRoots?.length||0;
 if(s.discipline==='engineering')return p.verification>=20&&num>=2;
 if(s.discipline==='agriculture'){
  const seasons=new Set(s.evidence.filter(x=>x.questionId===p.id).map(x=>x.created%4));
  return p.verification>=25 && seasons.size>=2;
 }
 return p.theory>=35 && p.verification>=20 && num>=2;
}
function designStudy(s,sample,control,novelty){
 init(s);let p=E.active(s);let a=+sample,b=+control,c=+novelty;
 if(s.done||s.currentEvent)return {ok:false,reason:'先处理当前事件'};
 if(!p)return {ok:false,reason:'没有活跃研究课题'};
 if(![a,b,c].every(x=>Number.isInteger(x)&&x>=1&&x<=5))return {ok:false,reason:'参数范围需在1到5之间'};
 if(a+b+c>11)return {ok:false,reason:'项目资源上限为11，请在范围、控制和创新中作出取舍'};
 if(p.lastDesignTerm===s.turn)return {ok:false,reason:'本季已经完成一次完整研究设计'};
 if(s.ap<2)return {ok:false,reason:'开展研究设计需2行动点'};
 const money=Math.round((a*.65+b*.28+c*.35)*10)/10;
 if(s.funds<money)return {ok:false,reason:`需要${money}万元预算，目前经费不足`};
 s.ap-=2;s.funds=Math.round((s.funds-money)*10)/10;p.lastDesignTerm=s.turn;p.designCount=(p.designCount||0)+1;
 p.progress=bound(p.progress+7+a*2-c*.8);p.evidence=bound(p.evidence+a*3+b*1.5);
 p.verification=bound(p.verification+b*3);p.theory=bound(p.theory+c*1.4);p.idea=bound(p.idea+c*1.1);
 if((a+b)>=7){let exists=s.evidence.some(x=>x.questionId===p.id&&x.created===s.turn);if(!exists){let root='design-'+p.id+'-'+s.turn;s.evidence.push({id:root,rootId:root,questionId:p.id,type:'研究设计',independent:b>=3,negative:false,created:s.turn,author:s.player.id,weight:.5});p.evidenceRoots.push(root)}}
 const risk=(c>=4&&b<=2);if(risk){p.verification=bound(p.verification-4);s.stress=bound(s.stress+6)}else s.stress=bound(s.stress+3);
 s.logs.unshift({id:'study-'+p.id+'-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'科研方案完成一轮设计',detail:`覆盖${a}、控制${b}、创新${c}；支出${money}万元。${risk?'方案冒险性高，可靠性受到质疑。':'研究材料与方法积累增强。'}`,tone:risk?'warning':'info'});
 return {ok:true,message:`研究方案已执行，支出${money}万元，消耗2行动点。`};
}
function person(s,id){if(id==='mentor')return {id:'mentor',name:s.mentor.name,topic:'研究团队与学位指导',papers:0};return s.npcs.find(n=>n.id===id)}
function interact(s,id,kind){init(s);if(s.done||s.currentEvent)return {ok:false,reason:'请先处理重要事件'};const n=person(s,id),r=s.flags.relations[id];if(!n||!r)return {ok:false,reason:'人物不存在'};if(!['discuss','help','negotiate','debate'].includes(kind))return {ok:false,reason:'未知交往方式'};if(s.ap<1)return {ok:false,reason:'行动点不足'};if(s.flags.actions['p-'+id]===s.turn)return {ok:false,reason:'本季度已经进行过深入交流'};
 s.ap--;s.flags.actions['p-'+id]=s.turn;r.met++;let p=E.active(s);let result='';
 if(kind==='discuss'){r.bond=bound(r.bond+4);s.insight=bound(s.insight+2);if(p)p.theory=bound(p.theory+4);result='双方仔细讨论了研究分歧，论证获得改善。'}
 if(kind==='help'){r.bond=bound(r.bond+7);r.cooperation=bound(r.cooperation+5);s.stress=bound(s.stress+3);if(id==='mentor')s.mentor.trust=bound(s.mentor.trust+7);result='你承担了一部分共同任务，对方记住了你的帮助。'}
 if(kind==='negotiate'){let success=r.bond+s.attributes.expression*.35>80;if(success){r.cooperation=bound(r.cooperation+10);s.funds=Math.round((s.funds+1.4)*10)/10;if(p)p.verification=bound(p.verification+5);result='对方同意共享一批资源，但期待未来的回报。'}else{r.dispute=bound(r.dispute+5);s.stress=bound(s.stress+4);result='合作条件未谈拢，对方希望你提出更有说服力的方案。'}}
 if(kind==='debate'){let success=s.attributes.rigor+s.insight>85;if(success){if(p)p.idea=bound(p.idea+4);s.insight=bound(s.insight+4);result='一场有力的学术争论帮助你明确了问题边界。'}else{r.dispute=bound(r.dispute+12);s.stress=bound(s.stress+6);result='证据不足使辩论陷入僵局，对方开始质疑你的论断。'}r.bond=bound(r.bond-5)}
 if(id==='mentor'){s.mentor.trust=bound(s.mentor.trust+(kind==='discuss'?3:kind==='debate'?-6:kind==='negotiate'?2:0))}
 s.logs.unshift({id:'social-'+s.turn+'-'+id,year:s.year,season:s.season,turn:s.turn,title:'人物来往｜'+n.name,detail:result,tone:kind==='debate'?'warning':'info'});return {ok:true,message:result};}
function degreeTurn(s){if(s.flags.degree===0&&s.turn>=12&&s.turn%4===0){s.stress=bound(s.stress+6);s.logs.unshift({id:'delay-m-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'硕士延期提醒',detail:'期限已过，但学位尚未通过正式答辩；压力增加，生涯路径延后。',tone:'warning'})}if(s.flags.degree===1&&s.turn>=28&&s.turn%4===0){s.stress=bound(s.stress+7);s.logs.unshift({id:'delay-d-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'博士延期提醒',detail:'需要完成博士学位论文或选择可行的研究职业转型。',tone:'warning'})}}
function evolveNPCs(s){if(s.turn%4!==0)return;for(let n of s.npcs){let r=s.flags.relations[n.id];if(!r)continue;if(r.dispute>18&&s.rng%5===0){s.world.competition=bound(s.world.competition+2);if(E.active(s)?.title===n.topic)s.insight=bound(s.insight+1)}if(r.cooperation>40&&s.turn%8===0){s.network=bound(s.network+1);s.insight=bound(s.insight+1)}
 let p=E.active(s);if(p&&p.title===n.topic&&s.turn%8===0){
 if(r.cooperation>=50){p.verification=bound(p.verification+3);s.logs.unshift({id:'npc-coop-'+n.id+'-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'同行合作带来复核进展',detail:`${n.name}的研究团队开放了比较材料，帮助你识别方法边界。`,tone:'positive'})}
 else {p.idea=bound(p.idea-3);s.world.competition=bound(s.world.competition+1);s.logs.unshift({id:'npc-race-'+n.id+'-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'同行竞争改变研究前沿',detail:`${n.name}在相近课题上公布新成果，你的部分原创优势被稀释。可与其商谈合作，或选择新的问题。`,tone:'warning'})}
 }
 n.activity=(n.activity||0)+1}}
function queueStory(s){if(s.currentEvent||s.done)return;let story=storylines.find(x=>s.turn>=x.start && !s.flags.story[x.id]);if(!story)return;s.currentEvent={id:'STORY-'+story.id,title:story.title,lead:story.intro,options:story.options,impact:'一个持续数年的研究与人物事件。'};s.flags.story[story.id]='pending'}
function decideStory(s,index){const id=s.currentEvent?.id.slice(6),x=storylines.find(z=>z.id===id),choice=x?.options[index];if(!choice)return {ok:false,reason:'事件选项无效'};s.currentEvent=null;s.flags.story[id]='complete';let p=E.active(s);
 if(index===0){s.mentor.trust=bound(s.mentor.trust+5);s.stress=bound(s.stress+3);if(p)p.verification=bound(p.verification+7)}
 if(index===1){s.mentor.trust=bound(s.mentor.trust-4);s.insight=bound(s.insight+5);if(p)p.idea=bound(p.idea+5)}
 if(index===2){s.network=bound(s.network+5);s.funds=Math.max(0,s.funds-1);if(p)p.evidence=bound(p.evidence+4)}
 s.flags.storyPromises.push({due:s.turn+5,story:id,choice:index});s.logs.unshift({id:'story-'+id+'-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:x.title,detail:`你选择了「${choice}」。这次决定将在未来的学术生涯产生后果。`,tone:'info'});return {ok:true,message:'决定已记录；后续几年仍会收到事件反馈。'};
}
function followStories(s){for(const item of s.flags.storyPromises.filter(x=>x.due<=s.turn)){let x=storylines.find(z=>z.id===item.story);if(!x)continue;let p=E.active(s);if(item.choice===0){s.mentor.trust=bound(s.mentor.trust+2);s.teaching=bound(s.teaching+2)}if(item.choice===1){s.insight=bound(s.insight+4);if(p)p.theory=bound(p.theory+4)}if(item.choice===2){s.network=bound(s.network+3);if(p)p.verification=bound(p.verification+3)}s.logs.unshift({id:'aftermath-'+item.story+'-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'旧日选择的回响',detail:x.follow,tone:'positive'});}s.flags.storyPromises=s.flags.storyPromises.filter(x=>x.due>s.turn)}
const originalCareer=E.changeCareer;E.changeCareer=function(s,track){
 if(s.flags.degree===0)return {ok:false,reason:'请先取得硕士学位'};
 if(s.flags.degree===1){if(!['industry','public','independent'].includes(track))return {ok:false,reason:'高校教职和高级教学路线仍需完成博士阶段'};if(s.turn<12)return {ok:false,reason:'需要完成常规硕士培养周期'};if(s.ap<1)return {ok:false,reason:'职业转型需要1行动点'};if(s.turn-(s.flags.lastCareerTurn??-100)<12)return {ok:false,reason:'职业转型至少间隔3年'};if(s.career===track)return {ok:false,reason:'已经选择此职业'};s.ap--;s.career=track;s.flags.lastCareerTurn=s.turn;s.stress=bound(s.stress+3);s.position=title(s);s.logs.unshift({id:'career-'+s.turn,year:s.year,season:s.season,turn:s.turn,title:'硕士毕业后的职业转向',detail:'你选择了不以博士学位为前提的科研工作路线；这条道路同样有成长空间。',tone:'positive'});return {ok:true,message:'职业转向已完成'};}
 const r=originalCareer(s,track);if(r.ok)s.position=title(s);return r};
const realSubmit=E.submit;E._baseReady=E.ready;E.ready=disciplineReady;E.submit=function(s,j,t,a){let p=E.active(s);if(!disciplineReady(s,p))return {ok:false,reason:s.discipline==='engineering'?'工程领域还需要至少2项证据来源与20点复现':s.discipline==='agriculture'?'田间研究需要跨两个季节采样并完成25点复核':'人文研究需要多源材料、35点理论和20点反向核验'};return realSubmit(s,j,t,a)};
E.designStudy=designStudy;
E.create=function(opts){let s=init(base.create(opts));s.flags.degree=0;s.flags.rank=0;s.flags.lastRankTurn=-40;s.ap=6;s.position=title(s);return s};
E.importSave=function(raw){let x=typeof raw==='string'?JSON.parse(raw):raw;if(!x||!x.player||!Array.isArray(x.projects))throw Error('无效的存档');if(!Number.isFinite(x.ap)||x.ap<0||x.ap>6||!Number.isFinite(x.health)||x.health<0||x.health>100||!Number.isFinite(x.funds)||x.funds<0||!Number.isFinite(x.stress)||x.stress<0||x.stress>100)throw Error('存档数值存在异常');if((x.schemaVersion||0)>E.SCHEMA)throw Error('存档来自较新版本');return init(base.load(x))};
E.passTurn=function(s){init(s);let r=base.pass(s);if(!r.ok)return r;degreeTurn(s);evolveNPCs(s);followStories(s);if(s.health<30){s.ap=Math.min(s.ap,4);s.stress=bound(s.stress+2)}s.position=title(s);queueStory(s);return r};
E.resolveEvent=function(s,i){if(s.currentEvent?.id.startsWith('STORY-'))return decideStory(s,i);return base.resolve(s,i)};
E.perform=function(s,a){init(s);let before=s.ap;const result=base.perform(s,a);if(result.ok){let p=E.active(s),style=s.flags.plans[p?.id]||'unset';if(p&&['investigate','verify','analyse','write'].includes(a)){if(style==='rush'){if(a==='investigate')p.progress=bound(p.progress+3);if(a==='verify')p.verification=bound(p.verification-3)}if(style==='rigor'){if(a==='verify')p.verification=bound(p.verification+4);if(a==='investigate')p.evidence=bound(p.evidence+2)}if(style==='bold'){if(a==='analyse')p.theory=bound(p.theory+5);if(a==='investigate'&&s.rng%4===0)p.evidence=bound(p.evidence-4)}}s.position=title(s)}return result};
E.revise=function(s,id,mode){let r=base.revise(s,id,mode);return r};
E.inherit=function(s,id,style){let r=base.inherit(s,id,style);if(r.ok){init(r.state);r.state.flags.degree=0;r.state.flags.rank=0;r.state.position=title(r.state);r.state.ap=6}return r};
E.applyDegree=applyDegree;E.degreeStatus=degreeStatus;E.applyRank=applyRank;E.rankStatus=rankStatus;E.rankCandidates=rankCandidates;E.rankPortfolio=rankPortfolio;E.selectPlan=selectPlan;E.plans=plans;E.interact=interact;E.person=person;E.title=title;E.normalize=init;
})(window);
