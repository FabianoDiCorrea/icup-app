<template>
  <div class="container mt-4 mb-5">
    <BCard title="Novo Campeonato" class="shadow-sm border-secondary bg-dark text-white">
      <BForm @submit.prevent="salvarCampeonato">

        <h5 class="text-primary border-bottom border-secondary pb-2 mb-3">1. Configurações</h5>
        <BRow class="mb-3">
          <BCol md="6">
            <BFormGroup label="Nome do Torneio:" label-for="nome-camp" class="text-white-50">
              <BFormInput id="nome-camp" v-model="campeonato.nome" placeholder="Ex: Copa do Brasil"
                :state="campeonato.nome ? true : null" class="bg-secondary text-white border-secondary" />
            </BFormGroup>
          </BCol>
          <BCol md="6">
            <BFormGroup label="Tipo de Campeonato:" label-for="tipo-camp" class="text-white-50">
              <BFormSelect id="tipo-camp" v-model="campeonato.tipo" @change="resetarConfiguracoesEspecificas"
                class="bg-secondary text-white border-secondary">
                <option value="PONTOS_CORRIDOS">Pontos Corridos</option>
                <option value="MATA_MATA">Mata-Mata (Eliminatória)</option>
                <option value="GRUPOS">Fase de Grupos</option>
              </BFormSelect>
            </BFormGroup>

          </BCol>
        </BRow>

        <div class="bg-secondary bg-opacity-25 p-3 rounded mb-4 border border-secondary">

          <div v-if="campeonato.tipo === 'PONTOS_CORRIDOS'">
            <BRow>
              <BCol md="12">
                <BFormGroup label="Formato:" label-for="turnos-camp" class="text-white">
                  <BFormSelect id="turnos-camp" v-model="campeonato.turnos" class="bg-dark text-white border-secondary">
                    <option :value="1">Turno Único (Todos contra todos 1x)</option>
                    <option :value="2">Turno e Returno (Ida e Volta)</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>
            </BRow>
            <BCard class="mt-3 bg-dark border border-secondary p-3">
  <div class="form-check mb-2">
    <input
      class="form-check-input"
      type="checkbox"
      id="ativarMataMata"
      v-model="campeonato.classificadosParaMataMata"
      :true-value="4"
      :false-value="null"
    />
    <label class="form-check-label text-white fw-bold" for="ativarMataMata">
      Ativar Fase Final (Mata-Mata)
    </label>
  </div>

  <div v-if="campeonato.classificadosParaMataMata !== null" class="mt-2">
    <BRow>
      <BCol md="6">
        <BFormGroup label="Quantos classificam:" class="text-white">
          <BFormInput
            type="number"
            min="2"
            :max="idsSelecionados.length"
            v-model.number="campeonato.classificadosParaMataMata"
            class="bg-dark text-white border-secondary"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup label="Formato da Fase Final:" class="text-white">
          <BFormSelect
            v-model="campeonato.turnosMataMata"
            class="bg-dark text-white border-secondary"
          >
            <option :value="1">Jogo Único</option>
            <option :value="2">Ida e Volta</option>
          </BFormSelect>
        </BFormGroup>
      </BCol>
    </BRow>
  </div>
</BCard>

          </div>

          <div v-if="campeonato.tipo === 'MATA_MATA'">
            <BRow>
              <BCol md="4">
                <BFormGroup label="Jogos por Confronto:" class="text-white">
                  <BFormSelect v-model="campeonato.turnos" class="bg-dark text-white border-secondary">
                    <option :value="1">Jogo Único</option>
                    <option :value="2">Ida e Volta</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>

              <BCol md="4">
                <BFormGroup label="Classificação p/ Próx. Fase:" class="text-white">
                  <BFormSelect v-model="campeonato.tipoClassificacao" class="bg-dark text-white border-secondary">
                    <option value="AUTOMATICA">Automática (Pts > Saldo > Manual)</option>
                    <option value="MANUAL">Sempre Manual</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>

              <BCol md="4">
                <BFormGroup label="Definição dos Confrontos:" class="text-white">
                  <BFormSelect v-model="campeonato.modoDefinicao" @change="resetarPreviews"
                    class="bg-dark text-white border-secondary">
                    <option value="AUTOMATICO">Sorteio Aleatório</option>
                    <option value="MANUAL">Escolha Manual</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>
            </BRow>
            <BAlert show variant="info" class="mt-2 py-2 small bg-dark border-info text-info">
              Nota: Selecione uma quantidade de times potência de 2 (2, 4, 8, 16...) para fechar a chave.
            </BAlert>
          </div>

          <div v-if="campeonato.tipo === 'GRUPOS'">
            <BRow>
              <BCol md="3">
                <BFormGroup label="Qtd. de Grupos:" class="text-white">
                  <BFormInput type="number" min="2" max="8" v-model.number="configGrupos.qtdGrupos"
                    @change="recalcularSlotsManuais" class="bg-dark text-white border-secondary" />
                </BFormGroup>
                <BCol md="6">
  <BFormGroup class="text-white">
    <label class="fw-bold mb-1">
      Máx. times por técnico
    </label>

    <BFormInput
      type="number"
      min="1"
      class="bg-dark text-white border-secondary mb-1"
      v-model.number="configGrupos.maxPorTecnico"
    />

    <small class="text-muted d-block text-nowrap">
      Limite de times do mesmo técnico em cada grupo. Se não for possível, o sistema permite repetição.
    </small>
  </BFormGroup>
