<template>
  <div class="container mt-4 mb-5">
    
    <!-- LOADING -->
    <div v-if="carregando" class="text-center py-5">
      <div class="spinner-grow text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <!-- ERRO -->
    <div v-else-if="!time" class="text-center py-5 alert alert-danger">
       <i class="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
       Não foi possível carregar as informações do time. (ID: {{ $route.params.idTime }})
       <br>
       <button class="btn btn-outline-dark mt-3 btn-sm" @click="$router.push('/lista-clubes')">Voltar para Lista</button>
    </div>

    <!-- CONTEÚDO PRINCIPAL -->
    <div v-else class="animate__animated animate__fadeIn">
      <!-- HEADER -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3">
           <img :src="time.escudo" style="width: 60px; height: 60px; object-fit: contain;" />
           <div>
              <h2 class="text-white fw-bold mb-0">Histórico de Confrontos</h2>
              <div class="text-muted">{{ time.nome }}</div>
           </div>
        </div>
        <button class="btn btn-outline-light" @click="$router.back()">Voltar</button>
      </div>

      <!-- FILTRO DE RIVAL -->
      <div class="card bg-dark border-secondary mb-4 shadow-sm">
          <div class="card-body">
              <div class="row align-items-end g-3">
                 <div class="col-12 col-md-6">
                    <label class="form-label text-warning fw-bold small">Filtrar por Adversário:</label>
                    <select class="form-select bg-secondary text-white border-secondary" v-model="adversarioFiltro">
                       <option :value="null">Todos os Adversários</option>
                       <option v-for="adv in listaAdversarios" :key="adv.id" :value="adv.id">
                          {{ adv.nome }}
                       </option>
                    </select>
                 </div>
                 <div class="col-12 col-md-6 text-center text-md-end">
                     <div v-if="estatisticas.total > 0" class="d-flex justify-content-center justify-content-md-end gap-3 text-white bg-dark bg-opacity-50 p-2 rounded border border-secondary border-opacity-25">
                         <div class="text-center px-2">
                             <div class="h3 fw-bold text-success mb-0">{{ estatisticas.vitorias }}</div>
                             <small class="text-muted text-uppercase" style="font-size: 0.65rem;">VITÓRIAS</small>
                         </div>
                         <div class="text-center border-start border-end border-secondary px-3">
                             <div class="h3 fw-bold text-secondary mb-0">{{ estatisticas.empates }}</div>
                             <small class="text-muted text-uppercase" style="font-size: 0.65rem;">EMPATES</small>
                         </div>
                         <div class="text-center px-2">
                             <div class="h3 fw-bold text-danger mb-0">{{ estatisticas.derrotas }}</div>
                             <small class="text-muted text-uppercase" style="font-size: 0.65rem;">DERROTAS</small>
                         </div>
                     </div>
                 </div>
              </div>
          </div>
      </div>

      <!-- LISTA DE JOGOS -->
      <div v-if="jogosFiltrados.length === 0" class="text-center text-muted py-5">
         Nenhum confronto encontrado.
      </div>

      <div v-else class="d-flex flex-column gap-2">
          <div v-for="(jogo, idx) in jogosFiltrados" :key="idx" 
               class="bg-dark border border-secondary border-opacity-50 p-3 rounded d-flex flex-column flex-md-row align-items-center gap-3 justify-content-between shadow-sm position-relative overflow-hidden hover-bg-light transition-colors">
             
             <!-- DATA E CAMPEONATO (Mobile: Top) -->
             <div class="text-center text-md-start w-100 w-md-auto d-flex d-md-block justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2 pb-md-0 mb-2 mb-md-0" style="min-width: 150px;">
                <div>
                   <div class="text-warning fw-bold small">{{ jogo.data }}</div>
                   <div class="text-white fw-bold small" style="font-size: 0.8rem;">{{ jogo.campeonato }}</div>
                   <!-- NOVA LINHA: EDIÇÃO -->
                   <div class="text-muted small text-uppercase fst-italic" style="font-size: 0.65rem;">{{ jogo.edicao }}ª Edição</div>
                </div>
                <div class="badge bg-secondary text-dark ms-2" style="font-size: 0.65rem;">{{ jogo.fase }}</div>
             </div>
 
             <!-- PLACAR CENTRAL -->
             <div class="d-flex align-items-center justify-content-center gap-2 gap-md-3 flex-grow-1 w-100">
                
                <!-- TIME A -->
                <div class="d-flex flex-column align-items-center align-items-md-end text-center text-md-end flex-grow-1" style="flex-basis: 0;">
                   <div class="d-flex flex-column flex-md-row align-items-center gap-2">
                      <span class="fw-bold text-white d-none d-md-inline" :class="{'text-warning': jogo.timeA.id === time.id}">{{ jogo.timeA.nome }}</span>
                      <span class="fw-bold text-white d-md-none small text-truncate w-100" :class="{'text-warning': jogo.timeA.id === time.id}">{{ jogo.timeA.nome }}</span>
                      <img :src="jogo.timeA.escudo" style="width: 36px; height: 36px; object-fit: contain;" />
                   </div>
                   <div class="text-muted small italic me-0 me-md-1 mt-1 mt-md-0 d-none d-md-block" style="font-size: 0.65rem;">
                      {{ jogo.tecnicoA }}
                   </div>
                </div>
 
                <!-- PLACAR -->
                <div class="d-flex flex-column align-items-center mx-1">
                   <div class="badge bg-dark border border-secondary fs-5 px-3 py-2 text-nowrap shadow-sm">
                      {{ jogo.golsA }} <span class="text-secondary mx-1">x</span> {{ jogo.golsB }}
                   </div>
                   <div v-if="jogo.penaltisA !== undefined" class="small text-muted mt-1" style="font-size: 0.65rem;">
                      (Pên: {{ jogo.penaltisA }} x {{ jogo.penaltisB }})
                   </div>
                   
                   <!-- Mobile Result Badge -->
                   <span class="badge mt-2 d-md-none rounded-pill shadow-sm" :class="getResultadoClass(jogo)" style="font-size: 0.6rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
                       {{ getResultadoLabel(jogo) }}
                   </span>
                </div>
 
                <!-- TIME B -->
                <div class="d-flex flex-column align-items-center align-items-md-start text-center text-md-start flex-grow-1" style="flex-basis: 0;">
                   <div class="d-flex flex-column-reverse flex-md-row align-items-center gap-2">
                      <img :src="jogo.timeB.escudo" style="width: 36px; height: 36px; object-fit: contain;" />
                      <span class="fw-bold text-white d-none d-md-inline" :class="{'text-warning': jogo.timeB.id === time.id}">{{ jogo.timeB.nome }}</span>
                      <span class="fw-bold text-white d-md-none small text-truncate w-100" :class="{'text-warning': jogo.timeB.id === time.id}">{{ jogo.timeB.nome }}</span>
                   </div>
                   <div class="text-muted small italic ms-0 ms-md-1 mt-1 mt-md-0 d-none d-md-block" style="font-size: 0.65rem;">
                      {{ jogo.tecnicoB }}
                   </div>
                </div>
             </div>
 
             <!-- RESULTADO ETIQUETA (Desktop Only) -->
             <div class="text-center d-none d-md-block" style="min-width: 60px;">
                <span class="badge shadow-sm" :class="getResultadoClass(jogo)">{{ getResultadoLabel(jogo) }}</span>
             </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';

