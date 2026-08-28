const STORE="mcm_cap1_test_v1";
let journalTab="registros";
const defaultState={
  xp:0,
  stage:"school1",
  events:[],
  journal:[],
  insights:[],

  schoolTalked:{
    marina:false,
    rafael:false,
    camila:false
  },

  ubsOrder:[
    "ubs",
    "objective",
    "strategy",
    "materials"
  ],

  ubsJustification:null,

  extensionObjective:null,
  extensionVerb:null,
  objectiveVerbOrder:[],
  extensionSpecifics:[],
  extensionStrategies:[],

  projectNeed:null,
  projectNeedOrder:[],
  projectAudience:[
    "children",
    "workers"
  ],

  projectMethods:{},
  projectSequence:[],
  projectResources:[],
  projectEvaluation:{},
  projectValidated:false,

  searchTokens:[],
  searchAttempts:0,
  selectedPapers:[],

  schoolActionTalked:{
    joao:false,
    beatriz:false,
    lucia:false,
    paulo:false
  },

  actionRating:null,
  actionReason:null,
  classifications:{},

  researchQuestion:null,
  projectStarted:false,

  /* =========================================
     ACOMPANHAMENTO FORMATIVO
     ========================================= */

  feedback:{
  necessidade:false,
  extensaoPesquisa:false,
  evidencias:false,
  projetoExtensao:false,
  perguntaPesquisa:false
},

totalTentativas:0};
let state=loadState();

const $=id=>document.getElementById(id);

function loadState(){

  try{

    const saved=
      JSON.parse(
        localStorage.getItem(STORE)||"{}"
      );

    return {
      ...structuredClone(defaultState),
      ...saved,

      feedback:{
        ...defaultState.feedback,
        ...(saved.feedback || {})
      }
    };

  }catch(e){

    return structuredClone(
      defaultState
    );
  }
}

function save(){
  localStorage.setItem(STORE,JSON.stringify(state));
  syncXP();
}

function shuffleArray(items){

  const shuffled=[...items];

  for(
    let i=shuffled.length-1;
    i>0;
    i--
  ){

    const j=
      Math.floor(
        Math.random()*(i+1)
      );

    [
      shuffled[i],
      shuffled[j]
    ]=[
      shuffled[j],
      shuffled[i]
    ];
  }

  return shuffled;
}

/* =========================================================
   ACOMPANHAMENTO FORMATIVO
   ========================================================= */

function registrarTentativa(){

  state.totalTentativas=
    (state.totalTentativas || 0) + 1;

  save();
}


function registrarAtencao(dominio){

  if(!state.feedback){
    state.feedback=
      structuredClone(
        defaultState.feedback
      );
  }

  if(dominio in state.feedback){

    state.feedback[dominio]=true;

    event(
      "feedback_attention",
      {domain:dominio}
    );
  }
}
function event(type,data={}){
  state.events.push({
    type,
    ...data,
    stage:state.stage,
    time:new Date().toISOString()
  });
  save();
}

function addJournal(title,text){
  if(!state.journal.some(x=>x.title===title)){
    state.journal.push({title,text});
    save();
  }
}

function addInsight(text){
  if(!state.insights.includes(text)){
    state.insights.push(text);
    save();
  }
}

function award(n,reason){
  state.xp+=n;
  event("xp",{points:n,reason});
}

function syncXP(){
  if($("xp")) $("xp").textContent=state.xp;
  document.querySelectorAll(".xpMirror").forEach(
    x=>x.textContent=state.xp
  );
}

function show(id){
  document.querySelectorAll(".screen").forEach(
    x=>x.classList.remove("active")
  );
  $(id).classList.add("active");
  syncXP();
}

function startGame(){
  show("map");
  updateMap();
}

function updateMap(){

  const map={
    school1:[
      "Primeira atividade na comunidade",
      "Visite a Escola Municipal.",
      "school"
    ],

    ubs:[
      "Articulação para a ação de extensão",
      "Converse com a equipe da UBS antes de fechar a proposta.",
      "ubs"
    ],

    faculty:[
      "Fundamentar e elaborar o projeto",
      "Vá à Faculdade/Biblioteca para elaborar o projeto e buscar evidências.",
      "faculty"
    ],

    execute:[
      "Executar a ação de extensão",
      "Retorne à Escola Municipal para realizar a ação com crianças e trabalhadores.",
      "school"
    ],

    insights:[
      "Analisar o que a prática revelou",
      "Organize os insights da ação em extensão, pesquisa ou ambas.",
      "faculty"
    ],

    research:[
      "Da extensão à pesquisa",
      "Escolha uma questão e inicie uma proposta de pesquisa.",
      "faculty"
    ],

    done:[
      "Capítulo concluído",
      "Revise o Caderno de Campo.",
      "none"
    ]

  }[state.stage]||[
    "Vila Aurora",
    "Continue sua jornada.",
    "none"
  ];

  $("missionTop").textContent=map[0];
  $("mapHint").textContent=map[1];

  [
    "schoolMarker",
    "ubsMarker",
    "facultyMarker"
  ].forEach(id=>$(id).classList.add("hidden"));

  if(map[2]==="school")
    $("schoolMarker").classList.remove("hidden");

  if(map[2]==="ubs")
    $("ubsMarker").classList.remove("hidden");

  if(map[2]==="faculty")
    $("facultyMarker").classList.remove("hidden");
}

function setScene(title,board,roomClass=""){

  show("scene");

  $("sceneTitle").textContent=title;
  $("sceneBoard").innerHTML=board;
  $("sceneRoom").className="room "+roomClass;
  $("npcs").innerHTML="";
  $("dialog").innerHTML="";
}

function speaker(icon,name){
  return `
    <div class="speaker">
      <span class="portrait">${icon}</span>
      <b>${name}</b>
    </div>
  `;
}

function answer(text,fn){
  return `
    <button class="answer" onclick="${fn}">
      ${text}
    </button>
  `;
}

function goSchool(){

  if(state.stage==="school1")
    return schoolIntro();

  if(state.stage==="execute")
    return familyAction();

  alert("Não há uma missão ativa na escola neste momento.");
}

function goUBS(){

  if(state.stage==="ubs")
    return ubsIntro();

  alert(
    "A UBS será utilizada quando a missão solicitar a articulação com o serviço."
  );
}

function goFaculty(){

  if(state.stage==="faculty")
    return extensionWorkshop();

  if(state.stage==="insights")
    return insightWorkshop();

  if(state.stage==="research")
    return researchChoice();

  alert(
    "A Faculdade/Biblioteca ainda não é necessária nesta etapa."
  );
}


/* =========================================================
   ESCOLA — PRIMEIRO CONTATO
   ========================================================= */

function schoolIntro(){

  setScene(
    "🏫 ESCOLA MUNICIPAL VILA AURORA",
    "BEM-VINDOS À <strong>ESCOLA VILA AURORA</strong>"
  );

  $("npcs").innerHTML=`
    <button class="npc" onclick="schoolFirst()">
      <span class="bang">!</span>
      👩🏽‍💼
      <label>Marina • Diretora</label>
    </button>
  `;

  $("dialog").innerHTML=`
    ${speaker("👩🏽‍💼","MARINA — DIRETORA")}

    <p>
      Sejam bem-vindos. Temos recebido avisos sobre crianças
      com vacinas atrasadas e algumas famílias demonstram dúvidas.
    </p>

    <p>
      <strong>
        Antes de pensar em uma ação, o que vocês pretendem fazer aqui?
      </strong>
    </p>

    <div class="answers">

      ${answer(
        "<b>A.</b> Explicar imediatamente quais cuidados as famílias devem adotar.",
        "schoolFirstAnswer('A')"
      )}

      ${answer(
        "<b>B.</b> Identificar uma doença importante e desenvolver uma solução.",
        "schoolFirstAnswer('B')"
      )}

      ${answer(
        "<b>C.</b> Conhecer a escola e ouvir como a comunidade percebe a situação.",
        "schoolFirstAnswer('C')"
      )}

      ${answer(
        "<b>D.</b> Coletar dados para realizar uma pesquisa com os alunos.",
        "schoolFirstAnswer('D')"
      )}

    </div>
  `;
}

function schoolFirst(){
  schoolIntro();
}

function schoolFirstAnswer(a){
  registrarTentativa();
  event("choice",{
    id:"ESCOLA_01",
    answer:a
  });

  if(a!=="C"){
    if(a==="A" || a==="B"){
      registrarAtencao("necessidade");
    }
    if(a==="D"){
  registrarAtencao("extensaoPesquisa");
}
    const fb={

      A:
        "A ação já começa com uma solução definida. Antes disso, é importante compreender a necessidade percebida pela comunidade.",

      B:
        "Definir previamente o problema e a solução pode fazer a universidade responder ao que ela imagina, e não ao que a comunidade percebe.",

      D:
        "Pesquisa e extensão podem se relacionar, mas a missão inicial é construir uma ação extensionista com a comunidade."

    }[a];

    $("dialog").innerHTML=`
      ${speaker("📖","CADERNO DE CAMPO")}

      <div class="feedback">
        <b>REVEJA A DECISÃO</b>
        <p>${fb}</p>
      </div>

      <button
        class="continue"
        onclick="schoolIntro()">
        TENTAR NOVAMENTE
      </button>
    `;

    return;
  }

  award(
    10,
    "escuta da comunidade"
  );

  addJournal(
    "👂 Escuta da comunidade",
    "A ação de extensão começa pela aproximação e pelo diálogo com a comunidade, evitando pressupor previamente uma única causa ou solução."
  );

  renderSchoolPeople();
}

const schoolPeople={

  marina:[
    "👩🏽‍💼",
    "Marina • Diretora",
    "A UBS informou que há crianças com vacinas atrasadas. Algumas famílias também procuram a escola com dúvidas.",
    "A escola identifica uma necessidade relacionada à vacinação infantil."
  ],

  rafael:[
    "👨🏿‍🏫",
    "Rafael • Professor",
    "Alguns responsáveis dizem que não sabem se a vacinação está em dia. Outros achavam que depois dos primeiros anos só haveria vacina em campanhas.",
    "Há dúvidas sobre calendário e situação vacinal."
  ],

  camila:[
    "👩🏻‍🏫",
    "Camila • Professora",
    "Já ouvimos relatos de falta de tempo, dúvidas sobre vacinas e também famílias que preferem não vacinar.",
    "As situações relatadas pelas famílias são diferentes."
  ]
};

function renderSchoolPeople(){

  $("npcs").innerHTML=
    Object.entries(schoolPeople)
      .map(([k,p])=>`

        <button
          class="npc ${state.schoolTalked[k]?"done":""}"
          onclick="talkSchool('${k}')">

          ${
            state.schoolTalked[k]
              ?""
              :'<span class="bang">!</span>'
          }

          ${p[0]}

          <label>
            ${p[1]}
          </label>

        </button>

      `).join("");

  $("dialog").innerHTML=`
    ${speaker("📋","MISSÃO")}

    <p>
      Converse com a diretora e os professores para compreender
      a necessidade percebida pela escola.
    </p>
  `;
}

function talkSchool(k){

  const p=schoolPeople[k];

  state.schoolTalked[k]=true;

  event("npc",{npc:k});

  addJournal(
    "📌 "+p[1],
    p[3]
  );

  renderSchoolPeople();

  const all=
    Object.values(state.schoolTalked)
      .every(Boolean);

  $("dialog").innerHTML=`
    ${speaker(p[0],p[1].toUpperCase())}

    <p>
      “${p[2]}”
    </p>

    <div class="feedback good">
      <b>REGISTRO</b>
      <p>${p[3]}</p>
    </div>

    ${
      all
        ?`
          <button
            class="continue"
            onclick="finishSchool()">
            CONCLUIR VISITA →
          </button>
        `
        :`
          <p>
            <small>
              Continue ouvindo os demais profissionais.
            </small>
          </p>
        `
    }
  `;
}

function finishSchool(){

  state.stage="ubs";

  award(
    10,
    "necessidade identificada"
  );

  event(
    "stage_complete",
    {stage_completed:"school1"}
  );

  save();

  show("map");
  updateMap();
}


/* =========================================================
   UBS — ARTICULAÇÃO
   ========================================================= */

function ubsIntro(){

  setScene(
    "🏥 UBS VILA AURORA",
    "ARTICULAÇÃO COM O SERVIÇO",
    "ubs-room"
  );

  $("npcs").innerHTML=`
    <button class="npc">
      👩🏿‍⚕️
      <label>Ana • Enfermeira</label>
    </button>
  `;

  $("dialog").innerHTML=`
    ${speaker("👩🏿‍⚕️","ANA — ENFERMEIRA")}

    <p>
      “A diretora comentou que vocês estiveram na escola.
      Nós também observamos crianças com vacinas atrasadas.
      Antes de fechar a atividade, vamos organizar os próximos passos.”
    </p>

   <button
  class="continue"
  onclick="ubsJustificationStep()">
  CONTINUAR →
</button>
  `;
}

function ubsJustificationStep(){

  show("workspace");

  $("workTitle").textContent=
    "🏥 UBS • ARTICULAÇÃO COM O SERVIÇO";

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        Por que conversar com a UBS antes de fechar a proposta?
      </h2>

      <p>
        A escola apresentou uma necessidade relacionada
        à vacinação infantil. A UBS também acompanha
        situações relacionadas à vacinação da comunidade.
      </p>

      <p>
        Qual é o principal papel dessa articulação
        neste momento?
      </p>

      <div class="answers">

        ${answer(
          "<b>A.</b> A UBS deve autorizar e definir toda atividade que será realizada na escola.",
          "ubsWhy('A')"
        )}

        ${answer(
          "<b>B.</b> A perspectiva do serviço pode complementar o que foi observado na escola e contribuir para o planejamento.",
          "ubsWhy('B')"
        )}

        ${answer(
          "<b>C.</b> Os profissionais da UBS conhecem melhor o problema e devem decidir o que a comunidade precisa.",
          "ubsWhy('C')"
        )}

        ${answer(
          "<b>D.</b> Os registros da UBS permitem determinar previamente as causas do atraso vacinal.",
          "ubsWhy('D')"
        )}

      </div>

    </div>
  `;
}

const orderLabels={

  ubs:
    "Conversar com a equipe da UBS sobre a situação observada",

  objective:
    "Definir o objetivo da ação de extensão",

  strategy:
    "Escolher a estratégia que será utilizada",

  materials:
    "Preparar os materiais necessários"
};

function ubsOrder(){

  show("workspace");

  $("workTitle").textContent=
    "🏥 UBS • ORGANIZE OS PRÓXIMOS PASSOS";

  renderOrder();
}

function renderOrder(){

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        🎯 Organize o plano inicial
      </h2>

      <p>
        Coloque as ações em uma sequência que represente
        como o grupo deveria avançar antes da execução.
      </p>

      <div class="sequence">

        ${
          state.ubsOrder.map((k,i)=>`

            <div class="seq-item">

              <span class="seq-num">
                ${i+1}
              </span>

              <span>
                ${orderLabels[k]}
              </span>

              <span class="mini-buttons">

                <button
                  onclick="moveOrder(${i},-1)">
                  ↑
                </button>

                <button
                  onclick="moveOrder(${i},1)">
                  ↓
                </button>

              </span>

            </div>

          `).join("")
        }

      </div>

      <button onclick="submitOrder()">
        CONFIRMAR ORDEM
      </button>

    </div>
  `;
}

function moveOrder(i,d){

  let j=i+d;

  if(j<0 || j>=state.ubsOrder.length)
    return;

  [
    state.ubsOrder[i],
    state.ubsOrder[j]
  ]=[
    state.ubsOrder[j],
    state.ubsOrder[i]
  ];

  event(
    "reorder",
    {
      id:"UBS_ORDEM",
      order:[...state.ubsOrder]
    }
  );

  renderOrder();
}

