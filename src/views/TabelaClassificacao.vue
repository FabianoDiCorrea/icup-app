<template>
  <div class="container mt-4 mb-5">

    <div v-if="carregando" class="text-center py-5">
      <BSpinner variant="primary" label="Processando dados..." />
    </div>

    <div v-else-if="!campeonato">
      <BAlert show variant="danger">Campeonato não encontrado.</BAlert>
      <BButton @click="$router.push('/lista-campeonatos')">Voltar</BButton>
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-primary fw-bold mb-0">
            {{ campeonato.tipo === 'MATA_MATA' ? 'Chaveamento' : 'Classificação' }}
          </h2>
          <span class="text-muted">{{ campeonato.nome }} <BBadge>{{ formatarTipo(campeonato.tipo) }}</BBadge></span>
        </div>
        <BButton variant="outline-secondary" @click="$router.push(`/campeonato/${id}`)">
          Ver Jogos
        </BButton>
      </div>

      <div v-if="campeonato.tipo === 'PONTOS_CORRIDOS'">
        <BCard class="shadow-sm p-0 overflow-hidden">
          <BTableSimple hover responsive striped class="mb-0 align-middle">
            <BThead variant="dark">
              <BTr>
                <BTh>#</BTh>
                <BTh>Time</BTh>
                <BTh v-for="col in colunas" :key="col.chave" class="text-center cursor-pointer user-select-none"
                  @click="alterarOrdenacao(col.chave)" :title="col.titulo"
                  :class="{ 'bg-secondary': ordenacao.coluna === col.chave }">
                  {{ col.sigla }}
                  <span v-if="ordenacao.coluna === col.chave" class="small">
                    {{ ordenacao.direcao === 'desc' ? '▼' : '▲' }}
                  </span>
                </BTh>
              </BTr>
            </BThead>
            <BTbody>
              <BTr v-for="(time, index) in timesClassificados" :key="time.id">
                <BTd class="text-center text-muted small" style="width: 50px;">{{ index + 1 }}º</BTd>
                <BTd style="min-width: 200px;">
  <div class="d-flex align-items-center gap-2">

    <!-- SIGLAS: TÉCNICO + PAÍS -->
    <span class="fw-bold">
      <span v-if="time.tecnico" class="tecnico-label me-1">
        {{ time.tecnico }}
      </span>

      <span
        v-if="campeonato.adicionarNacionalidade && time.pais"
        class="pais-label"
      >
        {{ time.pais.substring(0,3).toUpperCase() }}
      </span>
    </span>

    <!-- ESCUDO NO MEIO -->
    <img
      :src="time.escudo"
      style="width: 30px; height: 30px; object-fit: contain;"
      onerror="this.style.display='none'"
    />

    <!-- NOME DO TIME -->
    <span class="fw-bold">
      {{ time.nome }}
    </span>

  </div>