export default {
  name: 'HistoricoConfrontos',
  data() {
    return {
      carregando: true,
      time: null,
      historico: [],
      todosJogos: [],
      adversarioFiltro: null,
      tecnicos: [],
      mapaEdicoes: {} // Cache para edições
    };
  },
  computed: {
    listaAdversarios() {
       const adversarios = new Map();
       
       if (!this.todosJogos) return []; // PREVENIR CRASH

       this.todosJogos.forEach(j => {
          if (!j || !j.timeA || !j.timeB || !this.time) return; // PREVENIR CRASH

          const adv = j.timeA.id === this.time.id ? j.timeB : j.timeA;
          if (!adversarios.has(adv.id)) {
             adversarios.set(adv.id, adv);
          }
       });
       return Array.from(adversarios.values()).sort((a,b) => a.nome.localeCompare(b.nome));
    },
    jogosFiltrados() {
       let lista = this.todosJogos || [];
       if (this.adversarioFiltro) {
          lista = lista.filter(j => j.timeA.id == this.adversarioFiltro || j.timeB.id == this.adversarioFiltro); // ID pode ser string
       }
       return lista.sort((a,b) => new Date(b.dataIso) - new Date(a.dataIso));
    },
    estatisticas() {
       let v = 0, e = 0, d = 0;
       
       // Importante: calcular stats apenas sobre os jogos filtrados
       const listaParaStats = this.jogosFiltrados;

       if (!this.time) return { vitorias: 0, empates: 0, derrotas: 0, total: 0 }; // PREVENIR CRASH

       listaParaStats.forEach(j => {
          const meuTimeA = j.timeA.id === this.time.id;
          const golsPro = meuTimeA ? j.golsA : j.golsB;
          const golsContra = meuTimeA ? j.golsB : j.golsA;
          
          if (golsPro > golsContra) v++;
          else if (golsContra > golsPro) d++;
          else {
             if (j.penaltisA !== undefined) {
                const penPro = meuTimeA ? j.penaltisA : j.penaltisB;
                const penContra = meuTimeA ? j.penaltisB : j.penaltisA;
                if (penPro > penContra) v++;
                else d++;
             } else {
                e++;
             }
          }
       });
       return { vitorias: v, empates: e, derrotas: d, total: v+e+d };
    }
  },
  async mounted() {
    this.carregando = true;
    try {
      const idTime = this.$route.params.idTime;
      // REMOVIDO parseInt POIS O ID PODE SER STRING (ex: "1769215963600o4c9wm0nk")
      
      console.log('Carregando HistoricoConfrontos para time ID:', idTime);

      if (!idTime) throw new Error("ID do time inválido ou não fornecido");

      // O DbService já lida com IDs como string ou número (vide getTimeById)
      this.time = await DbService.getTimeById(idTime);
      
      if (!this.time) throw new Error("Time não encontrado no banco de dados.");

      this.historico = await DbService.getHistorico();
      const todosTecnicos = await DbService.getTecnicos();
      const mapaTecnicos = todosTecnicos.reduce((acc, t) => { acc[t.apelido] = t.nome; return acc; }, {});
      
      this.calcularEdicoes();
      this.processarJogos(mapaTecnicos);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
      // Se der erro, time fica null e exibe a mensagem de erro
      this.time = null; 
    } finally {
      this.carregando = false;
    }
  },
  methods: {
    calcularEdicoes() {
       if (!this.historico) return;
       const comps = {};
       this.historico.forEach(h => {
           if (!h || !h.nome) return; // PREVENIR CRASH
           const nome = h.nome.trim();
           if (!comps[nome]) comps[nome] = [];
           comps[nome].push(h);
       });

       Object.values(comps).forEach(lista => {
           // Ordena mesmo sem dataFim, usando data padrão 0
           lista.sort((a,b) => {
               const dA = a.dataFim ? new Date(a.dataFim) : 0;
               const dB = b.dataFim ? new Date(b.dataFim) : 0;
               return dA - dB;
           });
           lista.forEach((h, index) => {
               this.mapaEdicoes[h.idCampeonato] = index + 1;
           });
       });
    },

    processarJogos(mapaTecnicos) {
       const jogos = [];
       
       if (!this.historico) return;

       this.historico.forEach(h => {
          const jogosCamp = h.jogos || [];
          jogosCamp.forEach(j => {
             // Aceita apenas jogos finalizados
             if (!j.finalizado) return;
             if (!j.timeA || !j.timeB) return; // PREVENIR CRASH
             
             // Verifica se o time participou (TimeA ou TimeB)
             // Comparação robusta (string vs numero)
             if (String(j.timeA.id) === String(this.time.id) || String(j.timeB.id) === String(this.time.id)) {
                
                const tecA = mapaTecnicos[j.timeA.tecnico] || j.timeA.tecnico || '?';
                const tecB = mapaTecnicos[j.timeB.tecnico] || j.timeB.tecnico || '?';

                jogos.push({
                   data: h.dataFim ? new Date(h.dataFim).toLocaleDateString('pt-BR') : '-',
                   dataIso: h.dataFim || '', // Data do fim do campeonato é usada para ordenação macro
                   
                   campeonato: h.nome,
                   edicao: this.mapaEdicoes[h.idCampeonato] || '?',
                   fase: j.fase || `Rodada ${j.rodada}`,
                   
                   timeA: j.timeA,
                   timeB: j.timeB,
                   golsA: j.golsA,
                   golsB: j.golsB,
                   penaltisA: j.penaltisA,
                   penaltisB: j.penaltisB,
                   
                   tecnicoA: tecA,
                   tecnicoB: tecB
                });
             }
          });
       });
       this.todosJogos = jogos;
    },
    
    getResultadoClass(j) {
       if (!this.time) return ''; // PREVENIR CRASH
       const meuTimeA = String(j.timeA.id) === String(this.time.id);
       const vitoria = meuTimeA ? (j.golsA > j.golsB) : (j.golsB > j.golsA);
       const empate = j.golsA === j.golsB;
       
       // Empate com penaltis
       if (empate && j.penaltisA !== undefined) {
           const vitoriaPen = meuTimeA ? (j.penaltisA > j.penaltisB) : (j.penaltisB > j.penaltisA);
           return vitoriaPen ? 'bg-success' : 'bg-danger';
       }

       if (vitoria) return 'bg-success'; // Verde
       if (empate) return 'bg-secondary'; // Cinza
       return 'bg-danger'; // Vermelho
    },
    
    getResultadoLabel(j) {
       const classe = this.getResultadoClass(j);
       if (classe === 'bg-success') return 'VITORIA';
       if (classe === 'bg-secondary') return 'EMPATE';
       return 'DERROTA';
    }
  }
}
</script>

<style scoped>
.hover-bg-light:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
}
.transition-colors {
    transition: background-color 0.2s ease;
}
.form-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
}
</style>