function submitOrder(){

  event(
    "sequence_submit",
    {
      id:"UBS_ORDEM",
      order:[...state.ubsOrder]
    }
  );

  const ok=
    state.ubsOrder.join(",")===
    "ubs,objective,strategy,materials";

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        ${
          ok
            ?"✓ A sequência é coerente"
            :"💭 Analise a sequência"
        }
      </h2>

      <p>
        ${
          ok
            ?"A articulação com o serviço antecede o fechamento do objetivo e da estratégia; os materiais vêm depois das decisões sobre o que a ação pretende realizar."
            :"A ordem escolhida foi registrada. O ponto central é evitar chegar à comunidade com materiais e estratégias fechados antes de articular a proposta e definir o que a ação pretende alcançar."
        }
      </p>

      <h3>
        Por que conversar com a UBS antes de fechar a proposta?
      </h3>

      <div class="answers">

        ${answer(
          "<b>A.</b> Porque a UBS deve autorizar e definir toda atividade que será realizada na escola.",
          "ubsWhy('A')"
        )}

        ${answer(
          "<b>B.</b> Porque a perspectiva do serviço pode complementar o que foi observado na escola e contribuir para o planejamento.",
          "ubsWhy('B')"
        )}

        ${answer(
          "<b>C.</b> Porque os profissionais da UBS conhecem melhor o problema e devem decidir o que a comunidade precisa.",
          "ubsWhy('C')"
        )}

        ${answer(
          "<b>D.</b> Porque os registros da UBS permitem determinar previamente as causas do atraso vacinal.",
          "ubsWhy('D')"
        )}

      </div>

    </div>
  `;
}

function ubsWhy(a){

  registrarTentativa();
  state.ubsJustification=a;

  event(
    "choice",
    {
      id:"UBS_JUSTIFICATIVA",
      answer:a
    }
  );

  if(a!=="B"){
    
    registrarAtencao("projetoExtensao");
    
    $("workContent").innerHTML+=`
      <div class="work-card feedback">

        <b>
          REVEJA O RACIOCÍNIO
        </b>

        <p>
          A articulação não transfere à UBS o poder de decidir
          sozinha nem transforma os registros do serviço em prova
          das causas. O serviço acrescenta uma perspectiva importante
          para construir uma ação contextualizada.
        </p>

        <button onclick="ubsJustificationStep()">
  REVER JUSTIFICATIVA
</button>

      </div>
    `;

    return;
  }

  award(
    10,
    "planejamento articulado"
  );

  addJournal(
    "🤝 Planejamento articulado",
    "Escola, serviço de saúde e universidade podem contribuir para construir uma ação extensionista contextualizada."
  );

  ubsPerspective();
}

function ubsPerspective(){

  setScene(
    "🏥 UBS VILA AURORA",
    "O QUE O SERVIÇO ACRESCENTA",
    "ubs-room"
  );

  $("npcs").innerHTML=`
    <button class="npc">
      👩🏿‍⚕️
      <label>Ana • Enfermeira</label>
    </button>
  `;

  $("dialog").innerHTML=`
    ${speaker("👩🏿‍⚕️","ANA — ENFERMEIRA")}

    <p>
      “Aqui também encontramos crianças com vacinas atrasadas,
      mas as situações não são iguais. Há famílias com dúvidas
      sobre doses pendentes, perdas de caderneta e atrasos
      percebidos em consultas por outros motivos.”
    </p>

    <p>
      “Uma boa ação não deve partir da ideia de que todas
      as famílias estão na mesma situação.”
    </p>

    <button
      class="continue"
      onclick="goToFacultyAfterUBS()">
      SEGUIR PARA A FACULDADE →
    </button>
  `;
}

function goToFacultyAfterUBS(){

  addJournal(
    "🏥 Perspectiva da UBS",
    "A UBS confirma que há situações vacinais diversas e reforça que a ação não deve pressupor uma única causa para os atrasos."
  );

  state.stage="faculty";

  event(
    "stage_complete",
    {stage_completed:"ubs"}
  );

  save();

  show("map");
  updateMap();
}


/* =========================================================
   FACULDADE / BIBLIOTECA
   ========================================================= */

function extensionWorkshop(){

  show("workspace");

  $("workTitle").textContent=
    "📚 FACULDADE / BIBLIOTECA";

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        Fundamentar antes de executar
      </h2>

      <p>
        <b>Prof. Helena:</b>
        “Já conhecemos a necessidade apresentada pela escola
        e ouvimos a UBS. Antes de formular os objetivos e os métodos,
        vamos buscar evidências que possam ajudar a fundamentar
        a proposta.”
      </p>

      <p>
        <strong>Pergunta de busca:</strong>
        que evidências existem sobre ações educativas
        relacionadas à vacinação infantil?
      </p>

      <button onclick="conceptBlocks()">
        CONSTRUIR A BUSCA →
      </button>

    </div>
  `;
}

function conceptBlocks(){

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        1. Organize os conceitos
      </h2>

      <p>
        Para este teste, trabalharemos com três blocos conceituais:
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
        Observe que expressões compostas aparecem entre
        <b>aspas duplas</b>. Na próxima etapa, você também
        deverá inserir operadores e parênteses.
      </p>

      <button onclick="searchBuilder()">
        MONTAR ESTRATÉGIA →
      </button>

    </div>
  `;
}

const availableTokens=[
  "(",
  ")",
  "vaccination",
  "immunization",
  '"health education"',
  '"educational intervention"',
  "child",
  "children",
  "AND",
  "OR"
];

function searchBuilder(){

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        2. Monte a estratégia de busca
      </h2>

      <p>
        Clique nos cartões na ordem desejada.
        Você deve organizar também <b>operadores e parênteses</b>.
        As expressões compostas já aparecem entre aspas duplas.
      </p>

      <div class="search-builder">

        ${
          availableTokens.map((t,i)=>`

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

          `).join("")
        }

      </div>

      <div
        class="search-line"
        id="searchLine">

        ${
          state.searchTokens.join(" ")
          ||
          "Sua estratégia aparecerá aqui..."
        }

      </div>

      <div class="row-actions">

        <button onclick="removeToken()">
          ← REMOVER ÚLTIMO
        </button>

        <button onclick="clearSearch()">
          LIMPAR
        </button>

        <button onclick="testSearch()">
          🔎 TESTAR ESTRATÉGIA
        </button>

      </div>

      <div id="searchFeedback"></div>

    </div>
  `;
}

function addToken(t){

  state.searchTokens.push(t);

  event(
    "search_token",
    {token:t}
  );

  searchBuilder();
}

function removeToken(){

  state.searchTokens.pop();

  event(
    "search_edit",
    {action:"remove"}
  );

  searchBuilder();
}

function clearSearch(){

  state.searchTokens=[];

  event(
    "search_edit",
    {action:"clear"}
  );

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

    if(option1 || option2)
      return true;
  }

  return false;
}


/* Detecta AND entre os dois termos de um mesmo conceito. */

function hasANDInsideConcept(tokens,a,b){

  for(let i=0;i<tokens.length-2;i++){

    if(
      (
        tokens[i]===a &&
        tokens[i+1]==="AND" &&
        tokens[i+2]===b
      )
      ||
      (
        tokens[i]===b &&
        tokens[i+1]==="AND" &&
        tokens[i+2]===a
      )
    ){
      return true;
    }
  }

  return false;
}


/* Verifica presença dos termos. */

function hasAllTerms(tokens,terms){

  return terms.every(
    t=>tokens.includes(t)
  );
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

      const terms=[
        p[1],
        p[3]
      ];

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

  if(blocks.length!==3)
    return false;

  const ordered=[
    ...blocks
  ].sort((a,b)=>a.start-b.start);

  if(ordered[0].start!==0)
    return false;

  if(ordered[2].end!==tokens.length-1)
    return false;

  const between1=tokens.slice(
    ordered[0].end+1,
    ordered[1].start
  );

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

    if(t==="(")
      level++;

    if(t===")"){

      level--;

      if(level<0)
        return false;
    }
  }

  return level===0;
}


/* =========================================================
   TESTE DA ESTRATÉGIA
   ========================================================= */

function testSearch(){
  registrarTentativa();

  state.searchAttempts++;

  const tokens=state.searchTokens;
  const strategy=normalizeSearch(tokens);

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


  /* -------------------------------------------------------
     DIMENSÃO 1 — CONCEITOS
     ------------------------------------------------------- */

  const vaccinationComplete=
    hasAllTerms(
      tokens,
      vaccinationTerms
    );

  const educationComplete=
    hasAllTerms(
      tokens,
      educationTerms
    );

  const populationComplete=
    hasAllTerms(
      tokens,
      populationTerms
    );

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
     DIMENSÃO 5 — CONEXÃO ENTRE BLOCOS
     ------------------------------------------------------- */

  const blocks=
    identifyBlocks(tokens);

  const allBlocks=
    vaccinationOR &&
    educationOR &&
    populationOR;

  const correctConnections=
    blocksConnectedByAND(
      tokens,
      blocks
    );


  /* -------------------------------------------------------
     RESULTADO FINAL
     ------------------------------------------------------- */

  const correct=
    conceptsComplete &&
    allBlocks &&
    balanced &&
    correctConnections;

if(!correct){
  registrarAtencao("evidencias");
}

  event(
    "search_attempt",
    {

      strategy,
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

        parenthesesBalanced:
          balanced,

        blocksConnectedByAND:
          correctConnections,

        correct
      }
    }
  );


  /* =====================================================
     RAIO-X DA ESTRATÉGIA
     ===================================================== */

  let diagnostic=[];

  diagnostic.push(`
    <p>
      <b>Conceitos:</b>
      ${
        conceptsComplete
          ?"✓ Os três conceitos estão representados."
          :"⚠️ Um ou mais conceitos estão incompletos."
      }
    </p>
  `);

  diagnostic.push(`
    <p>
      <b>Termos alternativos:</b>
      ${
        conceptsComplete
          ?"✓ Foram incluídas alternativas para os três conceitos."
          :"⚠️ Verifique se cada conceito contém os termos propostos."
      }
    </p>
  `);

  diagnostic.push(`
    <p>
      <b>Operadores dentro dos blocos:</b>
      ${
        allBlocks
          ?"✓ OR foi utilizado adequadamente entre os termos alternativos."
          :"⚠️ Há problema na relação entre termos de um mesmo conceito."
      }
    </p>
  `);

  diagnostic.push(`
    <p>
      <b>Relação entre os conceitos:</b>
      ${
        correctConnections
          ?"✓ Os três blocos estão relacionados por AND."
          :"⚠️ Os conceitos ainda não estão corretamente relacionados."
      }
    </p>
  `);

  diagnostic.push(`
    <p>
      <b>Agrupamento:</b>
      ${
        allBlocks && balanced
          ?"✓ Os parênteses delimitam os três blocos conceituais."
          :"⚠️ Os blocos conceituais não estão adequadamente delimitados."
      }
    </p>
  `);

  diagnostic.push(`
    <p>
      <b>Expressões compostas:</b>
      ✓ As expressões apresentadas nos cartões mantêm as aspas duplas.
    </p>
  `);


  let explanation="";


  /* =====================================================
     ERRO — AND ENTRE TERMOS ALTERNATIVOS
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

        <h3>
          ⚠️ AND ENTRE TERMOS DO MESMO CONCEITO
        </h3>

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

          Educational strategies to improve childhood vaccination

          <br><br>

          vaccination ✓
          &nbsp;&nbsp;
          immunization ✗

        </div>

        <p>
          Esse trabalho poderia ser relevante, mas poderá deixar
          de ser recuperado se a estratégia exigir simultaneamente
          <b>vaccination AND immunization</b>.
        </p>

        <p>
          💡 <b>Reflita:</b>
          os termos representam conceitos que precisam ocorrer
          simultaneamente ou maneiras alternativas de representar
          um mesmo conceito?
        </p>

      </div>
    `;
  }


  /* =====================================================
     ERRO — PARÊNTESES
     ===================================================== */

  else if(
    !hasParentheses ||
    !balanced ||
    !allBlocks
  ){

    explanation=`
      <div class="feedback">

        <h3>
          ⚠️ OS BLOCOS CONCEITUAIS NÃO ESTÃO DELIMITADOS
        </h3>

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
          💡 <b>Pense:</b>
          como os parênteses podem mostrar quais termos pertencem
          ao mesmo conceito?
        </p>

      </div>
    `;
  }


  /* =====================================================
     ERRO — CONEXÃO ENTRE CONCEITOS
     ===================================================== */

  else if(!correctConnections){

    explanation=`
      <div class="feedback">

        <h3>
          ⚠️ OBSERVE A RELAÇÃO ENTRE OS CONCEITOS
        </h3>

        <p>
          Os termos dentro dos blocos estão organizados,
          mas a relação entre os diferentes conceitos
          precisa ser revista.
        </p>

        <p>
          Quando <b>OR</b> conecta conceitos diferentes,
          a busca pode recuperar registros relacionados
          a apenas um deles.
        </p>

        <div class="paper">

          <b>
            Vaccination coverage among older adults
          </b>

          <br>

          Vacinação ✓ &nbsp;
          Educação ✗ &nbsp;
          Crianças ✗

        </div>

        <div class="paper">

          <b>
            Health education for patients with diabetes
          </b>

          <br>

          Vacinação ✗ &nbsp;
          Educação ✓ &nbsp;
          Crianças ✗

        </div>

        <div class="paper">

          <b>
            Childhood nutrition and physical activity
          </b>

          <br>

          Vacinação ✗ &nbsp;
          Educação ✗ &nbsp;
          Crianças ✓

        </div>

        <p>
          Dependendo da estratégia construída,
          registros como esses podem ser recuperados
          mesmo sem reunir os três conceitos.
        </p>

        <p>
          💡 <b>Reflita:</b>
          você quer trabalhos sobre qualquer um desses assuntos
          isoladamente ou trabalhos que relacionem
          <b>vacinação + educação + crianças</b>?
        </p>

      </div>
    `;
  }


  /* =====================================================
     ESTRATÉGIA CORRETA
     ===================================================== */

  if(correct){

    explanation=`
      <div class="feedback good">

        <h3>
          ✓ ESTRATÉGIA LOGICAMENTE ADEQUADA
        </h3>

        <p>
          A ordem dos blocos e a ordem dos termos dentro
          de cada bloco podem variar.
          O importante é a relação lógica estabelecida entre eles.
        </p>

        <p>
          <b>OR — alternativas dentro do conceito</b><br>
          Permite recuperar registros que utilizem uma forma,
          a outra ou ambas.
        </p>

        <p>
          <b>AND — relação entre conceitos diferentes</b><br>
          Solicita registros que relacionem os diferentes
          conceitos da pergunta.
        </p>

        <p>
          <b>Parênteses — agrupamento</b><br>
          Explicitam quais termos pertencem a cada bloco conceitual.
        </p>

        <p>
          <b>Aspas — expressões compostas</b><br>
          Indicam que expressões como
          <b>"health education"</b>
          devem ser tratadas como uma unidade,
          conforme a sintaxe da base consultada.
        </p>

        <div class="project-box">

          <b>
            EM LINGUAGEM COMUM, VOCÊ PEDIU À BASE:
          </b>

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

      </div>
    `;

    award(
      15,
      "estratégia de busca"
    );
  }


  $("searchFeedback").innerHTML=`

    <div class="feedback info">

      <h3>
        🔎 RAIO-X DA ESTRATÉGIA
      </h3>

      ${diagnostic.join("")}

    </div>

    ${explanation}
  `;
}


/* =========================================================
   RESULTADOS DA BUSCA
   ========================================================= */