</BTd>

                <BTd class="text-center fw-bold text-primary">{{ time.pontos }}</BTd>
                <BTd class="text-center">{{ time.jogos }}</BTd>
                <BTd class="text-center">{{ time.vitorias }}</BTd>
                <BTd class="text-center">{{ time.empates }}</BTd>
                <BTd class="text-center">{{ time.derrotas }}</BTd>
                <BTd class="text-center text-muted small">{{ time.golsPro }}</BTd>
                <BTd class="text-center text-muted small">{{ time.golsContra }}</BTd>
                <BTd class="text-center">{{ time.saldoGols }}</BTd>
                <BTd class="text-center small">{{ time.aproveitamento }}%</BTd>
              </BTr>
            </BTbody>
          </BTableSimple>
        </BCard>
        <div class="mt-2 text-muted small">
          <span class="me-3"><strong>P:</strong> Pontos</span>
          <span class="me-3"><strong>J:</strong> Jogos</span>
          <span class="me-3"><strong>V:</strong> Vitórias</span>
          <span class="me-3"><strong>E:</strong> Empates</span>
          <span class="me-3"><strong>D:</strong> Derrotas</span>
           <span class="me-3"><strong>GP:</strong> Gols Pró</span>
          <span><strong>GC:</strong> Gols Contra</span>
          <span class="me-3"><strong>SG:</strong> Saldo de Gols</span>
          <span class="me-3"><strong>%:</strong> Aproveitamento</span>
        </div>
      </div>

      <div v-else-if="campeonato.tipo === 'GRUPOS'">
        <div v-for="(grupoTimes, nomeGrupo) in classificacaoPorGrupo" :key="nomeGrupo" class="mb-4">
          <h5 class="fw-bold   border-start border-4 border-primary ps-2 mb-2   py-2">
            {{ nomeGrupo }}
          </h5>
          <BCard class="shadow-sm p-0 overflow-hidden">
            <BTableSimple hover responsive striped class="mb-0 align-middle">
              <BThead variant="dark">
                <BTr>
                  <BTh>#</BTh>
                  <BTh>Time</BTh>
                  <BTh v-for="col in colunas" :key="col.chave" class="text-center cursor-pointer user-select-none"
                    @click="alterarOrdenacao(col.chave)" :title="col.titulo"
                    :class="{ 'bg-secondary': ordenacao.coluna === col.chave }">
                    {{ col.sigla }}
                    <span v-if="ordenacao.coluna === col.chave" class="small">
                      {{ ordenacao.direcao === 'desc' ? '▼' : '▲' }}
                    </span>
                  </BTh>
                </BTr>
              </BThead>
              <BTbody>
                <BTr v-for="(time, index) in grupoTimes" :key="time.id">
                  <BTd class="text-center text-muted small" style="width: 50px;">{{ index + 1 }}º</BTd>
                  <BTd style="min-width: 200px;">
  <div class="d-flex align-items-center gap-2">

    <!-- SIGLAS: TÉCNICO + PAÍS -->
    <span class="fw-bold">
      <span v-if="time.tecnico" class="tecnico-label me-1">
        {{ time.tecnico }}
      </span>

      <span
        v-if="campeonato.adicionarNacionalidade && time.pais"
        class="pais-label"
      >
        {{ time.pais.substring(0,3).toUpperCase() }}
      </span>
    </span>

    <!-- ESCUDO NO MEIO -->
    <img
      :src="time.escudo"
      style="width: 30px; height: 30px; object-fit: contain;"
      onerror="this.style.display='none'"
    />

    <!-- NOME DO TIME -->
    <span class="fw-bold">
      {{ time.nome }}
    </span>

  </div>
