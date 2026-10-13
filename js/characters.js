/* 学术人生 · 形象、气质、人物对话与跨代成就；离线运行，无联网请求 */
(function(root){'use strict';
const E=root.ALS_ENGINE;
const KEY='ALS_CHARACTER_ARCHIVE_V1';
const DEFAULT={achievements:[],unlocked:[],customAvatar:null};
const looks=[
 {id:'newcomer',name:'初入学府',file:'newcomer.png',motto:'背包里装着新生手册，还有远未成形的疑问。',require:null},
 {id:'scholar',name:'深夜笔记',file:'scholar.png',motto:'实验记录和便利贴，通常比寒暄更可靠。',require:null},
 {id:'researcher',name:'独立研究者',file:'researcher.png',motto:'已经习惯站到台前讨论自己的想法。',require:null},
 {id:'newcomer-alt',name:'田野新人',file:'newcomer-alt.png',motto:'愿意用脚步丈量资料和田野。',require:null},
 {id:'newcomer-campus',name:'进阶学徒',file:'newcomer-campus.png',motto:'第一次通过答辩后，换上一身自己的颜色。',require:'master'},
 {id:'scholar-alt',name:'旧馆学徒',file:'scholar-alt.png',motto:'习惯把不确定的问题写进笔记本。',require:'first_paper'},
 {id:'researcher-alt',name:'交游学子',file:'researcher-alt.png',motto:'既懂得严肃研究，也期待有意思的合作。',require:'doctor'},
 {id:'professor',name:'学术前辈',file:'professor.png',motto:'鬓角已经见白，但仍愿意质疑自己的理论。',require:'legacy'},
 {id:'professor-alt',name:'星火传人',file:'professor-alt.png',motto:'三代师生的研究记录，是最沉甸甸的行李。',require:'third'},
 {id:'custom',name:'自定义像素形象',file:'newcomer.png',motto:'第二代以后可将本地图片转成低分辨率像素头像。只改变外观，不改变学术数值。',require:'legacy'},
];
const badges=[
 {id:'none',name:'无佩饰',glyph:'',need:null},{id:'note',name:'便笺徽饰',glyph:'▤',need:null},
 {id:'master',name:'答辩印章',glyph:'印',need:'master'},{id:'pen',name:'录用钢笔',glyph:'✎',need:'first_paper'},
 {id:'legacy',name:'师承纹章',glyph:'✦',need:'legacy'},{id:'third',name:'三代火种',glyph:'◆',need:'third'}
];
const strengths=[
 {id:'focused',name:'沉心钻研',desc:'阅读首次行动：理论积累额外+2；不影响同行评审门槛'},
 {id:'precise',name:'见微知著',desc:'复核首次行动：验证额外+2'},
 {id:'eloquent',name:'言之有物',desc:'首次学术讨论：人际关系小幅改善'},
 {id:'creative',name:'灵光偶至',desc:'首次分析论证：新意额外+2'},
 {id:'resilient',name:'静水流深',desc:'每季首次休养：压力额外-2'},
 {id:'mentor',name:'乐于授业',desc:'首次指导学生：学生成长小幅提升'}
];
const flaws=[
 {id:'aloof',name:'独来独往',desc:'协商合作时更难迅速建立信任'},
 {id:'sharp',name:'锋芒太露',desc:'公开辩论时分歧额外增加'},
 {id:'proud',name:'心气过盛',desc:'稿件被退回时承受更大压力'},
 {id:'hesitant',name:'反复斟酌',desc:'赶写论文时略增加压力'},
 {id:'reserved',name:'慢热成性',desc:'初次交谈亲近较慢，但熟识后不再受此影响'},
 {id:'tireless',name:'忘寝废食',desc:'连续科研行动时更容易疲惫'}
];
const avatarArchetypes={
 newcomer:{strength:'resilient',flaw:'reserved',tag:'慢热而能扛'},scholar:{strength:'focused',flaw:'tireless',tag:'沉迷研究'},researcher:{strength:'eloquent',flaw:'proud',tag:'台前锋芒'},'newcomer-alt':{strength:'creative',flaw:'hesitant',tag:'田野敏感'},'newcomer-campus':{strength:'precise',flaw:'reserved',tag:'审慎进阶'},'scholar-alt':{strength:'focused',flaw:'aloof',tag:'旧馆独行'},'researcher-alt':{strength:'eloquent',flaw:'sharp',tag:'善辩交游'},professor:{strength:'mentor',flaw:'proud',tag:'严师自持'},'professor-alt':{strength:'mentor',flaw:'sharp',tag:'传承革新'},custom:{strength:'focused',flaw:'reserved',tag:'自由建档'}
};
const achievements=[
 {id:'first_paper',name:'第一封录用信',desc:'发表首篇期刊论文',unlock:'scholar-alt'},
 {id:'master',name:'青衿有成',desc:'通过硕士答辩',unlock:'newcomer-campus'},
 {id:'doctor',name:'独立求索',desc:'通过博士答辩',unlock:'researcher-alt'},
 {id:'mentor',name:'薪火相授',desc:'培养出第一位毕业学生',unlock:'professor'},
 {id:'legacy',name:'见证师承',desc:'开启第二代学术人生',unlock:'professor'},
 {id:'third',name:'三代年鉴',desc:'开启第三代学术人生',unlock:'professor-alt'},
 {id:'rank',name:'通过评议',desc:'通过第一次竞争性职称评审',unlock:'researcher-alt'},
];
const clamp=x=>Math.max(0,Math.min(100,Math.round(x*10)/10));
function meta(){try{let x=JSON.parse(root.localStorage.getItem(KEY)||'null');if(x&&Array.isArray(x.achievements)&&Array.isArray(x.unlocked)){if(!('customAvatar' in x))x.customAvatar=null;return x;}}catch(_){}return JSON.parse(JSON.stringify(DEFAULT));}
function saveMeta(m){try{root.localStorage.setItem(KEY,JSON.stringify(m))}catch(e){ /* 无存储权限时仍可完整游玩 */ }}
function restoreMeta(raw){if(!raw||typeof raw!=='object')return false;let validAchievements=new Set(achievements.map(x=>x.id)),validLooks=new Set(looks.map(x=>x.id));let m={achievements:Array.isArray(raw.achievements)?raw.achievements.filter(x=>validAchievements.has(x)):[],unlocked:Array.isArray(raw.unlocked)?raw.unlocked.filter(x=>validLooks.has(x)):[],customAvatar:typeof raw.customAvatar==='string'&&raw.customAvatar.startsWith('data:image/')&&raw.customAvatar.length<=650000?raw.customAvatar:null};for(const id of m.achievements){let a=achievements.find(x=>x.id===id);if(a?.unlock&&validLooks.has(a.unlock)&&!m.unlocked.includes(a.unlock))m.unlocked.push(a.unlock);}saveMeta(m);return true;}
function unlocked(id){let x=looks.find(y=>y.id===id);return !!x&&(!x.require||meta().unlocked.includes(id)||meta().achievements.includes(x.require));}
function portrait(id){if(id==='custom'){let m=meta();if(m.customAvatar)return m.customAvatar;}let look=looks.find(x=>x.id===id)||looks[0];return 'assets/characters/'+look.file;}
function portraitForAge(id,age){if(id==='custom'||!Number.isFinite(+age)||+age<52)return portrait(id);let look=looks.find(x=>x.id===id)||looks[0];let file=look.file.replace(/\.png$/,'-senior.png');return 'assets/characters/'+file;}
function lifeStage(s){let age=Number(s?.player?.age)||23,deg=s?.flags?.degree||0,rank=s?.flags?.rank||0;if(age>=60)return '晚年治学';if(age>=48||rank>=3)return '学术中坚';if(deg>=2||age>=31)return '独立研究';if(deg>=1)return '进阶求索';return '初入学府';}
function setCustomPortrait(data){if(!unlocked('custom'))return {ok:false,reason:'开启第二代学术人生后才可使用自定义形象'};if(typeof data!=='string'||!data.startsWith('data:image/'))return {ok:false,reason:'图片数据无效'};if(data.length>650000)return {ok:false,reason:'处理后的头像仍过大，请换一张更简单的图片'};let m=meta();m.customAvatar=data;if(!m.unlocked.includes('custom'))m.unlocked.push('custom');saveMeta(m);return {ok:true,message:'自定义像素形象已保存在本机'};}
function randomPersonPortrait(id,mood='neutral',age=null){
 if(id==='mentor')return portraitForAge('professor',age||58);
 let m=String(id).match(/^npc-(\d+)$/);
 if(m&&Number(m[1])<8){let n=Number(m[1]),senior=Number.isFinite(+age)&&+age>=52?'-senior':'',suffix=['warm','tense'].includes(mood)?'-'+mood:'';return 'assets/characters/npc-'+n+senior+suffix+'.png';}
 let n=Number(String(id).replace(/\D/g,''))||0,look=['researcher','scholar','newcomer-alt','researcher-alt','scholar-alt','newcomer'][n%6];
 return portraitForAge(look,age);
}
function validStrength(id){return strengths.some(x=>x.id===id)?id:'focused'}
function validFlaw(id){return flaws.some(x=>x.id===id)?id:'reserved'}
function charInit(s){if(!s||!s.player)return s;
 s.player.avatar=looks.some(x=>x.id===s.player.avatar)?s.player.avatar:'newcomer';
 s.player.badge=badges.some(x=>x.id===s.player.badge)?s.player.badge:'note';
 s.player.strength=validStrength(s.player.strength);
 s.player.flaw=validFlaw(s.player.flaw);
 s.flags=s.flags||{};s.flags.characterMarks=s.flags.characterMarks||{};
 if(!Array.isArray(s.flags.characterArchive))s.flags.characterArchive=[];
 if(!Array.isArray(s.flags.characterPromises))s.flags.characterPromises=[];
 if(!Array.isArray(s.flags.characterHistory))s.flags.characterHistory=[];
 return s;
}
function addLog(s,title,desc,tone='info'){
 s.nextId=(s.nextId||0)+1;
 s.logs.unshift({id:'char-'+s.generation+'-'+s.nextId,year:s.year,season:s.season,turn:s.turn,title,detail:desc,tone});
 if(s.logs.length>420)s.logs.length=420;
}
function awardProgress(s){charInit(s);let achieved=s.flags.characterMarks;
 const checks={first_paper:s.papers.length>0,master:s.flags.degree>=1,doctor:s.flags.degree>=2,mentor:s.students.some(x=>x.status==='毕业'),legacy:s.generation>=2,third:s.generation>=3,rank:s.flags.rank>=1};
 const m=meta();let dirty=false;
 for(const id of s.flags.characterArchive){if(achievements.some(a=>a.id===id)&&!m.achievements.includes(id)){m.achievements.push(id);dirty=true;const a=achievements.find(x=>x.id===id);if(a?.unlock&&!m.unlocked.includes(a.unlock))m.unlocked.push(a.unlock)}}
 for(const [id,hit] of Object.entries(checks)){
  if(!hit)continue;
  if(!achieved[id]){achieved[id]=true;const a=achievements.find(x=>x.id===id);addLog(s,'成就解锁｜'+a.name,a.desc+'。新的学术形象已列入你的形象图鉴。','positive');}
  if(!s.flags.characterArchive.includes(id))s.flags.characterArchive.push(id);
  if(!m.achievements.includes(id)){m.achievements.push(id);dirty=true}
  const a=achievements.find(x=>x.id===id);
  if(a?.unlock&&!m.unlocked.includes(a.unlock)){m.unlocked.push(a.unlock);dirty=true}
 }
 if(dirty)saveMeta(m);
}
function reputationLine(s){const f=s.player.flaw,plus=s.player.strength;return `${strengths.find(x=>x.id===plus)?.name||''} · ${flaws.find(x=>x.id===f)?.name||''}`;}
const base={create:E.create,import:E.importSave,perform:E.perform,interact:E.interact,resolve:E.resolveEvent,pass:E.passTurn,inherit:E.inherit,revise:E.revise,degree:E.applyDegree,rank:E.applyRank,recruit:E.recruit,retire:E.retire};
E.create=function(opts={}){
 const s=base.create(opts);charInit(s);
 s.player.avatar=unlocked(opts.avatar)?opts.avatar:'newcomer';s.player.badge='note';
 s.player.strength=validStrength(opts.strength);
 s.player.flaw=validFlaw(opts.flaw);
 const init={focused:{rigor:1},precise:{rigor:2},eloquent:{expression:2},creative:{creativity:2},resilient:{execution:1},mentor:{coordination:2}}[s.player.strength]||{};
 for(const [k,v] of Object.entries(init))s.attributes[k]=clamp(s.attributes[k]+v);
 addLog(s,'新生档案：'+reputationLine(s),'优势与局限都将成为你的研究人生的一部分。形象只影响展示，气质选择改变少量具体行动结果。');
 awardProgress(s);return s;
};
E.importSave=function(raw){const s=charInit(base.import(raw));awardProgress(s);return s;};
E.perform=function(s,action){charInit(s);const was=s.ap;const r=base.perform(s,action);
 if(!r.ok)return r;
 let p=E.active(s),f=s.flags.characterMarks;if(!f.actTurn||f.actTurn!==s.turn){f.actTurn=s.turn;f.acted={}};
 if(!f.acted[action]){
  const pos=s.player.strength,neg=s.player.flaw;
  if(pos==='focused'&&action==='read'&&p)p.theory=clamp(p.theory+2);
  if(pos==='precise'&&action==='verify'&&p)p.verification=clamp(p.verification+2);
  if(pos==='creative'&&action==='analyse'&&p)p.idea=clamp(p.idea+2);
  if(pos==='resilient'&&action==='rest')s.stress=clamp(s.stress-2);
  if(pos==='mentor'&&action==='mentorship'&&s.students.length){let t=s.students.find(x=>x.status==='在读');if(t)t.growth=clamp(t.growth+2)}
  if(neg==='hesitant'&&action==='write')s.stress=clamp(s.stress+2);
  if(neg==='tireless'&&['analyse','investigate','write','verify'].includes(action))s.stress=clamp(s.stress+1);
  f.acted[action]=true;
 }
 awardProgress(s);return r;
};
function adjustRelation(s,id,diff,dispute=0){let r=s.flags.relations?.[id];if(r){r.bond=clamp(r.bond+diff);r.dispute=clamp(r.dispute+dispute);if(id==='mentor')s.mentor.trust=clamp(s.mentor.trust+diff*0.55)}}
E.interact=function(s,id,kind){charInit(s);const r=base.interact(s,id,kind);if(!r.ok)return r;
 const f=s.player.flaw,p=s.player.strength,re=s.flags.relations?.[id];
 if(p==='eloquent'&&kind==='discuss')adjustRelation(s,id,2);
 if(f==='aloof'&&kind==='negotiate')adjustRelation(s,id,-2);
 if(f==='sharp'&&kind==='debate')adjustRelation(s,id,-1,3);
 if(f==='reserved'&&kind==='discuss'&&re?.met<=1)adjustRelation(s,id,-2);
 awardProgress(s);return r;};
/* 先选议题，再选表达方式；行动点与当季交谈次数共用人物系统，避免免费刷关系。 */
const conversations={
 research:{name:'研究分歧',lead:'对方认为你的研究方案缺乏关键环节。你会怎样回答？',options:[['带上证据，认真请教','discuss'],['直接提出反论点','debate'],['约定下一季度共同核验','negotiate']]},
 resource:{name:'资源与合作',lead:'实验平台和学术机会有限，你希望对方支持你的计划。',options:[['先听取对方难处','discuss'],['提出具体的交换方案','negotiate'],['主动承担一部分工作','help']]},
 credit:{name:'成果与署名',lead:'你们对贡献如何记录有不同看法。一个草率答复可能留下长久裂痕。',options:[['共同整理贡献记录','help'],['当面讨论具体证据','discuss'],['坚持个人贡献主张','debate']]}
};
E.dialogue=function(s,id,topic,option){charInit(s);const dialog=conversations[topic],idx=Number(option);if(!dialog||!Number.isInteger(idx)||idx<0||idx>2)return {ok:false,reason:'对话选项不存在'};
 const [label,kind]=dialog.options[idx];const r=E.interact(s,id,kind);if(!r.ok)return r;
 const n=id==='mentor'?s.mentor:s.npcs.find(x=>x.id===id);let delayed={due:s.turn+4,id,kind:topic,option:idx};
 s.flags.characterPromises.push(delayed);
 if(topic==='credit'&&idx===0){adjustRelation(s,id,2);s.integrity=clamp(s.integrity+1)}
 if(topic==='research'&&idx===1&&s.player.flaw==='sharp')adjustRelation(s,id,-2,2);
 if(topic==='resource'&&idx===2){s.stress=clamp(s.stress+1)}
 addLog(s,'交谈｜'+(n?.name||'学者'),`${label}。${r.message||''} 对方会记得这场谈话。`,'info');
 awardProgress(s);return {ok:true,message:label+'。对方的后续回应会在未来学期出现。'};
};
const personalArcs=[
 {id:'legacyShadow',turn:2,requires:'legacy',title:'你第一次被称作“某某的学生”',lead:'一次组会上，几乎所有人都先谈起前代导师，而不是你的问题。师承能带来资源，也会吞掉个人名字。',options:['借用导师声望，争取一次关键资源','主动强调自己的独立问题','公开说明继承与分歧各在哪里'],after:['你确实获得了机会，但此后每次被介绍都伴随着导师的名字。','独立身份建立得更慢，却逐渐有了自己的研究标签。','同行开始理解：继承并不等于复制。']},
 {id:'inheritedDispute',turn:10,requires:'legacy',title:'前代导师的老对手找到了你',lead:'一位与导师争论多年的学者愿意提供材料，但他明确希望你重新检查导师最有争议的结论。',options:['接受材料，进行独立核验','维护导师路线，只讨论方法细节','把双方材料放到同一套检验标准下'],after:['你发现旧争论并不只有输赢，而是隐藏着可继续研究的问题。','你守住了师承立场，也让旧分歧延续到下一代。','共同标准让两代人的争论第一次变得可比较。']},
 {id:'unfinishedNotebook',turn:16,requires:'legacy',title:'档案箱里有一页没有发表过的笔记',lead:'前代导师曾记录一个异常，却没有足够证据发表。继续追查可能浪费几年，也可能解释长期争议。',options:['把它作为旁线，小规模验证','把主要资源转向这条未解问题','只归档，不让未验证想法主导本代研究'],after:['旁线没有吞掉主课题，却留下了新的证据入口。','这张旧纸条成为本代研究最昂贵也最独特的赌注。','你保持了方法克制，后人仍能看到这条未完成记录。']},
 {id:'archivePublic',turn:24,requires:'legacy',title:'前代私人研究记录是否应该开放？',lead:'学生希望使用前代留下的失败实验与批注。公开能帮助共同体，也可能暴露当年的混乱与错误。',options:['整理后分级开放','完整开放，并附上背景说明','继续封存，只在团队内部使用'],after:['分级制度成为实验室长期的档案规范。','公开的失败记录意外帮助了几个后来者，也引来新的质疑。','记录保存完整，却失去了外部复核的机会。']},
 {id:'thirdMirror',turn:6,requires:'third',title:'第三代不想再活在两代人的注脚里',lead:'你同时继承了两代学术故事。学校希望把你包装成“学派第三代”，但你的研究问题已经明显不同。',options:['接受学派身份，同时重写研究纲领','拒绝标签，彻底从新问题开始','组织一次三代成果公开复盘'],after:['旧名称保留下来，但学派的内核已经被你重新定义。','你失去部分现成声望，却获得了更自由的同行评价。','公开复盘让荣耀和错误同时进入了学术史。']},
 {id:'discipline',turn:6,title:'第一次真正的研究分歧',lead:'导师认为你的研究设计还不够稳妥。期中评议将近，你是否愿意承担改动的代价？',options:['暂时收缩主张，补足关键证据','坚持原创路线，公开提出不同意见','寻找联合指导人共同修改方案'],after:['先完成可靠的研究，再做更大的主张。','导师没有立即同意，但你获得重新论证的机会。','一次联合组会让争议转为具体的研究问题。']},
 {id:'peerShare',turn:12,title:'同门请求查看尚未发表的核心材料',lead:'对方正在做相近方向，希望提前看到你的部分材料。共享可能换来复核，也可能增加被抢先的风险。',options:['连同方法说明一起共享','只共享可复核的有限部分','暂时拒绝，等投稿后再开放'],after:['对方后来回传了一份有用的复核记录。','有限共享没有伤害独立性，也建立了最低程度的信任。','你保住了短期独立性，但彼此的研究逐渐走向竞争。']},
 {id:'deadline',turn:18,title:'最后一个可用的试验窗口',lead:'资助期限与实验周期出现冲突。一种方法进展快却不够稳定，另一种会拖慢毕业。',options:['集中资源完成可交付的版本','延长验证周期，接受延期风险','与同行合作，交换研究资源'],after:['你交付的结果满足了短期目标，但仍有未解难题。','更扎实的证据让后续问题变得清晰。','合作团队同意共享部分资源，也提出了署名要求。']},
 {id:'firstJob',turn:31,requires:'doctor',title:'第一份稳定岗位附带了研究条件',lead:'机构愿意给你稳定位置，但希望你把一部分时间投入团队既有方向。职业安全和研究自主发生了第一次正面冲突。',options:['接受条件，先建立稳定基础','谈判保留一部分独立课题时间','拒绝绑定，继续寻找更自由的位置'],after:['稳定资源让你能持续工作，但个人方向推进得更慢。','当年的谈判成为你后来建立独立团队的先例。','你失去一部分短期保障，却留下更清晰的研究身份。']},
 {id:'authorship',turn:38,title:'谁应当署名？',lead:'团队成员对一项成果的贡献分配存在分歧。你的处理可能影响未来的学生与合作伙伴。',options:['公开核对每个人的实际贡献','坚持原有安排，承担公开质疑','请第三方评议并公开理由'],after:['团队建立了更清晰的记录制度。','矛盾没有立即爆发，却留下了新的隔阂。','共同评议耗费时间，但减少了误解。']},
 {id:'replication',turn:48,title:'外部团队无法复现你的旧成果',lead:'一篇已经发表数年的成果被公开质疑。问题可能来自环境差异，也可能是你当年的主张太宽。',options:['公开原始记录并协助复现','主动缩小结论范围并发表说明','先观望，不对外回应'],after:['外部团队后来确认了适用条件，论文的边界反而更清晰。','修正说明降低了短期光环，却提高了长期可信度。','争议持续发酵，后来每次引用这篇论文都伴随着质疑。']},
 {id:'studentCare',turn:58,requires:'student',title:'学生说自己已经很久没有真正休息',lead:'团队进度正在关键节点，但一名学生明显陷入疲惫。作为导师，你必须决定实验室如何面对人的极限。',options:['主动调整任务并推迟非关键节点','维持原计划，但减少临时加码','把问题视为个人时间管理，不改计划'],after:['学生恢复后提出了更独立的研究问题。','项目按期推进，但团队开始更重视边界。','短期没有停工，团队信任却出现了长期裂痕。']},
 {id:'correction',turn:70,title:'学生发现了你的理论边界',lead:'一位年轻研究者提出反例。你的代表性结论可能需要修改，学派传统正受到考验。',options:['和学生共同发表更正研究','支持学生独立发表挑战性结果','暂时不公开反例，维持旧论断'],after:['多年后的记录称这是学派走向成熟的一刻。','下一代逐渐发展出新的研究路线。','短期声誉保持稳定，但更严格的核查正在逼近。']},
 {id:'administration',turn:82,requires:'rank',title:'院系希望你承担更重的组织职责',lead:'你已经有一定学术影响。管理工作能改变资源分配，但会持续占据研究时间。',options:['接受完整职责，建设公共研究环境','只承担与自己研究方向相关的部分','拒绝行政角色，继续专注研究'],after:['你改变了团队获取资源的方式，也不得不接受个人产出下降。','有限职责成为一种可以长期维持的平衡。','你保住了研究时间，但错过了一部分制度影响力。']},
 {id:'schoolSplit',turn:100,requires:'rank',title:'你的学生们开始分成两条研究路线',lead:'一部分人坚持你早年的框架，另一部分人认为应该彻底重构。真正的学术传承已经不再由你单方面决定。',options:['允许两条路线独立发展','试图重新统一方法与术语','召开公开讨论，让证据决定下一步'],after:['分支后来形成了两个彼此竞争又互相引用的传统。','统一工作保留了共同语言，却牺牲了一些探索速度。','公开争论让学派失去整齐外观，却拥有更强的自我修正能力。']}
]
function queuePersonalArc(s){if(s.done||s.currentEvent)return;
 if(!s.flags.characterArcs)s.flags.characterArcs={};
 const eligible=x=>!x.requires||(x.requires==='doctor'&&s.flags.degree>=2)||(x.requires==='student'&&s.students?.some(z=>z.status==='在读'))||(x.requires==='rank'&&(s.flags.rank||0)>=1)||(x.requires==='legacy'&&s.generation>=2)||(x.requires==='third'&&s.generation>=3);
 let arc=personalArcs.find(x=>s.turn>=x.turn&&!Object.prototype.hasOwnProperty.call(s.flags.characterArcs,x.id)&&eligible(x));
 if(arc){s.currentEvent={id:'PERSONA-'+arc.id,title:arc.title,lead:arc.lead,options:arc.options,impact:'这次决定将在数个学期后留下结果。'};s.flags.characterArcs[arc.id]='pending';}
}
function resolvePersonalArc(s,index){const arc=personalArcs.find(x=>'PERSONA-'+x.id===s.currentEvent?.id);
 if(!arc||!Number.isInteger(index)||index<0||index>2)return {ok:false,reason:'无法处理这条事件'};
 if(!s.flags.characterArcs||s.flags.characterArcs[arc.id]!=='pending')return {ok:false,reason:'事件已处理'};
 const p=E.active(s),choice=arc.options[index];
 if(arc.id==='legacyShadow'){
  if(index===0){s.network=clamp(s.network+3);s.funds=Math.round((s.funds+1.2)*10)/10;s.stress=clamp(s.stress+2)}
  if(index===1){s.insight=clamp(s.insight+3);s.network=clamp(s.network-1);if(p)p.idea=clamp(p.idea+4)}
  if(index===2){s.openness=clamp(s.openness+3);s.attributes.expression=clamp(s.attributes.expression+2);s.mentor.trust=clamp(s.mentor.trust+1)}
 }
 if(arc.id==='inheritedDispute'){
  if(index===0){if(p)p.verification=clamp(p.verification+6);s.network=clamp(s.network+2);s.stress=clamp(s.stress+2)}
  if(index===1){s.mentor.trust=clamp(s.mentor.trust+3);if(p)p.theory=clamp(p.theory+3);s.openness=clamp(s.openness-2)}
  if(index===2){if(p){p.verification=clamp(p.verification+4);p.theory=clamp(p.theory+3)}s.attributes.rigor=clamp(s.attributes.rigor+2);s.stress=clamp(s.stress+3)}
 }
 if(arc.id==='unfinishedNotebook'){
  if(index===0){if(p){p.evidence=clamp(p.evidence+3);p.verification=clamp(p.verification+2)}s.funds=Math.max(0,s.funds-.8)}
  if(index===1){if(p){p.idea=clamp(p.idea+8);p.progress=clamp(p.progress-4)}s.funds=Math.max(0,s.funds-2);s.stress=clamp(s.stress+4)}
  if(index===2){s.attributes.rigor=clamp(s.attributes.rigor+1);s.openness=clamp(s.openness+1)}
 }
 if(arc.id==='archivePublic'){
  if(index===0){s.openness=clamp(s.openness+4);s.teaching=clamp(s.teaching+2);s.stress=clamp(s.stress+2)}
  if(index===1){s.openness=clamp(s.openness+7);s.network=clamp(s.network+3);s.stress=clamp(s.stress+4)}
  if(index===2){s.openness=clamp(s.openness-3);s.stress=clamp(s.stress-1);if(p)p.verification=clamp(p.verification+1)}
 }
 if(arc.id==='thirdMirror'){
  if(index===0){s.teaching=clamp(s.teaching+3);s.insight=clamp(s.insight+3);if(p)p.idea=clamp(p.idea+4)}
  if(index===1){s.network=clamp(s.network-3);s.insight=clamp(s.insight+5);s.stress=clamp(s.stress+3)}
  if(index===2){s.openness=clamp(s.openness+5);s.network=clamp(s.network+2);s.attributes.rigor=clamp(s.attributes.rigor+2);s.stress=clamp(s.stress+2)}
 }
 if(arc.id==='discipline'){
  if(index===0){if(p){p.evidence=clamp(p.evidence+6);p.scope=clamp(p.scope-4)}s.mentor.trust=clamp(s.mentor.trust+5)}
  if(index===1){if(p)p.idea=clamp(p.idea+8);s.mentor.trust=clamp(s.mentor.trust-5);s.stress=clamp(s.stress+4)}
  if(index===2){s.network=clamp(s.network+5);s.funds=Math.max(0,s.funds-1);if(p)p.verification=clamp(p.verification+4)}
 }
 if(arc.id==='deadline'){
  if(index===0){if(p){p.progress=clamp(p.progress+9);p.writing=clamp(p.writing+6);p.verification=clamp(p.verification-2)}s.stress=clamp(s.stress+5)}
  if(index===1){if(p)p.verification=clamp(p.verification+12);s.stress=clamp(s.stress+6)}
  if(index===2){s.network=clamp(s.network+6);s.funds=Math.max(0,s.funds-2);if(p)p.evidence=clamp(p.evidence+5)}
 }
 if(arc.id==='peerShare'){
  if(index===0){s.network=clamp(s.network+4);s.openness=clamp(s.openness+4);if(p)p.verification=clamp(p.verification+3);if(p)p.competition=clamp((p.competition||40)+5)}
  if(index===1){s.network=clamp(s.network+2);if(p)p.verification=clamp(p.verification+2)}
  if(index===2){s.network=clamp(s.network-2);if(p)p.competition=clamp((p.competition||40)+2);s.insight=clamp(s.insight+1)}
 }
 if(arc.id==='firstJob'){
  if(index===0){s.funds=Math.round((s.funds+3)*10)/10;s.stress=clamp(s.stress-2);if(p)p.progress=clamp(p.progress-3);s.teaching=clamp(s.teaching+2)}
  if(index===1){s.network=clamp(s.network+3);s.attributes.expression=clamp(s.attributes.expression+2);s.stress=clamp(s.stress+2)}
  if(index===2){s.network=clamp(s.network+1);s.stress=clamp(s.stress+5);s.funds=Math.max(0,s.funds-1);s.insight=clamp(s.insight+3)}
 }
 if(arc.id==='replication'){
  let old=s.papers?.slice().sort((a,b)=>a.year-b.year)[0];
  if(index===0){s.openness=clamp(s.openness+5);s.integrity=clamp(s.integrity+1);if(old)old.claimCredibility=clamp((old.claimCredibility||50)+5);s.stress=clamp(s.stress+2)}
  if(index===1){s.attributes.rigor=clamp(s.attributes.rigor+2);if(old)old.claimCredibility=clamp((old.claimCredibility||50)+3);s.stress=clamp(s.stress+3)}
  if(index===2){s.stress=clamp(s.stress+1);s.network=clamp(s.network-3);if(old)old.claimCredibility=clamp((old.claimCredibility||50)-8)}
 }
 if(arc.id==='studentCare'){
  let st=s.students.find(x=>x.status==='在读');
  if(index===0){s.teaching=clamp(s.teaching+5);s.stress=clamp(s.stress+2);if(st){st.autonomy=clamp(st.autonomy+7);st.growth=clamp(st.growth+2)}}
  if(index===1){s.teaching=clamp(s.teaching+2);if(st)st.autonomy=clamp(st.autonomy+2)}
  if(index===2){s.teaching=clamp(s.teaching-4);s.stress=clamp(s.stress-1);if(st)st.autonomy=clamp(st.autonomy-5)}
 }
 if(arc.id==='administration'){
  if(index===0){s.network=clamp(s.network+7);s.teaching=clamp(s.teaching+6);s.societal=clamp(s.societal+6);if(p)p.progress=clamp(p.progress-5);s.stress=clamp(s.stress+5)}
  if(index===1){s.network=clamp(s.network+3);s.societal=clamp(s.societal+3);s.stress=clamp(s.stress+2)}
  if(index===2){s.insight=clamp(s.insight+2);s.network=clamp(s.network-2);if(p)p.progress=clamp(p.progress+3)}
 }
 if(arc.id==='schoolSplit'){
  if(index===0){s.openness=clamp(s.openness+7);s.teaching=clamp(s.teaching+4);s.network=clamp(s.network-1)}
  if(index===1){s.teaching=clamp(s.teaching+3);s.attributes.rigor=clamp(s.attributes.rigor+2);s.stress=clamp(s.stress+3)}
  if(index===2){s.openness=clamp(s.openness+5);s.insight=clamp(s.insight+4);s.network=clamp(s.network+3);s.stress=clamp(s.stress+2)}
 }
 if(arc.id==='authorship'){
  if(index===0){s.teaching=clamp(s.teaching+6);s.network=clamp(s.network+3)}
  if(index===1){s.network=clamp(s.network-5);s.stress=clamp(s.stress+7)}
  if(index===2){s.attributes.rigor=clamp(s.attributes.rigor+3);s.funds=Math.max(0,s.funds-1.5);s.integrity=clamp(s.integrity+1)}
 }
 if(arc.id==='correction'){
  if(index===0){s.openness=clamp(s.openness+7);s.teaching=clamp(s.teaching+4)}
  if(index===1){s.openness=clamp(s.openness+10);s.insight=clamp(s.insight+4);s.network=clamp(s.network-2)}
  if(index===2){s.integrity=clamp(s.integrity-9);s.stress=clamp(s.stress+7)}
 }
 s.flags.characterArcs[arc.id]=index;
 s.flags.personaArcs=s.flags.personaArcs||[];
 s.flags.personaArcs.push({due:s.turn+5,id:arc.id,index});
 s.currentEvent=null;
 addLog(s,'人生抉择｜'+arc.title,'你选择了「'+choice+'」。短期后果已落实，后续还会有新消息。',index===2?'warning':'info');
 return {ok:true,message:'决定已记录。这段经历会继续影响后来几年。'};
}
E.passTurn=function(s){charInit(s);const res=base.pass(s);if(!res.ok)return res;
 let list=s.flags.characterPromises||[],keep=[];
 for(const item of list){if(item.due>s.turn){keep.push(item);continue}
  let who=item.id==='mentor'?s.mentor:s.npcs.find(x=>x.id===item.id);if(!who)continue;
  let r=s.flags.relations?.[item.id];
  if(item.kind==='research'&&item.option===2&&r?.cooperation>30){s.insight=clamp(s.insight+2);addLog(s,'旧日讨论得到回应',who.name+'寄来一份核验笔记，帮你缩小了争议的范围。','positive')}
  else if(item.kind==='credit'&&item.option===2){adjustRelation(s,item.id,-3,4);addLog(s,'署名争议的余波',who.name+'提出重新核对贡献记录。你当年的强硬表态仍有影响。','warning')}
  else if(item.kind==='resource'&&item.option===1&&r?.cooperation>45){s.funds=Math.round((s.funds+0.8)*10)/10;addLog(s,'合作承诺兑现',who.name+'帮助获得少量共享资源。','positive')}
  else addLog(s,'一场旧谈话',who.name+'提到了你们曾经讨论过的研究。关系并不会在一季后自动清零。');
 }
 s.flags.characterPromises=keep;
 const remain=[];for(const a of s.flags.personaArcs||[]){if(a.due>s.turn){remain.push(a);continue}
  const arc=personalArcs.find(x=>x.id===a.id);if(!arc)continue;
  addLog(s,'旧日决定的回声｜'+arc.title,arc.after[a.index],a.index===2?'warning':'positive');
 }s.flags.personaArcs=remain;
 queuePersonalArc(s);awardProgress(s);return res;
};
E.resolveEvent=function(s,index){if(s.currentEvent?.id?.startsWith('PERSONA-'))return resolvePersonalArc(s,index);const event=s.currentEvent, r=base.resolve(s,index);if(r.ok&&event){charInit(s);const pos=s.player.strength,neg=s.player.flaw;
  if(neg==='proud'&&/拒稿|退稿|失败|批评/.test(event.title||''))s.stress=clamp(s.stress+2);
  if(pos==='resilient'&&/失败|危机|中断/.test(event.title||''))s.stress=clamp(s.stress-1);
  awardProgress(s);
 }return r;};
E.revise=function(s,id,mode){const r=base.revise(s,id,mode);if(r.ok)awardProgress(s);return r;};
E.applyDegree=function(s){const r=base.degree(s);if(r.ok)awardProgress(s);return r;};
E.applyRank=function(s,mode){const r=base.rank(s,mode);if(r.ok)awardProgress(s);return r;};
E.recruit=function(s){const r=base.recruit(s);if(r.ok)awardProgress(s);return r;};
E.retire=function(s){const r=base.retire(s);if(r.ok)awardProgress(s);return r;};
E.inherit=function(s,id,style){const r=base.inherit(s,id,style);if(r.ok){charInit(r.state);r.state.player.avatar='newcomer';r.state.player.badge='note';
  r.state.flags.characterArchive=[...new Set([...(s.flags.characterArchive||[]),...meta().achievements])];r.state.player.strength='focused';r.state.player.flaw='reserved';r.state.flags.legacyTraitDraft=true;
  // 仅继承气质偏好作为叙事起点，不叠加前代基础属性或额外资助。
  addLog(r.state,'新一代学术档案',`前代导师的经历已留在年鉴中。你的研究会继承经验，也会面对自己的局限。`,'positive');awardProgress(r.state)}return r;};
E.wear=function(s,id){charInit(s);if(!unlocked(id))return {ok:false,reason:'此形象尚未解锁。完成生涯成就后可使用'};s.player.avatar=id;return {ok:true,message:'人物形象已更新。外观本身不影响能力。'};};
E.chooseNextTraits=function(s,positive,negative){charInit(s);if(!s.flags.legacyTraitDraft||s.ap!==6||s.turn!==0)return {ok:false,reason:'新一代已开始研究，无法重新登记起始气质'};const p=validStrength(positive),n=validFlaw(negative);if(p!==positive||n!==negative)return {ok:false,reason:'气质选项不正确'};const old=s.player.strength;const boosts={focused:['rigor',1],precise:['rigor',2],eloquent:['expression',2],creative:['creativity',2],resilient:['execution',1],mentor:['coordination',2]};const a=boosts[old],b=boosts[p];if(a)s.attributes[a[0]]=clamp(s.attributes[a[0]]-a[1]);if(b)s.attributes[b[0]]=clamp(s.attributes[b[0]]+b[1]);s.player.strength=p;s.player.flaw=n;s.flags.legacyTraitDraft=false;addLog(s,'第二代入学气质',reputationLine(s));return {ok:true,message:'新一代气质已建档。'};};
E.equipBadge=function(s,id){charInit(s);const b=badges.find(x=>x.id===id);if(!b||b.need&&!meta().achievements.includes(b.need))return {ok:false,reason:'纪念徽饰尚未解锁'};s.player.badge=id;return {ok:true,message:'徽饰已更新。佩饰不提供额外属性。'};};
E.setCustomPortrait=setCustomPortrait;
E.CHARACTERS={looks,badges,strengths,flaws,achievements,avatarArchetypes,meta,restoreMeta,unlocked,portrait,portraitForAge,lifeStage,setCustomPortrait,randomPersonPortrait,charInit,awardProgress,reputationLine,conversations};
})(window);
