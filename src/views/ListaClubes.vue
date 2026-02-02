<template>
  <div class="container mt-4">
    <BCard title="Clubes Cadastrados" class="shadow-sm">
      
      <BRow class="mb-4 align-items-center">
        <BCol md="6">
          <BInputGroup>
            <BInputGroupText>🔍</BInputGroupText>
            <BFormInput
              v-model="termoBusca"
              placeholder="Buscar time pelo nome..."
              type="search"
            />
          </BInputGroup>
        </BCol>

        <BRow class="mb-3">
  <BCol md="4">
    <BFormSelect v-model="paisSelecionado">
      <option value="TODOS">Todos os Países</option>
      <option value="SEM_PAIS">Sem País</option>

      <option
        v-for="pais in paisesDisponiveis"
        :key="pais"
        :value="pais"
      >
        {{ pais }}
      </option>
    </BFormSelect>
  </BCol>
</BRow>

        <BCol md="6" class="text-md-end text-muted mt-2 mt-md-0">
          <small>
            Exibindo {{ timesPaginados.length }} de {{ timesFiltrados.length }} time(s) encontrado(s).
            (Total no banco: {{ todosOsTimes.length }})
          </small>
        </BCol>
      </BRow>

      <div v-if="carregando" class="text-center py-5">
        <BSpinner variant="primary" label="Carregando..." />
      </div>

      <div v-else-if="timesFiltrados.length === 0" class="text-center py-5 text-muted">
        <h5 class="mt-3">Nenhum clube encontrado.</h5>
        <p v-if="termoBusca">Tente buscar com outro termo.</p>
        <p v-else>Cadastre novos times para vê-los aqui.</p>
      </div>

      <div v-else>
        <BTableSimple hover responsive align="middle">
  <BThead>
    <BTr>
      <BTh>Escudo</BTh>
      <BTh>Nome</BTh>
      <BTh>País</BTh>
      <BTh class="text-end">Ações</BTh>
    </BTr>
  </BThead>

  <BTbody>
    <BTr
      v-for="time in timesPaginados"
      :key="time.id"
    >
      <BTd style="width: 80px;">
        <img
          :src="time.escudo"
          :alt="time.nome"
          style="width: 50px; height: 50px; object-fit: contain;"
          @error="$event.target.style.display='none'"
        />
      </BTd>

      <BTd class="fw-bold">
        {{ time.nome }}
      </BTd>

      <BTd>
        <span class="text-muted text-uppercase">
          {{ time.pais || '-' }}
        </span>
      </BTd>

      <BTd class="text-end">
        <BButton
          size="sm"
          variant="outline-secondary"
          class="me-2"
          @click="$router.push(`/editar-clube/${time.id}`)"
        >
          Editar
        </BButton>

        <BButton
          size="sm"
          variant="outline-primary"
          @click="verDetalhes(time)"
        >
          Ver Elenco
        </BButton>

        <BButton
          size="sm"
          variant="outline-danger"
          class="ms-2"
          @click="excluirTime(time)"
        >
          Excluir
        </BButton>
      </BTd>
    </BTr>
  </BTbody>
</BTableSimple>


        <div class="d-flex justify-content-center mt-4"
     v-if="timesFiltrados && timesFiltrados.length > itensPorPagina">

          <BPagination
            v-model="paginaAtual"
            :total-rows="timesFiltrados.length"
            :per-page="itensPorPagina"
            first-number
            last-number
            prev-text="Anterior"
            next-text="Próxima"
          />
        </div>
      </div>

    </BCard>
    
    <BModal v-model="modalDetalhesAberto" :title="timeSelecionado?.nome" ok-only size="lg">
       <div v-if="timeSelecionado">
          <h6>Elenco ({{ timeSelecionado.jogadores.length }} jogadores)</h6>
          <BListGroup>
            <BListGroupItem v-for="jogador in timeSelecionado.jogadores" :key="jogador.numero">
                <span class="fw-bold me-2">#{{ jogador.numero }}</span> {{ jogador.nome }}
            </BListGroupItem>
          </BListGroup>
       </div>
    </BModal>

  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import {
  BCard, BRow, BCol, BInputGroup, BInputGroupText, BFormInput,
  BFormSelect,
  BTableSimple, BThead, BTbody, BTr, BTh, BTd, BButton,
  BSpinner, BPagination, BModal, BListGroup, BListGroupItem
} from 'bootstrap-vue-next';


export default {
  name: 'ListaClubes',
  components: {
  BCard, BRow, BCol, BInputGroup, BInputGroupText, BFormInput,
  BFormSelect,
  BTableSimple, BThead, BTbody, BTr, BTh, BTd, BButton,
  BSpinner, BPagination, BModal, BListGroup, BListGroupItem
},

  data() {
    return {
      carregando: true,
      todosOsTimes: [], 
      termoBusca: '',   
      paginaAtual: 1,
      itensPorPagina: 32,
      modalDetalhesAberto: false,
      timeSelecionado: null,
      paisSelecionado: 'TODOS',
    };
  },
  computed: {

     paisesDisponiveis() {
  const paises = new Set();

  this.todosOsTimes.forEach(time => {
    if (time.pais && time.pais.trim() !== '') {
      paises.add(time.pais.toUpperCase());
    }
  });

  return Array.from(paises).sort();
},

    timesFiltrados() {
      let lista = this.todosOsTimes;

  // filtro por país
  if (this.paisSelecionado === 'SEM_PAIS') {
    lista = lista.filter(t => !t.pais || t.pais.trim() === '');
  } 
  else if (this.paisSelecionado !== 'TODOS') {
    lista = lista.filter(
      t => t.pais && t.pais.toUpperCase() === this.paisSelecionado
    );
  }

  // filtro por busca
  if (this.termoBusca) {
    const termo = this.termoBusca.toLowerCase();
    lista = lista.filter(time =>
      time.nome.toLowerCase().includes(termo) ||
      (time.estadio || '').toLowerCase().includes(termo)
    );
  }

  return lista;
},

   timesPaginados() {
  const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
  const fim = inicio + this.itensPorPagina;
  return this.timesFiltrados.slice(inicio, fim);
}


  },
  watch: {
    termoBusca() {
      this.paginaAtual = 1;
    }
  },
  async mounted() {
    await this.carregarTimes();
  },
  methods: {
    async carregarTimes() {
      this.carregando = true;
      try {
        const times = await DbService.getTimes();
        // ALTERAÇÃO: Ordena alfabeticamente pelo nome
        this.todosOsTimes = times.sort((a, b) => a.nome.localeCompare(b.nome));
      } catch (error) {
        console.error("Erro ao listar times:", error);
      } finally {
        this.carregando = false;
      }
    },
    verDetalhes(time) {
        this.timeSelecionado = time;
        this.modalDetalhesAberto = true;
    },
    async excluirTime(time) {
  if (!confirm(`Excluir o time "${time.nome}"?`)) return;

  await DbService.excluirTime(time.id);
  await this.carregarTimes();
},

  }
}
</script>