function searchResults(){

  addJournal(
    "🔎 Estratégia de busca",
    '(vaccination OR immunization) AND ("health education" OR "educational intervention") AND (child OR children)'
  );

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        3. Resultados simulados
      </h2>

      <p>
        Selecione <b>três</b> trabalhos que parecem mais úteis
        para fundamentar uma ação educativa sobre vacinação
        desenvolvida no ambiente escolar.
      </p>

      <div class="result-list">

        ${paper(
          "P1",
          "School-based vaccine education: participatory activities with children",
          "Atividades educativas participativas e linguagem adequada ao público infantil."
        )}

        ${paper(
          "P2",
          "Childhood fractures in school playgrounds",
          "Estudo sobre traumatismos em recreios escolares."
        )}

        ${paper(
          "P3",
          "Educational strategies for vaccine literacy in school communities",
          "Estratégias educativas, diálogo e acesso a informações confiáveis sobre vacinação."
        )}

        ${paper(
          "P4",
          "Interactive health education and childhood immunization knowledge",
          "Uso de atividades interativas para abordar conhecimentos e dúvidas sobre vacinação."
        )}

        ${paper(
          "P5",
          "Antibiotic use in pediatric respiratory infections",
          "Uso de antibióticos em infecções respiratórias."
        )}

      </div>

      <button onclick="finishPapers()">
        USAR EVIDÊNCIAS NO PROJETO
      </button>

    </div>
  `;
}

function paper(id,title,desc){

  return `
    <button
      class="paper ${
        state.selectedPapers.includes(id)
          ?"selected"
          :""
      }"
      onclick="togglePaper('${id}')">

      <b>
        ${title}
      </b>

      <p>
        ${desc}
      </p>

    </button>
  `;
}

function togglePaper(id){

  if(state.selectedPapers.includes(id)){

    state.selectedPapers=
      state.selectedPapers.filter(
        x=>x!==id
      );

  }else{

    state.selectedPapers.push(id);
  }

  event(
    "paper_toggle",
    {
      paper:id,
      selected:
        state.selectedPapers.includes(id)
    }
  );

  searchResults();
}

function finishPapers(){
  registrarTentativa();

  const good=[
    "P1",
    "P3",
    "P4"
  ];

  event(
    "paper_submit",
    {
      selected:[
        ...state.selectedPapers
      ]
    }
  );

  if(state.selectedPapers.length!==3){

    alert(
      "Selecione exatamente três trabalhos."
    );

    return;
  }

  const score=
    state.selectedPapers.filter(
      x=>good.includes(x)
    ).length;

  if(score<3){

    registrarAtencao("evidencias");
    
    alert(
      "Sua seleção tem pouca relação com a ação proposta. Revise os títulos e as descrições."
    );

    return;
  }

  award(
    10,
    "seleção de evidências"
  );

  projectNeedStep();
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 1 — NECESSIDADE IDENTIFICADA
   ========================================================= */

const projectNeeds={

  A:{
    text:
      "Há crianças com situação vacinal atrasada e a escola relata diferentes dúvidas e dificuldades relacionadas à vacinação infantil.",

    type:"identified",

    feedback:
      "Esta formulação permanece próxima daquilo que foi apresentado pela escola e complementado pela UBS. Ela descreve a necessidade sem afirmar uma causa que ainda não foi demonstrada."
  },

  B:{
    text:
      "O desconhecimento do calendário vacinal é a principal causa do atraso das vacinas das crianças.",

    type:"hypothesis",

    feedback:
      "O desconhecimento do calendário é uma explicação possível, mas os relatos disponíveis não permitem afirmar que seja a principal causa dos atrasos."
  },

  C:{
    text:
      "As informações falsas divulgadas nas redes sociais são responsáveis pelo atraso vacinal das crianças.",

    type:"hypothesis",

    feedback:
      "A influência de informações falsas é uma hipótese plausível, mas ainda não há dados que permitam atribuir a ela os atrasos observados."
  },

  D:{
    text:
      "Os horários de funcionamento da UBS são a principal causa da vacinação atrasada.",

    type:"hypothesis",

    feedback:
      "Dificuldades de acesso podem contribuir para atrasos, mas não é possível concluir, a partir dos relatos disponíveis, que o horário da UBS seja a principal causa."
  },

  E:{
    text:
      "A resistência das famílias à vacinação explica a situação vacinal observada na escola.",

    type:"hypothesis",

    feedback:
      "A escola relatou situações diferentes entre as famílias. Generalizar resistência à vacinação transforma uma possibilidade em uma conclusão que não foi demonstrada."
  }
};

function projectNeedStep(){

  if(
    !state.projectNeedOrder ||
    state.projectNeedOrder.length===0
  ){
    state.projectNeedOrder=
      shuffleArray(
        Object.keys(projectNeeds)
      );

    save();
  }
  
  show("workspace");

  $("workTitle").textContent=
    "📋 MESA DE PROJETO • NECESSIDADE";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 1 • NECESSIDADE IDENTIFICADA
      </div>

      <h2>
        O que sabemos até aqui?
      </h2>

      <p>
        Vocês ouviram a escola, conversaram com a UBS
        e consultaram evidências.
      </p>

      <p>
        Agora é preciso distinguir
        <b>o que foi efetivamente identificado</b>
        daquilo que ainda representa uma
        <b>hipótese explicativa</b>.
      </p>

      <h3>
        Qual formulação representa melhor a necessidade
        apresentada pela comunidade escolar?
      </h3>

      <div class="answers">

        ${
          state.projectNeedOrder
  .map(id=>{

    const item=projectNeeds[id];

    return `

              <button
                class="answer ${
                  state.projectNeed===id
                    ?"selected"
                    :""
                }"
                onclick="chooseProjectNeed('${id}')">

                <b>${id}.</b>
                ${item.text}

              </button>

                       `;
          }).join("")
        }

      </div>

      <div id="needFeedback"></div>

    </div>
  `;

  if(state.projectNeed)
    showNeedFeedback(state.projectNeed);
}

function chooseProjectNeed(id){

  registrarTentativa();

  state.projectNeed=id;

  if(projectNeeds[id].type!=="identified"){
    registrarAtencao("necessidade");
  }

  event(
    "project_need_choice",
    {
      id,
      type:projectNeeds[id].type
    }
  );

  save();

  projectNeedStep();
}

function showNeedFeedback(id){

  const item=
    projectNeeds[id];

  const correct=
    item.type==="identified";

  $("needFeedback").innerHTML=`
    <div class="feedback ${
      correct
        ?"good"
        :""
    }">

      <h3>
        ${
          correct
            ?"✓ NECESSIDADE IDENTIFICADA"
            :"💡 EVIDÊNCIA OU HIPÓTESE?"
        }
      </h3>

      <p>
        ${item.feedback}
      </p>

      ${
        !correct
          ?`
            <p>
              Esta explicação não precisa ser descartada.
              Ela pode ser registrada como uma
              <b>hipótese</b> e, futuramente, contribuir
              para a formulação de uma pergunta de pesquisa.
            </p>

            <button onclick="projectNeedStep()">
              REVER A NECESSIDADE
            </button>
          `
          :`
            <p>
              <b>Princípio:</b>
              o projeto deve partir da necessidade que foi
              identificada, sem transformar possíveis causas
              em conclusões.
            </p>

            <button onclick="confirmProjectNeed()">
              DEFINIR O PÚBLICO →
            </button>
          `
      }

    </div>
  `;
}

function confirmProjectNeed(){

  if(
    !state.projectNeed ||
    projectNeeds[state.projectNeed].type!=="identified"
  ){

    alert(
      "Escolha a formulação que representa a necessidade efetivamente identificada."
    );

    return;
  }

  addJournal(
    "📌 Necessidade do projeto",
    projectNeeds[state.projectNeed].text
  );

  award(
    5,
    "distinguir necessidade e hipótese"
  );

  projectAudienceStep();
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 2 — PÚBLICO
   ========================================================= */

function projectAudienceStep(){

  show("workspace");

  $("workTitle").textContent=
    "📋 MESA DE PROJETO • PÚBLICO";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 2 • PÚBLICO DA AÇÃO
      </div>

      <h2>
        Com quem a ação será realizada?
      </h2>

      <div class="project-box">

        <b>
          LOCAL DEFINIDO
        </b>

        <p>
          Escola Municipal Vila Aurora
        </p>

      </div>

      <p>
        A primeira ação será desenvolvida
        <b>durante o período escolar</b>.
        Os responsáveis pelas crianças não participarão
        desta atividade.
      </p>

      <p>
        Considerando esse contexto, quem constitui
        o público diretamente envolvido na ação?
      </p>

      <div class="answers">

        ${answer(
          "<b>A.</b> Crianças da escola e trabalhadores da escola.",
          "chooseAudience('A')"
        )}

        ${answer(
          "<b>B.</b> Crianças da escola e seus pais ou responsáveis.",
          "chooseAudience('B')"
        )}

        ${answer(
          "<b>C.</b> Somente os profissionais da UBS.",
          "chooseAudience('C')"
        )}

        ${answer(
          "<b>D.</b> Todas as famílias cadastradas na UBS Vila Aurora.",
          "chooseAudience('D')"
        )}

      </div>

      <div id="audienceFeedback"></div>

    </div>
  `;
}

function chooseAudience(a){

registrarTentativa();

  event(
    "choice",
    {
      id:"PROJECT_AUDIENCE",
      answer:a
    }
  );

  if(a!=="A"){

registrarAtencao("projetoExtensao");

    const feedback={

      B:
        "Os responsáveis são atores importantes, mas foi definido que eles não estarão presentes nesta primeira atividade realizada durante o período escolar.",

      C:
        "A UBS participa da articulação e pode apoiar o projeto, mas seus profissionais não constituem o público principal da ação planejada na escola.",

      D:
        "O projeto foi delimitado para a Escola Vila Aurora. Ampliar o público para todas as famílias da UBS modifica o alcance da proposta."

    }[a];

    $("audienceFeedback").innerHTML=`
      <div class="feedback">

        <b>
          REVEJA O PÚBLICO
        </b>

        <p>
          ${feedback}
        </p>

        <p>
          O público precisa ser coerente com
          <b>o local, a disponibilidade dos participantes
          e aquilo que efetivamente será executado</b>.
        </p>

      </div>
    `;

    return;
  }

  state.projectAudience=[
    "children",
    "workers"
  ];

  save();

  $("audienceFeedback").innerHTML=`
    <div class="feedback good">

      <b>
        ✓ PÚBLICO DEFINIDO
      </b>

      <p>
        A ação será desenvolvida com
        <b>crianças e trabalhadores da Escola Vila Aurora</b>.
      </p>

      <p>
        Essa decisão passa a orientar os objetivos
        e os métodos. Uma atividade dirigida aos pais,
        por exemplo, não será coerente com o público
        definido para esta ação.
      </p>

      <button onclick="objectiveVerbStep()">
        CONSTRUIR OBJETIVO GERAL →
      </button>

    </div>
  `;
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 3 — VERBO DO OBJETIVO GERAL
   ========================================================= */

const objectiveVerbs={

  promote:{
    label:"PROMOVER",

    status:"strong",

    explanation:
      "Indica favorecer ou proporcionar uma ação, processo ou experiência. É compatível com uma atividade extensionista educativa."
  },

  orient:{
    label:"ORIENTAR",

    status:"possible",

    explanation:
      "Indica fornecer informações e direcionamentos. Pode ser adequado, mas tende a tornar o objetivo mais centrado na orientação e na transmissão de informações."
  },

  sensitize:{
    label:"SENSIBILIZAR",

    status:"possible",

    explanation:
      "Indica favorecer reflexão e atenção sobre determinado tema. Pode ser utilizado, mas exige cuidado para não pressupor previamente que o público seja pouco sensibilizado."
  },

  develop:{
    label:"DESENVOLVER",

    status:"possible",

    explanation:
      "Indica realizar ou implementar uma atividade, estratégia ou ação. Pode ser adequado quando o complemento deixa claro o que será desenvolvido e com qual finalidade."
  },

  investigate:{
    label:"INVESTIGAR",

    status:"research",

    explanation:
      "Indica buscar conhecimento sistematicamente sobre uma questão. Neste cenário, deslocaria a finalidade principal para uma investigação."
  },

  analyze:{
    label:"ANALISAR",

    status:"research",

    explanation:
      "Indica examinar informações ou dados para produzir uma interpretação. Neste contexto, aproxima o objetivo de uma investigação científica."
  },

  identify:{
    label:"IDENTIFICAR",

    status:"research",

    explanation:
      "Indica reconhecer ou caracterizar determinado aspecto. Pode ser usado em diferentes contextos, mas como finalidade central deste projeto deslocaria o foco da intervenção para obtenção de informações."
  },

  determine:{
    label:"DETERMINAR",

    status:"research",

    explanation:
      "Indica estabelecer ou estimar algo a partir de informações ou dados. É mais compatível aqui com objetivos investigativos, como determinar frequência ou fatores associados."
  },

  evaluate:{
    label:"AVALIAR",

    status:"monitoring",

    explanation:
      "Indica realizar uma apreciação a partir de critérios ou informações. A avaliação pode integrar o projeto, mas não representa adequadamente a finalidade principal desta ação."
  },

  increase:{
    label:"AUMENTAR",

    status:"outcome",

    explanation:
      "Expressa uma mudança desejada. Entretanto, aumentar a cobertura vacinal depende de vários fatores e não pode ser atribuído diretamente a uma única atividade educativa dos estudantes."
  }
};

function objectiveVerbStep(){

  if(
    !state.objectiveVerbOrder ||
    state.objectiveVerbOrder.length===0
  ){
    state.objectiveVerbOrder=
      shuffleArray(
        Object.keys(objectiveVerbs)
      );

    save();
  }
  
  show("workspace");

  $("workTitle").textContent=
    "📋 MESA DE PROJETO • OBJETIVO GERAL";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 3 • OBJETIVO GERAL
      </div>

      <h2>
        Comece pelo verbo
      </h2>

      <p>
        O verbo ajuda a explicitar
        <b>o que o projeto pretende realizar</b>.
        Ele deve ser analisado junto com a finalidade,
        o público e o alcance da ação.
      </p>

      <div class="project-box">

        <b>
          NECESSIDADE
        </b>

        <p>
          ${projectNeeds[state.projectNeed].text}
        </p>

        <b>
          PÚBLICO
        </b>

        <p>
          Crianças e trabalhadores da Escola Vila Aurora.
        </p>

      </div>

      <h3>
        Explore os verbos e escolha aquele que melhor
        representa a finalidade principal deste projeto.
      </h3>

      <div class="answers">

        ${
   state.objectiveVerbOrder
  .map(id=>{

    const v=objectiveVerbs[id];

    return `

              <button
                class="answer ${
                  state.extensionVerb===id
                    ?"selected"
                    :""
                }"
                onclick="selectObjectiveVerb('${id}')">

                <b>
                  ${v.label}
                </b>

                <br>

                <small>
                  ${v.explanation}
                </small>

              </button>

                       `;
          }).join("")
        }

      </div>

      <div id="verbFeedback"></div>

    </div>
  `;

  if(state.extensionVerb)
    renderVerbFeedback();
}

function selectObjectiveVerb(id){

  registrarTentativa();
  
  state.extensionVerb=id;

  if(objectiveVerbs[id].status==="research"){
    registrarAtencao("extensaoPesquisa");
  }

if(
  objectiveVerbs[id].status==="monitoring" ||
  objectiveVerbs[id].status==="outcome"
){
  registrarAtencao("projetoExtensao");
}

  event(
    "objective_verb",
    {
      verb:id,
      status:objectiveVerbs[id].status
    }
  );

  save();

  objectiveVerbStep();
}

function renderVerbFeedback(){

  const v=
    objectiveVerbs[state.extensionVerb];

  let title="";
  let text="";
  let canContinue=false;

  if(v.status==="strong"){

    title=
      "✓ VERBO MUITO COERENTE COM A PROPOSTA";

    text=
      "Promover permite expressar a criação de uma oportunidade educativa e de diálogo sem prometer um resultado que ultrapasse o alcance dos estudantes.";

    canContinue=true;
  }

  if(v.status==="possible"){

    title=
      "✓ VERBO POSSÍVEL";

    text=
      "Esse verbo pode ser utilizado em um projeto de extensão. Entretanto, o restante da formulação será decisivo para verificar se o objetivo permanece coerente com a necessidade, o público e a ação.";

    canContinue=true;
  }

  if(v.status==="research"){

    title=
      "⚠️ O VERBO MUDA A FINALIDADE";

    text=
      "Nesta formulação, o verbo direciona o objetivo para produção ou análise sistemática de informações. Isso se aproxima mais de uma finalidade investigativa do que da intervenção extensionista planejada.";
  }

  if(v.status==="monitoring"){

    title=
      "⚠️ AVALIAR NÃO É A FINALIDADE CENTRAL";

    text=
      "O projeto poderá prever formas de acompanhamento e avaliação. Entretanto, neste cenário, avaliar não representa aquilo que a ação pretende principalmente realizar com a comunidade escolar.";
  }

  if(v.status==="outcome"){

    title=
      "⚠️ O RESULTADO ULTRAPASSA O ALCANCE DA AÇÃO";

    text=
      "Uma mudança na cobertura vacinal depende de múltiplos fatores. O objetivo geral deve representar aquilo que os estudantes efetivamente realizarão durante a ação.";
  }

  $("verbFeedback").innerHTML=`
    <div class="feedback ${
      canContinue
        ?"good"
        :""
    }">

      <b>
        ${title}
      </b>

      <p>
        ${v.explanation}
      </p>

      <p>
        ${text}
      </p>

      ${
        canContinue
          ?`
            <button onclick="generalObjectiveStep()">
              COMPLETAR O OBJETIVO →
            </button>
          `
          :`
            <button onclick="objectiveVerbStep()">
              ESCOLHER OUTRO VERBO
            </button>
          `
      }

    </div>
  `;
}
/* =========================================================
   MESA DE PROJETO
   ETAPA 3B — COMPLETAR O OBJETIVO GERAL
   ========================================================= */

