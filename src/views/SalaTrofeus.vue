<template>
  <div class="container mt-4 mb-5">
    
    <div v-if="carregando" class="text-center py-5">
       <!-- Changed to spinner-border to avoid the "growing dot" effect -->
       <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Carregando...</span>
       </div>
    </div>

    <!-- Removed animate__animated animate__fadeIn -->
    <div v-else-if="time">
        
        <!-- HEADER -->
        <div class="d-flex align-items-center justify-content-between mb-5">
            <div class="d-flex align-items-center gap-3">
                <div class="bg-dark rounded-circle p-2 border border-secondary border-opacity-25 shadow-sm">
                    <img :src="time.escudo" style="width: 60px; height: 60px; object-fit: contain;" />
                </div>
                <div>
                    <h1 class="display-6 fw-bold text-warning mb-0 text-uppercase ls-1">Sala de Troféus</h1>
                    <div class="text-white-50 lead fs-6">{{ time.nome }}</div>
                </div>
            </div>
            <button class="btn btn-outline-light rounded-pill px-4" @click="$router.back()">
                <i class="bi bi-arrow-left me-2"></i> Voltar
            </button>
        </div>

        <div v-if="titulos.length === 0" class="text-center py-5 border border-secondary border-dashed rounded text-muted">
            <i class="bi bi-trophy opacity-50 display-1 mb-3 d-block"></i>
            <p class="mb-0 fs-5">A galeria ainda está vazia.</p>
            <small>Vença campeonatos para preencher este espaço!</small>
        </div>

        <!-- GRID DE TROFÉUS -->
        <div class="row g-4 justify-content-center">
            <div v-for="(camp, idx) in titulos" :key="idx" class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="card bg-dark border-secondary border-opacity-25 h-100 shadow-lg hover-scale transition-all">
                    
                    <!-- ESTRELAS (Topo) -->
                    <div class="card-header bg-transparent border-0 text-center pt-4 pb-0">
                         <div class="d-flex justify-content-center gap-1 flex-wrap item-center" style="min-height: 30px;">
                             <span v-for="n in camp.qtd" :key="n" 
                                   class="text-warning fw-bold d-inline-block"
                                   style="font-size: 1.5rem; text-shadow: 0 0 5px gold; line-height: 1;">★</span>
                         </div>
                    </div>

                    <!-- TROFÉU E IMAGEM (MAIOR DESTAQUE) -->
                    <div class="card-body text-center d-flex flex-column justify-content-center align-items-center pt-2">
                        <div class="position-relative mb-4 mt-2">
                             <!-- Glow effect behind trophy (Aumentado) -->
                             <div class="position-absolute top-50 start-50 translate-middle" 
                                  style="width: 180px; height: 180px; background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);"></div>
                             
                             <!-- TROFÉU AUMENTADO (230px) -->
                             <img :src="camp.urlTrofeu || require('@/assets/icup-logo.png')" 
                                  style="width: 230px; height: 230px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5)); position: relative; z-index: 2;" 
                                  class="trofeu-img" />
                        </div>
                        
                        <h4 class="text-white fw-bold mb-1 text-uppercase ls-1">{{ camp.nome }}</h4>

                        <!-- LISTA DE EDIÇÕES COM TÉCNICO -->
                        <div class="w-100 mt-auto pt-3 border-top border-secondary border-opacity-25">
                            <div class="d-flex flex-column gap-2">
                                <div v-for="(conq, cIdx) in camp.conquistas" :key="cIdx" 
                                      class="bg-secondary bg-opacity-10 border border-secondary border-opacity-25 rounded p-2 text-start">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-warning fw-bold small">{{ conq.edicao }}ª Edição</span>
                                        <span class="text-muted small" style="font-size: 0.8rem;">{{ conq.ano }}</span>
                                    </div>
                                    <div class="d-flex align-items-start text-white-50 small mt-1">
                                        <i class="bi bi-person-workspace me-2 text-secondary flex-shrink-0 mt-1"></i>
                                        <span class="fst-italic lh-sm">{{ conq.tecnico }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';

export default {
  name: 'SalaTrofeus',
  data() {
    return {
      carregando: true,
      time: null,
      historico: [],
      mapaEdicoes: {},
      mapaTecnicos: {} // Cache de técnicos
    };
  },
  computed: {
    titulos() {
      if (!this.historico || !this.time) return [];
      
      const grupos = {};
      const meuId = String(this.time.id); 
      
      this.historico.forEach(h => {
        if (!h.campeao) return;
        const idCampeao = h.campeao.id !== undefined ? String(h.campeao.id) : String(h.campeao);

        if (idCampeao === meuId) {
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
           
           // Resolve o nome do técnico
           let nomeTecnico = 'Téc. Desconhecido';
           if (h.campeao.tecnico) {
               nomeTecnico = this.mapaTecnicos[h.campeao.tecnico] || h.campeao.tecnico;
           }

           grupos[nomeNorm].conquistas.push({
             data: h.dataFim,
             ano: new Date(h.dataFim).getFullYear(),
             edicao: this.mapaEdicoes[h.idCampeonato] || '?',
             tecnico: nomeTecnico
           });
        }
      });
      
      Object.values(grupos).forEach(g => {
          g.conquistas.sort((a,b) => {
             const edA = parseInt(a.edicao) || 0;
             const edB = parseInt(b.edicao) || 0;
             return edB - edA; 
          });
      });

      return Object.values(grupos).sort((a,b) => b.qtd - a.qtd);
    }
  },
  async mounted() {
    try {
      this.carregando = true;
      const idTime = this.$route.params.id; 
      
      // Carrega dados em paralelo
      const [timeData, histData, tecsData] = await Promise.all([
          DbService.getTimeById(idTime),
          DbService.getHistorico(),
          DbService.getTecnicos()
      ]);

      this.time = timeData;
      this.historico = histData;
      
      // Mapeia técnicos (Apelido -> Nome)
      this.mapaTecnicos = tecsData.reduce((acc, t) => {
         acc[t.apelido] = t.nome;
         return acc;
      }, {});
      
      this.calcularEdicoes();
    } catch (e) {
      console.error(e);
    } finally {
      this.carregando = false;
    }
  },
  methods: {
     calcularEdicoes() {
       if (!this.historico) return;
       const comps = {};
       this.historico.forEach(h => {
           if (!h || !h.nome) return;
           const nome = h.nome.trim();
           if (!comps[nome]) comps[nome] = [];
           comps[nome].push(h);
       });

       Object.values(comps).forEach(lista => {
           lista.sort((a,b) => {
               const dA = a.dataFim ? new Date(a.dataFim) : 0;
               const dB = b.dataFim ? new Date(b.dataFim) : 0;
               return dA - dB;
           });
           lista.forEach((h, index) => {
               this.mapaEdicoes[h.idCampeonato] = index + 1;
           });
       });
    }
  }
}
</script>

<style scoped>
.hover-scale:hover {
    transform: translateY(-5px);
}
.transition-all {
    transition: all 0.3s ease;
}
.ls-1 {
    letter-spacing: 1px;
}
.drop-shadow-star {
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}
.trofeu-img {
    transition: transform 0.3s ease;
}
.card:hover .trofeu-img {
    transform: scale(1.1) rotate(5deg);
}
</style>