</BCol>



              </BCol>
              <BCol md="3">
                <BFormGroup label="Turnos (Fase de Grupos):" class="text-white">
                  <BFormSelect v-model="campeonato.turnos" class="bg-dark text-white border-secondary">
                    <option :value="1">Turno Único</option>
                    <option :value="2">Ida e Volta</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>

              <BCol md="3">
                <BFormGroup label="Avançam por Grupo:" description="Quantos times vão ao mata-mata?" class="text-white">
                  <BFormInput type="number" min="1" max="4" v-model.number="configGrupos.classificadosPorGrupo"
                    class="bg-dark text-white border-secondary" />
                </BFormGroup>
              </BCol>

              <BCol md="3">
                <BFormGroup label="Definição dos Grupos:" class="text-white">
                  <BFormSelect
  v-model="campeonato.modoDefinicao"
  @change="resetarPreviews"
  class="bg-dark text-white border-secondary"
>
  <option value="TECNICOS">Sorteio (Técnicos)</option>
  <option value="MANUAL">Escolha Manual</option>
</BFormSelect>

                </BFormGroup>
              </BCol>
            </BRow>

            <BRow class="mt-3">
              <BCol md="3" v-if="campeonato.modoDefinicao === 'AUTOMATICO'">
                <BFormGroup label="Qtd. de Potes:" class="text-white">
                  <BFormInput type="number" min="1" max="4" v-model.number="configGrupos.qtdPotes"
                    @change="recalcularPotes" class="bg-dark text-white border-secondary" />
                </BFormGroup>
              </BCol>

              <BCol md="9" class="border-start border-secondary ps-4">
                <label class="text-white mb-2 fw-bold">Regra de Classificação (Pós-Grupos):</label>
                
                <div class="d-flex flex-column gap-3">
                  <div class="form-check p-2 rounded bg-secondary bg-opacity-10 border border-secondary" :class="{'border-primary': configGrupos.modoKnockout === 'PADRAO'}">
                    <input class="form-check-input" type="radio" name="modoKnockout" id="modoPadrao" value="PADRAO"
                      v-model="configGrupos.modoKnockout">
                    <label class="form-check-label text-white fw-bold" for="modoPadrao">
                      Padrão (Completar Chave)
                    </label>
                    <div class="ms-2 mt-1">
                       <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="checkRepescagem"
                            v-model="configGrupos.usarRepescagem" :disabled="configGrupos.modoKnockout !== 'PADRAO'">
                          <label class="form-check-label text-white-50 small" for="checkRepescagem">
                            Ativar Repescagem (Classificar melhores 3ºs se necessário)
                          </label>
                        </div>
                    </div>
                  </div>

                  <div class="form-check p-2 rounded bg-secondary bg-opacity-10 border border-secondary" :class="{'border-primary': configGrupos.modoKnockout === 'BYE'}">
                    <input class="form-check-input" type="radio" name="modoKnockout" id="modoBye" value="BYE"
                      v-model="configGrupos.modoKnockout">
                    <label class="form-check-label text-white fw-bold" for="modoBye">
                      Sistema "Bye" (Rodada Preliminar)
                    </label>
                    <small class="d-block text-muted ms-2 mt-1">
                      Os melhores 1º colocados folgam. Os restantes disputam um Playoff para completar a chave. Ideal para 6, 12 ou 24 classificados.
                    </small>
                  </div>
                </div>
              </BCol>
            </BRow>
          </div>
        </div>

        <BFormGroup label="Adicionar Nacionalidade no nome do time" class="mb-3">
  <div class="d-flex gap-3">
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        id="nac-nao"
        :value="false"
        v-model="campeonato.adicionarNacionalidade"
      />
      <label class="form-check-label text-white" for="nac-nao">
        Não
      </label>
    </div>

    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        id="nac-sim"
        :value="true"
        v-model="campeonato.adicionarNacionalidade"
      />
      <label class="form-check-label text-white" for="nac-sim">
        Sim
      </label>
    </div>
  </div>
