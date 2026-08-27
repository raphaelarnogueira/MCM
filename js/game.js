const STORE="mcm_cap1_test_v1";
let journalTab="registros";
const defaultState={
  xp:0, stage:"school1", events:[], journal:[], insights:[],
  schoolTalked:{marina:false,rafael:false,camila:false},
  ubsOrder:["ubs","objective","strategy","materials"], ubsJustification:null,
  extensionObjective:null, extensionStrategies:[],
  searchTokens:[], searchAttempts:0, selectedPapers:[],
  familyTalked:{carlos:false,patricia:false,aline:false,marcos:false},
  actionRating:null, actionReason:null, classifications:{},
  researchQuestion:null, projectStarted:false
};
let state=loadState();
const $=id=>document.getElementById(id);
function loadState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(STORE)||"{}")}}catch(e){return structuredClone(defaultState)}}
function save(){localStorage.setItem(STORE,JSON.stringify(state));syncXP()}
function event(type,data={}){state.events.push({type,...data,stage:state.stage,time:new Date().toISOString()});save()}
function addJournal(title,text){if(!state.journal.some(x=>x.title===title)){state.journal.push({title,text});save()}}
function addInsight(text){if(!state.insights.includes(text)){state.insights.push(text);save()}}
function award(n,reason){state.xp+=n;event("xp",{points:n,reason})}
function syncXP(){if($("xp"))$("xp").textContent=state.xp;document.querySelectorAll(".xpMirror").forEach(x=>x.textContent=state.xp)}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");syncXP()}
function startGame(){show("map");updateMap()}
function updateMap(){
 const map={
  school1:["Primeira atividade na comunidade","Visite a Escola Municipal.", "school"],
  ubs:["Articulação para a ação de extensão","Converse com a equipe da UBS antes de fechar a proposta.", "ubs"],
  faculty:["Fundamentar e elaborar o projeto","Vá à Faculdade/Biblioteca para elaborar o projeto e buscar evidências.", "faculty"],
  execute:["Executar a ação de extensão","Retorne à Escola Municipal para realizar a ação com as famílias.", "school"],
  insights:["Analisar o que a prática revelou","Organize os insights da ação em extensão, pesquisa ou ambas.", "faculty"],
  research:["Da extensão à pesquisa","Escolha uma questão e inicie uma proposta de pesquisa.", "faculty"],
  done:["Capítulo concluído","Revise o Caderno ou o registro de teste.", "none"]
 }[state.stage]||["Vila Aurora","Continue sua jornada.","none"];
 $("missionTop").textContent=map[0];$("mapHint").textContent=map[1];
 ["schoolMarker","ubsMarker","facultyMarker"].forEach(id=>$(id).classList.add("hidden"));
 if(map[2]==="school")$("schoolMarker").classList.remove("hidden");
 if(map[2]==="ubs")$("ubsMarker").classList.remove("hidden");
 if(map[2]==="faculty")$("facultyMarker").classList.remove("hidden");
}
function setScene(title,board,roomClass=""){show("scene");$("sceneTitle").textContent=title;$("sceneBoard").innerHTML=board;$("sceneRoom").className="room "+roomClass;$("npcs").innerHTML="";$("dialog").innerHTML=""}
function speaker(icon,name){return `<div class="speaker"><span class="portrait">${icon}</span><b>${name}</b></div>`}
function answer(text,fn){return `<button class="answer" onclick="${fn}">${text}</button>`}
function goSchool(){
 if(state.stage==="school1")return schoolIntro();
 if(state.stage==="execute")return familyAction();
 alert("Não há uma missão ativa na escola neste momento.");
}
function goUBS(){if(state.stage==="ubs")return ubsIntro();alert("A UBS será utilizada quando a missão solicitar a articulação com o serviço.")}
function goFaculty(){
 if(state.stage==="faculty")return extensionWorkshop();
 if(state.stage==="insights")return insightWorkshop();
 if(state.stage==="research")return researchChoice();
 alert("A Faculdade/Biblioteca ainda não é necessária nesta etapa.");
}

/* ESCOLA 1 */
function schoolIntro(){
 setScene("🏫 ESCOLA MUNICIPAL VILA AURORA","BEM-VINDOS À <strong>ESCOLA VILA AURORA</strong>");
 $("npcs").innerHTML=`<button class="npc" onclick="schoolFirst()"><span class="bang">!</span>👩🏽‍💼<label>Marina • Diretora</label></button>`;
 $("dialog").innerHTML=`${speaker("👩🏽‍💼","MARINA — DIRETORA")}<p>Sejam bem-vindos. Temos recebido avisos sobre crianças com vacinas atrasadas e algumas famílias demonstram dúvidas.</p><p><strong>Antes de pensar em uma ação, o que vocês pretendem fazer aqui?</strong></p><div class="answers">
 ${answer("<b>A.</b> Explicar imediatamente quais cuidados as famílias devem adotar.","schoolFirstAnswer('A')")}
 ${answer("<b>B.</b> Identificar uma doença importante e desenvolver uma solução.","schoolFirstAnswer('B')")}
 ${answer("<b>C.</b> Conhecer a escola e ouvir como a comunidade percebe a situação.","schoolFirstAnswer('C')")}
 ${answer("<b>D.</b> Coletar dados para realizar uma pesquisa com os alunos.","schoolFirstAnswer('D')")}
 </div>`;
}
function schoolFirst(){schoolIntro()}
function schoolFirstAnswer(a){
 event("choice",{id:"ESCOLA_01",answer:a});
 if(a!=="C"){
  const fb={A:"A ação já começa com uma solução definida. Antes disso, é importante compreender a necessidade percebida pela comunidade.",B:"Definir previamente o problema e a solução pode fazer a universidade responder ao que ela imagina, e não ao que a comunidade percebe.",D:"Pesquisa e extensão podem se relacionar, mas a missão inicial é construir uma ação extensionista com a comunidade."}[a];
  $("dialog").innerHTML=`${speaker("📖","CADERNO DE CAMPO")}<div class="feedback"><b>REVEJA A DECISÃO</b><p>${fb}</p></div><button class="continue" onclick="schoolIntro()">TENTAR NOVAMENTE</button>`;return;
 }
 award(10,"escuta da comunidade");addJournal("👂 Escuta da comunidade","A ação de extensão começa pela aproximação e pelo diálogo com a comunidade, evitando pressupor previamente uma única causa ou solução.");
 renderSchoolPeople();
}
const schoolPeople={
 marina:["👩🏽‍💼","Marina • Diretora","A UBS informou que há crianças com vacinas atrasadas. Algumas famílias também procuram a escola com dúvidas.","A escola identifica uma necessidade relacionada à vacinação infantil."],
 rafael:["👨🏿‍🏫","Rafael • Professor","Alguns responsáveis dizem que não sabem se a vacinação está em dia. Outros achavam que depois dos primeiros anos só haveria vacina em campanhas.","Há dúvidas sobre calendário e situação vacinal."],
 camila:["👩🏻‍🏫","Camila • Professora","Já ouvimos relatos de falta de tempo, dúvidas sobre vacinas e também famílias que preferem não vacinar.","As situações relatadas pelas famílias são diferentes."]
};
function renderSchoolPeople(){
 $("npcs").innerHTML=Object.entries(schoolPeople).map(([k,p])=>`<button class="npc ${state.schoolTalked[k]?"done":""}" onclick="talkSchool('${k}')">${state.schoolTalked[k]?"":'<span class="bang">!</span>'}${p[0]}<label>${p[1]}</label></button>`).join("");
 $("dialog").innerHTML=`${speaker("📋","MISSÃO")}<p>Converse com a diretora e os professores para compreender a necessidade percebida pela escola.</p>`;
}
function talkSchool(k){
 const p=schoolPeople[k];state.schoolTalked[k]=true;event("npc",{npc:k});addJournal("📌 "+p[1],p[3]);renderSchoolPeople();
 const all=Object.values(state.schoolTalked).every(Boolean);
 $("dialog").innerHTML=`${speaker(p[0],p[1].toUpperCase())}<p>“${p[2]}”</p><div class="feedback good"><b>REGISTRO</b><p>${p[3]}</p></div>${all?'<button class="continue" onclick="finishSchool()">CONCLUIR VISITA →</button>':"<p><small>Continue ouvindo os demais profissionais.</small></p>"}`;
}
function finishSchool(){
 state.stage="ubs";award(10,"necessidade identificada");event("stage_complete",{stage_completed:"school1"});save();show("map");updateMap();
}