const generalObjectiveComplements={

  A:{
    text:
      "ações educativas e espaços de diálogo sobre vacinação infantil com crianças e trabalhadores da Escola Vila Aurora.",

    status:"coherent",

    feedback:
      "A formulação relaciona a ação educativa ao tema e ao público previamente definidos, mantendo um alcance compatível com a atuação dos estudantes."
  },

  B:{
    text:
      "a atualização da situação vacinal de todas as crianças da Escola Vila Aurora.",

    status:"service",

    feedback:
      "Atualizar a situação vacinal envolve avaliação individual e, quando necessário, administração de vacinas. Essas ações dependem do serviço de saúde e não correspondem ao que os estudantes executarão nesta atividade."
  },

  C:{
    text:
      "a identificação das principais causas do atraso vacinal entre as crianças da escola.",

    status:"research",

    feedback:
      "Identificar as principais causas exigiria coleta e análise sistemática de informações. A formulação transforma a finalidade do projeto de extensão em uma questão investigativa."
  },

  D:{
    text:
      "o aumento da cobertura vacinal das crianças da escola após a atividade educativa.",

    status:"outcome",

    feedback:
      "O aumento da cobertura vacinal é desejável, mas depende de múltiplos fatores e não pode ser atribuído diretamente a uma única atividade educativa."
  },

  E:{
    text:
      "a conscientização das crianças e dos trabalhadores que ainda não compreendem a importância das vacinas.",

    status:"assumption",

    feedback:
      "A formulação pressupõe previamente que crianças e trabalhadores não compreendem a importância das vacinas. Essa conclusão não foi estabelecida durante a aproximação com a comunidade."
  }
};

function buildGeneralObjectiveText(){

  const verb=
    objectiveVerbs[state.extensionVerb]
      ?objectiveVerbs[state.extensionVerb].label.toLowerCase()
      :"";

  const complement=
    state.extensionObjective &&
    generalObjectiveComplements[state.extensionObjective]
      ?generalObjectiveComplements[state.extensionObjective].text
      :"";

  if(!verb || !complement)
    return "";

  return (
    verb.charAt(0).toUpperCase()+
    verb.slice(1)+
    " "+
    complement
  );
}

function generalObjectiveStep(){

  show("workspace");

  $("workTitle").textContent=
    "📋 MESA DE PROJETO • OBJETIVO GERAL";

  const verb=
    objectiveVerbs[state.extensionVerb];

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 3 • OBJETIVO GERAL
      </div>

      <h2>
        Complete o objetivo
      </h2>

      <div class="project-box">

        <b>
          VERBO ESCOLHIDO
        </b>

        <p>
          ${verb.label}
        </p>

      </div>

      <p>
        Agora escolha o complemento que torna o objetivo
        mais coerente com:
      </p>

      <p>
        • a necessidade identificada;<br>
        • o público definido;<br>
        • o caráter extensionista da proposta;<br>
        • o alcance da atuação dos estudantes.
      </p>

      <div class="answers">

        ${
          Object.entries(generalObjectiveComplements)
            .map(([id,item])=>`

              <button
                class="answer ${
                  state.extensionObjective===id
                    ?"selected"
                    :""
                }"
                onclick="chooseGeneralObjective('${id}')">

                <b>${id}.</b>
                ${verb.label.charAt(0)+verb.label.slice(1).toLowerCase()}
                ${item.text}

              </button>

            `).join("")
        }

      </div>

      <div id="generalObjectiveFeedback"></div>

    </div>
  `;

  if(state.extensionObjective)
    renderGeneralObjectiveFeedback();
}

function chooseGeneralObjective(id){

registrarTentativa();

  state.extensionObjective=id;

    if(generalObjectiveComplements[id].status==="research"){
    registrarAtencao("extensaoPesquisa");
  }

if(
  generalObjectiveComplements[id].status==="service" ||
  generalObjectiveComplements[id].status==="outcome"
){
  registrarAtencao("projetoExtensao");
}

if(generalObjectiveComplements[id].status==="assumption"){
  registrarAtencao("necessidade");
}

  event(
    "general_objective_choice",
    {
      verb:state.extensionVerb,
      complement:id,
      status:generalObjectiveComplements[id].status
    }
  );

  save();

  generalObjectiveStep();
}

function renderGeneralObjectiveFeedback(){

  const item=
    generalObjectiveComplements[
      state.extensionObjective
    ];

  const coherent=
    item.status==="coherent";

  $("generalObjectiveFeedback").innerHTML=`
    <div class="feedback ${
      coherent
        ?"good"
        :""
    }">

      <h3>
        ${
          coherent
            ?"✓ OBJETIVO COERENTE"
            :"⚠️ REVEJA A FORMULAÇÃO"
        }
      </h3>

      <p>
        ${item.feedback}
      </p>

      ${
        coherent
          ?`
            <div class="project-box">

              <b>
                OBJETIVO GERAL CONSTRUÍDO
              </b>

              <p>
                ${buildGeneralObjectiveText()}
              </p>

            </div>

            <button onclick="confirmGeneralObjective()">
              DEFINIR OBJETIVOS ESPECÍFICOS →
            </button>
          `
          :`
            <button onclick="generalObjectiveStep()">
              REVER O OBJETIVO
            </button>
          `
      }

    </div>
  `;
}

function confirmGeneralObjective(){

  const item=
    generalObjectiveComplements[
      state.extensionObjective
    ];

  if(
    !item ||
    item.status!=="coherent"
  ){

    alert(
      "Revise a formulação do objetivo geral antes de continuar."
    );

    return;
  }

  addJournal(
    "🎯 Objetivo geral",
    buildGeneralObjectiveText()
  );

  award(
    5,
    "formulação do objetivo geral"
  );

  specificObjectivesStep();
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 4 — OBJETIVOS ESPECÍFICOS
   ========================================================= */

const specificObjectives={

  OE1:{
    text:
      "Promover atividades educativas sobre a importância da vacinação e das doenças imunopreveníveis.",

    category:"extension",

    short:"Educação sobre vacinação",

    feedback:
      "É compatível com o caráter educativo da extensão e pode ser desenvolvido pelos estudantes com o público definido."
  },

  OE2:{
    text:
      "Desenvolver estratégias lúdicas adequadas à faixa etária das crianças para abordar vacinação.",

    category:"extension",

    short:"Estratégias lúdicas com crianças",

    feedback:
      "É compatível com o público infantil e transforma o objetivo geral em uma possibilidade concreta de atuação."
  },

  OE3:{
    text:
      "Criar espaços para que crianças e trabalhadores expressem dúvidas relacionadas à vacinação.",

    category:"extension",

    short:"Espaço para dúvidas",

    feedback:
      "É coerente com a proposta de diálogo e permite que a atividade considere questões apresentadas pelos próprios participantes."
  },

  OE4:{
    text:
      "Orientar os trabalhadores da escola sobre fontes confiáveis de informação relacionadas à vacinação.",

    category:"extension",

    short:"Fontes confiáveis para trabalhadores",

    feedback:
      "É compatível com o público definido e pode ser realizado pelos estudantes como parte da ação educativa."
  },

  OE5:{
    text:
      "Identificar os principais fatores associados ao atraso vacinal entre as crianças da escola.",

    category:"research",

    short:"Fatores associados ao atraso",

    feedback:
      "Para responder a esse objetivo seria necessário coletar e analisar informações sistematicamente. Ele se aproxima de uma finalidade de pesquisa."
  },

  OE6:{
    text:
      "Determinar a frequência de atraso vacinal entre as crianças da Escola Vila Aurora.",

    category:"research",

    short:"Frequência de atraso vacinal",

    feedback:
      "Esse objetivo pretende mensurar a ocorrência de uma condição na população e exigiria um método de investigação."
  },

  OE7:{
    text:
      "Analisar a relação entre exposição a informações falsas e atraso vacinal entre as crianças.",

    category:"research",

    short:"Desinformação e atraso",

    feedback:
      "A formulação busca analisar uma relação entre fenômenos. Isso exigiria coleta e análise sistemática de dados."
  },

  OE8:{
    text:
      "Verificar individualmente a situação vacinal das crianças e indicar quais doses deverão receber.",

    category:"service",

    short:"Avaliação individual da situação vacinal",

    feedback:
      "A ação pode orientar sobre a importância de verificar a situação vacinal, mas a avaliação individual e a indicação de doses devem ocorrer no serviço de saúde."
  },

  OE9:{
    text:
      "Atualizar as vacinas atrasadas das crianças identificadas durante a atividade.",

    category:"service",

    short:"Atualização das vacinas",

    feedback:
      "A administração das vacinas é uma ação do serviço de saúde. Os estudantes podem orientar e articular o acesso, mas não assumir essa atribuição neste projeto."
  },

  OE10:{
    text:
      "Realizar busca ativa das crianças com vacinação atrasada.",

    category:"service",

    short:"Busca ativa",

    feedback:
      "A busca ativa relacionada à situação vacinal integra ações organizadas pelo serviço de saúde e não corresponde à finalidade desta atividade educativa dos estudantes."
  },

  OE11:{
    text:
      "Orientar pais e responsáveis sobre o calendário de vacinação infantil.",

    category:"audience",

    short:"Orientação aos responsáveis",

    feedback:
      "O conteúdo poderia ser pertinente em outra ação, mas os responsáveis não fazem parte do público definido para esta atividade realizada durante o período escolar."
  }
};

function specificObjectivesStep(){

  show("workspace");

  $("workTitle").textContent=
    "📋 MESA DE PROJETO • OBJETIVOS ESPECÍFICOS";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 4 • OBJETIVOS ESPECÍFICOS
      </div>

      <h2>
        O que precisa ser realizado para concretizar o objetivo geral?
      </h2>

      <div class="project-box">

        <b>
          OBJETIVO GERAL
        </b>

        <p>
          ${buildGeneralObjectiveText()}
        </p>

      </div>

      <p>
        Selecione <b>até três objetivos específicos</b>.
        Não existe uma ordem entre eles.
      </p>

      <p>
        Analise três aspectos:
        <b>pertinência ao projeto</b>,
        <b>possibilidade de execução pelos estudantes</b>
        e <b>compatibilidade com o público definido</b>.
      </p>

      <div class="answers">

        ${
          Object.entries(specificObjectives)
            .map(([id,item])=>`

              <button
                class="answer ${
                  state.extensionSpecifics.includes(id)
                    ?"selected"
                    :""
                }"
                onclick="toggleSpecificObjective('${id}')">

                ${
                  state.extensionSpecifics.includes(id)
                    ?"☑"
                    :"☐"
                }

                <b>${id.replace("OE","")}.</b>

                ${item.text}

              </button>

            `).join("")
        }

      </div>

      <p>
        <b>Selecionados:</b>
        ${state.extensionSpecifics.length}/3
      </p>

      <button onclick="checkSpecificObjectives()">
        ANALISAR OBJETIVOS
      </button>

      <div id="specificFeedback"></div>

    </div>
  `;
}

function toggleSpecificObjective(id){

  if(
    state.extensionSpecifics.includes(id)
  ){

    state.extensionSpecifics=
      state.extensionSpecifics.filter(
        x=>x!==id
      );

  }else{

    if(state.extensionSpecifics.length>=3){

      alert(
        "O projeto pode ter no máximo três objetivos específicos. Retire um objetivo antes de selecionar outro."
      );

      return;
    }

    state.extensionSpecifics.push(id);
  }

  event(
    "specific_objective_toggle",
    {
      objective:id,
      category:specificObjectives[id].category,
      selected:state.extensionSpecifics.includes(id)
    }
  );

  save();

  specificObjectivesStep();
}

function checkSpecificObjectives(){

registrarTentativa();

  if(
    state.extensionSpecifics.length===0
  ){

    $("specificFeedback").innerHTML=`
      <div class="feedback">
        Selecione pelo menos um objetivo específico.
      </div>
    `;

    return;
  }

  const selected=
    state.extensionSpecifics.map(
      id=>({
        id,
        ...specificObjectives[id]
      })
    );

  const inappropriate=
    selected.filter(
      x=>x.category!=="extension"
    );

if(
  selected.some(
    x=>x.category==="research"
  )
){
  registrarAtencao("extensaoPesquisa");
}

if(
  selected.some(
    x=>
      x.category==="service" ||
      x.category==="audience"
  )
){
  registrarAtencao("projetoExtensao");
}

  event(
    "specific_objectives_submit",
    {
      selected:
        state.extensionSpecifics.slice(),

      categories:
        selected.map(
          x=>({
            id:x.id,
            category:x.category
          })
        ),

      coherent:
        inappropriate.length===0
    }
  );

  if(inappropriate.length){

    const explanations=
      inappropriate.map(item=>{

        let destination="";

        if(item.category==="research")
          destination="🔬 MAIS RELACIONADO À PESQUISA";

        if(item.category==="service")
          destination="🏥 DEPENDE DO SERVIÇO DE SAÚDE";

        if(item.category==="audience")
          destination="👥 PÚBLICO INCOMPATÍVEL";

        return `
          <div class="project-box">

            <b>
              ${destination}
            </b>

            <p>
              ${item.text}
            </p>

            <p>
              <small>
                ${item.feedback}
              </small>
            </p>

          </div>
        `;
      }).join("");

    $("specificFeedback").innerHTML=`
      <div class="feedback">

        <h3>
          ⚠️ REVEJA ALGUMAS ESCOLHAS
        </h3>

        <p>
          Todos os objetivos estão relacionados ao tema,
          mas isso não significa que todos pertençam
          <b>a este projeto de extensão</b>.
        </p>

        ${explanations}

        <p>
          💡 Um objetivo pode ser importante e ainda assim
          pertencer a uma pesquisa, depender do serviço de saúde
          ou estar direcionado a um público que não participará
          desta ação.
        </p>

      </div>
    `;

    return;
  }

  $("specificFeedback").innerHTML=`
    <div class="feedback good">

      <h3>
        ✓ OBJETIVOS COMPATÍVEIS COM O PROJETO
      </h3>

      ${
        selected.map(item=>`
          <div class="project-box">

            <b>
              ${item.short}
            </b>

            <p>
              ${item.text}
            </p>

            <p>
              <small>
                ${item.feedback}
              </small>
            </p>

          </div>
        `).join("")
      }

      <p>
        Os objetivos específicos não precisam seguir uma ordem.
        O próximo passo é verificar
        <b>como cada um deles será executado</b>.
      </p>

      <button onclick="confirmSpecificObjectives()">
        ELABORAR OS MÉTODOS →
      </button>

    </div>
  `;
}