</BFormGroup>

        <BFormGroup label="Filtrar clubes por país" class="mb-3">
  <BFormSelect
    v-model="filtroPais"
    :options="opcoesPais"
  />
</BFormGroup>

<h5 class="text-primary border-bottom border-secondary pb-2 mb-3">
  2. Seleção de Clubes
</h5>

<BInputGroup class="mb-3">
  <BInputGroupText class="bg-secondary text-white border-secondary">
    🔍
  </BInputGroupText>
  <BFormInput
    v-model="termoBusca"
    placeholder="Filtrar times..."
    class="bg-dark text-white border-secondary"
  />
</BInputGroup>

<div
  class="border border-secondary rounded p-3 mb-3 bg-dark"
  style="max-height: 250px; overflow-y: auto;"
>
  <div
    v-if="timesFiltradosFinal.length === 0"
    class="text-center text-muted"
  >
    Nenhum time encontrado.
  </div>

  <div v-else>
    <div
      v-for="time in timesFiltradosFinal"
      :key="time.id"
      class="d-flex align-items-center justify-content-between mb-2 px-2 py-1 hover-item text-white"
      :class="{
        'border-start border-4 border-primary bg-secondary bg-opacity-25':
          isSelecionado(time.id)
      }"
    >
      <!-- ESQUERDA -->
      <div class="d-flex align-items-center gap-2">
        <input
          type="checkbox"
          class="form-check-input bg-dark border-secondary"
          :value="time.id"
          v-model="idsSelecionados"
          @change="atualizarSelecaoTimes"
        />

        <img
          :src="time.escudo"
          style="width: 24px; height: 24px; object-fit: contain;"
        />
        <span>
  {{ time.nome }}
  <small class="text-muted ms-1">
    ({{ time.pais?.substring(0, 3).toUpperCase() }})
  </small>
</span>

      </div>

      <!-- DIREITA -->
      <select
        class="form-select form-select-sm"
        style="width: 110px"
        v-model="time.tecnico"
        @click.stop
      >
        <option value="">---</option>
        <option
          v-for="tecnico in tecnicos"
          :key="tecnico.apelido"
          :value="tecnico.apelido"
        >
          {{ tecnico.apelido }}
        </option>
      </select>
    </div>
  </div>