/* UBS - ORDEM + JUSTIFICATIVA */
function ubsIntro(){
 setScene("🏥 UBS VILA AURORA","ARTICULAÇÃO COM O SERVIÇO","ubs-room");
 $("npcs").innerHTML=`<button class="npc">👩🏿‍⚕️<label>Ana • Enfermeira</label></button>`;
 $("dialog").innerHTML=`${speaker("👩🏿‍⚕️","ANA — ENFERMEIRA")}<p>“A diretora comentou que vocês estiveram na escola. Nós também observamos crianças com vacinas atrasadas. Antes de fechar a atividade, vamos organizar os próximos passos.”</p><button class="continue" onclick="ubsOrder()">ORGANIZAR O PLANO →</button>`;
}
const orderLabels={ubs:"Conversar com a equipe da UBS sobre a situação observada",objective:"Definir o objetivo da ação de extensão",strategy:"Escolher a estratégia que será utilizada",materials:"Preparar os materiais necessários"};
function ubsOrder(){
 show("workspace");$("workTitle").textContent="🏥 UBS • ORGANIZE OS PRÓXIMOS PASSOS";
 renderOrder();
}
function renderOrder(){
 $("workContent").innerHTML=`<div class="work-card"><h2>🎯 Organize o plano inicial</h2><p>Coloque as ações em uma sequência que represente como o grupo deveria avançar antes da execução.</p><div class="sequence">${state.ubsOrder.map((k,i)=>`<div class="seq-item"><span class="seq-num">${i+1}</span><span>${orderLabels[k]}</span><span class="mini-buttons"><button onclick="moveOrder(${i},-1)">↑</button><button onclick="moveOrder(${i},1)">↓</button></span></div>`).join("")}</div><button onclick="submitOrder()">CONFIRMAR ORDEM</button></div>`;
}
function moveOrder(i,d){let j=i+d;if(j<0||j>=state.ubsOrder.length)return;[state.ubsOrder[i],state.ubsOrder[j]]=[state.ubsOrder[j],state.ubsOrder[i]];event("reorder",{id:"UBS_ORDEM",order:[...state.ubsOrder]});renderOrder()}
function submitOrder(){
 event("sequence_submit",{id:"UBS_ORDEM",order:[...state.ubsOrder]});
 const ok=state.ubsOrder.join(",")==="ubs,objective,strategy,materials";
 $("workContent").innerHTML=`<div class="work-card"><h2>${ok?"✓ A sequência é coerente":"💭 Analise a sequência"}</h2><p>${ok?"A articulação com o serviço antecede o fechamento do objetivo e da estratégia; os materiais vêm depois das decisões sobre o que a ação pretende realizar.":"A ordem escolhida foi registrada. O ponto central é evitar chegar à comunidade com materiais e estratégias fechados antes de articular a proposta e definir o que a ação pretende alcançar."}</p><h3>Por que conversar com a UBS antes de fechar a proposta?</h3><div class="answers">
 ${answer("<b>A.</b> Porque a UBS deve autorizar e definir toda atividade que será realizada na escola.","ubsWhy('A')")}
 ${answer("<b>B.</b> Porque a perspectiva do serviço pode complementar o que foi observado na escola e contribuir para o planejamento.","ubsWhy('B')")}
 ${answer("<b>C.</b> Porque os profissionais da UBS conhecem melhor o problema e devem decidir o que a comunidade precisa.","ubsWhy('C')")}
 ${answer("<b>D.</b> Porque os registros da UBS permitem determinar previamente as causas do atraso vacinal.","ubsWhy('D')")}
 </div></div>`;
}
function ubsWhy(a){
 state.ubsJustification=a;event("choice",{id:"UBS_JUSTIFICATIVA",answer:a});
 if(a!=="B"){
  $("workContent").innerHTML+=`<div class="work-card feedback"><b>REVEJA O RACIOCÍNIO</b><p>A articulação não transfere à UBS o poder de decidir sozinha nem transforma os registros do serviço em prova das causas. O serviço acrescenta uma perspectiva importante para construir uma ação contextualizada.</p><button onclick="submitOrder()">REVER JUSTIFICATIVA</button></div>`;return;
 }
 award(10,"planejamento articulado");addJournal("🤝 Planejamento articulado","Escola, serviço de saúde e universidade podem contribuir para construir uma ação extensionista contextualizada.");
 ubsPerspective();
}
function ubsPerspective(){
 setScene("🏥 UBS VILA AURORA","O QUE O SERVIÇO ACRESCENTA","ubs-room");
 $("npcs").innerHTML=`<button class="npc">👩🏿‍⚕️<label>Ana • Enfermeira</label></button>`;
 $("dialog").innerHTML=`${speaker("👩🏿‍⚕️","ANA — ENFERMEIRA")}<p>“Aqui também encontramos crianças com vacinas atrasadas, mas as situações não são iguais. Há famílias com dúvidas sobre doses pendentes, perdas de caderneta e atrasos percebidos em consultas por outros motivos.”</p><p>“Uma boa ação não deve partir da ideia de que todas as famílias estão na mesma situação.”</p><button class="continue" onclick="extensionObjective()">DEFINIR OBJETIVO →</button>`;
}
function extensionObjective(){
 show("workspace");$("workTitle").textContent="📋 PROJETO DE EXTENSÃO";
 $("workContent").innerHTML=`<div class="work-card"><h2>Defina o objetivo da primeira ação</h2><p>Escolha a formulação mais compatível com o alcance de uma atividade extensionista inicial.</p><div class="answers">
 ${answer("<b>A.</b> Aumentar a cobertura vacinal das crianças da Escola Vila Aurora.","chooseObjective('A')")}
 ${answer("<b>B.</b> Conscientizar os responsáveis que não cumprem adequadamente o calendário vacinal.","chooseObjective('B')")}
 ${answer("<b>C.</b> Promover espaço de orientação e diálogo sobre vacinação infantil, esclarecendo dúvidas e orientando sobre atualização da situação vacinal.","chooseObjective('C')")}
 ${answer("<b>D.</b> Identificar as causas responsáveis pelo atraso vacinal das crianças da escola.","chooseObjective('D')")}
 </div></div>`;
}
function chooseObjective(a){
 state.extensionObjective=a;event("choice",{id:"EXT_OBJETIVO",answer:a});
 const f={
 A:"Aumentar a cobertura é desejável, mas é um resultado amplo e dificilmente atribuível a uma única atividade. O objetivo deve refletir o que a ação consegue realizar.",
 B:"A formulação pressupõe falta de conscientização e responsabiliza previamente as famílias, embora tenham sido relatadas situações diferentes.",
 D:"Identificar causas exige investigação sistemática; não é a finalidade principal desta primeira ação de extensão."
 };
 if(a!=="C"){$("workContent").innerHTML+=`<div class="work-card feedback"><b>REVEJA O OBJETIVO</b><p>${f[a]}</p><button onclick="extensionObjective()">TENTAR NOVAMENTE</button></div>`;return}
 award(10,"objetivo factível");addJournal("🎯 Objetivo da ação","Promover espaço de orientação e diálogo sobre vacinação infantil, esclarecendo dúvidas e orientando as famílias sobre atualização da situação vacinal.");
 state.stage="faculty";save();show("map");updateMap();
}