function confirmSpecificObjectives(){

  const selected=
    state.extensionSpecifics.map(
      id=>specificObjectives[id]
    );

  if(
    !selected.length ||
    selected.some(
      x=>x.category!=="extension"
    )
  ){

    alert(
      "Revise os objetivos específicos antes de continuar."
    );

    return;
  }

  addJournal(
    "🎯 Objetivos específicos",
    state.extensionSpecifics
      .map(
        id=>specificObjectives[id].text
      )
      .join(" | ")
  );

  award(
    10,
    "seleção de objetivos específicos"
  );

  methodsIntro();
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 5 — MÉTODOS
   ========================================================= */

const methodOptions={

  OE1:[

    {
      id:"M1A",

      label:
        "Exposição dialogada utilizando imagens e exemplos adequados à faixa etária.",

      valid:true,

      audience:"children",

      time:10,

      resources:[
        "images",
        "projector"
      ],

      feedback:
        "A estratégia permite abordar conteúdos relacionados à vacinação e, por ser dialogada, favorece interação com as crianças."
    },

    {
      id:"M1B",

      label:
        "Atividade educativa relacionando vacinas à prevenção de doenças imunopreveníveis.",

      valid:true,

      audience:"children",

      time:10,

      resources:[
        "illustrated_cards"
      ],

      feedback:
        "A atividade operacionaliza diretamente o objetivo educativo e pode utilizar linguagem adequada ao público infantil."
    },

    {
      id:"M1C",

      label:
        "Aplicar questionário para mensurar o conhecimento das crianças sobre vacinação.",

      valid:false,

      reason:"research",

      audience:"children",

      time:10,

      resources:[
        "questionnaire"
      ],

      feedback:
        "O questionário produziria informações sobre o conhecimento das crianças, mas não constitui, por si só, a estratégia educativa prevista no objetivo."
    },

    {
      id:"M1D",

      label:
        "Levantar quais crianças apresentam vacinas atrasadas.",

      valid:false,

      reason:"research_service",

      audience:"children",

      time:15,

      resources:[
        "vaccination_records"
      ],

      feedback:
        "Essa atividade procura produzir informações sobre a situação vacinal individual e não executa o objetivo educativo estabelecido."
    }
  ],


  OE2:[

    {
      id:"M2A",

      label:
        "Realizar quiz em equipes com situações e perguntas sobre vacinação.",

      valid:true,

      audience:"children",

      time:15,

      resources:[
        "quiz_cards"
      ],

      feedback:
        "O quiz é uma estratégia participativa e pode ser adaptado à faixa etária das crianças."
    },

    {
      id:"M2B",

      label:
        "Utilizar jogo de associação entre vacinas, proteção e prevenção de doenças.",

      valid:true,

      audience:"children",

      time:15,

      resources:[
        "game_cards"
      ],

      feedback:
        "O jogo transforma o conteúdo em uma atividade lúdica diretamente relacionada ao objetivo específico."
    },

    {
      id:"M2C",

      label:
        "Construir uma história ilustrada com personagens enfrentando dúvidas sobre vacinação.",

      valid:true,

      audience:"children",

      time:15,

      resources:[
        "illustrated_story"
      ],

      feedback:
        "A história ilustrada pode adequar a abordagem ao público infantil e favorecer discussão do tema."
    },

    {
      id:"M2D",

      label:
        "Realizar palestra expositiva de 40 minutos sobre o calendário vacinal.",

      valid:false,

      reason:"method_mismatch",

      audience:"children",

      time:40,

      resources:[
        "projector"
      ],

      feedback:
        "O objetivo prevê uma estratégia lúdica e adequada à faixa etária. Uma exposição longa e exclusivamente oral não corresponde à forma de atuação definida."
    },

    {
      id:"M2E",

      label:
        "Aplicar entrevista estruturada para investigar hesitação vacinal.",

      valid:false,

      reason:"research",

      audience:"children",

      time:20,

      resources:[
        "interview_form"
      ],

      feedback:
        "A entrevista tem finalidade de produzir informações sistemáticas. Neste projeto, o objetivo é desenvolver uma estratégia educativa."
    }
  ],


  OE3:[

    {
      id:"M3A",

      label:
        "Utilizar uma caixa de perguntas anônimas para que os participantes registrem dúvidas.",

      valid:true,

      audience:"both",

      time:5,

      resources:[
        "question_box",
        "paper"
      ],

      feedback:
        "A caixa de perguntas cria um canal para manifestação de dúvidas e pode favorecer a participação de pessoas que não desejem falar diante do grupo."
    },

    {
      id:"M3B",

      label:
        "Reservar momento de conversa aberta para perguntas e esclarecimentos.",

      valid:true,

      audience:"both",

      time:10,

      resources:[],

      feedback:
        "A estratégia é diretamente compatível com o objetivo de criar espaço para expressão e diálogo."
    },

    {
      id:"M3C",

      label:
        "Solicitar que os participantes relatem dúvidas e discutir coletivamente as questões apresentadas.",

      valid:true,

      audience:"both",

      time:10,

      resources:[
        "board"
      ],

      feedback:
        "A estratégia permite partir das questões apresentadas pelo próprio público e construir a discussão de maneira participativa."
    },

    {
      id:"M3D",

      label:
        "Aplicar escala padronizada para medir hesitação vacinal.",

      valid:false,

      reason:"research",

      audience:"workers",

      time:15,

      resources:[
        "scale_forms"
      ],

      feedback:
        "A aplicação de uma escala para mensurar hesitação tem finalidade investigativa e não corresponde ao espaço de diálogo previsto no objetivo."
    }
  ],


  OE4:[

    {
      id:"M4A",

      label:
        "Apresentar aos trabalhadores fontes oficiais e confiáveis para consulta sobre vacinação.",

      valid:true,

      audience:"workers",

      time:10,

      resources:[
        "source_guide"
      ],

      feedback:
        "A estratégia corresponde diretamente ao objetivo de orientar sobre fontes confiáveis."
    },

    {
      id:"M4B",

      label:
        "Realizar demonstração breve de como localizar informações em fontes oficiais de saúde.",

      valid:true,

      audience:"workers",

      time:10,

      resources:[
        "computer",
        "internet"
      ],

      feedback:
        "A demonstração permite que os trabalhadores conheçam, na prática, caminhos para localizar informações confiáveis."
    },

    {
      id:"M4C",

      label:
        "Entregar material com QR codes e referências de fontes oficiais sobre vacinação.",

      valid:true,

      audience:"workers",

      time:5,

      resources:[
        "source_leaflet"
      ],

      feedback:
        "O material pode facilitar consultas posteriores e está diretamente relacionado ao objetivo."
    },

    {
      id:"M4D",

      label:
        "Analisar quais trabalhadores acreditam em informações falsas sobre vacinas.",

      valid:false,

      reason:"research",

      audience:"workers",

      time:15,

      resources:[
        "questionnaire"
      ],

      feedback:
        "A atividade pretende identificar uma característica dos participantes por meio de coleta de informações. Isso desloca a ação para uma finalidade investigativa."
    }
  ]
};


function getMethodById(methodId){

  for(
    const objectiveId
    of Object.keys(methodOptions)
  ){

    const found=
      methodOptions[objectiveId]
        .find(
          m=>m.id===methodId
        );

    if(found)
      return found;
  }

  return null;
}


function methodsIntro(){

  show("workspace");

  $("workTitle").textContent=
    "🛠️ MESA DE PROJETO • MÉTODOS";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 5 • MÉTODOS
      </div>

      <h2>
        Como os objetivos serão executados?
      </h2>

      <p>
        Os objetivos indicam
        <b>o que o projeto pretende realizar</b>.
        Os métodos precisam explicar
        <b>como isso será feito</b>.
      </p>

      <div class="project-box">

        <b>
          REGRA DE COERÊNCIA
        </b>

        <p>
          Cada objetivo específico selecionado precisa ter
          pelo menos uma estratégia metodológica correspondente.
        </p>

      </div>

      <div class="project-grid">

        ${
          state.extensionSpecifics
            .map(id=>`

              <div class="project-box">

                <b>
                  ${specificObjectives[id].short}
                </b>

                <p>
                  ${specificObjectives[id].text}
                </p>

              </div>

            `).join("")
        }

      </div>

      <button onclick="methodObjectiveStep(0)">
        PLANEJAR PRIMEIRO OBJETIVO →
      </button>

    </div>
  `;
}


function methodObjectiveStep(index){

  if(
    index>=state.extensionSpecifics.length
  ){

    return methodsReview();
  }

  const objectiveId=
    state.extensionSpecifics[index];

  const objective=
    specificObjectives[objectiveId];

  const options=
    methodOptions[objectiveId];

  const selected=
    state.projectMethods[objectiveId]
    ||[];

  show("workspace");

  $("workTitle").textContent=
    "🛠️ MÉTODOS • "+
    (index+1)+
    "/"+
    state.extensionSpecifics.length;

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        OBJETIVO ${index+1} DE
        ${state.extensionSpecifics.length}
      </div>

      <h2>
        Escolha como este objetivo será executado
      </h2>

      <div class="project-box">

        <b>
          OBJETIVO ESPECÍFICO
        </b>

        <p>
          ${objective.text}
        </p>

      </div>

      <p>
        Selecione <b>uma estratégia principal</b>.
        Analise se ela realmente executa o objetivo
        ou se muda a finalidade da atividade.
      </p>

      <div class="answers">

        ${
          options.map((m,i)=>`

            <button
              class="answer ${
                selected.includes(m.id)
                  ?"selected"
                  :""
              }"
              onclick="selectMethod(
                '${objectiveId}',
                '${m.id}',
                ${index}
              )">

              ${
                selected.includes(m.id)
                  ?"☑"
                  :"☐"
              }

              <b>
                ${String.fromCharCode(65+i)}.
              </b>

              ${m.label}

              <br>

              <small>
                ⏱️ Aproximadamente ${m.time} min
              </small>

            </button>

          `).join("")
        }

      </div>

      <div id="methodFeedback"></div>

    </div>
  `;

  if(selected.length){

    const method=
      getMethodById(
        selected[0]
      );

    if(method)
      renderMethodFeedback(
        objectiveId,
        method,
        index
      );
  }
}


function selectMethod(
  objectiveId,
  methodId,
  index
){

  registrarTentativa();
  
  state.projectMethods[objectiveId]=[
    methodId
  ];

  const method=
    getMethodById(methodId);

if(!method.valid){
  registrarAtencao("projetoExtensao");
}

  event(
    "method_choice",
    {
      objective:objectiveId,
      method:methodId,
      valid:method.valid,
      reason:
        method.reason||null
    }
  );

  save();

  methodObjectiveStep(index);
}


function renderMethodFeedback(
  objectiveId,
  method,
  index
){

  $("methodFeedback").innerHTML=`
    <div class="feedback ${
      method.valid
        ?"good"
        :""
    }">

      <h3>
        ${
          method.valid
            ?"✓ MÉTODO COERENTE COM O OBJETIVO"
            :"⚠️ O MÉTODO MUDOU A FINALIDADE"
        }
      </h3>

      <p>
        ${method.feedback}
      </p>

      ${
        method.valid
          ?`
            <button
              onclick="methodObjectiveStep(${index+1})">

              ${
                index+1<
                state.extensionSpecifics.length
                  ?"PLANEJAR PRÓXIMO OBJETIVO →"
                  :"REVISAR MÉTODOS →"
              }

            </button>
          `
          :`
            <button
              onclick="methodObjectiveStep(${index})">

              ESCOLHER OUTRA ESTRATÉGIA

            </button>
          `
      }

    </div>
  `;
}


function methodsReview(){

  const rows=
    state.extensionSpecifics.map(
      objectiveId=>{

        const selected=
          state.projectMethods[objectiveId]
          ||[];

        const method=
          selected.length
            ?getMethodById(selected[0])
            :null;

        return {
          objectiveId,
          method
        };
      }
    );

  const missing=
    rows.filter(
      x=>!x.method
    );

  const invalid=
    rows.filter(
      x=>x.method && !x.method.valid
    );

  $("workTitle").textContent=
    "🔗 COERÊNCIA • OBJETIVOS E MÉTODOS";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 5 • REVISÃO
      </div>

      <h2>
        Objetivo ↔ Método
      </h2>

      <p>
        Confira se cada objetivo específico possui
        uma estratégia capaz de colocá-lo em prática.
      </p>

      ${
        rows.map(row=>`

          <div class="project-box">

            <b>
              🎯
              ${specificObjectives[row.objectiveId].short}
            </b>

            <p>
              ${specificObjectives[row.objectiveId].text}
            </p>

            <hr>

            ${
              row.method
                ?`
                  <p>
                    <b>🛠️ Método:</b><br>
                    ${row.method.label}
                  </p>

                  <p>
                    <small>
                      ${
                        row.method.valid
                          ?"✓ Compatível com o objetivo."
                          :"⚠️ A estratégia não executa adequadamente o objetivo."
                      }
                    </small>
                  </p>
                `
                :`
                  <p>
                    ⚠️ Nenhum método foi definido.
                  </p>
                `
            }

          </div>

        `).join("")
      }

      ${
        missing.length || invalid.length
          ?`
            <div class="feedback">

              <b>
                REVISE O PLANO
              </b>

              <p>
                Todo objetivo específico precisa aparecer
                concretamente nos métodos do projeto.
              </p>

              <button onclick="methodObjectiveStep(0)">
                REVER MÉTODOS
              </button>

            </div>
          `
          :`
            <div class="feedback good">

              <b>
                ✓ TODOS OS OBJETIVOS POSSUEM MÉTODO
              </b>

              <p>
                Agora vamos transformar essas estratégias
                em uma sequência de execução.
              </p>

              <button onclick="prepareSequence()">
                ORGANIZAR A AÇÃO →
              </button>

            </div>
          `
      }

    </div>
  `;
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 6 — SEQUÊNCIA DE EXECUÇÃO
   ========================================================= */

function prepareSequence(){

  const coreMethods=
    state.extensionSpecifics
      .map(
        objectiveId=>{

          const ids=
            state.projectMethods[objectiveId]
            ||[];

          return ids.length
            ?ids[0]
            :null;
        }
      )
      .filter(Boolean);

  const desired=[
    "opening",
    ...coreMethods,
    "evaluation"
  ];

  const current=
    Array.isArray(state.projectSequence)
      ?state.projectSequence
      :[];

  const sameItems=
    current.length===desired.length &&
    desired.every(
      x=>current.includes(x)
    );

  if(!sameItems){

    state.projectSequence=
      desired.slice();

    save();
  }

  sequenceStep();
}


function sequenceItemLabel(id){

  if(id==="opening")
    return "Apresentar os estudantes, a finalidade e a organização da atividade.";

  if(id==="evaluation")
    return "Realizar uma avaliação breve da atividade com os participantes.";

  const method=
    getMethodById(id);

  return method
    ?method.label
    :id;
}


function sequenceItemTime(id){

  if(id==="opening")
    return 5;

  if(id==="evaluation")
    return 5;

  const method=
    getMethodById(id);

  return method
    ?method.time
    :0;
}


function sequenceStep(){

  show("workspace");

  $("workTitle").textContent=
    "🧩 MESA DE PROJETO • SEQUÊNCIA";

  const total=
    state.projectSequence.reduce(
      (sum,id)=>
        sum+
        sequenceItemTime(id),
      0
    );

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 6 • PLANO DE EXECUÇÃO
      </div>

      <h2>
        Em que sequência a ação acontecerá?
      </h2>

      <p>
        Diferentemente dos objetivos específicos,
        que não possuem uma ordem obrigatória,
        os procedimentos acontecem
        <b>ao longo do tempo</b>.
      </p>

      <p>
        Organize as etapas para produzir
        uma sequência de execução compreensível.
      </p>

      <div class="sequence">

        ${
          state.projectSequence
            .map((id,i)=>`

              <div class="seq-item">

                <span class="seq-num">
                  ${i+1}
                </span>

                <span>

                  ${sequenceItemLabel(id)}

                  <br>

                  <small>
                    ⏱️ ${sequenceItemTime(id)} min
                  </small>

                </span>

                <span class="mini-buttons">

                  <button
                    onclick="moveProjectSequence(${i},-1)">
                    ↑
                  </button>

                  <button
                    onclick="moveProjectSequence(${i},1)">
                    ↓
                  </button>

                </span>

              </div>

            `).join("")
        }

      </div>

      <div class="project-box">

        <b>
          ⏱️ TEMPO PARCIAL PLANEJADO
        </b>

        <p>
          ${total} minutos
        </p>

        <small>
          Os recursos e a factibilidade serão analisados
          nas próximas etapas.
        </small>

      </div>

      <button onclick="checkProjectSequence()">
        ANALISAR SEQUÊNCIA
      </button>

      <div id="sequenceFeedback"></div>

    </div>
  `;
}


function moveProjectSequence(i,d){

  const j=
    i+d;

  if(
    j<0 ||
    j>=state.projectSequence.length
  )
    return;

  [
    state.projectSequence[i],
    state.projectSequence[j]
  ]=[
    state.projectSequence[j],
    state.projectSequence[i]
  ];

  event(
    "project_sequence_reorder",
    {
      order:
        state.projectSequence.slice()
    }
  );

  save();

  sequenceStep();
}


function checkProjectSequence(){

  registrarTentativa();

  const seq=
    state.projectSequence;

  const openingIndex=
    seq.indexOf("opening");

  const evaluationIndex=
    seq.indexOf("evaluation");

  const openingOK=
    openingIndex===0;

  const evaluationOK=
    evaluationIndex===
    seq.length-1;

  event(
    "project_sequence_submit",
    {
      order:seq.slice(),
      openingFirst:openingOK,
      evaluationLast:evaluationOK
    }
  );

  if(
    !openingOK ||
    !evaluationOK
  ){

      registrarAtencao("projetoExtensao");

    let message="";

    if(!openingOK){

      message+=`
        <p>
          A apresentação da atividade aparece depois
          de uma ou mais ações. É importante que os
          participantes compreendam inicialmente quem
          realizará a atividade e qual é sua finalidade.
        </p>
      `;
    }

    if(!evaluationOK){

      message+=`
        <p>
          A avaliação foi posicionada antes do término
          das atividades. Para avaliar a experiência
          como um todo, ela deve ocorrer após a execução
          das estratégias planejadas.
        </p>
      `;
    }

    $("sequenceFeedback").innerHTML=`
      <div class="feedback">

        <h3>
          ⚠️ REVEJA A SEQUÊNCIA
        </h3>

        ${message}

        <p>
          As estratégias centrais podem admitir
          diferentes ordens. O importante é preservar
          uma lógica temporal compreensível.
        </p>

      </div>
    `;

    return;
  }

  $("sequenceFeedback").innerHTML=`
    <div class="feedback good">

      <h3>
        ✓ SEQUÊNCIA COERENTE
      </h3>

      <p>
        A atividade começa com apresentação,
        desenvolve as estratégias previstas
        e termina com avaliação.
      </p>

      <p>
        A ordem entre as estratégias centrais
        pode variar de acordo com a dinâmica
        escolhida pelo grupo.
      </p>

      <button onclick="resourcesStep()">
        DEFINIR RECURSOS →
      </button>

    </div>
  `;
}
/* =========================================================
   MESA DE PROJETO
   ETAPA 7 — RECURSOS
   ========================================================= */