</div>


        <div class="d-flex justify-content-between align-items-center mb-4">
          <BBadge variant="primary" class="p-2">{{ idsSelecionados.length }} times selecionados</BBadge>
        </div>

        <div v-if="campeonato.tipo !== 'PONTOS_CORRIDOS'">
          <h5 class="text-primary border-bottom border-secondary pb-2 mb-3">3. Definição de Jogos/Grupos</h5>

          <div v-if="campeonato.tipo === 'GRUPOS' && campeonato.modoDefinicao === 'AUTOMATICO'" class="mb-4">
            <p class="small text-muted">Distribua os times nos potes para equilibrar o sorteio.</p>
            <BRow>
              <BCol v-for="(pote, index) in configGrupos.potes" :key="index" md="6" class="mb-3">
                <BCard :header="`Pote ${index + 1}`" class="h-100 bg-dark text-white border-secondary">
                  <div v-for="time in pote.times" :key="time.id"
                    class="d-flex justify-content-between align-items-center mb-1 small text-white-50">
                    <span>{{ time.nome }}</span>
                    <BButton size="sm" variant="outline-danger" class="py-0 px-1"
                      @click="removerDoPote(index, time.id)">x</BButton>
                  </div>
                  <div class="mt-2">
                    <BFormSelect size="sm" v-model="auxiliares.timeSelecionadoParaPote[index]"
                      @change="adicionarAoPote(index)" class="bg-secondary text-white border-secondary">
                      <option :value="null">Adicionar time...</option>
                      <option v-for="t in timesDisponiveisParaPote" :key="t.id" :value="t">{{ t.nome }}</option>
                    </BFormSelect>
                  </div>
                </BCard>
              </BCol>
            </BRow>
            <BButton variant="info" class="w-100 mt-2 text-white fw-bold" @click="executarSorteioGrupos">
              🎲 Sortear Grupos Agora
            </BButton>
          </div>

          <div v-if="campeonato.tipo === 'GRUPOS' && campeonato.modoDefinicao === 'MANUAL'" class="mb-4">
            <BRow>
              <BCol v-for="(grupo, index) in configGrupos.gruposManuais" :key="index" md="6" class="mb-3">
                <BCard :header="`Grupo ${String.fromCharCode(65 + index)}`"
                  class="h-100 bg-dark text-white border-secondary">
                  <div v-for="time in grupo.times" :key="time.id"
                    class="d-flex justify-content-between align-items-center mb-1 small text-white-50">
                    <span>{{ time.nome }}</span>
                    <BButton size="sm" variant="outline-danger" class="py-0 px-1"
                      @click="removerDoGrupoManual(index, time.id)">x</BButton>
                  </div>
                  <div class="mt-2">
                    <BFormSelect size="sm" v-model="auxiliares.timeSelecionadoParaGrupo[index]"
                      @change="adicionarAoGrupoManual(index)" class="bg-secondary text-white border-secondary">
                      <option :value="null">Adicionar time...</option>
                      <option v-for="t in timesDisponiveisParaGrupo" :key="t.id" :value="t">{{ t.nome }}</option>
                    </BFormSelect>
                  </div>
                </BCard>
              </BCol>
            </BRow>
            <BButton variant="success" class="w-100 mt-2" @click="confirmarGruposManuais"
              :disabled="!todosTimesAlocadosEmGrupos">
              ✔ Confirmar Grupos
            </BButton>
          </div>

          <div v-if="campeonato.tipo === 'MATA_MATA'" class="mb-4">
            <div v-if="campeonato.modoDefinicao === 'AUTOMATICO'">
              <BButton variant="info" class="w-100 text-white fw-bold" @click="executarSorteioMataMata">
                🎲 Sortear Confrontos Aleatoriamente
              </BButton>
            </div>
            <div v-else>
              <p class="small text-muted">Defina quem enfrenta quem na primeira fase.</p>
              <div v-for="(confronto, idx) in auxiliares.confrontosManuais" :key="idx"
                class="d-flex align-items-center justify-content-center mb-2 gap-2 p-2 rounded bg-secondary bg-opacity-10 border border-secondary">
                <strong class="me-2 text-white">#{{ idx + 1 }}</strong>
                <BFormSelect size="sm" v-model="confronto.timeA" style="max-width: 200px;"
                  class="bg-dark text-white border-secondary">
                  <option :value="null">Selecione...</option>
                  <option v-for="t in getTimesDisponiveisConfronto(confronto.timeA)" :key="t.id" :value="t">{{ t.nome }}
                  </option>
                </BFormSelect>
                <span class="badge bg-secondary">vs</span>
                <BFormSelect size="sm" v-model="confronto.timeB" style="max-width: 200px;"
                  class="bg-dark text-white border-secondary">
                  <option :value="null">Selecione...</option>
                  <option v-for="t in getTimesDisponiveisConfronto(confronto.timeB)" :key="t.id" :value="t">{{ t.nome }}
                  </option>
                </BFormSelect>
              </div>
              <BButton variant="success" class="w-100 mt-2" @click="confirmarMataMataManual"
                :disabled="!todosConfrontosPreenchidos">
                ✔ Confirmar Confrontos
              </BButton>
            </div>
          </div>

          <div v-if="previewJogos.length > 0 || previewGrupos.length > 0"
            class="border border-success rounded p-3 mt-3 bg-secondary bg-opacity-10">
            <h6 class="text-success text-center border-bottom border-success pb-2 mb-3">✅ Prévia Gerada</h6>

            <div v-if="campeonato.tipo === 'MATA_MATA'">
              <div v-for="(jogo, i) in previewJogosApenasIda" :key="i"
                class="d-flex justify-content-center align-items-center mb-2 border-bottom border-secondary pb-1 small text-white">
                <img :src="jogo.timeA.escudo" width="20" class="me-2" />
<span class="fw-bold">
  {{ formatarNomeTime(jogo.timeA) }}
</span>

<span class="mx-3 badge border border-secondary">vs</span>

<span class="fw-bold">
  {{ formatarNomeTime(jogo.timeB) }}
