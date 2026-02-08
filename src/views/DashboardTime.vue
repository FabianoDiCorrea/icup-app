<template>
  <div class="container mt-4 mb-5" v-if="time">
    
    <!-- HEADER DO TIME -->
    <div class="card bg-dark border-secondary shadow-sm mb-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="row m-0 align-items-center">
          <!-- Mobile: Center Text, Stack Image -->
          <div class="col-md-3 bg-secondary bg-opacity-10 p-4 text-center border-bottom border-md-end border-end-0 border-secondary">
             <img :src="time.escudo" style="width: 100px; height: 100px; object-fit: contain;" class="mb-3" />
             <h3 class="text-white fw-bold mb-1 fs-4">{{ time.nome }}</h3>
             <span class="badge bg-primary text-uppercase">{{ time.pais || 'Sem País' }}</span>
          </div>
          <div class="col-md-9 p-3 p-md-4">
             <div class="row text-center g-2 g-md-3">
                <div class="col-4">
                   <div class="text-muted small text-uppercase mb-1" style="font-size: 0.7rem;">Títulos</div>
                   <div class="h3 h2-md fw-bold text-warning mb-0">{{ totalTitulos }}</div>
                </div>
                <div class="col-4 border-start border-end border-secondary">
                   <div class="text-muted small text-uppercase mb-1" style="font-size: 0.7rem;">Gols Hist.</div>
                   <div class="h3 h2-md fw-bold text-white mb-0">{{ totalGols }}</div>
                </div>
                <div class="col-4">
                   <div class="text-muted small text-uppercase mb-1" style="font-size: 0.7rem;">Aprov.</div>
                   <div class="h3 h2-md fw-bold text-success mb-0">{{ aproveitamento }}%</div>
                </div>
             </div>
             <div class="mt-4 pt-3 border-top border-secondary">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                   <div class="text-center text-md-start mb-2 mb-md-0">
                      <span class="text-muted small">🏟️ <strong>{{ time.estadio || '-' }}</strong></span>
                   </div>
                   <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
                     <BButton variant="outline-info" size="sm" class="w-100 w-sm-auto" @click="$router.push(`/historico-confrontos/${time.id}`)">
                        📜 Histórico de Confrontos
                     </BButton>
                     <BButton variant="outline-light" size="sm" class="w-100 w-sm-auto" @click="$router.back()">Voltar</BButton>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TROFÉUS -->
    <h5 class="text-primary border-bottom border-secondary pb-2 mb-3 mt-4">🏆 SALA DE TROFÉUS</h5>
    <div v-if="titulosAgrupados.length === 0" class="text-muted small mb-4 italic">
      Ainda não conquistou títulos registrados.
    </div>
    <div class="row g-2 mb-4">
       <div v-for="(grupo, idx) in titulosAgrupados" :key="idx" class="col-12 col-md-6 col-lg-4">
          <div class="bg-dark border border-warning rounded p-2 d-flex align-items-start gap-2 position-relative h-100" :title="grupo.nome">
             <span v-if="grupo.qtd > 1" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                {{ grupo.qtd }}x
             </span>
             <img :src="grupo.urlTrofeu || require('@/assets/icup-logo.png')" style="width: 40px; height: 40px; object-fit: contain;" v-if="grupo.urlTrofeu" />
             <div class="d-flex flex-column w-100">
                <span class="text-warning fw-bold lh-1 mb-1">{{ grupo.nome }}</span>
                <div v-for="(c, cIdx) in grupo.conquistas" :key="cIdx" class="d-flex justify-content-between small text-white-50 border-bottom border-secondary border-opacity-25 pb-1 mb-1">
                   <span :title="formatarData(c.data)">{{ formatarDataCurta(c.data) }}</span>
                   <span class="text-end italic">
                      <span class="text-secondary me-1" style="font-size: 0.7em;">Técnico:</span>
                      {{ resolverNomeTecnico(c.tecnico) }}
                   </span>
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- DESEMPENHO POR COMPETIÇÃO -->
    <h5 class="text-primary border-bottom border-secondary pb-2 mb-3 mt-4">📊 DESEMPENHO POR COMPETIÇÃO</h5>
    <div v-if="estatisticasPorCompeticao.length === 0" class="text-muted small mb-4">
        Sem histórico suficiente.
    </div>
    <div class="row g-3 mb-4">
        <div v-for="comp in estatisticasPorCompeticao" :key="comp.nome" class="col-md-6 col-xl-4">
            <div class="card bg-dark border-secondary h-100">
                <div class="card-header border-secondary bg-secondary bg-opacity-10 text-white fw-bold">
                    {{ comp.nome }}
                </div>
                <ul class="list-group list-group-flush">
                    <li v-for="(p, i) in comp.participacoes" :key="p.id" class="list-group-item bg-dark border-secondary text-white-50 d-flex justify-content-between align-items-center small">
                        <div>
                            <div>{{ i + 1 }}ª Edição <small class="text-muted ms-1" style="font-size: 0.7em;">({{ new Date(p.data).getFullYear() }})</small></div>
                            <small class="text-info fst-italic" style="font-size: 0.7em;" v-if="p.tecnico">Téc. {{ p.tecnico }}</small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                             <span :class="{'text-warning fw-bold': p.posicao === 1}">{{ p.posicao }}º</span>
                             <span v-if="p.posicao === 1">🏆</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <!-- ESTATÍSTICAS E GRÁFICOS (Placeholder para Fase 4) -->
    <div class="row">
       <div class="col-12 col-lg-8">
            
            <!-- FILTRO DE COMPETIÇÃO -->
            <div class="d-flex justify-content-end mb-2">
                <select class="form-select w-auto bg-dark text-light border-secondary" 
                        v-model="competicaoFiltro" @change="prepararGrafico">
                    <option value="TODAS">Todas as Competições</option>
                    <option v-for="c in estatisticasPorCompeticao" :key="c.nome" :value="c.nome">{{ c.nome }}</option>
                </select>
            </div>

            <div class="card bg-dark border-secondary mb-3">
              <div class="card-header border-secondary d-flex justify-content-between align-items-center">
                 <h6 class="mb-0 text-white"><i class="bi bi-graph-up me-2"></i>Evolução de Aproveitamento</h6>
              </div>
              <div class="card-body">
                <div v-if="chartSeries[0].data.length > 0">
                   <apexchart type="line" height="100%" :options="chartOptions" :series="chartSeries"></apexchart>
                </div>
                <div v-else class="text-center py-5 text-muted small">
                   Faltam dados históricos para gerar o gráfico.
                </div>
             </div>
          </div>

          <div class="card bg-dark border-secondary mb-3">
             <div class="card-header border-secondary bg-secondary bg-opacity-10 text-white">Evolução de Colocação</div>
             <div class="card-body">
                <div v-if="chartSeriesColocacao.length > 0">
                   <apexchart type="line" height="100%" :options="chartOptionsColocacao" :series="chartSeriesColocacao"></apexchart>
                </div>
                <div v-else class="text-center py-5 text-muted small">
                   Dados insuficientes para gerar gráfico.
                </div>
             </div>
          </div>

            <!-- HISTÓRICO DE TORNEIOS -->
            <h5 class="text-primary border-bottom border-secondary pb-2 mb-3 mt-4">📋 HISTÓRICO DE COMPETIÇÕES</h5>
            <div v-if="participacoes.length === 0" class="text-muted small mb-4 italic text-center py-4 bg-dark rounded border border-secondary border-dashed">
            Ainda não participou de competições encerradas.
            </div>
            <div v-else class="d-flex flex-column gap-2 mb-4">
                <div v-for="p in participacoes" :key="p.id" class="bg-dark border border-secondary rounded overflow-hidden">
                    <!-- HEADER DO ITEM (COMPACTO) -->
                    <div class="d-flex align-items-center justify-content-between p-2 cursor-pointer hover-bg-light" @click="alternarJogos(p.id)">
                        <!-- Lado Esquerdo: Logo e Info Básica -->
                        <div class="d-flex align-items-center gap-3 flex-grow-1" style="min-width: 0;">
                            <div class="bg-white rounded p-1 flex-shrink-0" v-if="p.urlTrofeu" style="width: 36px; height: 36px;">
                                <img :src="p.urlTrofeu" style="width: 100%; height: 100%; object-fit: contain;" />
                            </div>
                            <div class="d-flex flex-column lh-1 overflow-hidden">
                                <span class="text-white fw-bold text-truncate">{{ p.nomeCamp }}</span>
                                <span class="text-muted small" style="font-size: 0.75rem;">{{ new Date(p.data).getFullYear() }}</span>
                            </div>
                        </div>

                        <!-- Lado Direito: Posição e Stats -->
                        <div class="d-flex align-items-center gap-3 ms-2">
                            <!-- Posição -->
                            <div class="text-end d-none d-sm-block">
                                <div class="fw-bold" :class="{'text-warning': p.posicao === 1, 'text-light': p.posicao === 2}">
                                    {{ p.posicao }}º <span v-if="p.posicao === 1">🏆</span>
                                </div>
                            </div>

                            <!-- Resumo de Stats (Mini Badges) -->
                            <div class="d-flex gap-1">
                                <span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25" title="Vitórias">{{ p.vitorias }}V</span>
                                <span class="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25" title="Empates">{{ p.empates }}E</span>
                                <span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25" title="Derrotas">{{ p.derrotas }}D</span>
                                <span class="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 d-none d-md-inline-block" title="Gols Pró">{{ p.golsPro }}GP</span>
                            </div>

                            <!-- Ícone Expandir -->
                            <span class="text-muted transition-transform" :class="{'rotate-180': p.expandidio}">
                                {{ p.aberto ? '▲' : '▼' }}
                            </span>
                        </div>
                    </div>

                    <!-- JOGOS DESTE TORNEIO (EXPANSÍVEL) -->
                    <div v-if="p.aberto" class="border-top border-secondary bg-black bg-opacity-25">
                        <div v-for="(j, idx) in p.confrontos" :key="idx" 
                                class="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-10 py-2 px-3 small">
                            
                            <div class="text-muted text-center flex-shrink-0 me-2" style="width: 30px; font-size: 0.7rem;">
                                {{ j.fase === 'Fase de Grupos' ? 'FG' : (j.fase || `R${j.rodada}`) }}
                            </div>
                            
                            <!-- Jogo -->
                            <div class="d-flex align-items-center justify-content-center flex-grow-1">
                                <!-- TIME A -->
                                <div class="d-flex align-items-center justify-content-end gap-2 text-end" style="width: 45%;">
                                    <div class="d-flex flex-column lh-1 overflow-hidden align-items-end">
                                        <span class="text-truncate d-none d-sm-block bg-transparent" :class="{'fw-bold text-white': j.timeA.id === time.id}">
                                            <span v-if="p.adicionarNacionalidade && j.timeA.pais" class="text-success me-1 small" style="font-size: 0.7em;">{{ j.timeA.pais }}</span>
                                            {{ j.timeA.nome }}
                                        </span>
                                        <small class="text-muted" style="font-size: 0.65em;" v-if="j.timeA.tecnico">{{ resolverNomeTecnico(j.timeA.tecnico) }}</small>
                                    </div>
                                    <img :src="j.timeA.escudo" style="width: 18px; height: 18px;" />
                                </div>
                                
                                <span class="mx-2 badge bg-dark border border-secondary">{{ j.golsA }} x {{ j.golsB }}</span>

                                <!-- TIME B -->
                                <div class="d-flex align-items-center justify-content-start gap-2 text-start" style="width: 45%;">
                                    <img :src="j.timeB.escudo" style="width: 18px; height: 18px;" />
                                    <div class="d-flex flex-column lh-1 overflow-hidden align-items-start">
                                        <span class="text-truncate d-none d-sm-block bg-transparent" :class="{'fw-bold text-white': j.timeB.id === time.id}">
                                            {{ j.timeB.nome }}
                                            <span v-if="p.adicionarNacionalidade && j.timeB.pais" class="text-success ms-1 small" style="font-size: 0.7em;">{{ j.timeB.pais }}</span>
                                        </span>
                                        <small class="text-muted" style="font-size: 0.65em;" v-if="j.timeB.tecnico">{{ resolverNomeTecnico(j.timeB.tecnico) }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
       </div>
       
       <div class="col-12 col-lg-4">
          <div class="card bg-dark border-secondary mb-3">
             <div class="card-header border-secondary bg-secondary bg-opacity-10 text-white d-flex justify-content-between align-items-center">
                <span class="fw-bold">Resumo do Clube</span>
             </div>
             <div class="card-body p-0">
                <!-- Stats Grid -->
                <div class="row text-center py-3 m-0 border-bottom border-secondary">
                   <div class="col-3 border-end border-secondary">
                      <h4 class="m-0 text-white fw-bold">{{ statsGerais.jogos }}</h4>
                      <small class="text-muted text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">Jogos</small>
                   </div>
                   <div class="col-3 border-end border-secondary">
                      <h4 class="m-0 text-success fw-bold">{{ statsGerais.vitorias }}</h4>
                      <small class="text-muted text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">Vitórias</small>
                   </div>
                   <div class="col-3 border-end border-secondary">
                      <h4 class="m-0 text-warning fw-bold">{{ statsGerais.empates }}</h4>
                      <small class="text-muted text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">Empates</small>
                   </div>
                   <div class="col-3">
                      <h4 class="m-0 text-danger fw-bold">{{ statsGerais.derrotas }}</h4>
                      <small class="text-muted text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;">Derrotas</small>
                   </div>
                </div>

                <!-- Section Title -->
                <div class="bg-black bg-opacity-25 px-3 py-1 border-bottom border-secondary">
                    <small class="text-muted fw-bold text-uppercase" style="font-size: 0.7rem;">Top Artilheiros</small>
                </div>

                <!-- Scorers Table -->
                <table class="table table-dark table-sm mb-0">
                   <tbody>
                      <tr v-for="(art, idx) in topArtilheiros" :key="idx">
                         <td class="ps-3 border-secondary text-truncate" style="max-width: 150px;">
                             <span :class="{'text-warning': idx === 0}">{{ idx + 1 }}.</span> {{ art.nome }}
                         </td>
                         <td class="text-center fw-bold text-success border-secondary">{{ art.gols }}</td>
                      </tr>
                      <tr v-if="topArtilheiros.length === 0">
                         <td colspan="2" class="text-center py-3 text-muted">Sem dados.</td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>



  </div>
  <div v-else-if="carregando" class="text-center py-5">
     <BSpinner variant="primary" />
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BButton, BSpinner } from 'bootstrap-vue-next';
import VueApexCharts from "vue3-apexcharts";