/* FACULDADE: BUSCA + PROJETO */
function extensionWorkshop(){
 show("workspace");$("workTitle").textContent="📚 FACULDADE / BIBLIOTECA";
 $("workContent").innerHTML=`<div class="work-card"><h2>Fundamentar antes de executar</h2><p><b>Prof. Helena:</b> “Já temos uma necessidade e um objetivo. Antes de escolher exatamente como agir, vamos buscar evidências que possam ajudar a fundamentar a proposta.”</p><p><strong>Pergunta de busca:</strong> que evidências existem sobre ações educativas relacionadas à vacinação infantil?</p><button onclick="conceptBlocks()">CONSTRUIR A BUSCA →</button></div>`;
}
function conceptBlocks(){
 $("workContent").innerHTML=`<div class="work-card"><h2>1. Organize os conceitos</h2><p>Para este teste, trabalharemos com três blocos conceituais:</p><div class="project-grid"><div class="project-box"><b>VACINAÇÃO</b><p>vaccination<br>immunization</p></div><div class="project-box"><b>EDUCAÇÃO</b><p>"health education"<br>"educational intervention"</p></div><div class="project-box"><b>POPULAÇÃO</b><p>child<br>children</p></div></div><p>Observe que expressões compostas aparecem entre <b>aspas duplas</b>. Na próxima etapa, você também deverá inserir operadores e parênteses.</p><button onclick="searchBuilder()">MONTAR ESTRATÉGIA →</button></div>`;
}
const availableTokens=[
  '(',
  ')',
  'vaccination',
  'immunization',
  '"health education"',
  '"educational intervention"',
  'child',
  'children',
  'AND',
  'OR'
];

function searchBuilder(){
  $("workContent").innerHTML=`
    <div class="work-card">
      <h2>2. Monte a estratégia de busca</h2>

      <p>
        Clique nos cartões na ordem desejada.
        Você deve organizar também <b>operadores e parênteses</b>.
        As expressões compostas já aparecem entre aspas duplas.
      </p>

      <div class="search-builder">
        ${availableTokens.map((t,i)=>`
          <button
            class="token ${
              t==="AND"||t==="OR"
                ?"operator"
                :t==="("||t===")"
                ?"paren"
                :""
            }"
            onclick='addToken(${JSON.stringify(t)})'>
            ${t}
          </button>
        `).join("")}
      </div>

      <div class="search-line" id="searchLine">
        ${state.searchTokens.join(" ")||"Sua estratégia aparecerá aqui..."}
      </div>

      <div class="row-actions">
        <button onclick="removeToken()">← REMOVER ÚLTIMO</button>
        <button onclick="clearSearch()">LIMPAR</button>
        <button onclick="testSearch()">🔎 TESTAR ESTRATÉGIA</button>
      </div>

      <div id="searchFeedback"></div>
    </div>`;
}

function addToken(t){
  state.searchTokens.push(t);
  event("search_token",{token:t});
  searchBuilder();
}

function removeToken(){
  state.searchTokens.pop();
  event("search_edit",{action:"remove"});
  searchBuilder();
}

function clearSearch(){
  state.searchTokens=[];
  event("search_edit",{action:"clear"});
  searchBuilder();
}


/* =========================================================
   VALIDAÇÃO LÓGICA DA ESTRATÉGIA
   ========================================================= */

function normalizeSearch(tokens){
  return tokens
    .join(" ")
    .replace(/\s+/g," ")
    .trim();
}


/* Verifica se um par de termos aparece corretamente
   agrupado com OR, independentemente da ordem. */

function validORBlock(tokens,a,b){

  for(let i=0;i<=tokens.length-5;i++){

    const part=tokens.slice(i,i+5);

    const option1=
      part[0]==="(" &&
      part[1]===a &&
      part[2]==="OR" &&
      part[3]===b &&
      part[4]===")";

    const option2=
      part[0]==="(" &&
      part[1]===b &&
      part[2]==="OR" &&
      part[3]===a &&
      part[4]===")";

    if(option1 || option2) return true;
  }

  return false;
}


/* Detecta AND entre os dois termos de um mesmo conceito. */

function hasANDInsideConcept(tokens,a,b){

  for(let i=0;i<tokens.length-2;i++){

    if(
      (tokens[i]===a &&
       tokens[i+1]==="AND" &&
       tokens[i+2]===b)

      ||

      (tokens[i]===b &&
       tokens[i+1]==="AND" &&
       tokens[i+2]===a)
    ){
      return true;
    }
  }

  return false;
}