</span>
<img :src="jogo.timeB.escudo" width="20" class="ms-2" />

              </div>
            </div>

            <div v-if="campeonato.tipo === 'GRUPOS'">
              <BRow>
                <BCol v-for="(grupo, idx) in previewGrupos" :key="idx" md="6" class="mb-3">
                  <div class="border border-secondary rounded p-2 h-100 bg-dark text-white">
                    <strong class="text-primary">{{ grupo.nome }}</strong>
                    <ul class="list-unstyled mb-0 ms-2 small mt-2">
                      <li v-for="t in grupo.times" :key="t.id"
                        class="border-bottom border-secondary py-1 text-white-50">
                        <img :src="t.escudo" width="15" class="me-1" /> {{ t.nome }}
                      </li>
                    </ul>
                  </div>
                </BCol>
              </BRow>
              <BAlert show variant="warning" class="mt-2 small text-center bg-dark border-warning text-warning"
                v-if="configGrupos.classificadosPorGrupo">
                Os <strong>{{ configGrupos.classificadosPorGrupo }}</strong> melhores de cada grupo avançam direto.
                <span v-if="configGrupos.modoKnockout === 'PADRAO' && configGrupos.usarRepescagem"><br>+ Melhores não-classificados para fechar a chave (Repescagem).</span>
                <span v-if="configGrupos.modoKnockout === 'BYE'"><br>Sistema BYE ativo: Melhores folgam, restantes jogam preliminar.</span>
              </BAlert>
            </div>
          </div>
        </div>

        <div class="mt-4 d-grid gap-2">
          <BButton type="submit" variant="success" size="lg">
            Salvar Campeonato
          </BButton>
        </div>

      </BForm>
    </BCard>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { gerarJogosGrupos, gerarJogosMataMata } from '../utils/GeradorTabela.js';

import {
  BCard, BForm, BFormGroup, BFormInput, BFormSelect,
  BRow, BCol, BButton, BBadge, BInputGroup, BInputGroupText, BAlert
} from 'bootstrap-vue-next';

