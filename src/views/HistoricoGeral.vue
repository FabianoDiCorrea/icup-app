<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary fw-bold mb-0">🏆 HISTÓRICO GERAL</h2>
    </div>

    <!-- TABS -->
    <ul class="nav nav-tabs border-secondary mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabAtiva === 'fame' }" @click="tabAtiva = 'fame'">
          Hall da Fama
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabAtiva === 'artilharia' }" @click="tabAtiva = 'artilharia'">
          Artilharia Geral
        </button>
      </li>
    </ul>

    <!-- CONTEÚDO: HALL DA FAMA -->
    <div v-if="tabAtiva === 'fame'">
      <div v-if="historico.length === 0" class="text-center py-5 text-muted">
        <p>Nenhum campeonato finalizado ainda.</p>
        <router-link to="/lista-campeonatos" class="btn btn-outline-primary btn-sm">Ir para Campeonatos</router-link>
      </div>

      <div v-else class="row g-3">
        <div v-for="item in historicoOrdenado" :key="item.dataRegistro" class="col-12 col-md-6 col-lg-4">
          <div class="card bg-dark border-secondary h-100 shadow-sm hover-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="trofeu-container bg-white rounded p-1" v-if="item.urlTrofeu">
                    <img :src="item.urlTrofeu" style="width: 40px; height: 40px; object-fit: contain;" />
                  </div>
                  <div>
                    <h5 class="card-title text-white mb-0">{{ item.nome }}</h5>
                    <small class="text-muted">{{ formatarData(item.dataFim) }}</small>
                  </div>
                </div>
              </div>

              <div class="bg-secondary bg-opacity-25 p-3 rounded border border-secondary mb-3">
                <!-- CAMPEÃO -->
                <div class="mb-3">
                  <span class="text-warning fw-bold small d-block mb-1">CAMPEÃO</span>
                  <div class="d-flex align-items-center justify-content-between">
                    <router-link :to="`/dashboard/time/${item.campeao?.id}`" class="text-decoration-none d-flex align-items-center gap-2">
                       <img :src="item.campeao?.escudo" style="width: 32px; height: 32px; object-fit: contain;" />
                       <div>
                          <div class="text-white fw-bold lh-1">{{ item.campeao?.nome }}</div>
                          <div class="text-muted small">
                            <span v-if="item.campeao?.tecnico">{{ resolverNomeTecnico(item.campeao.tecnico) }}</span>
                            <span v-if="item.adicionarNacionalidade && item.campeao?.pais" class="ms-1 op-75">({{ item.campeao.pais.substring(0,3).toUpperCase() }})</span>
                          </div>
                       </div>
                    </router-link>
                  </div>
                </div>

                <!-- VICE -->
                <div class="border-top border-secondary pt-2">
                  <span class="text-muted small d-block mb-1">Vice</span>
                  <div class="d-flex align-items-center justify-content-between">
                    <router-link :to="`/dashboard/time/${item.vice?.id}`" class="text-decoration-none d-flex align-items-center gap-2 text-white-50">
                       <img :src="item.vice?.escudo" style="width: 24px; height: 24px; object-fit: contain;" class="opacity-75" />
                       <div>
                          <div class="fw-bold small lh-1">{{ item.vice?.nome }}</div>
                          <div class="small" style="font-size: 0.75rem;">
                            <span v-if="item.vice?.tecnico">{{ resolverNomeTecnico(item.vice.tecnico) }}</span>
                            <span v-if="item.adicionarNacionalidade && item.vice?.pais" class="ms-1">({{ item.vice.pais.substring(0,3).toUpperCase() }})</span>
                          </div>
                       </div>
                    </router-link>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <router-link :to="`/campeonato/${item.idCampeonato}/classificacao`" class="btn btn-sm btn-outline-secondary w-100">
                  Ver Detalhes
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTEÚDO: ARTILHARIA GERAL -->
    <div v-if="tabAtiva === 'artilharia'">
      <div v-if="artilhariaGeral.length === 0" class="text-center py-5 text-muted">
        Nenhum dado de artilharia disponível.
      </div>
      
      <div v-else class="card bg-dark border-secondary">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead class="table-secondary">
              <tr>
                <th class="text-center" style="width: 60px;">Pos</th>
                <th>Jogador</th>
                <th class="text-center">Gols</th>
                <th class="text-end pe-4">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in artilhariaGeral" :key="index">
                <td class="text-center fw-bold">{{ index + 1 }}º</td>
                <td>
                  <div class="fw-bold">{{ p.nome }}</div>
                  <small class="text-muted" v-if="p.tecnico">{{ resolverNomeTecnico(p.tecnico) }}</small>
                </td>
                <td class="text-center">
                  <span class="badge bg-success fs-6">{{ p.gols }}</span>
                </td>
                <td class="text-end pe-3">
                    <router-link :to="`/dashboard/time/${p.timeId}`">
                      <img :src="p.escudo" style="width: 24px; height: 24px; object-fit: contain;" class="ms-2" />
                    </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DbService from '../services/DbService.js';

export default {
  name: 'HistoricoGeral',
  data() {
    return {
      tabAtiva: 'fame',
      historico: [],
      timesGeral: [],
      mapaTecnicos: {}
    };
  },
  computed: {
    historicoOrdenado() {
      return [...this.historico].sort((a, b) => new Date(b.dataFim) - new Date(a.dataFim));
    },
    artilhariaGeral() {
      const mapa = {};
      this.historico.forEach(h => {
        (h.artilheiros || []).forEach(art => {
          const chave = art.nome; // Simplificação para este MVP
          if (!mapa[chave]) {
            mapa[chave] = { 
              nome: art.nome, 
              gols: 0, 
              tecnico: art.tecnico,
              escudo: this.getEscudoTime(art.timeId)
            };
          }
          mapa[chave].gols += art.gols;
        });
      });
      return Object.values(mapa).sort((a, b) => b.gols - a.gols).slice(0, 20);
    }
  },
  async mounted() {
    this.historico = await DbService.getHistorico();
    this.timesGeral = await DbService.getTimes();
    const todosTecnicos = await DbService.getTecnicos();
    this.mapaTecnicos = todosTecnicos.reduce((acc, t) => {
       acc[t.apelido] = t.nome;
       return acc;
    }, {});
  },
  methods: {
    resolverNomeTecnico(nomeOuApelido) {
       if (!nomeOuApelido) return '';
       return this.mapaTecnicos[nomeOuApelido] || nomeOuApelido;
    },
    formatarData(iso) {
      if (!iso) return '';
      return new Date(iso).toLocaleDateString('pt-BR');
    },
    getEscudoTime(id) {
        const t = this.timesGeral.find(x => x.id === id);
        return t ? t.escudo : null;
    }
  }
};
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #94a3b8;
  border: none;
  font-weight: bold;
}
.nav-tabs .nav-link.active {
  background-color: transparent;
  color: #10b981;
  border-bottom: 3px solid #10b981;
}
.hover-card {
  transition: transform 0.2s;
}
.hover-card:hover {
  transform: translateY(-5px);
}
.trofeu-container {
  box-shadow: 0 0 10px rgba(255, 214, 0, 0.2);
}
</style>