/* Verifica presença dos termos. */

function hasAllTerms(tokens,terms){
  return terms.every(t=>tokens.includes(t));
}


/* Extrai blocos completos do tipo:
   ( termo OR termo )
   e identifica a qual conceito pertencem. */

function identifyBlocks(tokens){

  const blocks=[];

  for(let i=0;i<=tokens.length-5;i++){

    const p=tokens.slice(i,i+5);

    if(
      p[0]==="(" &&
      p[2]==="OR" &&
      p[4]===")"
    ){

      const terms=[p[1],p[3]];

      if(
        terms.includes("vaccination") &&
        terms.includes("immunization")
      ){
        blocks.push({
          type:"vaccination",
          start:i,
          end:i+4
        });
      }

      if(
        terms.includes('"health education"') &&
        terms.includes('"educational intervention"')
      ){
        blocks.push({
          type:"education",
          start:i,
          end:i+4
        });
      }

      if(
        terms.includes("child") &&
        terms.includes("children")
      ){
        blocks.push({
          type:"population",
          start:i,
          end:i+4
        });
      }
    }
  }

  return blocks;
}


/* Verifica se os três blocos completos estão ligados
   exclusivamente por AND, independentemente da ordem. */

function blocksConnectedByAND(tokens,blocks){

  if(blocks.length!==3) return false;

  const ordered=[...blocks].sort((a,b)=>a.start-b.start);

  /* Não pode haver conteúdo antes ou depois
     dos três blocos. */

  if(ordered[0].start!==0) return false;
  if(ordered[2].end!==tokens.length-1) return false;

  /* Entre bloco 1 e 2 deve existir apenas AND. */
  const between1=tokens.slice(
    ordered[0].end+1,
    ordered[1].start
  );

  /* Entre bloco 2 e 3 deve existir apenas AND. */
  const between2=tokens.slice(
    ordered[1].end+1,
    ordered[2].start
  );

  return (
    between1.length===1 &&
    between1[0]==="AND" &&
    between2.length===1 &&
    between2[0]==="AND"
  );
}


/* Verifica equilíbrio básico dos parênteses. */

function parenthesesBalanced(tokens){

  let level=0;

  for(const t of tokens){

    if(t==="(") level++;

    if(t===")"){
      level--;
      if(level<0) return false;
    }
  }

  return level===0;
}


/* =========================================================
   TESTE DA ESTRATÉGIA
   ========================================================= */