export default {
  name: 'CadastroCampeonato',
  components: {
    BCard, BForm, BFormGroup, BFormInput, BFormSelect,
    BRow, BCol, BButton, BBadge, BInputGroup, BInputGroupText, BAlert
  },
  data() {
    return {
      carregando: true,
      termoBusca: '',
      todosOsTimes: [],
      idsSelecionados: [],
      filtroPais: '',

      campeonato: {
        nome: '',
        tipo: 'PONTOS_CORRIDOS',
        turnos: 1,
        tipoClassificacao: 'AUTOMATICA',
        modoDefinicao: 'AUTOMATICO',
        adicionarNacionalidade: false,
        classificadosParaMataMata: null,
        turnosMataMata: 1
      },

      configGrupos: {
  qtdGrupos: 2,
  qtdPotes: 2,
  classificadosPorGrupo: 2,
  usarRepescagem: false,
  modoKnockout: 'PADRAO',
  maxTimesPorTecnico: 1, // 👈 NOVO
  potes: [{ times: [] }, { times: [] }],
  gruposManuais: []
},


      auxiliares: {
        timeSelecionadoParaPote: [null, null, null, null],
        timeSelecionadoParaGrupo: [null, null, null, null, null, null, null, null],
        confrontosManuais: []
      },

      previewJogos: [],
      previewGrupos: [],
      tecnicos: [],
    }
  },
    computed: {

  opcoesPais() {
  const lista = this.todosOsTimes || [];

  if (lista.length === 0) {
    return [{ value: '', text: 'Todos os países' }];
  }

  const paisesUnicos = [...new Set(lista.map(t => t.pais).filter(Boolean))];

  return [
    { value: '', text: 'Todos os países' },
    ...paisesUnicos.map(pais => ({
      value: pais,
      text: pais
    }))
  ];
},


    timesParaExibir() {
      if (!this.termoBusca) return this.todosOsTimes;
      const termo = this.termoBusca.toLowerCase();
      return this.todosOsTimes.filter(t => t.nome.toLowerCase().includes(termo));
    },
    timesSelecionadosObj() {
  return this.todosOsTimes
    .filter(t => this.idsSelecionados.includes(t.id))
    .map(t => ({
  ...t,
  pais: t.pais || '',
  tecnico: t.tecnico || 'SEM_TECNICO'
}));

},

    timesDisponiveisParaPote() {
      const timesEmPotes = this.configGrupos.potes.flatMap(p => p.times.map(t => t.id));
      return this.timesSelecionadosObj.filter(t => !timesEmPotes.includes(t.id));
    },
    timesDisponiveisParaGrupo() {
      const timesEmGrupos = this.configGrupos.gruposManuais.flatMap(g => g.times.map(t => t.id));
      return this.timesSelecionadosObj.filter(t => !timesEmGrupos.includes(t.id));
    },
    todosTimesAlocadosEmGrupos() {
      const totalAlocados = this.configGrupos.gruposManuais.reduce((acc, g) => acc + g.times.length, 0);
      return totalAlocados === this.idsSelecionados.length && this.idsSelecionados.length > 0;
    },
    todosConfrontosPreenchidos() {
      if (this.auxiliares.confrontosManuais.length === 0) return false;
      return this.auxiliares.confrontosManuais.every(c => c.timeA && c.timeB);
    },
    previewJogosApenasIda() {
      return this.previewJogos.filter(j => j.turno === 1);
    },
     
    timesFiltradosFinal() {
      let lista = this.timesParaExibir;
      if (this.filtroPais) {
      lista = lista.filter(t => t.pais === this.filtroPais);
    }

  return lista;
}




  },
  async mounted() {

    
    await this.carregarTimes();
    const salvos = localStorage.getItem("tecnicos");
    this.tecnicos = salvos ? JSON.parse(salvos) : [];

  },
  methods: {

    formatarNomeTime(time) {
  if (!time) return '';

  const partes = [];

  // Técnico
  if (time.tecnico) {
    partes.push(time.tecnico);
  }

  // País (só se a flag estiver ligada)
  if (this.campeonato.adicionarNacionalidade === true && time.pais) {
    partes.push(time.pais.substring(0, 3).toUpperCase());
  }

  // Nome do time
  partes.push(time.nome);

  return partes.join(' ');
},


    async carregarTimes() {
      try {
        this.todosOsTimes = await DbService.getTimes();
      } catch (error) { console.error(error); }
      finally { this.carregando = false; }
    },
     
    // 🔹 NOVO MÉTODO — AGRUPA TIMES POR TÉCNICO
  agruparTimesPorTecnico(times) {
    const mapa = {};

    times.forEach(time => {
      const tecnico = time.tecnico || 'SEM_TECNICO';

      if (!mapa[tecnico]) {
        mapa[tecnico] = [];
      }

      mapa[tecnico].push(time);
    });

    return mapa;
  },

    isSelecionado(id) {
      return this.idsSelecionados.includes(id);
    },
    resetarConfiguracoesEspecificas() {
      this.resetarPreviews();
      this.configGrupos = {
        qtdGrupos: 2, qtdPotes: 2, classificadosPorGrupo: 2,
        usarRepescagem: false,
        modoKnockout: 'PADRAO',
        potes: [{ times: [] }, { times: [] }],
        gruposManuais: []
      };
    },
    resetarPreviews() {
      this.previewJogos = [];
      this.previewGrupos = [];
      this.recalcularSlotsManuais();
    },
    atualizarSelecaoTimes() {
      this.atualizarPotesSeNecessario();
      this.recalcularSlotsManuais();
    },
    recalcularPotes() {
      const novaQtd = this.configGrupos.qtdPotes;
      while (this.configGrupos.potes.length < novaQtd) this.configGrupos.potes.push({ times: [] });
      while (this.configGrupos.potes.length > novaQtd) this.configGrupos.potes.pop();
    },
    atualizarPotesSeNecessario() {
      this.configGrupos.potes.forEach(pote => {
        pote.times = pote.times.filter(t => this.idsSelecionados.includes(t.id));
      });
      this.configGrupos.gruposManuais.forEach(grupo => {
        grupo.times = grupo.times.filter(t => this.idsSelecionados.includes(t.id));
      });
    },
    adicionarAoPote(indexPote) {
      const time = this.auxiliares.timeSelecionadoParaPote[indexPote];
      if (time) {
        this.configGrupos.potes[indexPote].times.push(time);
        this.auxiliares.timeSelecionadoParaPote[indexPote] = null;
      }
    },
    removerDoPote(indexPote, timeId) {
      this.configGrupos.potes[indexPote].times = this.configGrupos.potes[indexPote].times.filter(t => t.id !== timeId);
    },
    recalcularSlotsManuais() {
      if (this.campeonato.tipo === 'GRUPOS' && this.campeonato.modoDefinicao === 'MANUAL') {
        const qtd = this.configGrupos.qtdGrupos;
        while (this.configGrupos.gruposManuais.length < qtd) this.configGrupos.gruposManuais.push({ times: [] });
        while (this.configGrupos.gruposManuais.length > qtd) this.configGrupos.gruposManuais.pop();
      }
      if (this.campeonato.tipo === 'MATA_MATA' && this.campeonato.modoDefinicao === 'MANUAL') {
        const qtdTimes = this.idsSelecionados.length;
        const qtdConfrontos = Math.floor(qtdTimes / 2);
        if (this.auxiliares.confrontosManuais.length !== qtdConfrontos) {
          this.auxiliares.confrontosManuais = Array.from({ length: qtdConfrontos }, () => ({ timeA: null, timeB: null }));
        }
      }
    },
    adicionarAoGrupoManual(index) {
      const time = this.auxiliares.timeSelecionadoParaGrupo[index];
      if (time) {
        this.configGrupos.gruposManuais[index].times.push(time);
        this.auxiliares.timeSelecionadoParaGrupo[index] = null;
      }
    },
    removerDoGrupoManual(index, timeId) {
      this.configGrupos.gruposManuais[index].times = this.configGrupos.gruposManuais[index].times.filter(t => t.id !== timeId);
    },
    getTimesDisponiveisConfronto(timeAtualNoSelect) {
      const timesUsados = this.auxiliares.confrontosManuais.flatMap(c => [c.timeA?.id, c.timeB?.id]).filter(Boolean);
      return this.timesSelecionadosObj.filter(t => !timesUsados.includes(t.id) || t.id === timeAtualNoSelect?.id);
    },

    executarSorteioGrupos() {
  const times = [...this.timesSelecionadosObj];
  const qtdGrupos = this.configGrupos.qtdGrupos;
  const maxPorTecnico = this.configGrupos.maxTimesPorTecnico || 1;

  const timesPorGrupo = Math.ceil(times.length / qtdGrupos);

  // 1️⃣ Agrupa por técnico
  const porTecnico = {};
  times.forEach(time => {
    const tec = time.tecnico || 'SEM_TECNICO';
    if (!porTecnico[tec]) porTecnico[tec] = [];
    porTecnico[tec].push(time);
  });

  // embaralha times de cada técnico
  Object.values(porTecnico).forEach(lista =>
    lista.sort(() => Math.random() - 0.5)
  );

  // 2️⃣ Cria grupos
  const grupos = Array.from({ length: qtdGrupos }, (_, i) => ({
    nome: `Grupo ${String.fromCharCode(65 + i)}`,
    times: []
  }));

  // 3️⃣ Contador de técnicos por grupo
  const contadorTecnicoGrupo = Array.from(
    { length: qtdGrupos },
    () => ({})
  );

  let aindaTemTimes = true;

  // 4️⃣ Distribuição controlada
  while (aindaTemTimes) {
    aindaTemTimes = false;

    for (let g = 0; g < grupos.length; g++) {
      if (grupos[g].times.length >= timesPorGrupo) continue;

      // tenta técnico que ainda não estourou limite
      let tecnicoEscolhido = Object.keys(porTecnico).find(t => {
        const qtdNoGrupo = contadorTecnicoGrupo[g][t] || 0;
        return porTecnico[t].length > 0 && qtdNoGrupo < maxPorTecnico;
      });

      // fallback absoluto
      if (!tecnicoEscolhido) {
        tecnicoEscolhido = Object.keys(porTecnico).find(
          t => porTecnico[t].length > 0
        );
      }

      if (tecnicoEscolhido) {
        const time = porTecnico[tecnicoEscolhido].shift();
        grupos[g].times.push(time);

        contadorTecnicoGrupo[g][tecnicoEscolhido] =
          (contadorTecnicoGrupo[g][tecnicoEscolhido] || 0) + 1;

        aindaTemTimes = true;
      }
    }
  }

  // 5️⃣ Preview
  this.previewGrupos = grupos;
  this.previewJogos = gerarJogosGrupos(grupos, this.campeonato.turnos);
  // 6️⃣ VERIFICA VIOLAÇÃO DE LIMITE POR TÉCNICO
const violacoes = [];

this.previewGrupos.forEach(grupo => {
  const mapa = {};

  grupo.times.forEach(t => {
    const tecnico = t.tecnico || 'SEM_TECNICO';
    mapa[tecnico] = (mapa[tecnico] || 0) + 1;
  });

  Object.entries(mapa).forEach(([tecnico, qtd]) => {
    if (qtd > this.configGrupos.maxTimesPorTecnico) {
      violacoes.push(
        `${grupo.nome}: ${tecnico} (${qtd} times)`
      );
    }
  });
});

if (violacoes.length) {
  alert(
    '⚠️ Não foi possível respeitar totalmente o limite por técnico:\n\n' +
    violacoes.join('\n')
  );
}

},




    confirmarGruposManuais() {
      const gruposTemp = this.configGrupos.gruposManuais.map((g, i) => ({
        nome: `Grupo ${String.fromCharCode(65 + i)}`,
        times: g.times
      }));
      this.previewGrupos = gruposTemp;
      this.previewJogos = gerarJogosGrupos(gruposTemp, this.campeonato.turnos);
    },

    executarSorteioMataMata() {
      const times = [...this.timesSelecionadosObj];
      if (times.length % 2 !== 0) {
        alert("Para Mata-Mata, selecione uma quantidade par de times!");
        return;
      }
      times.sort(() => Math.random() - 0.5);
      this.previewJogos = gerarJogosMataMata(times, this.campeonato.turnos);
    },

    confirmarMataMataManual() {
      const timesOrdenados = [];
      this.auxiliares.confrontosManuais.forEach(c => {
        timesOrdenados.push(c.timeA);
        timesOrdenados.push(c.timeB);
      });
      this.previewJogos = gerarJogosMataMata(timesOrdenados, this.campeonato.turnos);
    },

    async salvarCampeonato() {

      // garante flag de nacionalidade

      const erros = [];

      // 🔹 SORTEIO AUTOMÁTICO PARA GRUPOS POR TÉCNICO
if (
  this.campeonato.tipo === 'GRUPOS' &&
  this.campeonato.modoDefinicao === 'TECNICOS' &&
  this.previewGrupos.length === 0
) {
  this.executarSorteioGrupos();
}


      if (!this.campeonato.nome) erros.push("Nome do Torneio");
      if (this.idsSelecionados.length < 2) erros.push("Selecione pelo menos 2 times");

      if (this.campeonato.tipo !== 'PONTOS_CORRIDOS') {
        if (this.campeonato.tipo === 'GRUPOS' && this.previewGrupos.length === 0) {
          erros.push("Defina os grupos (Sorteie ou Confirme a escolha manual)");
        }
        if (this.campeonato.tipo === 'MATA_MATA' && this.previewJogos.length === 0) {
          erros.push("Defina os confrontos (Sorteie ou Confirme a escolha manual)");
        }
      }

      if (erros.length > 0) {
        alert("Atenção! Resolva os seguintes itens antes de salvar:\n\n- " + erros.join("\n- "));
        return;
      }

      // 🔧 FIXA TÉCNICO E PAÍS NOS JOGOS (dados internos do campeonato)
this.previewJogos = this.previewJogos.map(jogo => ({
  ...jogo,
  timeA: {
    ...jogo.timeA,
    tecnico: jogo.timeA?.tecnico || '',
    pais: jogo.timeA?.pais || ''
  },
  timeB: {
    ...jogo.timeB,
    tecnico: jogo.timeB?.tecnico || '',
    pais: jogo.timeB?.pais || ''
  }
}));


      const timesComPais = this.timesSelecionadosObj.map(t => ({
  ...t,
  pais: t.pais || ''
}));

const dados = {
  id: Date.now(),
  nome: this.campeonato.nome,
  tipo: this.campeonato.tipo,
  turnos: this.campeonato.turnos,
  tipoClassificacao: this.campeonato.tipoClassificacao,
  modoDefinicao: this.campeonato.modoDefinicao,
  status: 'EM_ANDAMENTO',

  // ✅ SALVA DE VERDADE
  adicionarNacionalidade: this.campeonato.adicionarNacionalidade === true,

  // ✅ AQUI ESTÁ O CAMPO QUE FALTAVA
  classificadosParaMataMata:
    this.campeonato.tipo === 'PONTOS_CORRIDOS'
      ? Number(this.campeonato.classificadosParaMataMata) || null
      : null,

  // 🔥 LIMPA COMPLETAMENTE COISAS DE GRUPO
  classificadosPorGrupo:
  this.campeonato.tipo === 'GRUPOS'
    ? this.configGrupos.classificadosPorGrupo
    : null,

usarRepescagem:
  this.campeonato.tipo === 'GRUPOS'
    ? this.configGrupos.usarRepescagem
    : false,

modoKnockout:
  this.campeonato.tipo === 'GRUPOS'
    ? this.configGrupos.modoKnockout
    : null,

grupos:
  this.campeonato.tipo === 'GRUPOS'
    ? this.previewGrupos
    : [],

// ⚽ jogos
jogos:
  this.campeonato.tipo === 'PONTOS_CORRIDOS'
    ? []
    : this.previewJogos,


  times: this.timesSelecionadosObj.map(t => ({
    ...t,
    tecnico: t.tecnico || '',
    pais: t.pais || null
  })),

  dataCriacao: new Date().toISOString()
};





      try {
        this.carregando = true;
        await DbService.adicionarCampeonato(JSON.parse(JSON.stringify(dados)));
        alert(`Campeonato "${this.campeonato.nome}" criado com sucesso!`);
        this.idsSelecionados = [];
        this.campeonato.nome = '';
        this.resetarConfiguracoesEspecificas();
      } catch (error) {
        console.error(error);
        alert("Erro ao criar campeonato.");
      } finally {
        this.carregando = false;
      }
    }
    
  }
}
</script>

<style scoped>
.hover-item:hover {
  background-color: #232530;
}
</style>