<template>
  <div class="container mt-4 mb-5">
    <div v-if="carregando" class="text-center py-5">
      <BSpinner variant="primary" label="Carregando..." />
    </div>

    <div v-else-if="time" class="animate__animated animate__fadeIn">
      <!-- HEADER -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3">
           <img :src="time.escudo" style="width: 60px; height: 60px; object-fit: contain;" />
           <div>
              <h2 class="text-white fw-bold mb-0">Histórico de Confrontos</h2>
              <div class="text-muted">{{ time.nome }}</div>
           </div>
        </div>
        <BButton variant="outline-light" @click="$router.back()">Voltar</BButton>
      </div>

      <!-- FILTRO DE RIVAL -->
      <BCard class="bg-dark border-secondary mb-4 shadow-sm">
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
                     <div class="text-center">
                         <div class="h3 fw-bold text-success mb-0">{{ estatisticas.vitorias }}</div>
                         <small class="text-muted uppercase" style="font-size: 0.65rem;">VITÓRIAS</small>
                     </div>
                     <div class="text-center border-start border-end border-secondary px-3">
                         <div class="h3 fw-bold text-secondary mb-0">{{ estatisticas.empates }}</div>
                         <small class="text-muted uppercase" style="font-size: 0.65rem;">EMPATES</small>
                     </div>
                     <div class="text-center">
                         <div class="h3 fw-bold text-danger mb-0">{{ estatisticas.derrotas }}</div>
                         <small class="text-muted uppercase" style="font-size: 0.65rem;">DERROTAS</small>
                     </div>
                 </div>
             </div>
          </div>
      </BCard>

      <!-- LISTA DE JOGOS -->
      <div v-if="jogosFiltrados.length === 0" class="text-center text-muted py-5">
         Nenhum confronto encontrado.
      </div>

      <div v-else class="d-flex flex-column gap-2">
          <div v-for="(jogo, idx) in jogosFiltrados" :key="idx" 
               class="bg-dark border border-secondary border-opacity-50 p-3 rounded d-flex flex-column flex-md-row align-items-center gap-3 justify-content-between shadow-sm">
             
             <!-- DATA E CAMPEONATO (Mobile: Top) -->
             <div class="text-center text-md-start w-100 w-md-auto d-flex d-md-block justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2 pb-md-0 mb-2 mb-md-0">
                <div>
                   <div class="text-warning fw-bold small">{{ jogo.data }}</div>
                   <div class="text-muted small" style="font-size: 0.75rem;">{{ jogo.campeonato }}</div>
                </div>
                <div class="badge bg-secondary text-dark ms-2" style="font-size: 0.65rem;">{{ jogo.fase }}</div>
             </div>
 
             <!-- PLACAR CENTRAL -->
             <div class="d-flex align-items-center justify-content-center gap-2 gap-md-3 flex-grow-1 w-100">
                
                <div class="d-flex flex-column align-items-center align-items-md-end text-center text-md-end flex-grow-1" style="flex-basis: 0;">
                   <div class="d-flex flex-column flex-md-row align-items-center gap-2">
                      <span class="fw-bold text-white d-none d-md-inline" :class="{'text-warning': jogo.timeA.id === time.id}">{{ jogo.timeA.nome }}</span>
                      <span class="fw-bold text-white d-md-none small text-truncate w-100" :class="{'text-warning': jogo.timeA.id === time.id}">{{ jogo.timeA.nome }}</span>
                      <img :src="jogo.timeA.escudo" style="width: 36px; height: 36px; object-fit: contain;" />
                   </div>
                   <div class="text-muted small italic me-0 me-md-1 mt-1 mt-md-0 d-none d-md-block" style="font-size: 0.7rem;">
                      {{ jogo.tecnicoA }}
                   </div>
                </div>
 
                <div class="d-flex flex-column align-items-center mx-1">
                   <div class="badge bg-dark border border-secondary fs-5 px-3 py-2 text-nowrap">
                      {{ jogo.golsA }} <span class="text-secondary mx-1">x</span> {{ jogo.golsB }}
                   </div>
                   <div v-if="jogo.penaltisA !== undefined" class="small text-muted mt-1" style="font-size: 0.65rem;">
                      (Pên: {{ jogo.penaltisA }} x {{ jogo.penaltisB }})
                   </div>
                   <span class="badge mt-2 d-md-none rounded-pill" :class="getResultadoClass(jogo)" style="font-size: 0.6rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
                       {{ getResultadoLabel(jogo) }}
                   </span>
                </div>
 
                <div class="d-flex flex-column align-items-center align-items-md-start text-center text-md-start flex-grow-1" style="flex-basis: 0;">
                   <div class="d-flex flex-column-reverse flex-md-row align-items-center gap-2">
                      <img :src="jogo.timeB.escudo" style="width: 36px; height: 36px; object-fit: contain;" />
                      <span class="fw-bold text-white d-none d-md-inline" :class="{'text-warning': jogo.timeB.id === time.id}">{{ jogo.timeB.nome }}</span>
                      <span class="fw-bold text-white d-md-none small text-truncate w-100" :class="{'text-warning': jogo.timeB.id === time.id}">{{ jogo.timeB.nome }}</span>
                   </div>
                   <div class="text-muted small italic ms-0 ms-md-1 mt-1 mt-md-0 d-none d-md-block" style="font-size: 0.7rem;">
                      {{ jogo.tecnicoB }}
                   </div>
                </div>
             </div>
 
             <!-- RESULTADO ETIQUETA (Desktop Only) -->
             <div class="text-center d-none d-md-block" style="min-width: 60px;">
                <span class="badge" :class="getResultadoClass(jogo)">{{ getResultadoLabel(jogo) }}</span>
             </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BSpinner, BButton, BCard } from 'bootstrap-vue-next';