function testSearch(){

  state.searchAttempts++;

  const tokens=state.searchTokens;
  const strategy=normalizeSearch(tokens);

  /* -------------------------------------------------------
     DIMENSÃO 1 — TERMOS / CONCEITOS
     ------------------------------------------------------- */

  const vaccinationTerms=[
    "vaccination",
    "immunization"
  ];

  const educationTerms=[
    '"health education"',
    '"educational intervention"'
  ];

  const populationTerms=[
    "child",
    "children"
  ];

  const vaccinationComplete=
    hasAllTerms(tokens,vaccinationTerms);

  const educationComplete=
    hasAllTerms(tokens,educationTerms);

  const populationComplete=
    hasAllTerms(tokens,populationTerms);

  const conceptsComplete=
    vaccinationComplete &&
    educationComplete &&
    populationComplete;


  /* -------------------------------------------------------
     DIMENSÃO 2 — OR DENTRO DOS BLOCOS
     ------------------------------------------------------- */

  const vaccinationOR=
    validORBlock(
      tokens,
      "vaccination",
      "immunization"
    );

  const educationOR=
    validORBlock(
      tokens,
      '"health education"',
      '"educational intervention"'
    );

  const populationOR=
    validORBlock(
      tokens,
      "child",
      "children"
    );


  /* -------------------------------------------------------
     DIMENSÃO 3 — AND INADEQUADO ENTRE SINÔNIMOS
     ------------------------------------------------------- */

  const vaccinationAND=
    hasANDInsideConcept(
      tokens,
      "vaccination",
      "immunization"
    );

  const educationAND=
    hasANDInsideConcept(
      tokens,
      '"health education"',
      '"educational intervention"'
    );

  const populationAND=
    hasANDInsideConcept(
      tokens,
      "child",
      "children"
    );


  /* -------------------------------------------------------
     DIMENSÃO 4 — PARÊNTESES
     ------------------------------------------------------- */

  const balanced=
    parenthesesBalanced(tokens);

  const hasParentheses=
    tokens.includes("(") &&
    tokens.includes(")");


  /* -------------------------------------------------------
     DIMENSÃO 5 — BLOCOS E AND ENTRE CONCEITOS
     ------------------------------------------------------- */

  const blocks=identifyBlocks(tokens);

  const allBlocks=
    vaccinationOR &&
    educationOR &&
    populationOR;

  const correctConnections=
    blocksConnectedByAND(tokens,blocks);


  /* -------------------------------------------------------
     RESULTADO FINAL
     ------------------------------------------------------- */

  const correct=
    conceptsComplete &&
    allBlocks &&
    balanced &&
    correctConnections;


  /* Registra dados detalhados para análise futura. */

  event("search_attempt",{
    strategy:strategy,
    attempt:state.searchAttempts,

    validation:{
      conceptsComplete,
      vaccinationComplete,
      educationComplete,
      populationComplete,

      vaccinationOR,
      educationOR,
      populationOR,

      vaccinationAND,
      educationAND,
      populationAND,

      hasParentheses,
      parenthesesBalanced:balanced,

      blocksConnectedByAND:correctConnections,

      correct
    }
  });


  /* =====================================================
     MONTA O RAIO-X
     ===================================================== */

  let diagnostic=[];

  diagnostic.push(
    `<p><b>Conceitos:</b> ${
      conceptsComplete
      ?"✓ Os três conceitos estão representados."
      :"⚠️ Um ou mais conceitos estão incompletos."
    }</p>`
  );

  diagnostic.push(
    `<p><b>Termos alternativos:</b> ${
      conceptsComplete
      ?"✓ Foram incluídas alternativas para os três conceitos."
      :"⚠️ Verifique se cada conceito contém os termos propostos."
    }</p>`
  );

  diagnostic.push(
    `<p><b>Operadores dentro dos blocos:</b> ${
      allBlocks
      ?"✓ OR foi utilizado adequadamente entre os termos alternativos."
      :"⚠️ Há problema na relação entre termos de um mesmo conceito."
    }</p>`
  );

  diagnostic.push(
    `<p><b>Relação entre os conceitos:</b> ${
      correctConnections
      ?"✓ Os três blocos estão relacionados por AND."
      :"⚠️ Os conceitos ainda não estão corretamente relacionados."
    }</p>`
  );

  diagnostic.push(
    `<p><b>Agrupamento:</b> ${
      allBlocks && balanced
      ?"✓ Os parênteses delimitam os três blocos conceituais."
      :"⚠️ Os blocos conceituais não estão adequadamente delimitados."
    }</p>`
  );

  diagnostic.push(
    `<p><b>Expressões compostas:</b> ✓ As expressões apresentadas nos cartões mantêm as aspas duplas.</p>`
  );


  let explanation="";


  /* =====================================================
     ERRO: AND ENTRE TERMOS ALTERNATIVOS
     ===================================================== */

  if(
    vaccinationAND ||
    educationAND ||
    populationAND
  ){

    let blocksWrong=[];

    if(vaccinationAND)
      blocksWrong.push("VACINAÇÃO");

    if(educationAND)
      blocksWrong.push("EDUCAÇÃO");

    if(populationAND)
      blocksWrong.push("POPULAÇÃO");

    explanation=`
      <div class="feedback">

        <h3>⚠️ AND ENTRE TERMOS DO MESMO CONCEITO</h3>

        <p>
          Observe ${
            blocksWrong.length===1
            ?"o bloco"
            :"os blocos"
          }:
          <b>${blocksWrong.join(", ")}</b>.
        </p>

        <p>
          Ao utilizar <b>AND</b> entre termos alternativos,
          você solicita registros que atendam às duas condições.
        </p>

        <div class="paper">
          <b>Exemplo</b><br>
          Educational strategies to improve childhood vaccination<br><br>
          vaccination ✓ &nbsp;&nbsp;
          immunization ✗
        </div>

        <p>
          Esse trabalho poderia ser relevante, mas poderá deixar
          de ser recuperado se a estratégia exigir simultaneamente
          <b>vaccination AND immunization</b>.
        </p>

        <p>
          💡 <b>Reflita:</b> os termos representam conceitos que
          precisam ocorrer simultaneamente ou maneiras alternativas
          de representar um mesmo conceito?
        </p>

      </div>`;
  }


  /* =====================================================
     ERRO: AUSÊNCIA / PROBLEMA DE PARÊNTESES
     ===================================================== */

  else if(
    !hasParentheses ||
    !balanced ||
    !allBlocks
  ){

    explanation=`
      <div class="feedback">

        <h3>⚠️ OS BLOCOS CONCEITUAIS NÃO ESTÃO DELIMITADOS</h3>

        <p>
          Os parênteses ajudam a informar explicitamente à base
          quais termos pertencem a cada conceito.
        </p>

        <p>
          Sem o agrupamento adequado, a base utilizará suas regras
          de precedência para decidir quais operações serão
          realizadas primeiro.
        </p>

        <div class="project-grid">

          <div class="project-box">
            <b>VACINAÇÃO</b>
            <p>
              vaccination<br>
              immunization
            </p>
          </div>

          <div class="project-box">
            <b>EDUCAÇÃO</b>
            <p>
              "health education"<br>
              "educational intervention"
            </p>
          </div>

          <div class="project-box">
            <b>POPULAÇÃO</b>
            <p>
              child<br>
              children
            </p>
          </div>

        </div>

        <p>
          Sua intenção é construir três conceitos e permitir
          alternativas dentro de cada um deles.
        </p>

        <p>
          💡 <b>Pense:</b> como os parênteses podem mostrar quais
          termos pertencem ao mesmo conceito?
        </p>

      </div>`;
  }


  /* =====================================================
     ERRO: OR ENTRE CONCEITOS / CONEXÃO DOS BLOCOS
     ===================================================== */

  else if(!correctConnections){

    explanation=`
      <div class="feedback">

        <h3>⚠️ OBSERVE A RELAÇÃO ENTRE OS CONCEITOS</h3>

        <p>
          Os termos dentro dos blocos estão organizados, mas
          a relação entre os diferentes conceitos precisa ser revista.
        </p>

        <p>
          Quando <b>OR</b> conecta conceitos diferentes, a busca pode
          recuperar registros relacionados a apenas um deles.
        </p>

        <div class="paper">
          <b>Vaccination coverage among older adults</b><br>
          Vacinação ✓ &nbsp;
          Educação ✗ &nbsp;
          Crianças ✗
        </div>

        <div class="paper">
          <b>Health education for patients with diabetes</b><br>
          Vacinação ✗ &nbsp;
          Educação ✓ &nbsp;
          Crianças ✗
        </div>

        <div class="paper">
          <b>Childhood nutrition and physical activity</b><br>
          Vacinação ✗ &nbsp;
          Educação ✗ &nbsp;
          Crianças ✓
        </div>

        <p>
          Dependendo da estratégia construída, registros como esses
          podem ser recuperados mesmo sem reunir os três conceitos.
        </p>

        <p>
          💡 <b>Reflita:</b> você quer trabalhos sobre qualquer um
          desses assuntos isoladamente ou trabalhos que relacionem
          <b>vacinação + educação + crianças</b>?
        </p>

      </div>`;
  }


  /* =====================================================
     ESTRATÉGIA CORRETA
     ===================================================== */

  if(correct){

    explanation=`
      <div class="feedback good">

        <h3>✓ ESTRATÉGIA LOGICAMENTE ADEQUADA</h3>

        <p>
          A ordem dos blocos e a ordem dos termos dentro de cada
          bloco podem variar. O importante é a relação lógica
          estabelecida entre eles.
        </p>

        <p>
          <b>OR — alternativas dentro do conceito</b><br>
          Permite recuperar registros que utilizem uma forma,
          a outra ou ambas.
        </p>

        <p>
          <b>AND — relação entre conceitos diferentes</b><br>
          Solicita registros que relacionem os diferentes conceitos
          da pergunta.
        </p>

        <p>
          <b>Parênteses — agrupamento</b><br>
          Explicitam quais termos pertencem a cada bloco conceitual.
        </p>

        <p>
          <b>Aspas — expressões compostas</b><br>
          Indicam que expressões como
          <b>"health education"</b> devem ser tratadas como uma
          unidade, conforme a sintaxe da base consultada.
        </p>

        <div class="project-box">

          <b>EM LINGUAGEM COMUM, VOCÊ PEDIU À BASE:</b>

          <p>
            “Encontre registros relacionados a
            <b>vacinação E educação E crianças</b>,
            aceitando diferentes termos para representar
            cada um desses conceitos.”
          </p>

        </div>

        <button onclick="searchResults()">
          VER RESULTADOS SIMULADOS →
        </button>

      </div>`;

    award(15,"estratégia de busca");
  }


  /* =====================================================
     EXIBE O RESULTADO
     ===================================================== */

  $("searchFeedback").innerHTML=`
    <div class="feedback info">

      <h3>🔎 RAIO-X DA ESTRATÉGIA</h3>

      ${diagnostic.join("")}

    </div>

    ${explanation}
  `;
}
function searchResults(){
 addJournal("🔎 Estratégia de busca",'(vaccination OR immunization) AND ("health education" OR "educational intervention") AND (child OR children)');
 $("workContent").innerHTML=`<div class="work-card"><h2>3. Resultados simulados</h2><p>Selecione <b>três</b> trabalhos que parecem mais úteis para fundamentar uma ação educativa com famílias.</p><div class="result-list">
 ${paper("P1","Dialogue-based vaccine education with parents: a community intervention","Roda de conversa, espaço para dúvidas e participação das famílias.")}
 ${paper("P2","Childhood fractures in school playgrounds","Estudo sobre traumatismos em recreios escolares.")}
 ${paper("P3","Educational interventions and vaccine confidence among caregivers","Estratégias educativas e dúvidas/receios de responsáveis.")}
 ${paper("P4","Reminder and vaccination guidance strategies in primary care","Orientação, lembretes e encaminhamento para atualização vacinal.")}
 ${paper("P5","Antibiotic use in pediatric respiratory infections","Uso de antibióticos em infecções respiratórias.")}
 </div><button onclick="finishPapers()">USAR EVIDÊNCIAS NO PROJETO</button></div>`;
}
function paper(id,title,desc){return `<button class="paper ${state.selectedPapers.includes(id)?"selected":""}" onclick="togglePaper('${id}')"><b>${title}</b><p>${desc}</p></button>`}
function togglePaper(id){state.selectedPapers.includes(id)?state.selectedPapers=state.selectedPapers.filter(x=>x!==id):state.selectedPapers.push(id);event("paper_toggle",{paper:id,selected:state.selectedPapers.includes(id)});searchResults()}
function finishPapers(){
 const good=["P1","P3","P4"];event("paper_submit",{selected:[...state.selectedPapers]});
 if(state.selectedPapers.length!==3){alert("Selecione exatamente três trabalhos.");return}
 const score=state.selectedPapers.filter(x=>good.includes(x)).length;
 if(score<2){alert("Sua seleção tem pouca relação com a ação proposta. Revise títulos e descrições.");return}
 award(10,"seleção de evidências");chooseStrategies();
}
function chooseStrategies(){
 $("workContent").innerHTML=`<div class="work-card"><h2>4. Monte a ação de extensão</h2><p>Escolha <b>três componentes</b>. Não há uma única combinação perfeita; suas escolhas serão recuperadas quando a ação acontecer.</p><div class="answers">
 ${strategy("lecture","Palestra sobre importância das vacinas")}
 ${strategy("dialogue","Roda de conversa com responsáveis")}
 ${strategy("questions","Espaço estruturado para dúvidas")}
 ${strategy("cards","Conferência/orientação sobre cadernetas")}
 ${strategy("leaflet","Material educativo para levar para casa")}
 ${strategy("diseases","Exposição sobre doenças imunopreveníveis")}
 </div><p><b>Selecionados:</b> <span id="strategyCount">${state.extensionStrategies.length}</span>/3</p><button onclick="finishProject()">FINALIZAR PROJETO</button></div>`;
}
const strategyLabels={lecture:"Palestra sobre importância das vacinas",dialogue:"Roda de conversa com responsáveis",questions:"Espaço estruturado para dúvidas",cards:"Conferência/orientação sobre cadernetas",leaflet:"Material educativo",diseases:"Exposição sobre doenças imunopreveníveis"};
function strategy(id,label){return `<button class="answer ${state.extensionStrategies.includes(id)?"selected":""}" onclick="toggleStrategy('${id}')">${state.extensionStrategies.includes(id)?"☑":"☐"} ${label}</button>`}
function toggleStrategy(id){if(state.extensionStrategies.includes(id))state.extensionStrategies=state.extensionStrategies.filter(x=>x!==id);else if(state.extensionStrategies.length<3)state.extensionStrategies.push(id);event("strategy_toggle",{strategy:id,selected:state.extensionStrategies.includes(id)});chooseStrategies()}
function finishProject(){
 if(state.extensionStrategies.length!==3){alert("Escolha três componentes para a ação.");return}
 event("project_complete",{objective:state.extensionObjective,strategies:[...state.extensionStrategies],papers:[...state.selectedPapers]});
 award(15,"projeto de extensão concluído");addJournal("📋 Projeto de extensão","Objetivo definido, busca bibliográfica realizada e estratégias selecionadas para a ação com as famílias.");
 state.stage="execute";save();show("map");updateMap();
}

