<template>
    <div class="container mt-4">

        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Carregando..." />
        </div>

        <div v-else-if="!campeonato">
            <BAlert show variant="danger">Campeonato não encontrado.</BAlert>
            <BButton @click="$router.push('/lista-campeonatos')">Voltar</BButton>
        </div>

        <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div style="flex-grow: 1;">
                    <div v-if="!editandoNome" @dblclick="ativarEdicaoNome" class="cursor-pointer"
                        title="Duplo clique para editar nome">
                        <h2 class="text-primary fw-bold mb-0">
                            {{ campeonato.nome }}
                            <span class="fs-6 text-muted ms-2 opacity-50 d-none d-md-inline-block">✎</span>
                            <BBadge v-if="campeonato.status === 'ENCERRADO'" variant="dark" class="ms-2 fs-6">🏆
                                ENCERRADO</BBadge>
                        </h2>
                        <span class="text-muted small">
                            {{ campeonato.timesParticipantes.length }} Times • {{ totalRodadas }} Rodadas
                        </span>
                    </div>

                    <div v-else class="d-flex align-items-center gap-2">
                        <BFormInput v-model="nomeTemp" size="lg" class="fw-bold text-primary" style="max-width: 400px;"
                            @keyup.enter="salvarNome" auto-focus />
                        <BButton size="sm" variant="success" @click="salvarNome">✔</BButton>
                        <BButton size="sm" variant="outline-secondary" @click="cancelarEdicaoNome">✖</BButton>
                    </div>
                </div>

                <div class="d-flex gap-2 ms-3">
                    <BButton variant="outline-secondary" @click="$router.push('/lista-campeonatos')">
                        Voltar
                    </BButton>
                    <BButton v-if="campeonato.status === 'ENCERRADO'" variant="outline-warning"
                        @click="$router.push(`/campeonato/${campeonato.id}/imprimir`)" title="Gerar PDF">
                        🖨️ Imprimir
                    </BButton>
                    
<!-- BOTÃO: ENCERRAR CAMPEONATO -->
<!-- GERAR MATA-MATA DA LIGA -->
<BButton
  v-if="podeEncerrarLigaComMataMata"
  variant="warning"
  class="fw-bold me-2"
  @click="gerarMataMataDaLiga"
>
  🏁 Gerar Mata-Mata
</BButton>

<!-- ENCERRAR CAMPEONATO -->
<BButton
  v-if="podeEncerrarCampeonato"
  variant="dark"
  class="text-warning fw-bold border-warning"
  @click="encerrarCampeonato"
>
  🏆 Encerrar Campeonato
</BButton>

                    <BButton v-if="podeEncerrarFase" variant="success" @click="abrirModalEncerramento">
                        Encerrar Fase 🏁
                    </BButton>
                    <BButton v-if="podeEncerrarGrupos" variant="warning" @click="confirmarFimGrupos">
                        Encerrar Grupos ⏭️
                    </BButton>
                    <BButton variant="primary" @click="$router.push(`/campeonato/${campeonato.id}/classificacao`)">
                        Ver Tabela 📊
                    </BButton>
                    <BButton variant="outline-primary" @click="$router.push(`/campeonato/${campeonato.id}/artilharia`)">
                        Artilharia ⚽
                    </BButton>
                </div>
            </div>

            <BCard class="shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="m-0">
  <span v-if="typeof paginaAtual === 'string'">
    RODADAS – GRUPO {{ paginaAtual }}
  </span>

  <span v-else>
    Rodada {{ rodadaAtual }}
  </span>

  <span v-if="nomeFaseAtual" class="badge bg-info fs-6 ms-2">
    {{ nomeFaseAtual }}
  </span>
</h4>

                    <div class="d-flex justify-content-center align-items-center flex-wrap gap-1 my-2">
  <!-- SETA ESQUERDA -->
  <button
    class="btn btn-sm btn-outline-secondary"
    :disabled="paginaAtual <= paginasAtuais[0]"
    @click="irParaPagina(paginaAtual - 1)"
  >
    ‹
  </button>

  <!-- BOTÕES NUMÉRICOS / GRUPOS -->
  <button
    v-for="p in paginasAtuais"
    :key="p"
    class="btn btn-sm"
    :class="p === paginaAtual ? 'btn-primary' : 'btn-outline-secondary'"
    @click="irParaPagina(p)"
  >
    {{ p }}
  </button>

  <!-- SETA DIREITA -->
  <button
    class="btn btn-sm btn-outline-secondary"
    :disabled="paginaAtual >= paginasAtuais[paginasAtuais.length - 1]"
    @click="irParaPagina(paginaAtual + 1)"
  >
    ›
  </button>
</div>

                </div>
                <hr />
                <div class="lista-jogos">
                    <div v-if="jogosDaRodada.length === 0" class="text-center text-muted py-3">
                        Nenhum jogo nesta rodada.
                    </div>

                    <div v-for="jogo in jogosDaRodada" :key="jogo.id"
                        class="jogo-row py-3 border-bottom align-items-center">
                        <BRow class="w-100 m-0 align-items-center">
                            <BCol cols="4" md="4" class="text-end px-1">
                                <div class="d-flex align-items-center justify-content-end gap-2">
                                  <div class="d-flex align-items-center gap-2 text-truncate">

  <span
    v-if="getTimeCompleto(jogo.timeA)?.tecnico"
    class="tecnico-label"
  >
    {{ getTimeCompleto(jogo.timeA).tecnico }}
  </span>

  <span
    v-if="campeonato.adicionarNacionalidade && getTimeCompleto(jogo.timeA)?.pais"
    class="pais-label"
  >
    {{ getTimeCompleto(jogo.timeA).pais.substring(0,3).toUpperCase() }}
  </span>

  <img
    :src="getTimeCompleto(jogo.timeA).escudo"
    style="width: 26px; height: 26px; object-fit: contain"
    onerror="this.style.display='none'"
  />

  <span class="fw-bold">
    {{ getTimeCompleto(jogo.timeA).nome }}
  </span>