export default {
  name: 'HistoricoConfrontos',
  components: { BSpinner, BButton, BCard },
  data() {
    return {
      carregando: true,
      time: null,
      historico: [],
      todosJogos: [],
      adversarioFiltro: null,
      tecnicos: [] // Cache para resolver nomes
    };
  },
  computed: {
    listaAdversarios() {
       const adversarios = new Map();
       this.todosJogos.forEach(j => {
          const adv = j.timeA.id === this.time.id ? j.timeB : j.timeA;
          if (!adversarios.has(adv.id)) {
             adversarios.set(adv.id, adv);
          }
       });
       return Array.from(adversarios.values()).sort((a,b) => a.nome.localeCompare(b.nome));
    },
    jogosFiltrados() {
       let lista = this.todosJogos;
       if (this.adversarioFiltro) {
          lista = lista.filter(j => j.timeA.id == this.adversarioFiltro || j.timeB.id == this.adversarioFiltro);
       }
       return lista.sort((a,b) => new Date(b.dataIso) - new Date(a.dataIso));
    },
    estatisticas() {
       let v = 0, e = 0, d = 0;
       this.jogosFiltrados.forEach(j => {
          const meuTimeA = j.timeA.id === this.time.id;
          const golsPro = meuTimeA ? j.golsA : j.golsB;
          const golsContra = meuTimeA ? j.golsB : j.golsA;
          
          // Considera penaltis se houver
          if (golsPro > golsContra) v++;
          else if (golsContra > golsPro) d++;
          else {
             // Empate em gols normais, verifica penaltis se existirem
             if (j.penaltisA !== undefined) {
                const penPro = meuTimeA ? j.penaltisA : j.penaltisB;
                const penContra = meuTimeA ? j.penaltisB : j.penaltisA;
                if (penPro > penContra) v++;
                else d++; // Em mata-mata nunca empata nos penaltis
             } else {
                e++;
             }
          }
       });
       return { vitorias: v, empates: e, derrotas: d, total: v+e+d };
    }
  },
  async mounted() {
    try {
      const idTime = this.$route.params.idTime;
      this.time = await DbService.getTimeById(idTime);
      this.historico = await DbService.getHistorico();
      const todosTecnicos = await DbService.getTecnicos();
      const mapaTecnicos = todosTecnicos.reduce((acc, t) => { acc[t.apelido] = t.nome; return acc; }, {});
      
      this.processarJogos(mapaTecnicos);
    } catch (e) {
      console.error(e);
    } finally {
      this.carregando = false;
    }
  },
  methods: {
    processarJogos(mapaTecnicos) {
       const jogos = [];
       this.historico.forEach(h => {
          const jogosCamp = h.jogos || [];
          jogosCamp.forEach(j => {
             if (!j.finalizado) return;
             if (j.timeA.id == this.time.id || j.timeB.id == this.time.id) {
                
                // Resolver nomes de técnicos
                const tecA = mapaTecnicos[j.timeA.tecnico] || j.timeA.tecnico || '?';
                const tecB = mapaTecnicos[j.timeB.tecnico] || j.timeB.tecnico || '?';

                jogos.push({
                   data: new Date(h.dataFim).toLocaleDateString('pt-BR'),
                   dataIso: h.dataFim,
                   campeonato: h.nome,
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
       const meuTimeA = j.timeA.id === this.time.id;
       const vitoria = meuTimeA ? (j.golsA > j.golsB) : (j.golsB > j.golsA);
       const empate = j.golsA === j.golsB;
       
       if (vitoria) return 'bg-success';
       if (empate && j.penaltisA === undefined) return 'bg-secondary';
       
       // Se foi empate mas teve penaltis
       if (empate) {
          const vitoriaPen = meuTimeA ? (j.penaltisA > j.penaltisB) : (j.penaltisB > j.penaltisA);
          return vitoriaPen ? 'bg-success' : 'bg-danger';
       }

       return 'bg-danger';
    },
    getResultadoLabel(j) {
       const classe = this.getResultadoClass(j);
       if (classe === 'bg-success') return 'V';
       if (classe === 'bg-secondary') return 'E';
       return 'D';
    }
  }
}
</script>

<style scoped>
.form-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
}
</style>