export default {
  name: 'DashboardTime',
  components: { 
    BButton, 
    BSpinner,
    apexchart: VueApexCharts,
  },
  props: ['id'],
  data() {
    return {
      time: null,
      historico: [],
      carregando: true,
      chartOptions: {
        chart: {
          type: 'area',
          height: 350,
          toolbar: { show: false },
          background: 'transparent'
        },
        theme: { mode: 'dark' },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#10b981'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
          }
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: [],
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { colors: '#aaa' } },
          tooltip: { enabled: false }
        },
        yaxis: {
          labels: {
             formatter: (val) => val.toFixed(0) + '%',
             style: { colors: '#aaa' }
          }
        },
        grid: {
          borderColor: '#374151',
          strokeDashArray: 4,
        },
        tooltip: {
          y: {
            formatter: (val) => val.toFixed(1) + '%'
          },
          theme: 'dark'
        }
      },
      chartSeries: [{
        name: 'Aproveitamento',
        data: []
      }],
      // Gráfico de Colocação
      chartSeriesColocacao: [],
      chartOptionsColocacao: {
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'monotoneCubic', width: 4 }, // Linhas mais grossas
        markers: { size: 6, strokeWidth: 0, hover: { size: 8 } }, // Bolinhas maiores para facilitar o toque
        colors: ['#0d6efd', '#ffc107', '#dc3545', '#198754', '#6610f2'], // Cores variadas
        dataLabels: { enabled: true, style: { fontSize: '10px' }, background: { enabled: true, foreColor: '#000' } },
        xaxis: { categories: [], labels: { style: { colors: '#aaa' } }, tooltip: { enabled: false } },
        yaxis: { 
            reversed: true, // INVERTIDO: 1º lugar no topo
            min: 1, 
            forceNiceScale: true,
            labels: { style: { colors: '#aaa' }, formatter: (val) => Math.floor(val) + 'º' } 
        },
        theme: { mode: 'dark' },
        grid: { borderColor: '#444' },
        tooltip: { theme: 'dark' },
        legend: { position: 'bottom' }
      },
      expandidio: {}, // Controle de UI para expandir jogos
      mapaTecnicos: {}, // Cache de técnicos
      competicaoFiltro: 'TODAS' // Filtro de competição para os gráficos
    };
  },
  computed: {
    titulosAgrupados() {
      if (!this.historico) return [];
      const grupos = {};
      this.historico.forEach(h => {
        if (h.campeao?.id === this.time?.id) {
           const nomeNorm = h.nome.trim(); 
           if (!grupos[nomeNorm]) {
             grupos[nomeNorm] = { 
               nome: nomeNorm, 
               qtd: 0, 
               conquistas: [],
               urlTrofeu: h.urlTrofeu 
             };
           }
           grupos[nomeNorm].qtd++;
           grupos[nomeNorm].conquistas.push({
             ano: new Date(h.dataFim).getFullYear(),
             tecnico: h.campeao.tecnico,
             data: h.dataFim
           });
        }
      });
      return Object.values(grupos).sort((a,b) => b.qtd - a.qtd);
    },
    totalTitulos() {
      if (!this.historico) return 0;
      return this.historico.filter(h => h.campeao?.id === this.time?.id).length;
    },
    totalGols() {
      if (!this.historico) return 0;
      let total = 0;
      this.historico.forEach(h => {
        (h.artilheiros || []).forEach(art => {
          if (art.timeId === this.time?.id) total += art.gols;
        });
      });
      return total;
    },
    statsGerais() {
      const stats = { jogos: 0, vitorias: 0, empates: 0, derrotas: 0 };
      if (!this.historico) return stats;
      
      this.historico.forEach(h => {
         const snapshotTime = h.tabelaResumo?.find(t => t.id === this.time?.id);
         if (snapshotTime) {
            stats.jogos += (snapshotTime.jogos || 0);
            stats.vitorias += (snapshotTime.vitorias || 0);
            stats.empates += (snapshotTime.empates || 0);
            stats.derrotas += (snapshotTime.derrotas || 0);
         }
      });
      return stats;
    },
    aproveitamento() {
       const s = this.statsGerais;
       if (s.jogos === 0) return 0;
       const pontos = (s.vitorias * 3) + s.empates;
       const maxPontos = s.jogos * 3;
       return ((pontos / maxPontos) * 100).toFixed(1);
    },
    estatisticasPorCompeticao() {
        if (!this.participacoes) return [];
        const comps = {};
        this.participacoes.forEach(p => {
            const nome = p.nomeCamp; 
            if (!comps[nome]) {
                comps[nome] = { nome, participacoes: [] };
            }
            comps[nome].participacoes.push(p);
        });
        return Object.values(comps).map(c => {
           if (c.participacoes && c.participacoes.length) {
               c.participacoes.sort((a,b) => new Date(a.data) - new Date(b.data));
           }
           return c;
        });
    },
    topArtilheiros() {
      if (!this.historico) return [];
      const mapa = {};
      this.historico.forEach(h => {
        (h.artilheiros || []).forEach(art => {
          if (art.timeId === this.time?.id) {
            if (!mapa[art.nome]) mapa[art.nome] = 0;
            mapa[art.nome] += art.gols;
          }
        });
      });
      return Object.entries(mapa)
        .map(([nome, gols]) => ({ nome, gols }))
        .sort((a,b) => b.gols - a.gols)
        .slice(0, 5);
    },
    participacoes() {
      if (!this.time || !this.historico) return [];
      
      return this.historico
        .map(h => {
          // Proteção contra tabelaResumo nula (campeonatos antigos)
          const tabela = h.tabelaResumo || [];
          const stats = tabela.find(t => t.id === this.time.id);
          if (!stats) return null;

          const posicao = tabela.findIndex(t => t.id === this.time.id) + 1;
          
          const confrontos = (h.jogos || []).filter(j => 
            j.finalizado && (j.timeA?.id == this.time.id || j.timeB?.id == this.time.id)
          );
          
           // Agregar TODOS os técnicos que comandaram o time na campanha
           const tecnicosSet = new Set();
           
           // 1. Tenta pegar do resumo (se houver)
           if (stats.tecnico) {
               const nome = this.resolverNomeTecnico(stats.tecnico);
               if (nome) tecnicosSet.add(nome);
           }

           // 2. Varre os jogos para pegar técnicos que comandaram em partidas específicas
           confrontos.forEach(jogo => {
               let tec = null;
               if (jogo.timeA.id === this.time.id) {
                   tec = jogo.timeA.tecnico;
               } else if (jogo.timeB.id === this.time.id) {
                   tec = jogo.timeB.tecnico;
               }

               if (tec) {
                   const nome = this.resolverNomeTecnico(tec);
                   if (nome) tecnicosSet.add(nome);
               }
           });

           // Converte o Set para uma string "Nome1 / Nome2"
           const tecnicoDisplay = Array.from(tecnicosSet).join(' / ');

           return {
            id: h.idCampeonato,
            nomeCamp: h.nome,
            data: h.dataFim,
            urlTrofeu: h.urlTrofeu,
            posicao: posicao,
            vitorias: stats.vitorias || 0,
            empates: stats.empates || 0,
            derrotas: stats.derrotas || 0,
            golsPro: stats.golsPro || 0,
            confrontos: confrontos,
            aberto: !!this.expandidio[h.idCampeonato],
            adicionarNacionalidade: h.adicionarNacionalidade, // ✅ Propaga a configuração
            tecnico: tecnicoDisplay // 🆕 Técnico (String formatada)
          };
        })
        .filter(Boolean)
        .sort((a,b) => new Date(b.data) - new Date(a.data));
    }
  },
  async mounted() {
    this.carregando = true;
    try {
      this.time = await DbService.getTimeById(this.id);
      this.historico = await DbService.getHistorico();
      const todosTecnicos = await DbService.getTecnicos();
      
      // Cria mapa Apelido -> Nome
      this.mapaTecnicos = todosTecnicos.reduce((acc, t) => {
         acc[t.apelido] = t.nome;
         return acc;
      }, {});

      this.prepararGrafico();
    } catch (e) {
      console.error(e);
    } finally {
      this.carregando = false;
    }
  },
  methods: {
    // 🔹 Helper para corrigir nomes antigos (Apelido -> Nome Completo)
    resolverNomeTecnico(nomeOuApelido) {
       if (!nomeOuApelido) return 'Téc. Desconhecido';
       return this.mapaTecnicos[nomeOuApelido] || nomeOuApelido;
    },
    formatarDataCurta(iso) {
      if (!iso) return '-';
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    formatarData(iso) {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('pt-BR');
    },
    alternarJogos(idCamp) {
       this.expandidio[idCamp] = !this.expandidio[idCamp];
    },
    prepararGrafico() {
       // 0. Filtrar competições baseadas na seleção
       let listaCompeticoes = this.estatisticasPorCompeticao;
       
       if (this.competicaoFiltro !== 'TODAS') {
           listaCompeticoes = listaCompeticoes.filter(c => c.nome === this.competicaoFiltro);
       }

       // 1. Descobrir o máximo de participações em um único torneio para definir o eixo X (Compartilhado)
       let maxEdicoes = 0;
       listaCompeticoes.forEach(comp => {
           if (comp.participacoes.length > maxEdicoes) {
               maxEdicoes = comp.participacoes.length;
           }
       });

       // Criar categorias do Eixo X: "1ª Edição", "2ª Edição", etc.
       const categoriasX = Array.from({ length: maxEdicoes }, (_, i) => `${i + 1}ª Edição`);

       // 1. Aproveitamento por Competição (Refatorado)
       const neonColors = ['#00ff00', '#00d2ff', '#ff00ff', '#ffff00', '#ff4500']; // Verde Neon, Azul Neon, Magenta, Amarelo, Laranja
       
       this.chartOptions = {
          ...this.chartOptions,
          chart: { ...this.chartOptions.chart, type: 'line', background: 'transparent' }, 
          colors: neonColors,
          stroke: { curve: 'smooth', width: 4 }, // Linha mais grossa e visível
          markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
          fill: { type: 'solid', opacity: 1 }, // Garante que a linha seja sólida e visível
          xaxis: {
             ...this.chartOptions.xaxis,
             categories: categoriasX
          }
       };

       this.chartSeries = listaCompeticoes.map(comp => {
           const partsOrdenadas = [...comp.participacoes].sort((a, b) => new Date(a.data) - new Date(b.data));
           
           const data = partsOrdenadas.map((p, index) => {
               const totalJogos = p.vitorias + p.empates + p.derrotas;
               let aproveitamento = 0;
               if (totalJogos > 0) {
                   const pontos = (p.vitorias * 3) + p.empates;
                   aproveitamento = (pontos / (totalJogos * 3)) * 100;
               }

               return {
                   x: `${index + 1}ª Edição`,
                   y: parseFloat(aproveitamento.toFixed(1)),
                   tecnico: p.tecnico
               };
           });

           return {
               name: comp.nome,
               data: data
           };
       });

       // 2. Evolução de Colocação (Por Edição Sequencial)
       if (!this.participacoes || this.participacoes.length === 0) {
           this.chartSeriesColocacao = [];
           return;
       }

       // (Reutiliza maxEdicoes e categoriasX calculados acima)
       this.chartOptionsColocacao = {
           ...this.chartOptionsColocacao,
           colors: neonColors, // Aplica as mesmas cores neon
           stroke: { curve: 'monotoneCubic', width: 4 }, // Linha grossa
           markers: { size: 5 },
           xaxis: {
               ...this.chartOptionsColocacao.xaxis,
               categories: categoriasX
           },
           tooltip: {
               y: {
                   formatter: (val, opts) => {
                       const seriesIndex = opts.seriesIndex;
                       const dataPointIndex = opts.dataPointIndex;
                       const w = opts.w;
                       // Recupera o dado original para pegar o técnico
                       const seriesData = w.config.series[seriesIndex].data;
                       const dataPoint = seriesData[dataPointIndex];
                       
                       // Se dataPoint for objeto (novo formato), acessa diretamento. Se for array/número, trata.
                       const tecnico = dataPoint && dataPoint.tecnico ? dataPoint.tecnico : null;
                       // O técnico já vem formatado como string agora (Ex: "Fabiano / Marcos")
                       const nomeTecnico = tecnico || 'Sem Técnico';
                       
                       return `${val}º lugar (${nomeTecnico})`;
                   }
               }
           }
       };

       const series = listaCompeticoes.map(comp => {
           // Ordena cronologicamente
           const partsOrdenadas = [...comp.participacoes].sort((a, b) => new Date(a.data) - new Date(b.data));
           
           // Mapeia para objetos { x: '1ª Edição', y: posicao, tecnico: ... }
           const data = partsOrdenadas.map((p, index) => {
               return {
                   x: `${index + 1}ª Edição`,
                   y: p.posicao,
                   tecnico: p.tecnico
               };
           });

           return {
               name: comp.nome,
               data: data
           };
       });

       this.chartSeriesColocacao = series;
    }
  }
};
</script>

<style scoped>
.trofeu-mini {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>