</div>




                                    <span class="fw-bold d-md-none">{{ getSigla(jogo.timeA) }}</span>
                                
                                </div>
                                <div class="mt-1 text-muted small lh-1 text-truncate" style="font-size: 0.7rem;">
                                    <span v-for="(autor, idx) in getAutoresGols(jogo, jogo.timeA.id)" :key="idx"
                                        class="d-block">{{ autor }} ⚽</span>
                                </div>
                            </BCol>
                            <BCol cols="4" md="2" class="px-0">
    <div class="d-flex flex-column align-items-center">

        <!-- Placar -->
        <div class="d-flex justify-content-center align-items-center gap-1">
            <BFormInput type="number" v-model.number="jogo.golsA"
                class="text-center p-0 m-0 fw-bold" style="width: 40px; height: 35px;"
                :class="{ 'border-success': jogo.finalizado }"
                :disabled="campeonato.status === 'ENCERRADO'" />
            <span class="fw-bold text-muted mx-1">X</span>
            <BFormInput type="number" v-model.number="jogo.golsB"
                class="text-center p-0 m-0 fw-bold" style="width: 40px; height: 35px;"
                :class="{ 'border-success': jogo.finalizado }"
                :disabled="campeonato.status === 'ENCERRADO'" />
        </div>

        <!-- Estádio -->
        <div class="text-center text-muted small mt-1 text-truncate"
            style="font-size: 0.65rem;">
            🏟️ {{ getEstadio(jogo.timeA.id) }}
        </div>

        <!-- Pênaltis -->
<div
    v-if="
        jogo.golsA !== null &&
        jogo.golsB !== null &&
        jogo.golsA === jogo.golsB &&
        (campeonato.tipo === 'MATA_MATA' || nomeFaseAtual)
    "
    class="d-flex flex-column align-items-center mt-1 w-100"
>
    <!-- Inputs -->
    <div class="d-flex justify-content-center align-items-center gap-2">
        <BFormInput
            type="number"
            min="0"
            v-model.number="jogo.penaltisA"
            class="text-center p-0 m-0"
            style="width: 35px; height: 28px;"
            :disabled="campeonato.status === 'ENCERRADO'"
        />

        <span class="text-muted">x</span>

        <BFormInput
            type="number"
            min="0"
            v-model.number="jogo.penaltisB"
            class="text-center p-0 m-0"
            style="width: 35px; height: 28px;"
            :disabled="campeonato.status === 'ENCERRADO'"
        />
    </div>

    <!-- TEXTO ABAIXO (como no desenho) -->
    <div class="text-muted small mt-1" style="font-size: 0.65rem;">
        Pênaltis
    </div>
</div>


    </div>
</BCol>

                            <BCol cols="4" md="4" class="text-start px-1">
                                <div class="d-flex align-items-center justify-content-start gap-2">
                                    
                                    <div class="d-flex align-items-center gap-2 text-truncate">

  <span class="fw-bold">
    {{ getTimeCompleto(jogo.timeB).nome }}
  </span>

  <img
    :src="getTimeCompleto(jogo.timeB).escudo"
    style="width: 26px; height: 26px; object-fit: contain"
    onerror="this.style.display='none'"
  />

  <span
    v-if="campeonato.adicionarNacionalidade && getTimeCompleto(jogo.timeB)?.pais"
    class="pais-label"
  >
    {{ getTimeCompleto(jogo.timeB).pais.substring(0,3).toUpperCase() }}
  </span>

  <span
    v-if="getTimeCompleto(jogo.timeB)?.tecnico"
    class="tecnico-label"
  >
    {{ getTimeCompleto(jogo.timeB).tecnico }}
  </span>

</div>


                                    <span class="fw-bold d-md-none">{{ getSigla(jogo.timeB) }}</span>
                                </div>
                                <div class="mt-1 text-muted small lh-1 text-truncate" style="font-size: 0.7rem;">
                                    <span v-for="(autor, idx) in getAutoresGols(jogo, jogo.timeB.id)" :key="idx"
                                        class="d-block">⚽ {{ autor }}</span>
                                </div>
                            </BCol>
                            <BCol cols="12" md="2" class="text-center text-md-end mt-2 mt-md-0 px-1">
                                <div class="d-flex justify-content-center justify-content-md-end gap-1">
                                    <BButton size="sm" :variant="jogo.finalizado ? 'success' : 'outline-primary'"
                                        class="py-1 px-2" title="Salvar Resultado" @click="salvarPlacar(jogo)"
                                        :disabled="campeonato.status === 'ENCERRADO'">
                                        <span v-if="jogo.finalizado">✔</span>
                                        <span v-else>💾</span>
                                    </BButton>
                                    <BButton size="sm" variant="outline-secondary" class="py-1 px-2"
                                        title="Súmula / Detalhes" @click="irParaSumula(jogo)">
                                        📝
                                    </BButton>
                                </div>
                            </BCol>
                        </BRow>
                    </div>
                </div>
            </BCard>
        </div>

        <BModal v-model="modalEncerramentoAberto" title="Definir Classificados" size="lg" hide-footer>
            <div class="p-2">
                <BAlert show variant="info" class="small">
                    Confira os vencedores. Em caso de empate, selecione quem avança.
                </BAlert>
                <div v-for="confronto in confrontosEncerramento" :key="confronto.id"
                    class="border rounded p-3 mb-3 bg-dark">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-muted small">Confronto #{{ confronto.id }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-center" style="width: 30%;">
                            <span class="d-block fw-bold">{{ confronto.timeA.nome }}</span>
                            <div class="badge bg-secondary">Total: {{ confronto.placarA }}</div>
                        </div>
                        <div class="text-center" style="width: 40%;">
                            <span class="small text-muted d-block mb-1">Quem avança?</span>
                            <BFormSelect v-model="confronto.vencedorId" :options="opcoesVencedor(confronto)"
                                :class="{ 'border-danger': !confronto.vencedorId }" />
                        </div>
                        <div class="text-center" style="width: 30%;">
                            <span class="d-block fw-bold">{{ confronto.timeB.nome }}</span>
                            <div class="badge bg-secondary">Total: {{ confronto.placarB }}</div>
                        </div>
                    </div>
                </div>
                <div class="d-grid gap-2 mt-4">
                    <BButton variant="success" size="lg" @click="confirmarAvancoFase">
                        Confirmar e Gerar Próxima Fase
                    </BButton>
                </div>
            </div>
        </BModal>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import {
    gerarJogosComByeSystem
} from '../utils/GeradorTabela.js';