/* EXECUÇÃO E INSIGHTS */
const familyPeople={
 carlos:["👨🏿","Carlos • Pai","Eu sei que vacina é importante. O problema é que trabalho até as 18h e, quando consigo sair, a sala de vacinação já fechou.","O horário de funcionamento pode dificultar o acesso de algumas famílias."],
 patricia:["👩🏻","Patrícia • Mãe","Nós mudamos há alguns meses e perdi a caderneta. Não sei quais doses meu filho ainda precisa tomar.","Perda da caderneta e incerteza sobre doses pendentes apareceram durante a ação."],
 aline:["👩🏽","Aline • Responsável","Fiquei com receio de uma vacina depois de ver vários vídeos nas redes sociais falando de reações.","Informações das redes sociais podem gerar dúvidas e receios sobre vacinação."],
 marcos:["👨🏼","Marcos • Pai","Eu achava que depois de pequeno só precisava vacinar novamente quando tivesse campanha.","Alguns responsáveis desconhecem a continuidade do calendário vacinal."]
};
function familyAction(){
 setScene("🏫 ESCOLA • DIA DA AÇÃO","AÇÃO DE EXTENSÃO COM AS FAMÍLIAS","family-room");renderFamilies();
 $("dialog").innerHTML=`${speaker("📋","SEU PROJETO")}<p><b>Objetivo:</b> promover orientação e diálogo sobre vacinação infantil.</p><p><b>Componentes escolhidos:</b> ${state.extensionStrategies.map(x=>strategyLabels[x]).join("; ")}.</p><p>Converse com as famílias. A prática pode revelar situações que o planejamento não antecipou.</p>`;
}
function renderFamilies(){
 $("npcs").innerHTML=Object.entries(familyPeople).map(([k,p])=>`<button class="npc ${state.familyTalked[k]?"done":""}" onclick="talkFamily('${k}')">${state.familyTalked[k]?"":'<span class="bang">!</span>'}${p[0]}<label>${p[1]}</label></button>`).join("");
}
function talkFamily(k){
 const p=familyPeople[k];state.familyTalked[k]=true;event("npc",{npc:k});addInsight(p[3]);renderFamilies();
 const all=Object.values(state.familyTalked).every(Boolean);
 $("dialog").innerHTML=`${speaker(p[0],p[1].toUpperCase())}<p>“${p[2]}”</p><div class="feedback info"><b>💡 INSIGHT REGISTRADO</b><p>${p[3]}</p></div>${all?'<button class="continue" onclick="evaluateAction()">AVALIAR A AÇÃO →</button>':"<p><small>Continue ouvindo as demais famílias.</small></p>"}`;
}
function evaluateAction(){
 show("workspace");$("workTitle").textContent="🔄 AVALIAÇÃO DA AÇÃO";
 $("workContent").innerHTML=`<div class="work-card"><h2>O planejamento encontrou a realidade</h2><div class="project-grid"><div class="project-box"><b>O QUE VOCÊ PLANEJOU</b><p>${state.extensionStrategies.map(x=>"• "+strategyLabels[x]).join("<br>")}</p></div><div class="project-box"><b>O QUE A COMUNIDADE TROUXE</b><p>${state.insights.map(x=>"• "+x).join("<br>")}</p></div></div><h3>Quanto sua ação respondeu ao que apareceu na prática?</h3><div class="row-actions">${[1,2,3,4,5].map(n=>`<button onclick="rateAction(${n})">${n}</button>`).join("")}</div><p>1 = muito pouco &nbsp; • &nbsp; 5 = muito bem</p><div id="reasonBox"></div></div>`;
}
function rateAction(n){
 state.actionRating=n;event("rating",{id:"ACTION_RATING",value:n});
 $("reasonBox").innerHTML=`<h3>Por que você fez essa avaliação?</h3><div class="answers">
 ${answer("<b>A.</b> Porque uma única ação educativa deveria resolver todas as causas do atraso vacinal.","actionReason('A')")}
 ${answer("<b>B.</b> Porque a ação pode responder a algumas necessidades, mas a experiência revelou situações que exigem outras estratégias ou articulações.","actionReason('B')")}
 ${answer("<b>C.</b> Porque a atividade não aumentou imediatamente a cobertura vacinal.","actionReason('C')")}
 ${answer("<b>D.</b> Porque os problemas relatados pelas famílias não fazem parte de um projeto de extensão.","actionReason('D')")}
 </div>`;
}
function actionReason(a){
 state.actionReason=a;event("choice",{id:"ACTION_REASON",answer:a});
 if(a!=="B"){alert("Reavalie: uma ação extensionista pode ser útil sem resolver todas as situações, e a avaliação deve considerar seu objetivo e os limites encontrados.");return}
 award(10,"avaliação crítica");state.stage="insights";save();show("map");updateMap();
}