const resourceLabels={

  images:
    "Imagens educativas",

  projector:
    "Projetor multimídia",

  illustrated_cards:
    "Cartões ilustrados",

  quiz_cards:
    "Cartões para quiz",

  game_cards:
    "Cartas ou peças do jogo",

  illustrated_story:
    "História ilustrada",

  question_box:
    "Caixa para perguntas",

  paper:
    "Papéis para registro",

  board:
    "Quadro ou cartaz",

  source_guide:
    "Guia de fontes oficiais",

  computer:
    "Computador",

  internet:
    "Acesso à internet",

  source_leaflet:
    "Material com fontes e QR codes",

  questionnaire:
    "Questionários para coleta de dados",

  vaccination_records:
    "Cadernetas ou registros vacinais",

  interview_form:
    "Roteiro estruturado de entrevista",

  scale_forms:
    "Escala padronizada impressa",

  vaccines:
    "Vacinas e insumos para aplicação",

  syringes:
    "Seringas e materiais para vacinação",

  consent_forms:
    "Termos para pesquisa com participantes"
};


function getRequiredResources(){

  const resources=[];

  state.extensionSpecifics.forEach(
    objectiveId=>{

      const selected=
        state.projectMethods[objectiveId]
        ||[];

      selected.forEach(
        methodId=>{

          const method=
            getMethodById(methodId);

          if(
            method &&
            method.valid
          ){

            method.resources.forEach(
              resource=>{

                if(
                  !resources.includes(resource)
                ){

                  resources.push(resource);
                }
              }
            );
          }
        }
      );
    }
  );

  return resources;
}


function resourcesStep(){

  show("workspace");

  $("workTitle").textContent=
    "🎒 MESA DE PROJETO • RECURSOS";

  const required=
    getRequiredResources();

  const optionalResources=[
    ...required,
    "questionnaire",
    "vaccination_records",
    "vaccines",
    "syringes",
    "consent_forms"
  ].filter(
    (x,i,array)=>
      array.indexOf(x)===i
  );

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 7 • RECURSOS
      </div>

      <h2>
        O que será necessário para executar a ação?
      </h2>

      <p>
        Selecione os recursos necessários
        para realizar os métodos que o grupo escolheu.
      </p>

      <p>
        Evite acrescentar materiais que transformem
        a atividade educativa em uma ação que não foi
        prevista no projeto.
      </p>

      <div class="answers">

        ${
          optionalResources.map(
            resource=>`

              <button
                class="answer ${
                  state.projectResources.includes(resource)
                    ?"selected"
                    :""
                }"
                onclick="toggleProjectResource('${resource}')">

                ${
                  state.projectResources.includes(resource)
                    ?"☑"
                    :"☐"
                }

                ${resourceLabels[resource]||resource}

              </button>

            `
          ).join("")
        }

      </div>

      <button onclick="checkProjectResources()">
        ANALISAR RECURSOS
      </button>

      <div id="resourceFeedback"></div>

    </div>
  `;
}


function toggleProjectResource(resource){

  if(
    state.projectResources.includes(resource)
  ){

    state.projectResources=
      state.projectResources.filter(
        x=>x!==resource
      );

  }else{

    state.projectResources.push(resource);
  }

  event(
    "project_resource_toggle",
    {
      resource,
      selected:
        state.projectResources.includes(resource)
    }
  );

  save();

  resourcesStep();
}


function checkProjectResources(){

  registrarTentativa();
  
  const required=
    getRequiredResources();

  const missing=
    required.filter(
      resource=>
        !state.projectResources.includes(resource)
    );

  const inappropriate=[
    "questionnaire",
    "vaccination_records",
    "vaccines",
    "syringes",
    "consent_forms"
  ].filter(
    resource=>
      state.projectResources.includes(resource) &&
      !required.includes(resource)
  );

  event(
    "project_resources_submit",
    {
      selected:
        state.projectResources.slice(),

      required:
        required.slice(),

      missing:
        missing.slice(),

      inappropriate:
        inappropriate.slice()
    }
  );

  if(
    missing.length ||
    inappropriate.length
  ){

      registrarAtencao("projetoExtensao");

    let content="";

    if(missing.length){

      content+=`
        <p>
          <b>Faltam recursos necessários:</b>
        </p>

        <ul>
          ${
            missing.map(
              x=>`
                <li>
                  ${resourceLabels[x]||x}
                </li>
              `
            ).join("")
          }
        </ul>
      `;
    }

    if(inappropriate.length){

      content+=`
        <p>
          <b>
            Alguns recursos não correspondem
            aos métodos escolhidos:
          </b>
        </p>

        <ul>
          ${
            inappropriate.map(
              x=>`
                <li>
                  ${resourceLabels[x]||x}
                </li>
              `
            ).join("")
          }
        </ul>

        <p>
          Esses materiais sugerem procedimentos
          de pesquisa, avaliação individual ou vacinação
          que não fazem parte desta ação educativa.
        </p>
      `;
    }

    $("resourceFeedback").innerHTML=`
      <div class="feedback">

        <h3>
          ⚠️ REVEJA OS RECURSOS
        </h3>

        ${content}

        <p>
          Os recursos devem decorrer dos métodos,
          e não o contrário.
        </p>

      </div>
    `;

    return;
  }

  $("resourceFeedback").innerHTML=`
    <div class="feedback good">

      <h3>
        ✓ RECURSOS COERENTES
      </h3>

      <p>
        Os materiais selecionados correspondem
        às estratégias metodológicas planejadas.
      </p>

      <button onclick="timeFeasibilityStep()">
        ANALISAR TEMPO E FACTIBILIDADE →
      </button>

    </div>
  `;
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 8 — TEMPO E FACTIBILIDADE
   ========================================================= */

function projectTotalMinutes(){

  return state.projectSequence.reduce(
    (sum,id)=>
      sum+
      sequenceItemTime(id),
    0
  );
}


function timeFeasibilityStep(){

  show("workspace");

  $("workTitle").textContent=
    "⏱️ MESA DE PROJETO • FACTIBILIDADE";

  const total=
    projectTotalMinutes();

  const limit=50;

  const feasible=
    total<=limit;

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 8 • TEMPO E FACTIBILIDADE
      </div>

      <h2>
        O plano cabe no tempo disponível?
      </h2>

      <div class="project-grid">

        <div class="project-box">

          <b>
            TEMPO DISPONÍVEL
          </b>

          <p class="big-number">
            ${limit} min
          </p>

        </div>

        <div class="project-box">

          <b>
            TEMPO PLANEJADO
          </b>

          <p class="big-number">
            ${total} min
          </p>

        </div>

      </div>

      <h3>
        Distribuição do tempo
      </h3>

      ${
        state.projectSequence.map(
          (id,i)=>`

            <div class="seq-item">

              <span class="seq-num">
                ${i+1}
              </span>

              <span>
                ${sequenceItemLabel(id)}
              </span>

              <b>
                ${sequenceItemTime(id)} min
              </b>

            </div>

          `
        ).join("")
      }

      ${
        feasible
          ?`
            <div class="feedback good">

              <h3>
                ✓ PLANO FACTÍVEL NO TEMPO DISPONÍVEL
              </h3>

              <p>
                As atividades planejadas podem ser realizadas
                dentro dos ${limit} minutos disponíveis.
              </p>

              <p>
                A estimativa de tempo não garante que tudo
                ocorrerá exatamente como planejado, mas ajuda
                a construir uma proposta executável.
              </p>

              <button onclick="evaluationPlanningStep()">
                PLANEJAR AVALIAÇÃO →
              </button>

            </div>
          `
          :`
            <div class="feedback">

              <h3>
                ⚠️ O PLANO ULTRAPASSA O TEMPO DISPONÍVEL
              </h3>

              <p>
                O grupo planejou ${total} minutos para uma
                atividade de ${limit} minutos.
              </p>

              <p>
                Um projeto precisa ser viável nas condições
                reais de execução. Reveja os métodos ou
                a organização da atividade.
              </p>

              <button onclick="methodObjectiveStep(0)">
                REVER MÉTODOS
              </button>

            </div>
          `
      }

    </div>
  `;

  event(
    "project_feasibility",
    {
      planned_minutes:total,
      available_minutes:limit,
      feasible
    }
  );
}


/* =========================================================
   MESA DE PROJETO
   ETAPA 9 — MONITORAMENTO E AVALIAÇÃO
   ========================================================= */

const evaluationOptions={

  EV1:{
    text:
      "Registrar o número de participantes e quais atividades planejadas foram efetivamente realizadas.",

    valid:true,

    type:"process",

    feedback:
      "Esse registro permite acompanhar a execução da ação e verificar se o que foi planejado foi realizado."
  },

  EV2:{
    text:
      "Realizar uma avaliação breve com os participantes sobre clareza e utilidade da atividade.",

    valid:true,

    type:"participant_feedback",

    feedback:
      "A avaliação breve fornece retorno sobre a experiência dos participantes sem transformar a atividade em um estudo de efeito."
  },

  EV3:{
    text:
      "Registrar as principais dúvidas e temas que surgirem durante a atividade para orientar ações futuras.",

    valid:true,

    type:"field_record",

    feedback:
      "O registro sistemático do que emergiu na prática pode orientar novas ações extensionistas e também revelar questões que mereçam investigação."
  },

  EV4:{
    text:
      "Comprovar que a atividade aumentou a cobertura vacinal das crianças.",

    valid:false,

    type:"impact",

    feedback:
      "Uma atividade isolada não permite atribuir mudanças de cobertura vacinal diretamente à intervenção. Esse desfecho ultrapassa o alcance do projeto."
  },

  EV5:{
    text:
      "Determinar se houve redução da hesitação vacinal das famílias após a ação.",

    valid:false,

    type:"research",

    feedback:
      "Os responsáveis não participam desta ação e determinar mudança em hesitação exigiria desenho e instrumentos adequados de investigação."
  },

  EV6:{
    text:
      "Comparar estatisticamente conhecimento antes e depois da atividade para demonstrar sua eficácia.",

    valid:false,

    type:"research",

    feedback:
      "Essa proposta transforma o acompanhamento da atividade em uma avaliação de efeito com coleta e análise de dados, exigindo outro delineamento."
  }
};


function evaluationPlanningStep(){

  show("workspace");

  $("workTitle").textContent=
    "📊 MESA DE PROJETO • AVALIAÇÃO";

  const selected=
    Object.keys(
      state.projectEvaluation||{}
    ).filter(
      id=>state.projectEvaluation[id]
    );

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 9 • MONITORAMENTO E AVALIAÇÃO
      </div>

      <h2>
        Como acompanhar a ação?
      </h2>

      <p>
        Selecione <b>duas formas</b>
        de acompanhamento ou avaliação compatíveis
        com o alcance deste projeto.
      </p>

      <p>
        A avaliação deve ajudar a compreender
        <b>como a ação ocorreu</b> e
        <b>como foi percebida</b>,
        sem prometer demonstrar efeitos que o projeto
        não consegue medir.
      </p>

      <div class="answers">

        ${
          Object.entries(evaluationOptions)
            .map(([id,item])=>`

              <button
                class="answer ${
                  state.projectEvaluation[id]
                    ?"selected"
                    :""
                }"
                onclick="toggleProjectEvaluation('${id}')">

                ${
                  state.projectEvaluation[id]
                    ?"☑"
                    :"☐"
                }

                <b>
                  ${id.replace("EV","")}.
                </b>

                ${item.text}

              </button>

            `).join("")
        }

      </div>

      <p>
        <b>Selecionadas:</b>
        ${selected.length}/2
      </p>

      <button onclick="checkProjectEvaluation()">
        ANALISAR AVALIAÇÃO
      </button>

      <div id="evaluationFeedback"></div>

    </div>
  `;
}


function toggleProjectEvaluation(id){

  state.projectEvaluation=
    state.projectEvaluation||{};

  if(state.projectEvaluation[id]){

    delete state.projectEvaluation[id];

  }else{

    const selected=
      Object.keys(
        state.projectEvaluation
      ).filter(
        x=>state.projectEvaluation[x]
      );

    if(selected.length>=2){

      alert(
        "Selecione no máximo duas formas de acompanhamento ou avaliação."
      );

      return;
    }

    state.projectEvaluation[id]=true;
  }

  event(
    "project_evaluation_toggle",
    {
      option:id,
      selected:
        !!state.projectEvaluation[id],
      valid:
        evaluationOptions[id].valid
    }
  );

  save();

  evaluationPlanningStep();
}


function checkProjectEvaluation(){

  registrarTentativa();

  const selected=
    Object.keys(
      state.projectEvaluation||{}
    ).filter(
      id=>state.projectEvaluation[id]
    );

  if(selected.length!==2){

    $("evaluationFeedback").innerHTML=`
      <div class="feedback">
        Selecione exatamente duas formas de acompanhamento
        ou avaliação.
      </div>
    `;

    return;
  }

  const invalid=
    selected.filter(
      id=>!evaluationOptions[id].valid
    );

  event(
    "project_evaluation_submit",
    {
      selected:selected.slice(),
      valid:invalid.length===0
    }
  );

  if(invalid.length){

      registrarAtencao("projetoExtensao");

    $("evaluationFeedback").innerHTML=`
      <div class="feedback">

        <h3>
          ⚠️ REVEJA O QUE A AVALIAÇÃO PODE DEMONSTRAR
        </h3>

        ${
          invalid.map(
            id=>`

              <div class="project-box">

                <b>
                  ${evaluationOptions[id].text}
                </b>

                <p>
                  ${evaluationOptions[id].feedback}
                </p>

              </div>

            `
          ).join("")
        }

        <p>
          O monitoramento de uma ação extensionista
          pode registrar execução, participação,
          percepções e questões emergentes.
          Isso é diferente de demonstrar causalmente
          a eficácia da intervenção.
        </p>

      </div>
    `;

    return;
  }

  $("evaluationFeedback").innerHTML=`
    <div class="feedback good">

      <h3>
        ✓ AVALIAÇÃO COMPATÍVEL COM O PROJETO
      </h3>

      ${
        selected.map(
          id=>`

            <div class="project-box">

              <b>
                ${evaluationOptions[id].text}
              </b>

              <p>
                <small>
                  ${evaluationOptions[id].feedback}
                </small>
              </p>

            </div>

          `
        ).join("")
      }

      <button onclick="projectCoherenceMatrix()">
        REVISAR O PROJETO COMPLETO →
      </button>

    </div>
  `;
}


/* =========================================================
   ETAPA 10 — MATRIZ DE COERÊNCIA
   ========================================================= */

function audienceForObjective(id){

  if(id==="OE4")
    return "Trabalhadores da escola";

  if(id==="OE3")
    return "Crianças e trabalhadores da escola";

  return "Crianças da escola";
}


function projectCoherenceMatrix(){

  show("workspace");

  $("workTitle").textContent=
    "🔗 MESA DE PROJETO • COERÊNCIA";

  const evaluationSelected=
    Object.keys(
      state.projectEvaluation||{}
    ).filter(
      id=>state.projectEvaluation[id]
    );

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        ETAPA 10 • MATRIZ DE COERÊNCIA
      </div>

      <h2>
        O projeto está conectado?
      </h2>

      <div class="project-box">

        <b>
          📌 NECESSIDADE
        </b>

        <p>
          ${projectNeeds[state.projectNeed].text}
        </p>

      </div>

      <div class="project-box">

        <b>
          👥 PÚBLICO
        </b>

        <p>
          Crianças e trabalhadores da Escola Vila Aurora.
        </p>

      </div>

      <div class="project-box">

        <b>
          🎯 OBJETIVO GERAL
        </b>

        <p>
          ${buildGeneralObjectiveText()}
        </p>

      </div>

      <h3>
        Objetivos específicos ↔ métodos
      </h3>

      ${
        state.extensionSpecifics.map(
          objectiveId=>{

            const methodId=
              (
                state.projectMethods[objectiveId]
                ||[]
              )[0];

            const method=
              getMethodById(methodId);

            return `
              <div class="project-box">

                <b>
                  🎯
                  ${specificObjectives[objectiveId].text}
                </b>

                <p>
                  <b>Público:</b>
                  ${audienceForObjective(objectiveId)}
                </p>

                <p>
                  <b>Método:</b><br>
                  ${
                    method
                      ?method.label
                      :"Não definido"
                  }
                </p>

                <p>
                  <b>Recursos relacionados:</b><br>
                  ${
                    method &&
                    method.resources.length
                      ?method.resources
                        .map(
                          r=>resourceLabels[r]||r
                        )
                        .join(", ")
                      :"Nenhum recurso específico."
                  }
                </p>

              </div>
            `;
          }
        ).join("")
      }

      <div class="project-box">

        <b>
          ⏱️ TEMPO TOTAL
        </b>

        <p>
          ${projectTotalMinutes()} minutos
        </p>

      </div>

      <div class="project-box">

        <b>
          📊 ACOMPANHAMENTO / AVALIAÇÃO
        </b>

        <ul>
          ${
            evaluationSelected.map(
              id=>`
                <li>
                  ${evaluationOptions[id].text}
                </li>
              `
            ).join("")
          }
        </ul>

      </div>

      <p>
        A coerência metodológica exige que
        <b>necessidade, público, objetivos, métodos,
        recursos, tempo e avaliação</b>
        façam parte da mesma lógica de intervenção.
      </p>

      <button onclick="validateCompleteProject()">
        VALIDAR PROJETO
      </button>

      <div id="projectValidationFeedback"></div>

    </div>
  `;
}