import {
    BCard, BButton, BSpinner, BPagination, BRow, BCol, BFormInput, BAlert, BModal, BFormSelect, BBadge
} from 'bootstrap-vue-next';

export default {
    name: 'DetalhesCampeonato',
    components: {
        BCard, BButton, BSpinner, BPagination, BRow, BCol, BFormInput, BAlert, BModal, BFormSelect, BBadge
    },
    data() {
  return {
    carregando: true,
    campeonato: null,
    rodadaAtual: 1,
    paginaAtual: null,
    id: '',
    editandoNome: false,
    nomeTemp: '',
    modalEncerramentoAberto: false,
    confrontosEncerramento: [],

    // 👇 ADICIONAR ISSO AQUI
    paginacaoCores: {
      liga: {
        borda: '#ffffff',
        texto: '#ffffff',
        fundoAtivo: '#ffffff',
        textoAtivo: '#000000'
      },
      mata: {
        borda: '#00c853', // verde
        texto: '#00c853',
        fundoAtivo: '#00c853',
        textoAtivo: '#002b12'
      },
      final: {
        borda: '#ffd600', // amarelo
        texto: '#ffd600',
        fundoAtivo: '#ffd600',
        textoAtivo: '#3a2f00'
      }
    }
  }
},

    computed: {

        paginasAtuais() {
  // se NÃO for grupo, mantém como está hoje
  const temGrupo = this.campeonato.jogos.some(j => j.grupo);

  if (!temGrupo) {
    return Array.from({ length: this.totalRodadas }, (_, i) => i + 1);
  }

  // fase de grupos → páginas por grupo
  const grupos = new Set(
    this.campeonato.jogos
      .filter(j => j.grupo)
      .map(j => j.grupo)
  );

  return Array.from(grupos).sort(); // ['A','B','C'...]
},


        podeEncerrarGrupos() {
  if (!this.campeonato) return false;
  if (this.campeonato.status === 'ENCERRADO') return false;

  // só vale para campeonatos de GRUPOS
  if (this.campeonato.tipo !== 'GRUPOS') return false;

  const jogos = this.campeonato.jogos || [];
  if (jogos.length === 0) return false;

  // ❌ se já entrou no mata-mata, NÃO mostra
  const jaTemMataMata = jogos.some(j => j.fase);
  if (jaTemMataMata) return false;

  // 🔥 NOVO: só mostrar enquanto a rodada atual AINDA É DE GRUPO
  // se existir nome de fase atual (Semi, Quartas, Final etc), some
  if (this.nomeFaseAtual) return false;

  // todos os jogos de grupos precisam estar finalizados
  return jogos.every(j => j.finalizado === true);
},


        tabelaBase() {
  if (!this.campeonato || !this.campeonato.jogos) return [];

  const stats = {};

  // inicializa times
  this.campeonato.timesParticipantes.forEach(t => {
    stats[t.id] = {
      ...t,
      pontos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      saldoGols: 0
    };
  });

  // percorre jogos
  this.campeonato.jogos.forEach(j => {
    if (!j.finalizado) return;

    const A = stats[j.timeA.id];
    const B = stats[j.timeB.id];

    A.golsPro += j.golsA;
    A.golsContra += j.golsB;
    B.golsPro += j.golsB;
    B.golsContra += j.golsA;

    if (j.golsA > j.golsB) {
      A.pontos += 3;
      A.vitorias++;
      B.derrotas++;
    } else if (j.golsB > j.golsA) {
      B.pontos += 3;
      B.vitorias++;
      A.derrotas++;
    } else {
      A.pontos++;
      B.pontos++;
      A.empates++;
      B.empates++;
    }
  });

  Object.values(stats).forEach(t => {
    t.saldoGols = t.golsPro - t.golsContra;
  });

  return Object.values(stats);
},

 
  temMataMataDepois() {
  if (!this.campeonato) return false;

  return (
    this.campeonato.tipo === 'PONTOS_CORRIDOS' &&
    Number(this.campeonato.classificadosParaMataMata || 0) > 0 &&
    this.campeonato.encerrado !== true
  );
},

        totalRodadas() {
            if (!this.campeonato || !this.campeonato.jogos || this.campeonato.jogos.length === 0) return 1;
            return Math.max(...this.campeonato.jogos.map(j => j.rodada));
        },
        jogosDaRodada() {
  if (!this.campeonato) return [];

  const temGrupo = this.campeonato.jogos.some(j => j.grupo);

  // 🔹 FASE DE GRUPOS → página = GRUPO
  if (temGrupo && typeof this.paginaAtual === 'string') {
    return this.campeonato.jogos.filter(
      j => j.grupo === this.paginaAtual
    );
  }

  // 🔹 LIGA / MATA-MATA → página = RODADA
  return this.campeonato.jogos.filter(
    j => j.rodada === this.rodadaAtual
  );
},

        nomeFaseAtual() {
            if (this.jogosDaRodada.length > 0) return this.jogosDaRodada[0].fase;
            return '';
        },
        podeEncerrarFase() {
    // 1️⃣ Campeonato já encerrado? Nunca mostra
    if (!this.campeonato || this.campeonato.status === 'ENCERRADO') {
        return false;
    }

    // 2️⃣ Jogos da rodada atual
    const jogos = this.jogosDaRodada;
    if (!jogos || jogos.length === 0) {
        return false;
    }

    // 3️⃣ Se NÃO existir fase → é GRUPOS → não mostra
    const ehMataMata = jogos.some(j => j.fase);
    if (!ehMataMata) {
        return false;
    }

    // 4️⃣ Se for FINAL → não mostra
    const faseAtual = jogos[0].fase;
    if (faseAtual === 'Final') {
        return false;
    }

    // 5️⃣ Todos os jogos precisam estar finalizados
    const todosFinalizados = jogos.every(j => j.finalizado === true);

    return todosFinalizados;
},

podeEncerrarLigaComMataMata() {
  if (!this.campeonato) return false;

  // só liga em pontos corridos
  if (this.campeonato.tipo !== 'PONTOS_CORRIDOS') return false;

  // precisa ter classificados definidos
  if (!this.campeonato.classificadosParaMataMata) return false;

  // se o mata-mata JÁ foi gerado, NÃO pode mostrar o botão
  if (this.campeonato.mataMataGerado === true) return false;

  // todos os jogos da liga precisam estar finalizados
  const jogos = this.campeonato.jogos || [];
  if (jogos.length === 0) return false;

  return jogos.every(j => j.finalizado === true);
},



        podeEncerrarCampeonato() {
  if (!this.campeonato) return false;
  if (this.campeonato.status === 'ENCERRADO') return false;

  const jogos = this.campeonato.jogos || [];
  if (jogos.length === 0) return false;

  // 🔹 GRUPOS + MATA-MATA
  if (this.campeonato.tipo === 'GRUPOS') {
    const jogosFinal = jogos.filter(j => j.fase === 'Final');
    if (jogosFinal.length === 0) return false;

    return jogosFinal.every(j => {
      if (!j.finalizado) return false;

      if (j.golsA === j.golsB) {
        return (
          j.penaltisA != null &&
          j.penaltisB != null &&
          j.penaltisA !== j.penaltisB
        );
      }

      return true;
    });
  }

  // 🔹 PONTOS CORRIDOS COM MATA-MATA
  if (
    this.campeonato.tipo === 'PONTOS_CORRIDOS' &&
    this.campeonato.classificadosParaMataMata
  ) {
    if (!this.campeonato.mataMataGerado) return false;

    const jogosFinal = jogos.filter(j => j.fase === 'Final');
    if (jogosFinal.length === 0) return false;

    return jogosFinal.every(j => {
      if (!j.finalizado) return false;

      if (j.golsA === j.golsB) {
        return (
          j.penaltisA != null &&
          j.penaltisB != null &&
          j.penaltisA !== j.penaltisB
        );
      }

      return true;
    });
  }

  // 🔹 PONTOS CORRIDOS PURO
  if (this.campeonato.tipo === 'PONTOS_CORRIDOS') {
    return jogos.every(j => j.finalizado === true);
  }

  // 🔹 MATA-MATA PURO
  if (this.campeonato.tipo === 'MATA_MATA') {
    const jogosFinal = jogos.filter(j => j.fase === 'Final');
    if (jogosFinal.length === 0) return false;

    return jogosFinal.every(j => j.finalizado === true);
  }

  return false;
}




    },
    async mounted() {
        this.id = this.$route.params.id
        await this.carregarCampeonato();
    },
    methods: {


        irParaPagina(p) {
  this.paginaAtual = p;

  // 🔹 se for número, é LIGA / MATA-MATA
  if (typeof p === 'number') {
    this.rodadaAtual = p;

    localStorage.setItem(
      `icup_rodada_${this.campeonato.id}`,
      p
    );
  }

  // 🔹 salva sempre a página atual
  localStorage.setItem(
    `icup_pagina_${this.campeonato.id}`,
    p
  );
},

        estiloRodada(n) {
  const fase = this.faseDaRodada(n);
  const cores = this.paginacaoCores[fase];

  const ativo = n === this.rodadaAtual;

  return {
    borderColor: cores.borda,
    color: ativo ? cores.textoAtivo : cores.texto,
    backgroundColor: ativo ? cores.fundoAtivo : 'transparent'
  };
},


        faseDaRodada(n) {
  // ainda não tem mata-mata
  if (!this.campeonato.mataMataGerado) {
    return 'liga';
  }

  const faltam = this.totalRodadas - n + 1;

  if (faltam === 1) return 'final';
  if (faltam <= 3) return 'mata'; // quartas / semi
  return 'liga';
},


        irParaRodada(n) {
  if (n < 1 || n > this.totalRodadas) return;

  this.rodadaAtual = n;

  localStorage.setItem(
    `icup_rodada_${this.campeonato.id}`,
    this.rodadaAtual
  );
},


        voltarRodada() {
  if (this.rodadaAtual > 1) {
    this.rodadaAtual--;
    this.salvarRodadaAtual();
  }
},

avancarRodada() {
  if (this.rodadaAtual < this.totalRodadas) {
    this.rodadaAtual++;
    this.salvarRodadaAtual();
  }
},

salvarRodadaAtual() {
  if (!this.campeonato?.id) return;

  localStorage.setItem(
    `icup_rodada_${this.campeonato.id}`,
    this.rodadaAtual
  );
},

        async gerarMataMataDaLiga() {
  if (!this.campeonato) return;

  // 🔥 GERA CLASSIFICAÇÃO A PARTIR DOS JOGOS
  const tabela = this.calcularClassificacaoPontosCorridos();

  const qtd = Number(this.campeonato.classificadosParaMataMata);

  if (!qtd || qtd < 2) {
    alert('Defina a quantidade de classificados.');
    return;
  }

  const classificados = tabela.slice(0, qtd).map((t, index) => ({ ...t, posicao: index + 1 }))
  .sort((a, b) => a.posicao - b.posicao);


  if (classificados.length % 2 !== 0) {
    alert('Quantidade de classificados deve ser par.');
    return;
  }

  const jogos = [];
  let confrontoId = 1;

  for (let i = 0; i < classificados.length / 2; i++) {
    const timeA = classificados[i];
    const timeB = classificados[classificados.length - 1 - i];

    jogos.push({
  id: Date.now() + i,
  confrontoId,
  fase: 'Mata-Mata',

  // 🔥 ESSA LINHA É A CORREÇÃO
  rodada: this.totalRodadas + 1,

  turno: 1,
  finalizado: false,
  golsA: null,
  golsB: null,
  timeA: { ...timeA },
  timeB: { ...timeB }
});


    confrontoId++;
  }

  // adiciona os jogos ao campeonato
  this.campeonato.jogos.push(...jogos);
  this.campeonato.mataMataGerado = true;

  await DbService.atualizarCampeonato(this.campeonato);

// 🔥 RECARREGA O CAMPEONATO DO BANCO
await this.carregarCampeonato();

// mantém a rodada atual (não força reset)
localStorage.setItem(
  `icup_rodada_${this.campeonato.id}`,
  this.rodadaAtual
);

alert('Mata-mata gerado com sucesso!');

},

calcularClassificacaoPontosCorridos() {
  const stats = {};

  this.campeonato.timesParticipantes.forEach(t => {
    stats[t.id] = {
      ...t,
      pontos: 0,
      vitorias: 0,
      saldoGols: 0,
      golsPro: 0,
      golsContra: 0
    };
  });

  this.campeonato.jogos.forEach(j => {
    if (!j.finalizado) return;

    const a = stats[j.timeA.id];
    const b = stats[j.timeB.id];

    a.golsPro += j.golsA;
    a.golsContra += j.golsB;
    b.golsPro += j.golsB;
    b.golsContra += j.golsA;

    a.saldoGols = a.golsPro - a.golsContra;
    b.saldoGols = b.golsPro - b.golsContra;

    if (j.golsA > j.golsB) {
      a.pontos += 3;
      a.vitorias++;
    } else if (j.golsB > j.golsA) {
      b.pontos += 3;
      b.vitorias++;
    } else {
      a.pontos += 1;
      b.pontos += 1;
    }
  });

  return Object.values(stats).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    return b.saldoGols - a.saldoGols;
  });
},

        formatarNomeTime(time) {
  if (!time || !this.campeonato) return '';

  const tecnico = time.tecnico ? `${time.tecnico} ` : '';
  const nome = time.nome || '';

  // 🔒 REGRA FINAL: só mostra país se for TRUE
  if (this.campeonato.adicionarNacionalidade !== true) {
    return `${tecnico}${nome}`.trim();
  }

  const pais = time.pais
    ? `${time.pais.substring(0, 3).toUpperCase()} `
    : '';

  return `${tecnico}${pais}${nome}`.trim();
},

        nomeExibidoTime(time) {
  if (!time) return '';
  return time.nome || '';
},


        async carregarCampeonato() {
  this.carregando = true;
  try {
    const dados = await DbService.getCampeonatoById(this.id);

    console.log('CAMPEONATO CARREGADO:', dados);
    console.log('adicionarNacionalidade:', dados.adicionarNacionalidade);

    if (dados) {

  // 🔥 LIMPA LIXO DE CAMPEONATOS ANTIGOS
  if (dados.tipo === 'PONTOS_CORRIDOS') {
    delete dados.classificadosPorGrupo;
    delete dados.usarRepescagem;
    delete dados.modoKnockout;
    delete dados.grupos;
  }

  this.campeonato = dados;
}

  } catch (error) {
    console.error("Erro ao carregar:", error);
  } finally {
    this.carregando = false;
  }

  // 🔹 restaura rodada
const rodadaSalva = localStorage.getItem(
  `icup_rodada_${this.campeonato.id}`
);

if (rodadaSalva) {
  this.rodadaAtual = Number(rodadaSalva);
}

// 🔹 restaura página (grupo ou rodada)
const paginaSalva = localStorage.getItem(
  `icup_pagina_${this.campeonato.id}`
);

if (paginaSalva !== null) {
  this.paginaAtual = isNaN(paginaSalva)
    ? paginaSalva        // grupo: 'A', 'B', 'C'
    : Number(paginaSalva); // rodada: 1, 2, 3
} else {
  // fallback seguro
  this.paginaAtual = this.rodadaAtual;
}

},

        async encerrarCampeonato() {
            if (!confirm("Deseja declarar este campeonato como ENCERRADO e arquivá-lo?")) return;
            try {
                this.campeonato.status = 'ENCERRADO';
                await DbService.atualizarCampeonato(this.campeonato);
                alert("Campeonato encerrado com sucesso! 🏆");
            } catch (error) { console.error(error); alert("Erro ao encerrar."); }
        },
        ativarEdicaoNome() {
            this.nomeTemp = this.campeonato.nome;
            this.editandoNome = true;
        },
        cancelarEdicaoNome() {
            this.editandoNome = false;
        },
        async salvarNome() {
            if (!this.nomeTemp.trim()) return alert("Nome não pode ser vazio.");
            this.campeonato.nome = this.nomeTemp;
            try {
                await DbService.atualizarCampeonato(this.campeonato);
                this.editandoNome = false;
            } catch (error) { console.error(error); alert("Erro ao renomear."); }
        },
        getSigla(time) {
            const timeCompleto = this.campeonato.timesParticipantes.find(t => t.id === time.id);
            if (timeCompleto && timeCompleto.sigla) return timeCompleto.sigla;
            return time.nome.substring(0, 3).toUpperCase();
        },
        getEstadio(timeId) {
            if (!this.campeonato || !this.campeonato.timesParticipantes) return '-';
            const time = this.campeonato.timesParticipantes.find(t => t.id === timeId);
            return time ? time.estadio : 'Estádio Desconhecido';
        },
        getAutoresGols(jogo, timeId) {
            if (!jogo.eventos || jogo.eventos.length === 0) return [];
            const eventosGol = jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === timeId);
            return eventosGol.map(evento => {
                if (evento.jogador && evento.jogador.nome) return evento.jogador.nome;
                const timeCompleto = this.campeonato.timesParticipantes.find(t => t.id === timeId);
                if (!timeCompleto) return 'Desconhecido';
                const jogador = timeCompleto.jogadores.find(j => (j.id || j.numero) == evento.jogadorId);
                return jogador ? jogador.nome : 'Desconhecido';
            });
        },
        irParaSumula(jogo) {
            this.$router.push(`/campeonato/${this.campeonato.id}/jogo/${jogo.id}`);
        },
        async salvarPlacar(jogo) {
  if (
    jogo.golsA === '' ||
    jogo.golsB === '' ||
    jogo.golsA === null ||
    jogo.golsB === null
  ) {
    alert("Preencha os gols.");
    return;
  }

  try {
    jogo.finalizado = true;

    // salva o jogo
    await DbService.atualizarJogo(this.campeonato.id, jogo);
    // 🔥 SE EDITAR JOGO DA LIGA, INVALIDA MATA-MATA
if (
  this.campeonato.tipo === 'PONTOS_CORRIDOS' &&
  !jogo.fase // jogo da liga
) {
  // remove jogos de mata-mata
  this.campeonato.jogos = this.campeonato.jogos.filter(j => !j.fase);

  // volta flags
  this.campeonato.mataMataGerado = false;
  this.campeonato.faseEncerrada = false;

  await DbService.atualizarCampeonato(this.campeonato);
}


    // 🔥 SE FOR JOGO DE GRUPO E JÁ EXISTE MATA-MATA → DESFAZ
    const jogoEhDeGrupo = !jogo.fase;
    const existeMataMata = this.campeonato.jogos.some(j => j.fase);

    if (
      this.campeonato.tipo === 'GRUPOS' &&
      jogoEhDeGrupo &&
      existeMataMata
    ) {
      // remove TODOS os jogos de mata-mata
      this.campeonato.jogos = this.campeonato.jogos.filter(j => !j.fase);

      // libera novamente encerrar grupos
      this.campeonato.faseEncerrada = false;

      await DbService.atualizarCampeonato(this.campeonato);
    }

    await this.carregarCampeonato();

  } catch (error) {
    console.error("Erro", error);
    alert("Erro ao salvar.");
    jogo.finalizado = false;
  }
},


        abrirModalEncerramento() {
            const faseAtual = this.nomeFaseAtual;

            let jogosDaFase = [];

            // CORREÇÃO CRÍTICA AQUI TAMBÉM:
            // Se a fase atual se chamar "Classificação Direta (Bye)", ela TAMBÉM deve puxar os jogos de Playoff.
            if (faseAtual.includes('Playoff') || faseAtual.includes('Preliminar') || faseAtual.includes('Bye') || faseAtual.includes('Classificação Direta')) {
                jogosDaFase = this.campeonato.jogos.filter(j =>
                    j.fase && (
                        j.fase.includes('Playoff') ||
                        j.fase.includes('Preliminar') ||
                        j.fase.includes('Bye') ||
                        j.fase.includes('Classificação Direta')
                    )
                );
            } else {
                jogosDaFase = this.campeonato.jogos.filter(j => j.fase === faseAtual);
            }

            const mapaConfrontos = {};

            jogosDaFase.forEach(jogo => {
                if (!mapaConfrontos[jogo.confrontoId]) {
                    const nomeFase = jogo.fase || '';

                    mapaConfrontos[jogo.confrontoId] = {
                        id: jogo.confrontoId,
                        timeA: jogo.timeA,
                        timeB: jogo.timeB,
                        placarA: 0,
                        placarB: 0,
                        vencedorId: null,
                        isBye: nomeFase.includes('Bye') || nomeFase.includes('Classificação Direta')
                    };
                }
                const conf = mapaConfrontos[jogo.confrontoId];

                if (jogo.turno === 1) {
                    conf.placarA += (jogo.golsA || 0);
                    conf.placarB += (jogo.golsB || 0);
                } else {
                    conf.placarB += (jogo.golsA || 0);
                    conf.placarA += (jogo.golsB || 0);
                }

                if (conf.isBye) {
                    conf.vencedorId = conf.timeA.id;
                }
            });

            const listaConfrontos = Object.values(mapaConfrontos);
            const tipoClassificacao = this.campeonato.tipoClassificacao || 'AUTOMATICA';

            listaConfrontos.forEach(conf => {
                if (conf.isBye) return;

                if (conf.isBye) return;

// 🔥 NOVA REGRA: tenta decidir automaticamente
if (conf.placarA > conf.placarB) {
    conf.vencedorId = conf.timeA.id;
}
else if (conf.placarB > conf.placarA) {
    conf.vencedorId = conf.timeB.id;
}
else {
    // 🔥 empate → tenta decidir nos pênaltis
    const jogosDoConfronto = jogosDaFase.filter(j => j.confrontoId === conf.id);

    const jogoComPenaltis = jogosDoConfronto.find(j =>
        j.penaltisA != null &&
        j.penaltisB != null &&
        j.penaltisA !== j.penaltisB
    );

    if (jogoComPenaltis) {
        conf.vencedorId =
            jogoComPenaltis.penaltisA > jogoComPenaltis.penaltisB
                ? jogoComPenaltis.timeA.id
                : jogoComPenaltis.timeB.id;
    } else {
        // só cai aqui se NÃO houver pênaltis
        conf.vencedorId = null;
    }
}

            });

            this.confrontosEncerramento = listaConfrontos;
            // 🔥 REGRA FINAL: só abre modal se existir confronto sem vencedor
const existeConfrontoSemVencedor = this.confrontosEncerramento.some(
    c => !c.vencedorId
);

if (existeConfrontoSemVencedor) {
    this.modalEncerramentoAberto = true;
} else {
    // 🚀 todos os confrontos já decididos → avança direto
    this.confirmarAvancoFase();
}

        },
        opcoesVencedor(confronto) {
            return [
                { value: null, text: 'Selecione...' },
                { value: confronto.timeA.id, text: confronto.timeA.nome },
                { value: confronto.timeB.id, text: confronto.timeB.nome }
            ];
        },
        async confirmarAvancoFase() {
            const pendentes = this.confrontosEncerramento.some(c => !c.vencedorId);
            if (pendentes) { alert("Selecione todos os vencedores."); return; }
            const vencedoresObj = this.confrontosEncerramento.map(conf => {
                if (conf.vencedorId == conf.timeA.id) return conf.timeA;
                if (conf.vencedorId == conf.timeB.id) return conf.timeB;
                return null;
            }).filter(v => v !== null);
            try {
                this.carregando = true;
                await DbService.avancarFaseMataMata(this.campeonato.id, vencedoresObj);
                this.modalEncerramentoAberto = false;
                alert("Nova fase gerada com sucesso!");
                await this.carregarCampeonato();
            } catch (error) { console.error(error); alert("Erro ao gerar nova fase."); }
            finally { this.carregando = false; }
        },

        // === FUNÇÃO ATUALIZADA COM DETECÇÃO INTELIGENTE DE MODO ===
        async confirmarFimGrupos() {
            // 1. Cálculos Básicos
            const classificacao = this.calcularClassificacaoGrupos();
            const qtdDiretos = this.campeonato.classificadosPorGrupo || 2;
            let modoKnockout = this.campeonato.modoKnockout || 'PADRAO';

            let timesClassificados = [];
            for (const nomeGrupo in classificacao) {
                const grupo = classificacao[nomeGrupo];
                timesClassificados.push(...grupo.slice(0, qtdDiretos));
            }

            const totalClassificados = timesClassificados.length;
            const logBase2 = Math.log2(totalClassificados);
            const ehPotenciaPerfeita = Number.isInteger(logBase2);

            // === CORREÇÃO: DETECÇÃO DE MODO PARA CAMPEONATOS ANTIGOS ===
            // Se o modo for PADRAO (padrão de campeonatos antigos), mas temos um número
            // de times típico de Bye (6, 12, 24) e que não é potência de 2, perguntamos.
            if (modoKnockout === 'PADRAO' && !ehPotenciaPerfeita) {
                // Ex: 6 times. Se for padrão, vai pedir repescagem. Se for Bye, funciona bem.
                if ([6, 12, 24, 48].includes(totalClassificados)) {
                    const desejaBye = confirm(
                        `⚠️ DETECTADO: Você tem ${totalClassificados} classificados.\n\n` +
                        `O modo atual é "PADRÃO" (exige repescagem de 3ºs colocados).\n` +
                        `Mas esse número funciona perfeitamente com o Sistema "Bye" (Melhores folgam).\n\n` +
                        `Deseja mudar para o Sistema "BYE" agora?`
                    );
                    if (desejaBye) modoKnockout = 'BYE';
                }
            }

            console.log("Modo Final Definido:", modoKnockout);

            // === LÓGICA 1: SISTEMA DE BYE / PLAYOFFS ===
            if (modoKnockout === 'BYE') {
                if (totalClassificados < 3) { alert("Poucos times para sistema de Bye."); return; }
                if (!confirm(`CONFIRMAÇÃO SISTEMA DE BYE:\nExistem ${totalClassificados} classificados.\nO sistema dará folga para os melhores e criará um playoff preliminar para os outros.\n\nDeseja confirmar?`)) return;

                try {
                    this.carregando = true;
                    // Gera jogos (Playoffs + Byes fake)
                    const novosJogos = gerarJogosComByeSystem(
                        timesClassificados,
                        this.campeonato.turnos, // <--- AQUI ESTÁ A CORREÇÃO (passa 1 ou 2 dinamicamente)
                        this.totalRodadas
                    )

                    this.campeonato.jogos.push(...novosJogos);
                    // IMPORTANTE: Atualizar o modo no banco caso tenha sido alterado dinamicamente
                    this.campeonato.modoKnockout = 'BYE';

                    await DbService.atualizarCampeonato(this.campeonato);

                    alert("Fase Preliminar e Byes gerados com sucesso!");
                    await this.carregarCampeonato();
                    this.rodadaAtual = this.totalRodadas;
                } catch (e) {
                    console.error(e);
                    alert("Erro ao gerar sistema Bye.");
                } finally {
                    this.carregando = false;
                }
                return; // FIM LÓGICA BYE
            }

            // === LÓGICA 2: PADRÃO (REPESCAGEM E POTÊNCIAS DE 2) ===
            let usarRepescagem = this.campeonato.usarRepescagem || false;
            let timesRestantes = [];

            for (const nomeGrupo in classificacao) {
                const grupo = classificacao[nomeGrupo];
                timesRestantes.push(...grupo.slice(qtdDiretos));
            }

            // Oferta de repescagem de segurança
            if (!ehPotenciaPerfeita && !usarRepescagem) {
                const proximaPotencia = Math.pow(2, Math.ceil(Math.log2(totalClassificados)));
                const faltam = proximaPotencia - totalClassificados;
                if (confirm(`⚠️ MODO PADRÃO (REPESCAGEM):\nTemos ${totalClassificados} classificados (Chave quebrada).\nDeseja ativar a REPESCAGEM agora para classificar mais ${faltam} times (Melhores 3ºs)?`)) {
                    usarRepescagem = true;
                }
            }

            let timesExtras = [];
            if (usarRepescagem) {
                const proximaPotencia = Math.pow(2, Math.ceil(Math.log2(totalClassificados)));
                const vagasFaltantes = proximaPotencia - totalClassificados;
                if (vagasFaltantes > 0) {
                    if (vagasFaltantes > timesRestantes.length) {
                        alert(`Erro: Precisamos de ${vagasFaltantes} times extra, mas só temos ${timesRestantes.length}.`);
                        return;
                    }
                    timesRestantes.sort((a, b) => {
                        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
                        return b.saldoGols - a.saldoGols;
                    });
                    timesExtras = timesRestantes.slice(0, vagasFaltantes);
                }
            }

            let msg = "Isso encerrará a fase de grupos e gerará o Mata-Mata.";
            if (timesExtras.length > 0) msg += `\n\nℹ️ REPESCAGEM: + ${timesExtras.length} melhores 3ºs classificados.`;

            if (!confirm(msg)) return;

            try {
                this.carregando = true;
                const ultimaRodadaAntiga = this.totalRodadas;

                if (usarRepescagem || timesExtras.length > 0) {
                    const listaFinal = [...timesClassificados, ...timesExtras];
                    await DbService.avancarGruposComSeeding(this.campeonato.id, listaFinal);
                } else {
                    const classificadosPorGrupoObj = {};
                    for (const nome in classificacao) {
                        classificadosPorGrupoObj[nome] = classificacao[nome].slice(0, qtdDiretos);
                    }
                    await DbService.avancarGruposParaMataMata(this.campeonato.id, classificadosPorGrupoObj);
                }
                this.campeonato.faseEncerrada = true;
                alert("Mata-Mata gerado com sucesso!");
                await this.carregarCampeonato();
                this.rodadaAtual = ultimaRodadaAntiga + 1;
            } catch (error) {
                console.error(error);
                alert("Erro ao gerar mata-mata.");
            } finally {
                this.carregando = false;
            }
        },

        calcularClassificacaoGrupos() {
    const mapaStats = {};
    this.campeonato.timesParticipantes.forEach(t => {
        mapaStats[t.id] = { ...t, pontos: 0, vitorias: 0, saldoGols: 0, golsPro: 0 };
    });

    this.campeonato.jogos.forEach(jogo => {
        if (!jogo.finalizado) return;

        const tA = mapaStats[jogo.timeA.id];
        const tB = mapaStats[jogo.timeB.id];

        if (jogo.golsA > jogo.golsB) {
            tA.pontos += 3;
            tA.vitorias++;
        } else if (jogo.golsB > jogo.golsA) {
            tB.pontos += 3;
            tB.vitorias++;
        } else {
            tA.pontos += 1;
            tB.pontos += 1;
        }

        tA.saldoGols += (jogo.golsA - jogo.golsB);
        tB.saldoGols += (jogo.golsB - jogo.golsA);
        tA.golsPro += jogo.golsA;
        tB.golsPro += jogo.golsB;
    });

    const gruposObj = {};
    this.campeonato.grupos.forEach(g => {
        gruposObj[g.nome] = [];
    });

    Object.values(mapaStats).forEach(timeStats => {
        const grupoDoTime = this.campeonato.grupos.find(g =>
            g.times.some(t => t.id === timeStats.id)
        );
        if (grupoDoTime) {
            gruposObj[grupoDoTime.nome].push(timeStats);
        }
    });

    for (const nome in gruposObj) {
        gruposObj[nome].sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
            return b.saldoGols - a.saldoGols;
        });
    }

    return gruposObj;
},

getTimeCompleto(timeJogo) {
    if (!this.campeonato || !this.campeonato.timesParticipantes) {
        return timeJogo;
    }

    const encontrado = this.campeonato.timesParticipantes.find(
        t => t.id === timeJogo.id
    );

    return encontrado || timeJogo;
}

    }
}
</script>

<style scoped>
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type=number] {
    -moz-appearance: textfield;
}

.jogo-row:last-child {
    border-bottom: none !important;
}

.cursor-pointer {
    cursor: pointer;
}

.form-control:disabled {
    opacity: 0.25;
    color: #000;
}
</style>