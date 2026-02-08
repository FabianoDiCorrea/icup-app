<template>
  <div class="container mt-4">
    <BCard no-body class="shadow-sm border-0 bg-dark">
      
      <div v-if="carregando" class="text-center py-5">
        <BSpinner variant="primary" label="Carregando..." />
      </div>

      <BTabs v-else card active-nav-item-class="font-weight-bold text-primary" content-class="mt-3" v-model="tabIndex">
        
        <!-- ABA: CAMPEONATOS ATIVOS -->
        <BTab title="🏆 EM ANDAMENTO">
            <div class="d-flex justify-content-between align-items-center mb-4 px-3">
                <div>
                    <h4 class="text-white mb-1">Meus Campeonatos</h4>
                    <p class="text-muted mb-0 small">Torneios ativos e prontos para jogar.</p>
                </div>
                <BButton variant="success" @click="$router.push('/novo-campeonato')" class="fw-bold shadow">
                + Novo Campeonato
                </BButton>
            </div>

            <div v-if="campeonatosAtivos.length === 0" class="text-center py-5 text-muted border border-secondary border-dashed rounded mx-3">
                <h5 class="mt-3">Nenhum campeonato ativo.</h5>
                <p>Crie um novo ou verifique os finalizados.</p>
            </div>

            <div v-else class="px-3 pb-3">
                <div class="row g-3">
                    <div v-for="camp in campeonatosAtivos" :key="camp.id" class="col-12 col-md-6 col-lg-4">
                        <div class="card bg-secondary bg-opacity-10 border-secondary h-100 hover-shadow transition-all">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <h5 class="card-title text-white fw-bold text-truncate mb-0" :title="camp.nome">{{ camp.nome }}</h5>
                                    <BBadge variant="primary" class="ms-2">
                                        {{ camp.timesParticipantes ? camp.timesParticipantes.length : 0 }} times
                                    </BBadge>
                                </div>
                                <p class="card-text text-muted small mb-4">
                                    Última alteração: {{ formatarData(camp.dataAtualizacao || camp.dataCriacao) }}
                                </p>
                                <div class="d-grid gap-2">
                                    <BButton variant="primary" @click="irParaDetalhes(camp.id)" class="fw-bold">
                                        ⚽ ENTRAR
                                    </BButton>
                                    <div class="d-flex gap-2">
                                        <BButton size="sm" variant="outline-warning" class="flex-grow-1" @click="editarCampeonato(camp.id)" title="Editar">
                                            ✏️ Configurar
                                        </BButton>
                                        <BButton size="sm" variant="outline-danger" @click="excluirCampeonato(camp.id)" title="Excluir">
                                            🗑️
                                        </BButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BTab>

        <!-- ABA: CAMPEONATOS FINALIZADOS -->
        <BTab title="🏁 FINALIZADOS">
            <div class="d-flex justify-content-between align-items-center mb-4 px-3">
                <div>
                    <h4 class="text-white-50 mb-1">Galeria de Troféus</h4>
                    <p class="text-muted mb-0 small">Histórico de campeonatos encerrados.</p>
                </div>
            </div>

            <div v-if="campeonatosFinalizados.length === 0" class="text-center py-5 text-muted border border-secondary border-dashed rounded mx-3">
                <h5>Nenhum campeonato finalizado ainda.</h5>
            </div>

            <div v-else class="list-group list-group-flush bg-transparent px-3 pb-3">
                <div v-for="camp in campeonatosFinalizados" :key="camp.id" 
                     class="list-group-item bg-dark border-secondary text-white d-flex justify-content-between align-items-center mb-2 rounded border">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                            🏆
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold">{{ camp.nome }}</h6>
                            <small class="text-muted">{{ formatarData(camp.dataCriacao) }} • {{ camp.timesParticipantes.length }} Times</small>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-2">
                        <BButton size="sm" variant="outline-light" @click="irParaDetalhes(camp.id)">
                            👁️ Ver Histórico
                        </BButton>
                        <BButton size="sm" variant="outline-danger" @click="excluirCampeonatoSeguro(camp)" title="Excluir Definitivamente">
                            🗑️
                        </BButton>
                    </div>
                </div>
            </div>
        </BTab>
      </BTabs>
    </BCard>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { 
  BCard, BButton, BSpinner, BTabs, BTab, BBadge 
} from 'bootstrap-vue-next';

export default {
  name: 'ListaCampeonatos',
  components: {
    BCard, BButton, BSpinner, BTabs, BTab, BBadge
  },
  data() {
    return {
      carregando: true,
      campeonatos: [],
      tabIndex: 0
    }
  },
  computed: {
      campeonatosAtivos() {
          return this.campeonatos.filter(c => c.status !== 'ENCERRADO');
      },
      campeonatosFinalizados() {
          return this.campeonatos.filter(c => c.status === 'ENCERRADO');
      }
  },
  async mounted() {
    await this.carregarDados();
  },
  methods: {
    async carregarDados() {
      try {
        this.campeonatos = await DbService.getCampeonatos();
        this.campeonatos.sort((a, b) => b.id - a.id);
      } catch (error) {
        console.error("Erro ao listar campeonatos:", error);
      } finally {
        this.carregando = false;
      }
    },


    irParaDetalhes(id) {
      this.$router.push(`/campeonato/${id}`);
    },

    formatarData(dataIso) {
      if (!dataIso) return '-';
      return new Date(dataIso).toLocaleDateString('pt-BR');
    },

    async excluirCampeonato(id) {
      const ok = confirm(
        "⚠️ Tem certeza que deseja EXCLUIR este campeonato?\n\n" +
        "Essa ação não pode ser desfeita."
      );

      if (!ok) return;

      try {
        await DbService.excluirCampeonato(id);
        alert("Campeonato excluído com sucesso!");
        await this.carregarDados();
      } catch (error) {
        console.error(error);
        alert("Erro ao excluir campeonato.");
      }
    },

    async excluirCampeonatoSeguro(camp) {
        const confirmacao = prompt(
            `⚠️ EXCLUSÃO DE CAMPEONATO FINALIZADO ⚠️\n\n` +
            `Você está prestes a apagar permanentemente o histórico do campeonato "${camp.nome}".\n\n` +
            `Para confirmar, digite exatamente: DELETAR`
        );

        if (confirmacao !== 'DELETAR') {
            if (confirmacao !== null) alert("Texto incorreto. Exclusão cancelada.");
            return;
        }

        try {
            await DbService.excluirCampeonato(camp.id);
            alert("Campeonato antigo excluído e histórico removido.");
            await this.carregarDados();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir.");
        }
    },

    async duplicarCampeonato(id) { // Mantido caso precise futuramente, mas removido da UI ativa para simplificar
      if (!confirm("Deseja criar uma cópia idêntica deste campeonato?")) return;
      try {
        this.carregando = true;
        await DbService.duplicarCampeonato(id);
        alert("Cópia criada com sucesso!");
        await this.carregarDados();
      } catch (error) { console.error(error); } finally { this.carregando = false; }
    },

    editarCampeonato(id) {
      this.$router.push(`/editar-campeonato/${id}`);
    }
  }
}
</script>

<style scoped>
</style>