/* CLASSIFICAÇÃO */
const questions=[
 ["Q1","Podemos incluir conferência das cadernetas na próxima ação?","ext"],
 ["Q2","Podemos articular com a UBS uma ação em horário mais acessível?","ext"],
 ["Q3","Quais são os principais fatores associados ao atraso vacinal entre as crianças da comunidade?","research"],
 ["Q4","Qual é a frequência de atraso vacinal entre as crianças atendidas pela UBS?","research"],
 ["Q5","Como abordar dúvidas relacionadas a informações falsas na próxima atividade?","ext"],
 ["Q6","Como as famílias compreendem informações sobre vacinação divulgadas nas redes sociais?","both"]
];
function insightWorkshop(){
 show("workspace");$("workTitle").textContent="💡 O QUE AINDA NÃO SABEMOS?";
 $("workContent").innerHTML=`<div class="work-card"><h2>Dos insights aos novos questionamentos</h2><p><b>Prof. Helena:</b> “Nem tudo que surgiu na prática exige uma pesquisa. Algumas questões orientam diretamente a melhoria da extensão; outras exigem produção sistemática de conhecimento; algumas podem contribuir para os dois caminhos.”</p><div class="classify-grid"><div class="bucket"><b>🤝 EXTENSÃO</b><div id="bExt"></div></div><div class="bucket"><b>🔬 PESQUISA</b><div id="bResearch"></div></div><div class="bucket"><b>🔄 AMBAS</b><div id="bBoth"></div></div></div><div id="unclassified"></div><button onclick="checkClassification()">CONFERIR CLASSIFICAÇÃO</button><div id="classFeedback"></div></div>`;renderClassification();
}
function renderClassification(){
 ["bExt","bResearch","bBoth"].forEach(id=>$(id).innerHTML="");$("unclassified").innerHTML="";
 questions.forEach(([id,text])=>{
  const c=state.classifications[id];
  const card=`<div class="insight-card"><b>${text}</b><div class="class-buttons"><button onclick="classify('${id}','ext')">Extensão</button><button onclick="classify('${id}','research')">Pesquisa</button><button onclick="classify('${id}','both')">Ambas</button></div></div>`;
  if(c==="ext")$("bExt").innerHTML+=card;else if(c==="research")$("bResearch").innerHTML+=card;else if(c==="both")$("bBoth").innerHTML+=card;else $("unclassified").innerHTML+=card;
 });
}
function classify(id,c){state.classifications[id]=c;event("classification",{question:id,category:c});renderClassification()}
function checkClassification(){
 if(Object.keys(state.classifications).length<questions.length){$("classFeedback").innerHTML=`<div class="feedback">Classifique todos os questionamentos antes de continuar.</div>`;return}
 const errors=questions.filter(([id,t,correct])=>state.classifications[id]!==correct);
 event("classification_submit",{errors:errors.map(x=>x[0]),answers:{...state.classifications}});
 if(errors.length){
  $("classFeedback").innerHTML=`<div class="feedback"><b>REVEJA ${errors.length} CLASSIFICAÇÃO(ÕES)</b><p><b>Extensão:</b> decisões que podem orientar ou modificar diretamente a ação.</p><p><b>Pesquisa:</b> perguntas cuja resposta exige coleta e análise sistemática de informações.</p><p><b>Ambas:</b> uma questão pode orientar a prática e também ser investigada sistematicamente.</p></div>`;return;
 }
 award(15,"distinguir extensão e pesquisa");$("classFeedback").innerHTML=`<div class="feedback good"><b>✓ CLASSIFICAÇÃO CONCLUÍDA</b><p>A extensão pode ser aprimorada a partir do que ocorreu na prática. Ao mesmo tempo, algumas lacunas exigem investigação sistemática para serem respondidas.</p><button onclick="whyResearch()">CONTINUAR →</button></div>`;
}
function whyResearch(){
 $("workContent").innerHTML=`<div class="work-card"><h2>Por que uma questão pode exigir pesquisa?</h2><p>Considere: <b>“Quais são os principais fatores associados ao atraso vacinal entre as crianças da comunidade?”</b></p><div class="answers">
 ${answer("<b>A.</b> Porque qualquer pergunta relacionada à saúde precisa ser estudada cientificamente.","whyResearchAnswer('A')")}
 ${answer("<b>B.</b> Porque respondê-la exige coleta e análise sistemática de informações para produzir conhecimento sobre o fenômeno.","whyResearchAnswer('B')")}
 ${answer("<b>C.</b> Porque projetos de extensão não podem obter nenhuma informação da comunidade.","whyResearchAnswer('C')")}
 ${answer("<b>D.</b> Porque somente pesquisadores podem discutir fatores relacionados à vacinação.","whyResearchAnswer('D')")}
 </div></div>`;
}
function whyResearchAnswer(a){
 event("choice",{id:"WHY_RESEARCH",answer:a});
 if(a!=="B"){alert("A diferença não está no tema nem em quem faz a pergunta. O ponto é a necessidade de produzir e analisar dados de modo sistemático para responder ao questionamento.");return}
 award(10,"reconhecer questão de pesquisa");state.stage="research";save();researchChoice();
}