/* =========================================================
   VALIDAÇÃO FINAL DO PROJETO
   ========================================================= */

function validateCompleteProject(){

  const problems=[];

  if(
    !state.projectNeed ||
    projectNeeds[state.projectNeed].type!=="identified"
  ){

    problems.push(
      "A necessidade do projeto precisa representar aquilo que foi efetivamente identificado."
    );
  }


  if(
    !state.projectAudience.includes("children") ||
    !state.projectAudience.includes("workers")
  ){

    problems.push(
      "O público da ação deve incluir crianças e trabalhadores da escola."
    );
  }


  if(
    !state.extensionVerb ||
    !state.extensionObjective ||
    generalObjectiveComplements[
      state.extensionObjective
    ].status!=="coherent"
  ){

    problems.push(
      "O objetivo geral precisa ser revisado."
    );
  }


  if(
    state.extensionSpecifics.length<1 ||
    state.extensionSpecifics.length>3
  ){

    problems.push(
      "Defina entre um e três objetivos específicos."
    );
  }


  if(
    state.extensionSpecifics.some(
      id=>
        specificObjectives[id].category!=="extension"
    )
  ){

    problems.push(
      "Há objetivo específico incompatível com o projeto de extensão."
    );
  }


  state.extensionSpecifics.forEach(
    id=>{

      const methodId=
        (
          state.projectMethods[id]
          ||[]
        )[0];

      const method=
        getMethodById(methodId);

      if(
        !method ||
        !method.valid
      ){

        problems.push(
          "Há objetivo específico sem método coerente."
        );
      }
    }
  );


  const required=
    getRequiredResources();

  const missingResources=
    required.filter(
      r=>!state.projectResources.includes(r)
    );

  if(missingResources.length){

    problems.push(
      "Faltam recursos necessários para os métodos selecionados."
    );
  }


  if(projectTotalMinutes()>50){

    problems.push(
      "O tempo planejado ultrapassa o período disponível."
    );
  }


  const evalSelected=
    Object.keys(
      state.projectEvaluation||{}
    ).filter(
      id=>state.projectEvaluation[id]
    );

  if(
    evalSelected.length!==2 ||
    evalSelected.some(
      id=>!evaluationOptions[id].valid
    )
  ){

    problems.push(
      "A avaliação precisa conter duas opções compatíveis com o alcance do projeto."
    );
  }


  event(
    "project_validation",
    {
      valid:problems.length===0,
      problems:problems.slice()
    }
  );


  if(problems.length){

    $("projectValidationFeedback").innerHTML=`
      <div class="feedback">

        <h3>
          ⚠️ O PROJETO AINDA PRECISA DE AJUSTES
        </h3>

        <ul>
          ${
            problems.map(
              p=>`
                <li>
                  ${p}
                </li>
              `
            ).join("")
          }
        </ul>

      </div>
    `;

    return;
  }


  state.projectValidated=true;

  award(
    20,
    "projeto de extensão completo"
  );


  addJournal(
    "📋 Projeto de extensão",
    [
      "Necessidade: "+
      projectNeeds[state.projectNeed].text,

      "Público: crianças e trabalhadores da Escola Vila Aurora.",

      "Objetivo geral: "+
      buildGeneralObjectiveText(),

      "Objetivos específicos: "+
      state.extensionSpecifics
        .map(
          id=>specificObjectives[id].text
        )
        .join(" | "),

      "Tempo planejado: "+
      projectTotalMinutes()+
      " minutos."
    ].join("\n")
  );


  $("projectValidationFeedback").innerHTML=`
    <div class="feedback good">

      <h3>
        ✓ PROJETO PRONTO PARA EXECUÇÃO
      </h3>

      <p>
        O grupo partiu de uma necessidade apresentada
        pela comunidade, buscou evidências e construiu
        objetivos, métodos, recursos e avaliação
        coerentes com a proposta.
      </p>

      <p>
        Agora a ação pode ser realizada.
      </p>

      <button onclick="releaseExecution()">
        RETORNAR À ESCOLA →
      </button>

    </div>
  `;

  save();
}


function releaseExecution(){

  state.stage="execute";

  event(
    "stage_complete",
    {
      stage_completed:"extension_project"
    }
  );

  save();

  show("map");
  updateMap();
}


/* =========================================================
   EXECUÇÃO NA ESCOLA
   ========================================================= */

const schoolActionPeople={

  joao:{
    icon:"👦🏽",
    name:"João • Estudante",

    speech:
      "Eu achava que vacina era mais para criança pequena. Depois que a gente cresce ainda precisa tomar vacina?",

    insight:
      "Algumas crianças apresentam dúvidas sobre a continuidade do calendário vacinal ao longo da vida.",

    type:"education"
  },


  beatriz:{
    icon:"👧🏻",
    name:"Beatriz • Estudante",

    speech:
      "Eu vi um vídeo dizendo que algumas vacinas deixam a pessoa doente. Como a gente sabe se uma informação é verdadeira?",

    insight:
      "As crianças podem ter contato com informações sobre vacinação em diferentes meios e demonstram necessidade de reconhecer fontes confiáveis.",

    type:"information"
  },


  lucia:{
    icon:"👩🏿‍🏫",
    name:"Lúcia • Professora",

    speech:
      "As crianças trazem muitas dúvidas de casa. Às vezes nós também não sabemos qual fonte indicar quando perguntam sobre vacina.",

    insight:
      "Os trabalhadores da escola também podem necessitar de referências confiáveis para orientar dúvidas que surgem no cotidiano escolar.",

    type:"school"
  },


  paulo:{
    icon:"👨🏼‍💼",
    name:"Paulo • Trabalhador da escola",

    speech:
      "Quando uma família pergunta se uma vacina está atrasada, eu não sei responder. O melhor é orientar que procure a UBS?",

    insight:
      "A escola pode orientar a procura pelo serviço de saúde para avaliação individual da situação vacinal, sem assumir atribuições da UBS.",

    type:"service"
  }
};


function familyAction(){

  setScene(
    "🏫 ESCOLA MUNICIPAL VILA AURORA",
    "AÇÃO DE EXTENSÃO",
    "school-room"
  );

  $("npcs").innerHTML=
    Object.entries(
      schoolActionPeople
    ).map(
      ([id,p])=>`

        <button
          class="npc ${
            state.schoolActionTalked[id]
              ?"done"
              :""
          }"
          onclick="talkSchoolAction('${id}')">

          ${
            state.schoolActionTalked[id]
              ?""
              :'<span class="bang">!</span>'
          }

          ${p.icon}

          <label>
            ${p.name}
          </label>

        </button>

      `
    ).join("");


  const all=
    Object.values(
      state.schoolActionTalked
    ).every(Boolean);


  $("dialog").innerHTML=`
    ${speaker("🎓","AÇÃO EM ANDAMENTO")}

    <p>
      O projeto foi elaborado e a atividade está sendo
      realizada com crianças e trabalhadores da escola.
    </p>

    <p>
      Durante a execução, observe as dúvidas,
      comentários e situações que surgem.
    </p>

    ${
      all
        ?`
          <button
            class="continue"
            onclick="actionEvaluation()">
            AVALIAR A AÇÃO →
          </button>
        `
        :""
    }
  `;
}


function talkSchoolAction(id){

  const p=
    schoolActionPeople[id];

  state.schoolActionTalked[id]=true;

  event(
    "action_npc",
    {
      npc:id,
      insight_type:p.type
    }
  );

  addInsight(
    p.insight
  );

  save();

  familyAction();

  const all=
    Object.values(
      state.schoolActionTalked
    ).every(Boolean);


  $("dialog").innerHTML=`
    ${speaker(
      p.icon,
      p.name.toUpperCase()
    )}

    <p>
      “${p.speech}”
    </p>

    <div class="feedback good">

      <b>
        💡 REGISTRO DE CAMPO
      </b>

      <p>
        ${p.insight}
      </p>

    </div>

    ${
      all
        ?`
          <button
            class="continue"
            onclick="actionEvaluation()">
            AVALIAR A AÇÃO →
          </button>
        `
        :`
          <p>
            <small>
              Continue acompanhando os participantes.
            </small>
          </p>
        `
    }
  `;
}


/* =========================================================
   AVALIAÇÃO APÓS A EXECUÇÃO
   ========================================================= */

function actionEvaluation(){

  show("workspace");

  $("workTitle").textContent=
    "📊 APÓS A AÇÃO";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        REFLEXÃO SOBRE A PRÁTICA
      </div>

      <h2>
        O projeto cumpriu seu papel?
      </h2>

      <p>
        A ação foi realizada conforme o projeto,
        mas durante a atividade surgiram dúvidas
        e situações que não estavam completamente
        previstas no planejamento inicial.
      </p>

      <h3>
        Como você avalia essa situação?
      </h3>

      <div class="answers">

        ${answer(
          "<b>A.</b> A ação fracassou, porque um bom projeto deveria prever todas as dúvidas antes da execução.",
          "chooseActionReason('A')"
        )}

        ${answer(
          "<b>B.</b> A ação pode atender parte da necessidade e, ao mesmo tempo, revelar novas demandas para extensão, articulação com a UBS ou pesquisa.",
          "chooseActionReason('B')"
        )}

        ${answer(
          "<b>C.</b> As dúvidas demonstram que a atividade deveria ter sido substituída por uma pesquisa desde o início.",
          "chooseActionReason('C')"
        )}

        ${answer(
          "<b>D.</b> As novas questões não devem ser registradas, pois não estavam previstas nos objetivos do projeto.",
          "chooseActionReason('D')"
        )}

      </div>

      <div id="actionReasonFeedback"></div>

    </div>
  `;
}


function chooseActionReason(a){

  state.actionReason=a;

  event(
    "choice",
    {
      id:"ACTION_REFLECTION",
      answer:a
    }
  );

  if(a!=="B"){

    const feedback={

      A:
        "Projetos orientam a ação, mas a interação com a comunidade pode revelar situações que não eram conhecidas previamente.",

      C:
        "Extensão e pesquisa possuem finalidades distintas. O surgimento de perguntas durante a extensão não significa que a atividade deveria ter começado como pesquisa.",

      D:
        "Os registros de campo são importantes justamente porque permitem aprender com aquilo que emerge durante a prática."

    }[a];

    $("actionReasonFeedback").innerHTML=`
      <div class="feedback">

        <h3>
          REVEJA A INTERPRETAÇÃO
        </h3>

        <p>
          ${feedback}
        </p>

      </div>
    `;

    return;
  }


  award(
    10,
    "reflexão sobre a prática"
  );


  addJournal(
    "💡 Aprendizado da ação",
    "A extensão pode responder a necessidades concretas e, durante sua execução, revelar novas demandas para outras ações, articulação com serviços ou investigação científica."
  );


  $("actionReasonFeedback").innerHTML=`
    <div class="feedback good">

      <h3>
        ✓ A PRÁTICA TAMBÉM PRODUZ NOVAS PERGUNTAS
      </h3>

      <p>
        O projeto orienta a ação, mas a realidade
        pode revelar aspectos que não estavam
        completamente conhecidos no planejamento.
      </p>

      <p>
        Agora será necessário decidir
        <b>o que fazer com cada nova questão</b>.
      </p>

      <button onclick="releaseInsights()">
        ORGANIZAR OS INSIGHTS →
      </button>

    </div>
  `;

  save();
}


function releaseInsights(){

  state.stage="insights";

  event(
    "stage_complete",
    {
      stage_completed:"extension_action"
    }
  );

  save();

  show("map");
  updateMap();
}


/* =========================================================
   INSIGHTS — EXTENSÃO, PESQUISA OU AMBAS
   ========================================================= */

const classificationItems={

  Q1:{
    text:
      "Na próxima atividade, utilizar mais estratégias lúdicas para trabalhar vacinação com as crianças.",

    correct:"extension",

    explanation:
      "Trata-se de aperfeiçoar uma ação educativa junto à comunidade. A questão pode ser incorporada diretamente ao planejamento extensionista."
  },

  Q2:{
    text:
      "Articular com a UBS uma forma clara de orientar famílias que precisam verificar individualmente a situação vacinal.",

    correct:"extension",

    explanation:
      "A questão demanda articulação entre escola, universidade e serviço de saúde para qualificar a orientação oferecida à comunidade."
  },

  Q3:{
    text:
      "Quais fatores estão associados ao atraso vacinal entre crianças atendidas pela UBS Vila Aurora?",

    correct:"research",

    explanation:
      "A pergunta busca produzir conhecimento sistemático sobre fatores associados a uma condição e exige delineamento de pesquisa."
  },

  Q4:{
    text:
      "Qual é a frequência de atraso vacinal entre crianças acompanhadas pela UBS Vila Aurora?",

    correct:"research",

    explanation:
      "A questão pretende estimar a ocorrência de uma condição em uma população e necessita de método investigativo."
  },

  Q5:{
    text:
      "Na próxima ação, orientar os trabalhadores da escola sobre fontes oficiais de informação sobre vacinação.",

    correct:"extension",

    explanation:
      "É uma necessidade que pode ser incorporada diretamente a uma nova ação educativa."
  },

  Q6:{
    text:
      "Como crianças e trabalhadores da escola compreendem as informações sobre vacinação que circulam nas redes sociais?",

    correct:"both",

    explanation:
      "O tema pode gerar uma ação educativa, mas também contém uma pergunta que pode ser investigada sistematicamente. Extensão e pesquisa podem dialogar sem se tornarem a mesma atividade."
  }
};


function insightWorkshop(){

  show("workspace");

  $("workTitle").textContent=
    "💡 OFICINA • O QUE FAZER COM AS NOVAS QUESTÕES?";

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        Extensão, pesquisa ou ambas?
      </h2>

      <p>
        A ação gerou novas questões.
        Para cada situação, escolha o caminho
        que parece mais adequado.
      </p>

      <div class="project-box">

        <b>
          EXTENSÃO
        </b>

        <p>
          Atua diretamente com a comunidade
          por meio de ações construídas a partir
          de necessidades e diálogo.
        </p>

      </div>

      <div class="project-box">

        <b>
          PESQUISA
        </b>

        <p>
          Produz conhecimento de forma sistemática
          para responder a uma pergunta.
        </p>

      </div>

      <div class="project-box">

        <b>
          AMBAS
        </b>

        <p>
          Um mesmo tema pode gerar ações extensionistas
          e perguntas de pesquisa, desde que cada atividade
          tenha finalidade e método próprios.
        </p>

      </div>

      <button onclick="classificationStep(0)">
        COMEÇAR CLASSIFICAÇÃO →
      </button>

    </div>
  `;
}