</BTd>

                  <BTd class="text-center fw-bold   text-primary">{{ time.pontos }}</BTd>
                  <BTd class="text-center">{{ time.jogos }}</BTd>
                  <BTd class="text-center">{{ time.vitorias }}</BTd>
                  <BTd class="text-center">{{ time.empates }}</BTd>
                  <BTd class="text-center">{{ time.derrotas }}</BTd> 
                  <BTd class="text-center text-muted small">{{ time.golsPro }}</BTd>
                  <BTd class="text-center text-muted small">{{ time.golsContra }}</BTd>
                  <BTd class="text-center">{{ time.saldoGols }}</BTd>
                  <BTd class="text-center small">{{ time.aproveitamento }}%</BTd>
                </BTr>
              </BTbody>
            </BTableSimple>
          </BCard>
        </div>

        <div class="mt-2 text-muted small">
          <span class="me-3"><strong>P:</strong> Pontos</span>
          <span class="me-3"><strong>J:</strong> Jogos</span>
          <span class="me-3"><strong>V:</strong> Vitórias</span>
          <span class="me-3"><strong>E:</strong> Empates</span>
          <span class="me-3"><strong>D:</strong> Derrotas</span>
          <span class="me-3"><strong>GP:</strong> Gols Pró</span>
          <span><strong>GC:</strong> Gols Contra</span>
          <span class="me-3"><strong>SG:</strong> Saldo de Gols</span>
          <span class="me-3"><strong>%:</strong> Aproveitamento</span>
        </div>

        <div v-if="temMataMata" class="mt-5 pt-4 border-top">
          <h4 class="text-primary fw-bold mb-4">Fase Final</h4>

          <div class="d-flex flex-nowrap overflow-auto pb-4 gap-4" style="min-height: 400px;">
            <div v-for="(fase, nomeFase) in dadosMataMata" :key="nomeFase" class="fase-coluna"
              style="min-width: 320px;">
              <h5 class="text-center bg-dark text-white py-2 rounded-top mb-0">{{ nomeFase }}</h5>
              <div class="  p-3 h-100 border-start border-end border-bottom">

                <div v-for="confronto in fase" :key="confronto.id" class="card mb-3 shadow-sm border-0 confronto-card">
                  <div class="card-body p-2">
                    <div class="d-flex justify-content-between text-muted small mb-1">
                      <span>Confronto #{{ confronto.id }}</span>
                      <span v-if="confronto.finalizado" class="text-success fw-bold">Finalizado</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center p-2 rounded mb-1"
                      :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeA.id, ' ': confronto.vencedor !== confronto.timeA.id }">
                      <div class="d-flex align-items-center">
                        <img :src="confronto.timeA.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                        <span>{{ confronto.timeA.nome }}</span>
                      </div>
                      <div class="d-flex gap-2">
                        <span class="badge bg-secondary">{{ confronto.placarA_Ida }}</span>
                        <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarA_Volta }}</span>
                        <span class="fw-bold ms-1">{{ confronto.totalA }}</span>
                      </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center p-2 rounded"
                      :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeB.id, ' ': confronto.vencedor !== confronto.timeB.id }">
                      <div class="d-flex align-items-center">
                        <img :src="confronto.timeB.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                        <span>{{ confronto.timeB.nome }}</span>
                      </div>
                      <div class="d-flex gap-2">
                        <span class="badge bg-secondary">{{ confronto.placarB_Ida }}</span>
                        <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarB_Volta }}</span>
                        <span class="fw-bold ms-1">{{ confronto.totalB }}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="campeonato.tipo === 'MATA_MATA'">
        <div class="d-flex flex-nowrap overflow-auto pb-4 gap-4" style="min-height: 400px;">

          <div v-for="(fase, nomeFase) in dadosMataMata" :key="nomeFase" class="fase-coluna" style="min-width: 320px;">
            <h5 class="text-center bg-dark text-white py-2 rounded-top mb-0">{{ nomeFase }}</h5>
            <div class="  p-3 h-100 border-start border-end border-bottom">

              <div v-for="confronto in fase" :key="confronto.id" class="card mb-3 shadow-sm border-0 confronto-card">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between text-muted small mb-1">
                    <span>Confronto #{{ confronto.id }}</span>
                    <span v-if="confronto.finalizado" class="text-success fw-bold">Finalizado</span>
                  </div>

                  <div class="d-flex justify-content-between align-items-center p-2 rounded mb-1"
                    :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeA.id, ' ': confronto.vencedor !== confronto.timeA.id }">
                    <div class="d-flex align-items-center">
                      <img :src="confronto.timeA.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                      <span>{{ confronto.timeA.nome }}</span>
                    </div>
                    <div class="d-flex gap-2">
                      <span class="badge bg-secondary">{{ confronto.placarA_Ida }}</span>
                      <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarA_Volta }}</span>
                      <span class="fw-bold ms-1">{{ confronto.totalA }}</span>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between align-items-center p-2 rounded"
                    :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeB.id, ' ': confronto.vencedor !== confronto.timeB.id }">
                    <div class="d-flex align-items-center">
                      <img :src="confronto.timeB.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                      <span>{{ confronto.timeB.nome }}</span>
                    </div>
                    <div class="d-flex gap-2">
                      <span class="badge bg-secondary">{{ confronto.placarB_Ida }}</span>
                      <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarB_Volta }}</span>
                      <span class="fw-bold ms-1">{{ confronto.totalB }}</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <div v-if="Object.keys(dadosMataMata).length === 0" class="text-center w-100 py-5 text-muted">
            Nenhum confronto definido ainda.
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import {
  BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BAlert, BBadge
} from 'bootstrap-vue-next';

