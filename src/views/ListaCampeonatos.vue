<template>
  <div class="container mt-4">
    <BCard title="Meus Campeonatos" class="shadow-sm">
      
      <div class="d-flex justify-content-between align-items-center mb-4">
        <p class="text-muted mb-0">Gerencie seus torneios e acompanhe os jogos.</p>
        <BButton variant="success" @click="$router.push('/novo-campeonato')">
          + Novo Campeonato
        </BButton>
      </div>

      <div v-if="carregando" class="text-center py-5">
        <BSpinner variant="primary" label="Carregando..." />
      </div>

      <div v-else-if="campeonatos.length === 0" class="text-center py-5 text-muted">
        <h5 class="mt-3">Nenhum campeonato criado.</h5>
        <p>Clique no botão acima para começar seu primeiro torneio.</p>
      </div>

      <div v-else>
        <BTableSimple hover responsive align="middle">
          <BThead>
            <BTr>
              <BTh>Nome do Torneio</BTh>
              <BTh>Times</BTh>
              <BTh>Status</BTh>
              <BTh class="text-end">Ações</BTh>
            </BTr>
          </BThead>
          <BTbody>
            <BTr v-for="camp in campeonatos" :key="camp.id">
              <BTd class="fw-bold text-primary">{{ camp.nome }}</BTd>
              
              <BTd>
                <BBadge variant="light" class="  border">
                  {{ camp.timesParticipantes ? camp.timesParticipantes.length : 0 }} clubes
                </BBadge>
              </BTd>

              <BTd>
                <BBadge :variant="getBadgeVariant(camp.status)">
                  {{ formatarStatus(camp.status) }}
                </BBadge>
              </BTd>

              <BTd class="text-end">
                <div class="d-flex justify-content-end gap-1 flex-wrap">
                  <BButton size="sm" variant="primary" @click="irParaDetalhes(camp.id)" title="Gerenciar Jogo">
                    Gerenciar
                  </BButton>
                  
                  <BButton size="sm" variant="warning" @click="editarCampeonato(camp.id)" title="Editar Configurações">
                    ✏️
                  </BButton>

                  <BButton size="sm" variant="info" @click="duplicarCampeonato(camp.id)" title="Duplicar (Criar Cópia)">
                    👯
                  </BButton>

                  <BButton size="sm" variant="danger" @click="excluirCampeonato(camp.id)" title="Excluir Definitivamente">
                    Excluir
                  </BButton>
                </div>
              </BTd>

            </BTr>
          </BTbody>
        </BTableSimple>
      </div>

    </BCard>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { 
  BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BBadge 
} from 'bootstrap-vue-next';

export default {
  name: 'ListaCampeonatos',
  components: {
    BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BBadge
  },
  data() {
    return {
      carregando: true,
      campeonatos: []
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

    formatarStatus(status) {
      if (status === 'EM_ANDAMENTO') return 'Em Andamento';
      if (status === 'FINALIZADO') return 'Finalizado';
      return status;
    },

    getBadgeVariant(status) {
      if (status === 'EM_ANDAMENTO') return 'success';
      if (status === 'FINALIZADO') return 'secondary';
      return 'primary';
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

    async duplicarCampeonato(id) {
      if (!confirm("Deseja criar uma cópia idêntica deste campeonato?")) return;
      
      try {
        this.carregando = true;
        await DbService.duplicarCampeonato(id);
        alert("Campeonato duplicado com sucesso! Procure pelo nome com 'CÓPIA'.");
        await this.carregarDados();
      } catch (error) {
        console.error(error);
        alert("Erro ao duplicar campeonato.");
      } finally {
        this.carregando = false;
      }
    },

    editarCampeonato(id) {
      this.$router.push(`/editar-campeonato/${id}`);
    }
  }
}
</script>

<style scoped>
</style>