/* TRANSIÇÃO PARA PESQUISA */
function researchChoice(){
 show("workspace");$("workTitle").textContent="🔬 ESCOLHA UMA PERGUNTA DE PESQUISA";
 $("workContent").innerHTML=`<div class="work-card"><h2>Da prática à investigação</h2><p>Escolha uma das questões para iniciar a proposta. Todas podem originar pesquisas, mas pedem informações diferentes.</p>
 ${researchOption("R1","Qual é a frequência de atraso vacinal entre as crianças da comunidade?","Queremos saber quanto/quantos; será necessário obter informações que permitam medir a ocorrência.")}
 ${researchOption("R2","Quais fatores estão associados ao atraso vacinal entre crianças atendidas pela UBS Vila Aurora?","Queremos estudar relações entre características e um desfecho.")}
 ${researchOption("R3","Quais são as principais dúvidas e percepções dos responsáveis sobre a vacinação infantil?","Queremos compreender experiências, opiniões e significados.")}
 <button onclick="finishResearchChoice()">CONFIRMAR PERGUNTA</button></div>`;
}
function researchOption(id,q,hint){return `<button class="paper ${state.researchQuestion===id?"selected":""}" onclick="selectResearch('${id}')"><b>${q}</b><p>🔎 ${hint}</p></button>`}
function selectResearch(id){state.researchQuestion=id;event("research_question",{id});researchChoice()}
function finishResearchChoice(){
 if(!state.researchQuestion){alert("Escolha uma pergunta.");return}
 award(10,"seleção de pergunta");state.stage="done";save();$("finalXp").textContent=state.xp;show("chapterEnd");
}
function openResearchStart(){
 state.projectStarted=true;event("research_project_started",{question:state.researchQuestion});save();
 show("workspace");$("workTitle").textContent="🔬 PROPOSTA DE PESQUISA";
 const qs={R1:"Qual é a frequência de atraso vacinal entre as crianças da comunidade?",R2:"Quais fatores estão associados ao atraso vacinal entre crianças atendidas pela UBS Vila Aurora?",R3:"Quais são as principais dúvidas e percepções dos responsáveis sobre a vacinação infantil?"};
 $("workContent").innerHTML=`<div class="work-card"><h2>Novo documento desbloqueado</h2><div class="project-box"><b>Origem da pergunta</b><p>Surgiu durante a execução e avaliação do projeto de extensão sobre vacinação infantil.</p></div><div class="project-box"><b>Pergunta de pesquisa</b><p>${qs[state.researchQuestion]}</p></div><div class="project-grid"><div class="project-box">🔒 Justificativa</div><div class="project-box">🔒 Objetivos</div><div class="project-box">🔒 População</div><div class="project-box">🔒 Método</div><div class="project-box">🔒 Dados</div><div class="project-box">🔒 Aspectos éticos</div></div><div class="feedback info"><b>FIM DO PROTÓTIPO DE TESTE DO CAPÍTULO 1</b><p>O próximo bloco poderá desenvolver a proposta de pesquisa a partir da pergunta escolhida.</p></div><button onclick="openData()">VER DADOS REGISTRADOS</button></div>`;
}

/* CADERNO E DADOS */
function openJournal(){renderJournal();$("journal").classList.remove("hidden")}function closeJournal(){$("journal").classList.add("hidden")}
function renderJournal(){
 let h="";
 if(journalTab==="registros")h=state.journal.length?state.journal.map(e=>`<div class="entry"><b>${e.title}</b><p>${e.text}</p></div>`).join(""):"<p>Sem registros.</p>";
 if(journalTab==="projeto")h=`<div class="project-grid"><div class="project-box"><b>Objetivo</b><p>${state.extensionObjective==="C"?"Promover orientação e diálogo sobre vacinação infantil.":"Ainda não definido."}</p></div><div class="project-box"><b>Estratégias</b><p>${state.extensionStrategies.length?state.extensionStrategies.map(x=>strategyLabels[x]).join("<br>"):"Ainda não definidas."}</p></div><div class="project-box"><b>Evidências selecionadas</b><p>${state.selectedPapers.length?state.selectedPapers.join(", "):"Ainda não selecionadas."}</p></div><div class="project-box"><b>Pergunta de pesquisa</b><p>${state.researchQuestion||"Ainda não escolhida."}</p></div></div>`;
 if(journalTab==="insights")h=state.insights.length?state.insights.map(x=>`<div class="insight-card">💡 ${x}</div>`).join(""):"<p>Os insights surgirão durante a execução da ação.</p>";
 $("journalEntries").innerHTML=h;
}
function openData(){
 $("dataModal").classList.remove("hidden");
 $("dataSummary").innerHTML=`<p><b>Etapa:</b> ${state.stage} &nbsp; | &nbsp; <b>XP:</b> ${state.xp} &nbsp; | &nbsp; <b>Eventos:</b> ${state.events.length} &nbsp; | &nbsp; <b>Tentativas de busca:</b> ${state.searchAttempts}</p><p><small>Para o protótipo, os dados ficam apenas no <b>localStorage</b> deste navegador. O botão abaixo permite exportar um JSON para teste. Para pesquisa real com estudantes, será necessário posteriormente um backend/banco de dados e consentimento/fluxo ético apropriado.</small></p>`;
 $("dataDump").value=JSON.stringify(state,null,2);
}
function closeData(){$("dataModal").classList.add("hidden")}
async function copyData(){await navigator.clipboard.writeText(JSON.stringify(state,null,2));alert("JSON copiado.")}
function downloadData(){const b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="mcm-capitulo1-teste.json";a.click();URL.revokeObjectURL(a.href)}
function resetGame(){if(confirm("Apagar o progresso deste navegador e reiniciar o teste?")){localStorage.removeItem(STORE);location.reload()}}
syncXP();