export default {
  name: 'TabelaClassificacao',
  components: {
    BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BAlert, BBadge
  },
  props: {
    id: { type: [String, Number], required: true }
  },
  data() {
    return {
      carregando: true,
      campeonato: null,
      tabelaBase: [], // Todos os times com stats calculados

      ordenacao: { coluna: 'pontos', direcao: 'desc' },

      colunas: [
        { sigla: 'P', chave: 'pontos', titulo: 'Pontos' },
        { sigla: 'J', chave: 'jogos', titulo: 'Jogos' },
        { sigla: 'V', chave: 'vitorias', titulo: 'Vitórias' },
        { sigla: 'E', chave: 'empates', titulo: 'Empates' },
        { sigla: 'D', chave: 'derrotas', titulo: 'Derrotas' },
        { sigla: 'GF', chave: 'golsPro', titulo: 'Gols Pró' },
        { sigla: 'GC', chave: 'golsContra', titulo: 'Gols Contra' },
        { sigla: 'SG', chave: 'saldoGols', titulo: 'Saldo de Gols' }, 
        { sigla: '%', chave: 'aproveitamentoNum', titulo: 'Aproveitamento' },
      ]
    }
  },
  computed: {
    // --- Lógica para Pontos Corridos e Base para Grupos ---
    timesClassificados() {
      // Ordena a tabelaBase inteira
      return this.ordenarTimes([...this.tabelaBase]);
    },

    // --- Lógica para Grupos ---
    classificacaoPorGrupo() {
      if (!this.campeonato || this.campeonato.tipo !== 'GRUPOS') return {};

      const gruposObj = {};

      // Inicializa com os nomes dos grupos do cadastro
      if (this.campeonato.grupos) {
        this.campeonato.grupos.forEach(g => { gruposObj[g.nome] = [] });
      }

      // Distribui os times calculados nos seus grupos
      this.tabelaBase.forEach(timeStats => {
        // Busca a qual grupo esse time pertence
        const grupoDoTime = this.campeonato.grupos.find(g => g.times.some(t => t.id === timeStats.id));

        if (grupoDoTime) {
          if (!gruposObj[grupoDoTime.nome]) gruposObj[grupoDoTime.nome] = [];
          gruposObj[grupoDoTime.nome].push(timeStats);
        }
      });

      // Ordena cada grupo
      for (const nome in gruposObj) {
  gruposObj[nome] = gruposObj[nome].sort((a, b) => {

    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
    if (a.golsContra !== b.golsContra) return a.golsContra - b.golsContra;

    // 🔥 confronto direto APENAS DO GRUPO
    const cd = this.resultadoConfrontoDiretoGrupo(a.id, b.id, nome);
    if (cd !== 0) return cd;

    return a.nome.localeCompare(b.nome);
  });
}


      return gruposObj;
    },

    // --- Lógica para Mata-Mata ---
    dadosMataMata() {
        // PERMITIR SE FOR MATA-MATA OU SE FOR GRUPOS COM JOGOS DE FASE
        if (!this.campeonato) return {};
        if (this.campeonato.tipo !== 'MATA_MATA' && !this.temMataMata) return {};
        
        const fases = {};
        const jogos = this.campeonato.jogos || [];
        
        jogos.forEach(jogo => {
            // Importante: Ignorar jogos de grupo (que não têm 'fase')
            if (!jogo.fase) return; 

            const nomeFase = jogo.fase;
            if (!fases[nomeFase]) fases[nomeFase] = {}; 

            const confId = jogo.confrontoId;
            if (!fases[nomeFase][confId]) {
                fases[nomeFase][confId] = {
                    id: confId,
                    timeA: jogo.timeA,
                    timeB: jogo.timeB,
                    placarA_Ida: '-', placarB_Ida: '-',
                    placarA_Volta: '-', placarB_Volta: '-',
                    totalA: 0, totalB: 0,
                    temVolta: false,
                    finalizado: false,
                    vencedor: null
                };
            }
            
            const confronto = fases[nomeFase][confId];

            if (jogo.turno === 1) {
                confronto.placarA_Ida = jogo.golsA ?? '-';
                confronto.placarB_Ida = jogo.golsB ?? '-';
                if (jogo.finalizado) {
                    confronto.totalA += jogo.golsA;
                    confronto.totalB += jogo.golsB;
                }
            } else {
                confronto.temVolta = true;
                confronto.placarA_Volta = jogo.golsB ?? '-'; 
                confronto.placarB_Volta = jogo.golsA ?? '-'; 
                
                if (jogo.finalizado) {
                    confronto.totalA += jogo.golsB;
                    confronto.totalB += jogo.golsA;
                }
            }
            
            const idaFinalizada = jogos.find(j => j.confrontoId === confId && j.turno === 1)?.finalizado;
            const voltaFinalizada = jogos.find(j => j.confrontoId === confId && j.turno === 2)?.finalizado;
            
            confronto.finalizado = confronto.temVolta ? (idaFinalizada && voltaFinalizada) : idaFinalizada;

            if (confronto.finalizado) {
                if (confronto.totalA > confronto.totalB) confronto.vencedor = confronto.timeA.id;
                else if (confronto.totalB > confronto.totalA) confronto.vencedor = confronto.timeB.id;
                else confronto.vencedor = 'PENALTIS';
            }
        });

        const resultadoFinal = {};
        for (const f in fases) {
            resultadoFinal[f] = Object.values(fases[f]).sort((a,b) => a.id - b.id);
        }

        return resultadoFinal;
    },

    temMataMata() {
      if (!this.campeonato || !this.campeonato.jogos) return false;
      // Se existe algum jogo com a propriedade 'fase' definida, o mata-mata começou
      return this.campeonato.jogos.some(j => j.fase);
    },
  },
  async mounted() {
    await this.carregarEClassificar();
  },
  methods: {

    resultadoConfrontoDireto(idA, idB) {
  const jogos = this.jogos || [];

  let pontosA = 0;
  let pontosB = 0;
  let saldoA = 0;
  let saldoB = 0;

  jogos.forEach(j => {
    const ehA =
      j.timeA.id === idA && j.timeB.id === idB;
    const ehB =
      j.timeA.id === idB && j.timeB.id === idA;

    if (!ehA && !ehB) return;
    if (!j.finalizado) return;

    let golsA, golsB;

    if (ehA) {
      golsA = j.golsA;
      golsB = j.golsB;
    } else {
      golsA = j.golsB;
      golsB = j.golsA;
    }

    saldoA += golsA - golsB;
    saldoB += golsB - golsA;

    if (golsA > golsB) pontosA += 3;
    else if (golsB > golsA) pontosB += 3;
    else {
      pontosA += 1;
      pontosB += 1;
    }
  });

  if (pontosA !== pontosB) return pontosB - pontosA;
  if (saldoA !== saldoB) return saldoB - saldoA;

  return 0; // empate total → segue para nome
},

resultadoConfrontoDiretoGrupo(idA, idB, nomeGrupo) {
  if (!this.campeonato || !this.campeonato.jogos) return 0;

  // pega apenas jogos SEM fase (ou seja: jogos de grupo)
  const jogosDoGrupo = this.campeonato.jogos.filter(j => {
    if (j.fase) return false;
    const grupo = this.campeonato.grupos.find(g =>
      g.nome === nomeGrupo &&
      g.times.some(t => t.id === j.timeA.id) &&
      g.times.some(t => t.id === j.timeB.id)
    );
    return !!grupo;
  });

  let pontosA = 0;
  let pontosB = 0;
  let saldoA = 0;
  let saldoB = 0;

  jogosDoGrupo.forEach(j => {
    if (!j.finalizado) return;

    let golsA, golsB;

    if (j.timeA.id === idA && j.timeB.id === idB) {
      golsA = j.golsA;
      golsB = j.golsB;
    } else if (j.timeA.id === idB && j.timeB.id === idA) {
      golsA = j.golsB;
      golsB = j.golsA;
    } else return;

    saldoA += golsA - golsB;
    saldoB += golsB - golsA;

    if (golsA > golsB) pontosA += 3;
    else if (golsB > golsA) pontosB += 3;
    else {
      pontosA += 1;
      pontosB += 1;
    }
  });

  if (pontosA !== pontosB) return pontosB - pontosA;
  if (saldoA !== saldoB) return saldoB - saldoA;

  return 0;
},


    formatarTipo(tipo) {
      if (tipo === 'PONTOS_CORRIDOS') return 'Pontos Corridos';
      if (tipo === 'MATA_MATA') return 'Mata-Mata';
      if (tipo === 'GRUPOS') return 'Fase de Grupos';
      return tipo;
    },

    async carregarEClassificar() {
      this.carregando = true;
      try {
        const camp = await DbService.getCampeonatoById(this.id);
        if (camp) {
          this.campeonato = camp;
          this.calcularStatsBase(camp);
        }
      } catch (error) {
        console.error("Erro ao calcular classificação:", error);
      } finally {
        this.carregando = false;
      }
    },

    // Calcula estatísticas básicas (P, V, E, D, GP, GC) para TODOS os times
    calcularStatsBase(camp) {
      const mapaStats = {};
      
      // Inicializa para todos os times com 0
      camp.timesParticipantes.forEach(time => {
  mapaStats[time.id] = {
    id: time.id,
    nome: time.nome,
    escudo: time.escudo,
    tecnico: time.tecnico || null, // 👈 AQUI É O PONTO
    pais: time.pais || null,
    pontos: 0,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    golsPro: 0,
    golsContra: 0,
    saldoGols: 0,
    aproveitamento: '0.0',
    aproveitamentoNum: 0
  };
});


      if (camp.jogos) {
          camp.jogos.forEach(jogo => {
            if (!jogo.finalizado) return;
            
            // Se for jogo de mata-mata (tem propriedade 'fase'), IGNORAMOS para a tabela de grupos
            if (jogo.fase) return; 

            const timeA = mapaStats[jogo.timeA.id];
            const timeB = mapaStats[jogo.timeB.id];
            
            if (!timeA || !timeB) return;

            // Incrementa stats
            timeA.jogos++; timeB.jogos++;
            timeA.golsPro += (jogo.golsA || 0); 
            timeA.golsContra += (jogo.golsB || 0);
            timeB.golsPro += (jogo.golsB || 0); 
            timeB.golsContra += (jogo.golsA || 0);

            if (jogo.golsA > jogo.golsB) {
              timeA.vitorias++; timeA.pontos += 3; timeB.derrotas++;
            } else if (jogo.golsB > jogo.golsA) {
              timeB.vitorias++; timeB.pontos += 3; timeA.derrotas++;
            } else {
              timeA.empates++; timeA.pontos += 1; timeB.empates++; timeB.pontos += 1;
            }
          });
      }

      this.tabelaBase = Object.values(mapaStats).map(t => {
        t.saldoGols = t.golsPro - t.golsContra;
        if (t.jogos > 0) {
          const aproveitamento = (t.pontos / (t.jogos * 3)) * 100;
          t.aproveitamentoNum = aproveitamento;
          t.aproveitamento = aproveitamento.toFixed(1);
        } else {
            t.aproveitamentoNum = 0;
            t.aproveitamento = '0.0';
        }
        return t;
      });
    },


    ordenarTimes(lista) {
  return lista.sort((a, b) => {

    // 1️⃣ Pontos
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;

    // 2️⃣ Vitórias
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;

    // 3️⃣ Saldo de gols
    if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;

    // 4️⃣ 🔥 GOLS FEITOS (GF) — FALTAVA ISSO
    if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;

    // 5️⃣ Menos gols sofridos
    if (a.golsContra !== b.golsContra) return a.golsContra - b.golsContra;

    // 🔥 CONFRONTO DIRETO (último critério real)
     const confronto = this.resultadoConfrontoDireto(a.id, b.id);

    if (confronto !== 0) return confronto;

    // 6️⃣ Fallback
    return a.nome.localeCompare(b.nome);
  });
},


    alterarOrdenacao(chave) {
      if (this.ordenacao.coluna === chave) {
        this.ordenacao.direcao = this.ordenacao.direcao === 'desc' ? 'asc' : 'desc';
      } else {
        this.ordenacao.coluna = chave;
        this.ordenacao.direcao = 'desc';
      }
    }
  }
}
</script>

<style scoped>
.cursor-pointer:hover {
  background-color: #444 !important;
  color: #fff;
}

.fase-coluna {
  min-width: 300px;
  max-width: 350px;
}

/* Scroll horizontal para o mata-mata */
.d-flex.overflow-auto::-webkit-scrollbar {
  height: 8px;
}

.d-flex.overflow-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>