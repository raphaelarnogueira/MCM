let xp=0, stage=0;
const state={talked:{marina:false,rafael:false,camila:false},events:[]};
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');syncXP()}
function syncXP(){document.getElementById('xp').textContent=xp;document.querySelectorAll('.xpMirror').forEach(x=>x.textContent=xp)}
function logEvent(question,answer,correct,tag){state.events.push({question,answer,correct,tag,time:new Date().toISOString()});console.table(state.events)}
function startGame(){show('map')}
function goFaculty(){alert('A atividade de hoje acontece na Escola Municipal. Procure o símbolo ! no mapa.')}
function goSchool(){show('scene'); introDirector()}
function dialog(html){document.getElementById('dialog').innerHTML=html}
function introDirector(){
 stage=1; document.getElementById('npcs').innerHTML='<button class="npc"><span class="bang">!</span>👩‍💼<span>Marina • Diretora</span></button>';
 dialog(`<h3>Marina — Diretora</h3><p>Sejam bem-vindos! É muito bom ter estudantes de Medicina conosco.</p><p>Antes de começarmos, gostaria de saber: <strong>o que vocês pretendem fazer na escola?</strong></p>
 <div class="answers">
 ${ans('A','Viemos ensinar à comunidade quais são os principais cuidados com a saúde das crianças.')}
 ${ans('B','Viemos identificar uma doença importante na escola e desenvolver um projeto para solucioná-la.')}
 ${ans('C','Primeiro queremos conhecer a escola e ouvir quais necessidades de saúde são percebidas pela comunidade.')}
 ${ans('D','Viemos coletar informações para realizar uma pesquisa sobre a saúde dos alunos.')}
 </div>`);
}
function ans(letter,text){return `<button class="answer" onclick="firstAnswer('${letter}')"><b>${letter}.</b> ${text}</button>`}
const firstFeedback={
 A:['Uma ação de extensão não deve partir automaticamente da ideia de que a universidade já conhece as necessidades da comunidade. Antes de propor uma ação, é importante conhecer o contexto e ouvir os envolvidos.','PREDEFINE_NECESSIDADE'],
 B:['Definir previamente o problema pode fazer com que o projeto responda mais aos interesses da universidade do que às necessidades percebidas pela comunidade.','DEFINE_PROBLEMA_SEM_ESCUTA'],
 D:['Uma pesquisa pode produzir conhecimento, mas nossa missão neste momento é conhecer a comunidade e identificar, junto a ela, necessidades que possam orientar uma ação de extensão.','CONFUNDE_EXTENSAO_PESQUISA']
};
function firstAnswer(l){
 if(l==='C'){logEvent('EXT_001',l,true,'ESCUTA_COMUNIDADE');xp+=10;dialog(`<h3>Marina — Diretora</h3><p>“Ótimo! Quem vive a rotina da escola pode ajudar vocês a compreender melhor o que está acontecendo por aqui.”</p><div class="feedback good"><strong>✓ Boa escolha!</strong><p>A construção de uma ação extensionista começa pelo diálogo com a comunidade. Antes de propor soluções, é necessário compreender o contexto e reconhecer as necessidades percebidas pelas pessoas envolvidas.</p><p>⭐ +10 XP &nbsp; • &nbsp; 🔓 <strong>Escuta da Comunidade</strong></p></div><button class="continue" onclick="openConversations()">Continuar →</button>`)}
 else{let f=firstFeedback[l];logEvent('EXT_001',l,false,f[1]);dialog(`<h3>Marina — Diretora</h3><p>“Talvez seja melhor conhecermos nossa realidade antes de decidir o que fazer.”</p><div class="feedback"><strong>Observe novamente.</strong><p>${f[0]}</p></div><button class="continue" onclick="introDirector()">Tentar novamente</button>`)}
}
const people={
 marina:{emoji:'👩‍💼',name:'Marina • Diretora',text:'Nos últimos meses, recebemos comunicados da UBS informando que há crianças da escola com vacinas atrasadas. Também percebemos que algumas famílias têm dúvidas sobre quando devem procurar a unidade de saúde.',note:'A escola recebeu informações da UBS sobre crianças com vacinação atrasada.'},
 rafael:{emoji:'👨‍🏫',name:'Rafael • Professor',text:'Já ouvi responsáveis dizerem que achavam que, depois das vacinas dos primeiros anos de vida, não precisariam mais se preocupar. Outros dizem que não sabem se a vacinação da criança está realmente em dia.',note:'Existem dúvidas das famílias sobre o calendário e a situação vacinal das crianças.'},
 camila:{emoji:'👩‍🏫',name:'Camila • Professora',text:'Quando conversamos com as famílias, aparecem situações diferentes. Algumas dizem que não tiveram tempo de levar a criança à unidade. Outras têm dúvidas sobre as vacinas, e há famílias que dizem preferir não vacinar.',note:'Diferentes fatores podem estar relacionados ao atraso vacinal.'}
};
function openConversations(){stage=2;renderNPCs();dialog('<h3>Ouvindo a comunidade escolar</h3><p>Marina apresenta profissionais que acompanham as crianças diariamente.</p><p><strong>Converse com todos os personagens marcados com !</strong></p>')}
function renderNPCs(){document.getElementById('npcs').innerHTML=Object.entries(people).map(([k,p])=>`<button class="npc ${state.talked[k]?'done':''}" onclick="talk('${k}')">${state.talked[k]?'':'<span class="bang">!</span>'}${p.emoji}<span>${p.name}</span></button>`).join('')}
function talk(k){let p=people[k];state.talked[k]=true;logEvent('DIALOG_'+k.toUpperCase(),'view',true,'NPC_VIEW');renderNPCs();let all=Object.values(state.talked).every(Boolean);dialog(`<h3>${p.name}</h3><p>“${p.text}”</p><div class="feedback good"><strong>📌 Informação registrada</strong><p>${p.note}</p></div>${all?'<button class="continue" onclick="criticalQuestion()">Reunir as informações →</button>':'<p><small>Converse também com os demais profissionais.</small></p>'}`)}
function criticalQuestion(){
 dialog(`<h3>O que podemos concluir?</h3><p>Depois de conversar com os profissionais, qual conclusão é mais adequada <strong>neste momento</strong>?</p><div class="answers">
 ${crit('A','As famílias não vacinam as crianças porque não conhecem a importância das vacinas.')}
 ${crit('B','A escola apresenta baixa cobertura vacinal causada principalmente pela falta de informação dos responsáveis.')}
 ${crit('C','A comunidade escolar identifica crianças com vacinação atrasada e relata diferentes situações que podem estar relacionadas ao problema.')}
 ${crit('D','As famílias que não vacinam seus filhos precisam receber atividades educativas sobre a importância das vacinas.')}
 </div>`)
}
function crit(l,t){return `<button class="answer" onclick="criticalAnswer('${l}')"><b>${l}.</b> ${t}</button>`}
const critF={
 A:['A falta de conhecimento foi mencionada em algumas situações, mas também foram relatadas outras possíveis razões. Ainda não temos informações suficientes para afirmar uma única causa.','GENERALIZACAO_CAUSAL'],
 B:['A comunidade relatou crianças com vacinação atrasada, mas essas conversas não permitem medir a cobertura vacinal nem estabelecer sua principal causa.','EXTRAPOLA_EVIDENCIA'],
 D:['Uma atividade educativa pode fazer parte de um projeto de extensão, mas as informações disponíveis ainda não permitem concluir que essa seja a única ou a melhor resposta.','INTERVENCAO_PREMATURA']
};
function criticalAnswer(l){
 if(l==='C'){logEvent('ESCUTA_002',l,true,'INTERPRETACAO_ADEQUADA');xp+=10;dialog(`<h3>✓ Boa interpretação!</h3><div class="feedback good"><p>Você diferenciou aquilo que foi efetivamente relatado pela comunidade das explicações que ainda precisariam ser investigadas.</p><p>Sabemos que existe uma <strong>necessidade percebida relacionada à vacinação infantil</strong>, mas ainda não podemos afirmar quais são suas causas.</p><p>⭐ +10 XP &nbsp; • &nbsp; 🧠 <strong>Escuta Crítica</strong></p></div><p><strong>Marina:</strong> “A UBS acompanha a vacinação das crianças da região. Talvez seja importante conversar com a equipe de saúde antes de pensarmos no que fazer.”</p><button class="continue" onclick="unlockUBS()">Voltar ao mapa →</button>`)}
 else{let f=critF[l];logEvent('ESCUTA_002',l,false,f[1]);dialog(`<h3>Analise com cuidado</h3><div class="feedback"><p>${f[0]}</p></div><button class="continue" onclick="criticalQuestion()">Tentar novamente</button>`)}
}
function unlockUBS(){document.getElementById('ubsBtn').disabled=false;document.getElementById('ubsBtn').classList.remove('locked');document.getElementById('ubsLock').textContent='!';document.getElementById('schoolMark').textContent='✓';document.getElementById('mapHint').textContent='Novo local disponível: clique na UBS Vila Aurora.';document.getElementById('missionTop').textContent='Investigue a situação da vacinação infantil';show('map')}
function finishPrototype(){document.getElementById('finalXp').textContent=xp;show('end')}
function restart(){location.reload()}