function classificationStep(index){

  const ids=
    Object.keys(
      classificationItems
    );

  if(index>=ids.length){

    return classificationSummary();
  }

  const id=
    ids[index];

  const item=
    classificationItems[id];

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        SITUAÇÃO ${index+1} DE ${ids.length}
      </div>

      <h2>
        ${item.text}
      </h2>

      <div class="answers">

        ${answer(
          "<b>A.</b> Principalmente extensão",
          `classifyInsight('${id}','extension',${index})`
        )}

        ${answer(
          "<b>B.</b> Principalmente pesquisa",
          `classifyInsight('${id}','research',${index})`
        )}

        ${answer(
          "<b>C.</b> Pode gerar extensão e pesquisa",
          `classifyInsight('${id}','both',${index})`
        )}

      </div>

      <div id="classificationFeedback"></div>

    </div>
  `;
}


function classifyInsight(
  id,
  choice,
  index
){

  registrarTentativa();

  const item=
    classificationItems[id];

  state.classifications[id]=choice;

  const correct=
    choice===item.correct;

    if(!correct){
  registrarAtencao("extensaoPesquisa");
}

  event(
    "classification",
    {
      item:id,
      answer:choice,
      correct
    }
  );

  save();


  $("classificationFeedback").innerHTML=`
    <div class="feedback ${
      correct
        ?"good"
        :""
    }">

      <h3>
        ${
          correct
            ?"✓ CLASSIFICAÇÃO COERENTE"
            :"💭 REVEJA A FINALIDADE"
        }
      </h3>

      <p>
        ${item.explanation}
      </p>

      ${
        correct
          ?`
            <button
              onclick="classificationStep(${index+1})">
              PRÓXIMA SITUAÇÃO →
            </button>
          `
          :`
            <button
              onclick="classificationStep(${index})">
              TENTAR NOVAMENTE
            </button>
          `
      }

    </div>
  `;

  if(correct){

    award(
      3,
      "classificação extensão/pesquisa"
    );
  }
}


function classificationSummary(){

  const ids=
    Object.keys(
      classificationItems
    );

  const correctCount=
    ids.filter(
      id=>
        state.classifications[id]===
        classificationItems[id].correct
    ).length;

  $("workContent").innerHTML=`
    <div class="work-card">

      <h2>
        ✓ NOVAS POSSIBILIDADES IDENTIFICADAS
      </h2>

      <p>
        Você classificou corretamente
        <b>${correctCount} de ${ids.length}</b>
        situações.
      </p>

      <p>
        A experiência extensionista não precisa
        terminar quando a atividade termina.
        Ela pode:
      </p>

      <ul>
        <li>
          gerar novas ações com a comunidade;
        </li>

        <li>
          exigir articulação com serviços;
        </li>

        <li>
          revelar lacunas de conhecimento;
        </li>

        <li>
          originar perguntas que podem ser
          investigadas cientificamente.
        </li>
      </ul>

      <button onclick="releaseResearchStage()">
        TRANSFORMAR UMA DÚVIDA EM PERGUNTA DE PESQUISA →
      </button>

    </div>
  `;
}


function releaseResearchStage(){

  state.stage="research";

  event(
    "stage_complete",
    {
      stage_completed:"insight_classification"
    }
  );

  save();

  show("map");
  updateMap();
}


/* =========================================================
   DA EXTENSÃO À PERGUNTA DE PESQUISA
   ========================================================= */

const researchQuestions={

  R1:{
    text:
      "Quais fatores estão associados ao atraso vacinal entre crianças atendidas pela UBS Vila Aurora?",

    valid:true,

    explanation:
      "A pergunta define um fenômeno que pode ser investigado sistematicamente e surge de uma questão observada durante a aproximação com a comunidade."
  },

  R2:{
    text:
      "Qual é a frequência de atraso vacinal entre crianças acompanhadas pela UBS Vila Aurora?",

    valid:true,

    explanation:
      "A pergunta busca estimar a ocorrência de uma condição em uma população definida e pode orientar um estudo epidemiológico."
  },

  R3:{
    text:
      "Quais são as principais dúvidas e percepções de crianças e trabalhadores da Escola Vila Aurora sobre vacinação infantil?",

    valid:true,

    explanation:
      "A pergunta delimita participantes e fenômeno de interesse e poderia ser investigada por abordagem adequada às percepções dos participantes."
  },

  R4:{
    text:
      "Realizar novas atividades educativas sobre vacinação na Escola Vila Aurora.",

    valid:false,

    explanation:
      "Esta formulação descreve uma ação a ser realizada, e não uma pergunta que produza conhecimento por investigação sistemática."
  },

  R5:{
    text:
      "Aumentar a cobertura vacinal das crianças da comunidade.",

    valid:false,

    explanation:
      "A formulação apresenta um resultado desejado, mas não constitui uma pergunta de pesquisa."
  }
};


function researchChoice(){

  show("workspace");

  $("workTitle").textContent=
    "🔬 DA EXTENSÃO À PESQUISA";

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        UMA NOVA ETAPA
      </div>

      <h2>
        Qual questão poderia iniciar uma pesquisa?
      </h2>

      <p>
        A ação de extensão permitiu identificar
        perguntas que não podem ser respondidas
        apenas pela realização de outra atividade educativa.
      </p>

      <p>
        Escolha uma formulação que possa orientar
        a produção sistemática de conhecimento.
      </p>

      <div class="answers">

        ${
          Object.entries(researchQuestions)
            .map(([id,item])=>`

              <button
                class="answer ${
                  state.researchQuestion===id
                    ?"selected"
                    :""
                }"
                onclick="chooseResearchQuestion('${id}')">

                <b>
                  ${id.replace("R","")}.
                </b>

                ${item.text}

              </button>

            `).join("")
        }

      </div>

      <div id="researchQuestionFeedback"></div>

    </div>
  `;

  if(state.researchQuestion)
    renderResearchQuestionFeedback();
}


function chooseResearchQuestion(id){

  registrarTentativa();

  state.researchQuestion=id;

if(!researchQuestions[id].valid){
  registrarAtencao("perguntaPesquisa");
}

  event(
    "research_question_choice",
    {
      question:id,
      valid:
        researchQuestions[id].valid
    }
  );

  save();

  researchChoice();
}


function renderResearchQuestionFeedback(){

  const q=
    researchQuestions[
      state.researchQuestion
    ];

  $("researchQuestionFeedback").innerHTML=`
    <div class="feedback ${
      q.valid
        ?"good"
        :""
    }">

      <h3>
        ${
          q.valid
            ?"✓ UMA PERGUNTA INVESTIGÁVEL"
            :"⚠️ ISTO AINDA NÃO É UMA PERGUNTA DE PESQUISA"
        }
      </h3>

      <p>
        ${q.explanation}
      </p>

      ${
        q.valid
          ?`
            <button onclick="finishChapter()">
              CONCLUIR CAPÍTULO →
            </button>
          `
          :`
            <button onclick="researchChoice()">
              ESCOLHER OUTRA FORMULAÇÃO
            </button>
          `
      }

    </div>
  `;
}

function getFeedbackDomains(){

  return [
    {
  id:"necessidade",
  title:"Identificação da necessidade",
  text:"Revise a diferença entre uma necessidade identificada no contexto e explicações ou hipóteses que ainda não foram demonstradas."
},

   {
  id:"extensaoPesquisa",
  title:"Extensão × pesquisa",
  text:"Revise as diferenças entre extensão e pesquisa, especialmente quanto aos seus objetivos e ao tipo de conhecimento ou intervenção que cada uma produz."
},
    {
  id:"evidencias",
  title:"Busca e seleção de evidências",
  text:"Revise como conceitos, operadores booleanos e agrupamentos são utilizados na estratégia de busca e como avaliar a pertinência dos resultados encontrados."
},

    {
  id:"projetoExtensao",
  title:"Construção do projeto de extensão",
  text:"Revise a relação entre necessidade, objetivos, público e métodos, buscando coerência e factibilidade no planejamento da ação."
},

    {
  id:"perguntaPesquisa",
  title:"Da prática à pergunta de pesquisa",
  text:"Revise como uma questão surgida na prática pode ser delimitada e transformada em uma pergunta investigável."
}
  ];

}

function renderFinalFeedback(){

  const domains=
    getFeedbackDomains();

  const attention=
    domains.filter(
      domain=>
        state.feedback &&
        state.feedback[domain.id]===true
    );

  if(attention.length===0){

    $("finalFeedback").innerHTML=`
      <div class="feedback good">

        <h3>
          🌟 PERCURSO SEM PONTOS DE ATENÇÃO IDENTIFICADOS
        </h3>

        <p>
          Você concluiu as decisões avaliadas neste capítulo
          sem selecionar alternativas associadas aos pontos
          de atenção analisados.
        </p>

      </div>
    `;

    return;
  }
  $("finalFeedback").innerHTML=`
    <div class="feedback">

      <h3>
        📌 PONTOS DE ATENÇÃO PARA SEGUIR APRENDENDO
      </h3>

      <p>
        Durante o percurso, algumas decisões indicaram
        conteúdos que merecem ser retomados:
      </p>
      ${
        attention.map(
          domain=>`
            <div class="project-box">

              <b>
                ${domain.title}
              </b>

              <p>
                ${domain.text}
              </p>

            </div>
          `
        ).join("")
      }
        

    </div>
  `;
}



function finishChapter(){

  const q=
    researchQuestions[
      state.researchQuestion
    ];

  if(
    !q ||
    !q.valid
  )
    return;


  addJournal(
    "🔬 Pergunta de pesquisa",
    q.text
  );


  award(
    15,
    "formulação de pergunta investigável"
  );


  state.stage="done";

  event(
    "chapter_complete",
    {
      chapter:1,
      xp:state.xp,
      research_question:
        q.text
    }
  );

  save();

  $("finalXp").textContent=
    state.xp;
    
renderFinalFeedback();

  show("chapterEnd");
}


/* =========================================================
   PRÓXIMA ETAPA
   ========================================================= */

function openResearchStart(){

  show("workspace");

  $("workTitle").textContent=
    "🔬 PRÓXIMO CAPÍTULO";

  const q=
    researchQuestions[
      state.researchQuestion
    ];

  $("workContent").innerHTML=`
    <div class="work-card">

      <div class="kicker">
        PROPOSTA DE PESQUISA
      </div>

      <h2>
        Da pergunta ao projeto
      </h2>

      <div class="project-box">

        <b>
          PERGUNTA QUE SURGIU DA EXPERIÊNCIA
        </b>

        <p>
          ${
            q
              ?q.text
              :"Nenhuma pergunta selecionada."
          }
        </p>

      </div>

      <p>
        No próximo capítulo, essa pergunta poderá
        ser utilizada para trabalhar:
      </p>

      <ul>
        <li>
          tema e delimitação do problema;
        </li>

        <li>
          pergunta de pesquisa;
        </li>

        <li>
          objetivo geral e objetivos específicos;
        </li>

        <li>
          justificativa;
        </li>

        <li>
          escolha do método;
        </li>

        <li>
          relação entre pergunta, objetivo e delineamento.
        </li>
      </ul>

      <p>
        <b>Capítulo 1 concluído.</b>
      </p>

      <button onclick="show('map');updateMap()">
        VOLTAR À VILA
      </button>

    </div>
  `;
}


/* =========================================================
   CADERNO DE CAMPO
   ========================================================= */

function openJournal(){

  $("journal").classList.remove(
    "hidden"
  );

  renderJournal();
}


function closeJournal(){

  $("journal").classList.add(
    "hidden"
  );
}


function renderJournal(){

  const container=
    $("journalEntries");

  if(!container)
    return;


  if(journalTab==="registros"){

    container.innerHTML=
      state.journal.length
        ?state.journal.map(
          item=>`

            <div class="journal-entry">

              <b>
                ${item.title}
              </b>

              <p>
                ${item.text}
              </p>

            </div>

          `
        ).join("")
        :`
          <p>
            Nenhum registro realizado ainda.
          </p>
        `;

    return;
  }


  if(journalTab==="insights"){

    container.innerHTML=
      state.insights.length
        ?state.insights.map(
          item=>`

            <div class="journal-entry">

              <b>
                💡 Insight
              </b>

              <p>
                ${item}
              </p>

            </div>

          `
        ).join("")
        :`
          <p>
            Os insights aparecerão durante
            a execução da ação.
          </p>
        `;

    return;
  }


  if(journalTab==="projeto"){

    const methods=
      state.extensionSpecifics.map(
        objectiveId=>{

          const methodId=
            (
              state.projectMethods[
                objectiveId
              ]
              ||[]
            )[0];

          const method=
            getMethodById(methodId);

          return method
            ?`
              <div class="journal-entry">

                <b>
                  ${specificObjectives[objectiveId].short}
                </b>

                <p>
                  ${method.label}
                </p>

              </div>
            `
            :"";
        }
      ).join("");


    const selectedPapers=
      state.selectedPapers.length
        ?state.selectedPapers.join(", ")
        :"Ainda não selecionados";


    const question=
      state.researchQuestion &&
      researchQuestions[
        state.researchQuestion
      ]
        ?researchQuestions[
          state.researchQuestion
        ].text
        :"Ainda não definida";


    container.innerHTML=`

      <div class="journal-entry">

        <b>
          📌 Necessidade
        </b>

        <p>
          ${
            state.projectNeed
              ?projectNeeds[
                state.projectNeed
              ].text
              :"Ainda não definida"
          }
        </p>

      </div>


      <div class="journal-entry">

        <b>
          👥 Público
        </b>

        <p>
          Crianças e trabalhadores
          da Escola Vila Aurora.
        </p>

      </div>


      <div class="journal-entry">

        <b>
          🎯 Objetivo geral
        </b>

        <p>
          ${
            buildGeneralObjectiveText()
            ||
            "Ainda não definido"
          }
        </p>

      </div>


      <div class="journal-entry">

        <b>
          🎯 Objetivos específicos
        </b>

        <p>
          ${
            state.extensionSpecifics.length
              ?state.extensionSpecifics
                .map(
                  id=>
                    specificObjectives[id].text
                )
                .join("<br><br>")
              :"Ainda não definidos"
          }
        </p>

      </div>


      <div class="journal-entry">

        <b>
          🛠️ Métodos
        </b>

        ${
          methods
          ||
          "<p>Ainda não definidos.</p>"
        }

      </div>


      <div class="journal-entry">

        <b>
          🔎 Evidências selecionadas
        </b>

        <p>
          ${selectedPapers}
        </p>

      </div>


      <div class="journal-entry">

        <b>
          🔬 Pergunta de pesquisa
        </b>

        <p>
          ${question}
        </p>

      </div>
    `;

    return;
  }
}


/* =========================================================
   FUNÇÕES DE REGISTRO LOCAL
   Permanecem no código para testes do protótipo.
   Não há botão de acesso aos dados para o estudante.
   ========================================================= */

function openData(){

  if(!$("dataModal"))
    return;

  $("dataModal").classList.remove(
    "hidden"
  );

  renderData();
}


function closeData(){

  if(!$("dataModal"))
    return;

  $("dataModal").classList.add(
    "hidden"
  );
}


function renderData(){

  if(
    !$("dataSummary") ||
    !$("dataDump")
  )
    return;

  $("dataSummary").innerHTML=`
    <div class="project-grid">

      <div class="project-box">
        <b>XP</b>
        <p>${state.xp}</p>
      </div>

      <div class="project-box">
        <b>ETAPA</b>
        <p>${state.stage}</p>
      </div>

      <div class="project-box">
        <b>EVENTOS</b>
        <p>${state.events.length}</p>
      </div>

      <div class="project-box">
        <b>TENTATIVAS DE BUSCA</b>
        <p>${state.searchAttempts}</p>
      </div>

    </div>
  `;

  $("dataDump").value=
    JSON.stringify(
      state,
      null,
      2
    );
}


function copyData(){

  const text=
    JSON.stringify(
      state,
      null,
      2
    );

  if(
    navigator.clipboard &&
    navigator.clipboard.writeText
  ){

    navigator.clipboard
      .writeText(text)
      .then(
        ()=>alert(
          "Dados copiados."
        )
      );

  }else{

    alert(
      "A cópia automática não está disponível neste navegador."
    );
  }
}


function downloadData(){

  const blob=
    new Blob(
      [
        JSON.stringify(
          state,
          null,
          2
        )
      ],
      {
        type:"application/json"
      }
    );

  const url=
    URL.createObjectURL(blob);

  const a=
    document.createElement("a");

  a.href=url;

  a.download=
    "mcm-vila-aurora-teste.json";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
}


function resetGame(){

  if(
    !confirm(
      "Deseja apagar os dados locais deste teste e reiniciar o jogo?"
    )
  )
    return;

  localStorage.removeItem(
    STORE
  );

  state=
    structuredClone(
      defaultState
    );

  save();

  location.reload();
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    syncXP();

    if(
      state.stage==="done" &&
      $("finalXp")
    ){

      $("finalXp").textContent=
        state.xp;
    }

    updateMap();
  }
);
