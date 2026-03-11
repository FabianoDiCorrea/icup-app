<template>
    <div :class="[abaAtiva === 'FORMACAO' ? 'container-fluid px-md-5' : 'container', 'mt-4 pb-5']">
        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Carregando..." />
        </div>

        <div v-else-if="!jogo">
            <BAlert show variant="danger">Jogo não encontrado.</BAlert>
            <BButton @click="voltar">Voltar</BButton>
        </div>

        <div v-else>
            
            <SumulaHeader 
                :rodada="jogo.rodada" 
                :timeA="jogo.timeA" :timeB="jogo.timeB" 
                :golsA="golsA" :golsB="golsB"
                :uniformeA="jogo.uniformeA" :uniformeB="jogo.uniformeB" 
                v-model:dataHora="jogo.dataHora"
                v-model:abaAtiva="abaAtiva"
                v-model:nota="jogo.nota" 
                
                :tempoFormatado="tempoFormatado"
                :labelTempo="labelTempo"
                :modoCronometro="modoCronometro"
                :statusCronometro="statusCronometro"
                :tempoRestante="tempoRestante"
                :duracaoPartida="duracaoPartida"

                @voltar="voltar" @salvar="salvarAlteracoes" @sharear="gerarShare"
                @iniciar="iniciarCronometro"
                @pausar="pararCronometro"
                @resetar="resetarCronometro"
                @editarTempo="abrirEditorTempo"
                @ajustarSegundos="ajustarSegundos"
                @trocarModo="trocarModoCronometro"
            />
           
            <SocialShareModal v-model="modalShareAberto" :timeA="timeFullA" :timeB="timeFullB" :golsA="golsA"
                :golsB="golsB" :eventos="jogo.eventos" nomeCampeonato="My Champs" :rodada="jogo.rodada" 
                :estadio="timeFullA.estadio" :dataHora="jogo.dataHora" />

            <SumulaEventos v-if="abaAtiva === 'EVENTOS'" :timeA="jogo.timeA" :timeB="jogo.timeB" :elencoA="elencoA"
    :elencoB="elencoB" :titularesA="jogo.titularesA" :titularesB="jogo.titularesB" :jogo="jogo"
    :golsA="golsA" :golsB="golsB"
    v-model:ferramentaAtiva="ferramentaAtiva"
    @aplicar="aplicarAcao"
    @simular="simularJogo"
    @simularPenaltis="simularPenaltis"
/>


            <SumulaTimeline v-if="abaAtiva === 'TIMELINE'" :eventos="jogo.eventos" :substituicoes="jogo.substituicoes"
                :timeA="jogo.timeA" :timeB="jogo.timeB" @remover="removerItemTimeline" />

            <SumulaEscalacao v-if="abaAtiva === 'ESCALACAO'" :timeA="jogo.timeA" :timeB="jogo.timeB" :elencoA="elencoA"
                :elencoB="elencoB" :titularesA="jogo.titularesA" :titularesB="jogo.titularesB"
                @toggleTitular="toggleTitular" @selecionarTodos="selecionarTodos"
                @selecionarNenhum="selecionarNenhum" />

            <SumulaSubstituicoes v-if="abaAtiva === 'SUBS'" :timeA="jogo.timeA" :timeB="jogo.timeB" :elencoA="elencoA"
                :elencoB="elencoB" :titularesA="jogo.titularesA" :titularesB="jogo.titularesB"
                :substituicoes="jogo.substituicoes" :subTempA="subTempA" :subTempB="subTempB"
                @realizarSubstituicao="realizarSubstituicao" @removerSubstituicao="removerSubstituicao" />

            <SumulaUniformes v-if="abaAtiva === 'UNIFORMES'" :timeA="jogo.timeA" :timeB="jogo.timeB"
                :uniformeA="jogo.uniformeA" :uniformeB="jogo.uniformeB" :timeFullA="timeFullA" :timeFullB="timeFullB"
                @selecionar="selecionarUniforme" />

            <SumulaFormacao v-if="abaAtiva === 'FORMACAO'"
                :timeA="jogo.timeA" :timeB="jogo.timeB"
                :timeFullA="timeFullA" :timeFullB="timeFullB"
                :uniformeA="jogo.uniformeA" :uniformeB="jogo.uniformeB"
                @selecionarCor="selecionarCorPorIndice" />

            <!-- ⚠️ BOTÃO DE PERIGO: ANULAR PARTIDA (Só aparece na aba Súmula/Eventos) -->
            <div v-if="abaAtiva === 'EVENTOS'" class="mt-5 pt-5 border-top border-secondary text-center">
                <BButton variant="outline-danger" size="sm" class="opacity-50 hover-opacity-100" @click="anularPartida">
                    🚫 ANULAR PARTIDA (RESET TOTAL)
                </BButton>
                <p class="text-muted small mt-2">Isso apagará todos os gols, cartões e resetará o tempo.</p>
            </div>
        </div>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BSpinner, BButton, BAlert } from 'bootstrap-vue-next';

import SumulaHeader from '@/components/sumula/SumulaHeader.vue';
import SumulaEventos from '@/components/sumula/SumulaEventos.vue';
import SumulaTimeline from '@/components/sumula/SumulaTimeline.vue';
import SumulaEscalacao from '@/components/sumula/SumulaEscalacao.vue';
import SumulaSubstituicoes from '@/components/sumula/SumulaSubstituicoes.vue';
import SumulaUniformes from '@/components/sumula/SumulaUniformes.vue';
import SumulaFormacao from '@/components/sumula/SumulaFormacao.vue';
import SocialShareModal from '@/views/SocialShareModal.vue';

export default {
    name: 'SumulaJogo',
    components: {
        BSpinner, BButton, BAlert,
        SumulaHeader, SumulaEventos, SumulaTimeline,
        SumulaEscalacao, SumulaSubstituicoes, SumulaUniformes, SumulaFormacao, SocialShareModal
    },
    data() {
        return {
            carregando: true,
            abaAtiva: 'EVENTOS',
            jogo: null,
            modalShareAberto: false,
            timeFullA: {}, timeFullB: {},
            elencoA: [], elencoB: [],
            ferramentaAtiva: null,
            idCampeonato: '', idJogo: '',
            subTempA: { saiId: null, entraId: null },
            subTempB: { saiId: null, entraId: null },
            
            // CRONÔMETRO
            duracaoPartida: 10, // minutos padrão
            tempoRestante: 600, // segundos
            statusCronometro: 'PARADO', // PARADO, RODANDO, ENCERRADO
            modoCronometro: 'REAL', // REAL, SIM_90, SIM_45
            cronometroId: null,
            apitoTocando: false
        }
    },
    computed: {
        labelTempo() {
            if (this.modoCronometro !== 'SIM_45') return null;
            const tempoTotalMs = this.duracaoPartida * 60 * 1000;
            const decorridoMs = tempoTotalMs - this.tempoRestante;
            if (decorridoMs >= tempoTotalMs / 2) return '2º TEMPO';
            return '1º TEMPO';
        },
        tempoFormatado() {
            const tempoTotalMs = this.duracaoPartida * 60 * 1000;
            const decorridoMs = tempoTotalMs - this.tempoRestante;
            
            if (this.modoCronometro === 'SIM_90') {
                // Decorrido proporcional a 90 minutos (90 * 60 = 5400 * 1000 = 5400000ms)
                const proporcao = decorridoMs / tempoTotalMs;
                const msSimulados = Math.floor(proporcao * 5400000); // 5400000ms = 90m
                const totalSegundos = Math.floor(msSimulados / 1000);
                const m = Math.floor(totalSegundos / 60);
                const s = totalSegundos % 60;
                return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            } 
            else if (this.modoCronometro === 'SIM_45') {
                // Decorrido em 2 metades. Cada metade = 45 min simulados (2700000ms)
                const metadeRealMs = tempoTotalMs / 2;
                let refMs = decorridoMs;
                if (decorridoMs >= metadeRealMs) {
                    refMs = decorridoMs - metadeRealMs; // Reseta pro 2º tempo
                }
                const proporcao = refMs / metadeRealMs;
                const msSimulados = Math.floor(proporcao * 2700000); // 2700000ms = 45m
                const totalSegundos = Math.floor(msSimulados / 1000);
                const m = Math.floor(totalSegundos / 60);
                const s = totalSegundos % 60;
                return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }

            // Modo REAL (Regressivo)
            const totalSegundos = Math.ceil(this.tempoRestante / 1000); // Teto para não mostrar 00:00 se tiver 500ms
            const m = Math.floor(totalSegundos / 60);
            const s = totalSegundos % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        },
        tempoStringParaEvento() {
            if (this.statusCronometro === 'PARADO' && this.tempoRestante === this.duracaoPartida * 60 * 1000) return null;
            
            if (this.modoCronometro === 'SIM_90') {
                const parts = this.tempoFormatado.split(':');
                return `${parts[0]}'`;
            } else if (this.modoCronometro === 'SIM_45') {
                const marks = this.tempoFormatado.split(':');
                const label = this.labelTempo === '1º TEMPO' ? '1ºT' : '2ºT';
                return `${marks[0]}' ${label}`;
            } else {
                return this.tempoFormatado;
            }
        },
        golsA() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeA.id).length;
        },
        golsB() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeB.id).length;
        }
    },
    async mounted() {
        this.idCampeonato = this.$route.params.idCampeonato;
        this.idJogo = this.$route.params.idJogo;
        await this.carregarDados();
        
    },
    beforeUnmount() {
        // ESSENCIAL: Limpar o loop do cronômetro quando sair da tela da súmula, evitando memory leak
        if (this.cronometroId) {
            clearInterval(this.cronometroId);
            this.cronometroId = null;
        }
    },
    methods: {
        async carregarDados() {
            this.carregando = true;
            try {
                const camp = await DbService.getCampeonatoById(this.idCampeonato);
                if (!camp) throw new Error("Campeonato não encontrado");

                const jogoEncontrado = camp.jogos.find(j => String(j.id) === String(this.idJogo));
                if (!jogoEncontrado) throw new Error("Jogo não encontrado");

                // Inits
                jogoEncontrado.eventos = jogoEncontrado.eventos || [];
                jogoEncontrado.substituicoes = jogoEncontrado.substituicoes || [];
                jogoEncontrado.titularesA = jogoEncontrado.titularesA || [];
                jogoEncontrado.titularesB = jogoEncontrado.titularesB || [];
                jogoEncontrado.dataHora = jogoEncontrado.dataHora || '';
                jogoEncontrado.craque = jogoEncontrado.craque || null;
                jogoEncontrado.uniformeA = jogoEncontrado.uniformeA || null;
                jogoEncontrado.uniformeB = jogoEncontrado.uniformeB || null;
                
                // Inicializa a nota se não existir
                jogoEncontrado.nota = jogoEncontrado.nota || 0;

                // INICIALIZAÇÃO E RECUPERAÇÃO DO CRONÔMETRO
                jogoEncontrado.cronometro = jogoEncontrado.cronometro || {
                    duracaoPartida: 10,
                    tempoRestanteSnapshot: 600 * 1000, // 10 min em ms (agora em milissegundos)
                    ultimoUpdate: null,
                    status: 'PARADO', // PARADO, RODANDO, ENCERRADO
                    modo: 'REAL'
                };

                // Sync local state
                this.duracaoPartida = jogoEncontrado.cronometro.duracaoPartida;
                this.statusCronometro = jogoEncontrado.cronometro.status;
                this.modoCronometro = jogoEncontrado.cronometro.modo || 'REAL';
                
                // Conversão legada: se o snapshot salvo for menor que 5000 (provavelmente salvo em segundos)
                // convertemos para ms. Jogos de 90 mins são 5400s, mas como é default 10min = 600
                if(jogoEncontrado.cronometro.tempoRestanteSnapshot < 10000 && jogoEncontrado.cronometro.tempoRestanteSnapshot > 0) {
                    jogoEncontrado.cronometro.tempoRestanteSnapshot *= 1000;
                }

                if (this.statusCronometro === 'RODANDO' && jogoEncontrado.cronometro.ultimoUpdate) {
                    const agora = Date.now();
                    const decorridoMs = agora - jogoEncontrado.cronometro.ultimoUpdate;
                    const novoTempoMs = jogoEncontrado.cronometro.tempoRestanteSnapshot - decorridoMs;

                    if (novoTempoMs <= 0) {
                        this.tempoRestante = 0;
                        this.statusCronometro = 'ENCERRADO';
                        this.pararCronometro(false); // false = não salvar cronometro state simples
                        
                        // Atualiza objeto
                        jogoEncontrado.cronometro.status = 'ENCERRADO';
                        jogoEncontrado.cronometro.tempoRestanteSnapshot = 0;
                        jogoEncontrado.cronometro.ultimoUpdate = null;
                        
                        // Garante sincronia antes do apito
                        this.jogo = jogoEncontrado; 
                        this.salvarAlteracoes(true); // FINALIZA POIS O TEMPO ACABOU NO BACKGROUND

                        this.tocarApitoFinal();
                    } else {
                        this.tempoRestante = novoTempoMs;
                        // Retoma o loop visual (não reseta timestamp base)
                        this.retomarCronometroVisual(jogoEncontrado.cronometro.ultimoUpdate, jogoEncontrado.cronometro.tempoRestanteSnapshot); 
                    }
                } else {
                    this.tempoRestante = jogoEncontrado.cronometro.tempoRestanteSnapshot;
                }

                const timeGlobalA = await DbService.getTimeById(jogoEncontrado.timeA.id);
                const timeGlobalB = await DbService.getTimeById(jogoEncontrado.timeB.id);

                const snapA = camp.timesParticipantes.find(t => t.id == jogoEncontrado.timeA.id) || {};
                const snapB = camp.timesParticipantes.find(t => t.id == jogoEncontrado.timeB.id) || {};

                // REVERSÃO DO MERGE: Prioridade Máxima para os Dados Globais (Cadastro)
                // Isso garante que nomes dos jogadores e escudos venham do cadastro oficial
                const finalA = { ...(snapA || {}), ...(timeGlobalA || {}) };
                const finalB = { ...(snapB || {}), ...(timeGlobalB || {}) };

                // EXCEÇÃO: O Técnico e o País são específicos do Campeonato (onde estão FAB, VIT, etc.)
                if (snapA?.tecnico) finalA.tecnico = snapA.tecnico;
                if (snapA?.pais) finalA.pais = snapA.pais;
                if (snapB?.tecnico) finalB.tecnico = snapB.tecnico;
                if (snapB?.pais) finalB.pais = snapB.pais;

                this.timeFullA = finalA;
                this.timeFullB = finalB;

                // Sync elenco para as abas Súmula e Escalacao
                this.elencoA = this.timeFullA.jogadores || [];
                this.elencoB = this.timeFullB.jogadores || [];

                // 🔥 INICIALIZAÇÃO INTELIGENTE DE UNIFORMES
                if (!jogoEncontrado.uniformeA && this.timeFullA.cores && this.timeFullA.cores.length > 0) {
                    jogoEncontrado.uniformeA = this.timeFullA.cores[0]; // Casa
                }
                if (!jogoEncontrado.uniformeB && this.timeFullB.cores && this.timeFullB.cores.length > 0) {
                    // Tenta Fora (índice 1), se não tiver usa Casa (índice 0)
                    jogoEncontrado.uniformeB = this.timeFullB.cores[1] || this.timeFullB.cores[0];
                }

                this.jogo = jogoEncontrado;
            } catch (error) {
                console.error(error);
                alert("Erro ao carregar dados.");
            } finally {
                this.carregando = false;
            }
        },

        // --- Helpers ---
        getId(j) { return j.id || j.numero; },
        criarSnapshot(j) { return { id: this.getId(j), numero: j.numero, nome: j.nome }; },

        async salvarAlteracoes(finalizar = false) {
            // Se vier de evento (click), 'finalizar' pode ser um objeto Event, então forçamos false.
            // Se for chamada interna passando booleano, respeita.
            const deveFinalizar = (typeof finalizar === 'boolean') ? finalizar : false;

            // Se não finalizou e gols forem 0, salva null para não exibir 0x0
            // Se finalizou, salva 0 mesmo (0x0)
            const gA = this.golsA;
            const gB = this.golsB;

            this.jogo.golsA = (gA === 0 && !this.jogo.finalizado && !deveFinalizar) ? null : gA;
            this.jogo.golsB = (gB === 0 && !this.jogo.finalizado && !deveFinalizar) ? null : gB;
            
            if (deveFinalizar) {
                this.jogo.finalizado = true;
            }
            // Nota: Se deveFinalizar for false, não alteramos o status 'finalizado'. 
            // Ele permanece como estava (pode já estar finalizado ou não).

            try {
                await DbService.atualizarJogo(this.idCampeonato, JSON.parse(JSON.stringify(this.jogo)));
            } catch (error) { console.error(error); }
        },

        selecionarUniforme(cor, lado) {
            if (lado === 'A') this.jogo.uniformeA = cor; else this.jogo.uniformeB = cor;
            this.salvarAlteracoes(false);
        },
        selecionarCorPorIndice(idx, lado) {
            const timeFull = lado === 'A' ? this.timeFullA : this.timeFullB;
            if (timeFull.cores && timeFull.cores[idx]) {
                this.selecionarUniforme(timeFull.cores[idx], lado);
            }
        },

        async aplicarAcao(jogador, timeId) {
            if (!this.ferramentaAtiva) return;
            const snapshot = this.criarSnapshot(jogador);

            if (this.ferramentaAtiva === 'CRAQUE') {
                if (this.jogo.craque && this.jogo.craque.id == snapshot.id && this.jogo.craqueTimeId == timeId) {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                } else {
                    this.jogo.craque = snapshot;
                    this.jogo.craqueTimeId = timeId;
                }
            } else {
                // 🔥 Lógica de Escalonamento (Advertência -> Amarelo -> Vermelho)
                if (this.ferramentaAtiva === 'AMARELO') {
                    // Ao aplicar Amarelo, remove a Advertência (Azul) anterior
                    this.jogo.eventos = this.jogo.eventos.filter(e => 
                        !(e.jogadorId == snapshot.id && e.timeId == timeId && e.tipo === 'AZUL')
                    );
                } else if (this.ferramentaAtiva === 'VERMELHO') {
                    // Ao aplicar Vermelho, remove Amarelo e Advertência anteriores
                    this.jogo.eventos = this.jogo.eventos.filter(e => 
                        !(e.jogadorId == snapshot.id && e.timeId == timeId && (e.tipo === 'AMARELO' || e.tipo === 'AZUL'))
                    );
                }

                this.jogo.eventos.push({
                    id: Date.now(),
                    tipo: this.ferramentaAtiva,
                    jogador: snapshot,
                    jogadorId: snapshot.id,
                    timeId: timeId,
                    minuto: this.tempoStringParaEvento // Usa a computada que criamos
                });
            }
            await this.salvarAlteracoes();
        },

        async removerItemTimeline(item) {
            if (!confirm("Remover item?")) return;
            if (item.categoria === 'SUBS') {
                this.jogo.substituicoes = this.jogo.substituicoes.filter(s => s.id !== item.id);
            } else {
                this.jogo.eventos = this.jogo.eventos.filter(e => e.id !== item.id);
                if (item.tipo === 'CRAQUE') {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                }
            }
            await this.salvarAlteracoes();
        },
        async removerSubstituicao(sub) { this.removerItemTimeline(sub); },

        toggleTitular(jogador, lado) {
            const lista = lado === 'A' ? this.jogo.titularesA : this.jogo.titularesB;
            const jId = this.getId(jogador);
            const index = lista.findIndex(t => t?.id == jId);
            if (index !== -1) lista.splice(index, 1);
            else lista.push(this.criarSnapshot(jogador));
            this.salvarAlteracoes(false);
        },
        selecionarTodos(lado) {
            const elenco = lado === 'A' ? this.elencoA : this.elencoB;
            const novos = elenco.map(j => this.criarSnapshot(j));
            if (lado === 'A') this.jogo.titularesA = novos; else this.jogo.titularesB = novos;
            this.salvarAlteracoes(false);
        },
        selecionarNenhum(lado) {
            if (lado === 'A') this.jogo.titularesA = []; else this.jogo.titularesB = [];
            this.salvarAlteracoes(false);
        },

        async realizarSubstituicao(lado) {
            const temp = lado === 'A' ? this.subTempA : this.subTempB;
            const timeId = lado === 'A' ? this.jogo.timeA.id : this.jogo.timeB.id;
            const elenco = lado === 'A' ? this.elencoA : this.elencoB;

            const jogadorSai = elenco.find(j => this.getId(j) == temp.saiId);
            const jogadorEntra = elenco.find(j => this.getId(j) == temp.entraId);

            if (!jogadorSai || !jogadorEntra) return alert("Erro nos jogadores.");

            this.jogo.substituicoes.push({
                id: Date.now(),
                timeId: timeId,
                sai: this.criarSnapshot(jogadorSai),
                entra: this.criarSnapshot(jogadorEntra),
                minuto: this.tempoStringParaEvento
            });
            temp.saiId = null; temp.entraId = null;
            await this.salvarAlteracoes();
        },
        gerarShare(){
            this.modalShareAberto = true;
        },

        simularJogo() {
    const jaTemGol = this.jogo.eventos.some(e => e.tipo === 'GOL');

    const mensagem = jaTemGol
        ? 'Essa partida já foi simulada. Deseja sobrescrever?'
        : 'Deseja simular esta partida?';

    if (!confirm(mensagem)) return;

    // remove gols anteriores
    this.jogo.eventos = this.jogo.eventos.filter(e => e.tipo !== 'GOL');

    // jogadores válidos (exceto camisa 1)
    let jogadoresA = this.elencoA.filter(j => j.numero !== 1);
    if (jogadoresA.length === 0) jogadoresA = this.elencoA; // Fallback: usa goleiro se só tiver ele
    if (jogadoresA.length === 0) jogadoresA = [{ id: 'aut', numero: '-', nome: 'Desconhecido' }]; // Fallback final

    let jogadoresB = this.elencoB.filter(j => j.numero !== 1);
    if (jogadoresB.length === 0) jogadoresB = this.elencoB;
    if (jogadoresB.length === 0) jogadoresB = [{ id: 'aut', numero: '-', nome: 'Desconhecido' }];

    // sorteio de gols (0 a 3)
    const golsA = Math.floor(Math.random() * 4);
    const golsB = Math.floor(Math.random() * 4);

    // gols do time A
    for (let i = 0; i < golsA; i++) {
        const jogador = jogadoresA[Math.floor(Math.random() * jogadoresA.length)];

        this.jogo.eventos.push({
            id: Date.now() + i,
            tipo: 'GOL',
            timeId: this.jogo.timeA.id,
            jogador: this.criarSnapshot(jogador),
            jogadorId: jogador.id || jogador.numero,
            minuto: 'Simulado' // Gols de simulação ganham essa label temporal
        });
    }

    // gols do time B
    for (let i = 0; i < golsB; i++) {
        const jogador = jogadoresB[Math.floor(Math.random() * jogadoresB.length)];

        this.jogo.eventos.push({
            id: Date.now() + 100 + i,
            tipo: 'GOL',
            timeId: this.jogo.timeB.id,
            jogador: this.criarSnapshot(jogador),
            jogadorId: jogador.id || jogador.numero,
            minuto: 'Simulado'
        });
    }

    this.salvarAlteracoes(true);
},

simularPenaltis() {
    if (!confirm("Deseja simular o resultado dos pênaltis?")) return;

    // Gera um resultado onde não há empate
    let pA, pB;
    do {
        pA = Math.floor(Math.random() * 6); // 0 a 5
        pB = Math.floor(Math.random() * 6);
    } while (pA === pB);

    this.jogo.penaltisA = pA;
    this.jogo.penaltisB = pB;

    this.salvarAlteracoes(true);
    alert(`Pênaltis simulados: ${pA} x ${pB}`);
},

async anularPartida() {
    const msg = "⚠️ ATENÇÃO: Deseja realmente ANULAR esta partida?\n\nIsso irá:\n- Zerar o Placar\n- Remover Gols e Cartões\n- Resetar Cronômetro\n- Remover status de Finalizado\n\nEsta ação não pode ser desfeita!";
    if (!confirm(msg)) return;

    if (!confirm("CONFIRMAÇÃO FINAL: Tem certeza absoluta?")) return;

    try {
        this.pararCronometro(false);

        // Reset do objeto jogo
        this.jogo.eventos = [];
        this.jogo.substituicoes = [];
        this.jogo.golsA = null;
        this.jogo.golsB = null;
        this.jogo.finalizado = false;
        this.jogo.craque = null;
        this.jogo.craqueTimeId = null;
        this.jogo.nota = 0;

        // Reset Cronômetro
        const duracao = this.duracaoPartida || 10;
        this.tempoRestante = duracao * 60 * 1000;
        this.statusCronometro = 'PARADO';

        this.jogo.cronometro = {
            duracaoPartida: duracao,
            tempoRestanteSnapshot: duracao * 60 * 1000,
            ultimoUpdate: null,
            status: 'PARADO',
            modo: this.modoCronometro
        };

        // Salva as alterações (passando false para não forçar 'finalizado: true')
        await this.salvarAlteracoes(false);
        
        alert("Partida anulada com sucesso!");
        // Opcional: recarrega para garantir sincronia
        await this.carregarDados(); 
    } catch (e) {
        console.error(e);
        alert("Erro ao anular partida.");
    }
},

        voltar() { this.$router.push(`/campeonato/${this.idCampeonato}`); },
        
        // --- LÓGICA DO CRONÔMETRO ---
        // --- LÓGICA DO CRONÔMETRO ---
        async salvarEstadoCronometro() {
            if (!this.jogo) return;
            this.jogo.cronometro = {
                duracaoPartida: this.duracaoPartida,
                tempoRestanteSnapshot: this.tempoRestante, // Snapshot atual
                ultimoUpdate: this.statusCronometro === 'RODANDO' ? Date.now() : null,
                status: this.statusCronometro,
                modo: this.modoCronometro
            };
            // Salvar estado cronometro NÃO DEVE finalizar a partida
            await this.salvarAlteracoes(false); 
        },

        async trocarModoCronometro() {
            if(this.statusCronometro === 'RODANDO') {
                alert("Pausa o cronômetro antes de trocar o modo!");
                return;
            }
            if(this.modoCronometro === 'REAL') this.modoCronometro = 'SIM_90';
            else if(this.modoCronometro === 'SIM_90') this.modoCronometro = 'SIM_45';
            else this.modoCronometro = 'REAL';
            
            await this.salvarEstadoCronometro();

            if(confirm("Deseja aplicar este Modo de Cronômetro para todos os demais jogos pendentes do campeonato?")) {
                await this.propagarConfiguracoesCronometro('modo');
            }
        },

        iniciarCronometro() {
            if (this.tempoRestante > 0) {
                this.statusCronometro = 'RODANDO';
                // Salva estado COM timestamp atual antes de iniciar visualmente
                // Isso garante que o delta comece a contar a partir de AGORA
                this.salvarEstadoCronometro();
                this.retomarCronometroVisual(Date.now(), this.tempoRestante);
            }
        },

        retomarCronometroVisual(timestampBase, tempoRestanteBase) {
            // Apenas inicia o intervalo visual (não salva no DB repetidamente)
            if (this.cronometroId) clearInterval(this.cronometroId);
            
            // Loop rápido para tela rodar fluida (100ms)
            this.cronometroId = setInterval(() => {
                if (this.tempoRestante > 0) {
                    const decorridoMs = Date.now() - timestampBase;
                    this.tempoRestante = tempoRestanteBase - decorridoMs;

                    if (this.tempoRestante <= 0) {
                        this.tempoRestante = 0;
                        this.statusCronometro = 'ENCERRADO';
                        this.pararCronometro(false); 
                        
                        // Atualiza explicitamente o objeto jogo antes de salvar
                        this.jogo.cronometro.status = 'ENCERRADO';
                        this.jogo.cronometro.tempoRestanteSnapshot = 0;
                        this.jogo.cronometro.ultimoUpdate = null;

                        this.salvarAlteracoes(true); // Finaliza partida e persiste
                        this.tocarApitoFinal();
                    }
                }
            }, 50); // 50ms = 20 FPS (Suficiente para precisão visual rápida)
        },

        pararCronometro(salvar = true) {
            clearInterval(this.cronometroId);
            this.cronometroId = null;
            
            if (this.statusCronometro !== 'ENCERRADO') {
                this.statusCronometro = 'PARADO';
            }
            if (salvar) this.salvarEstadoCronometro();
        },

        resetarCronometro() {
            this.pararCronometro(false); // Para sem salvar ainda
            this.statusCronometro = 'PARADO';
            this.tempoRestante = this.duracaoPartida * 60 * 1000;
            this.salvarEstadoCronometro(); // Salva resetado
        },

        ajustarTempo(minutos) {
            // Deprecated logic from previous request, but keeping safe
             this.resetarCronometro();
        },

        async abrirEditorTempo() {
            const novoTempo = prompt("Digite o tempo em minutos:", this.duracaoPartida);
            if (novoTempo && !isNaN(novoTempo)) {
                this.duracaoPartida = parseInt(novoTempo);
                this.resetarCronometro();

                if(confirm("Deseja aplicar essa duração de (" + this.duracaoPartida + " min) para todos os demais jogos pendentes do campeonato?")) {
                    await this.propagarConfiguracoesCronometro('duracao');
                }
            }
        },
        async propagarConfiguracoesCronometro(tipo) {
            try {
                const camp = await DbService.getCampeonatoById(this.idCampeonato);
                if (!camp || !camp.jogos) return;
                
                let alteracoes = 0;
                
                for (let j of camp.jogos) {
                    // Pula o próprio jogo que já está aberto/salvo e jogos que já acabaram
                    if (j.id === this.jogo.id) continue;
                    if (j.finalizado) continue;
                    
                    if (!j.cronometro) {
                        j.cronometro = {
                            duracaoPartida: 10,
                            tempoRestanteSnapshot: 10 * 60 * 1000,
                            ultimoUpdate: null,
                            status: 'PARADO',
                            modo: 'REAL'
                        };
                    }

                    if (tipo === 'duracao' || tipo === 'ambos') {
                        // Verificamos se o jogo ainda está Intacto (não rodou nenhumm milissegundo extra) para limpar adequadamente o tempo base também
                        const tempoBaseAnteriorMs = (j.cronometro.duracaoPartida * 60 * 1000);
                        const duracaoIntacta = j.cronometro.tempoRestanteSnapshot === tempoBaseAnteriorMs || j.cronometro.tempoRestanteSnapshot === 0;
                        
                        j.cronometro.duracaoPartida = this.duracaoPartida;

                        if (duracaoIntacta) {
                            j.cronometro.tempoRestanteSnapshot = this.duracaoPartida * 60 * 1000;
                        }
                    }
                    
                    if (tipo === 'modo' || tipo === 'ambos') {
                        j.cronometro.modo = this.modoCronometro;
                    }
                    alteracoes++;
                }

                if (alteracoes > 0) {
                    await DbService.atualizarCampeonato(camp);
                    // Como não disparamos toasts bonitos aqui, vamos usar um Toast simples padrão do navegador
                    console.log(`Sucesso: Configuração propagada para ${alteracoes} jogos.`);
                }
            } catch (error) {
                console.error("Erro ao propagar config global do cronômetro:", error);
                alert("Erro ao aplicar nos outros jogos do campeonato.");
            }
        },
        ajustarSegundos(segundos) {
            // "segundos" aqui representa o tempo VISUAL que o usuário quer pular (ex: 10s visuais)
            // Precisamos descobrir quanto de tempo REAL isso representa pro cálculo em milissegundos.
            
            let fatorConversao = 1; // Modo REAL (1s visual = 1s real)
            
            if (this.modoCronometro === 'SIM_90') {
                // 90 min simulados = duracaoPartida real
                // Fator: 5400s / (duracaoPartida*60)
                fatorConversao = 5400 / (this.duracaoPartida * 60);
            } else if (this.modoCronometro === 'SIM_45') {
                 // 45 min simulados = (duracaoPartida/2) real (que dá o mesmo fator, pois 45 * 2 = 90)
                fatorConversao = 2700 / ((this.duracaoPartida * 60) / 2);
            }

            // O tempo real a ser pulado em Ms é o (tempo visual pedido / fator)
            const ajusteRealEmMs = (segundos / fatorConversao) * 1000;

            // Se for negativo (-10s visuais), ele "volta" no tempo (adiciona tempo *restante*)
            // Se for positivo (+10s visuais), ele "avança" no tempo (subtrai tempo *restante*)
            // Nota: O botão +10s passa "+10", botão -10s passa "-10". 
            // O sinal do template SumulaHeader.vue tem que casar:
            // @click="$emit('ajustarSegundos', -10)" -> Quero -10s visuais (voltar tempo decorrido, ou seja, Aumentar Restante)
            // Lógica antiga (bugada): this.tempoRestante += (segundos * 1000) = somava -10, então tirava tempo restante (avançava).
            // Ajeitando para a intuição lógica (Avançar 10s = diminuir restante / Voltar 10s = aumentar restante)
            
            // Mas, pra não mexer no componente base, vamos inverter o sinal aqui onde o cálculo atua no restante.
            // Para "Tirar -10s da partida": Aumenta o tempo restante (+10s) = (segundos * -1)
            this.tempoRestante += (ajusteRealEmMs * -1); 
            
            // Limitadores
            const tempoMaximoMs = this.duracaoPartida * 60 * 1000;
            if (this.tempoRestante > tempoMaximoMs) this.tempoRestante = tempoMaximoMs;
            if (this.tempoRestante < 0) this.tempoRestante = 0;
            
            // Salva o novo tempo restante como snapshot atual
            // Se estiver rodando, isso "reseta" o delta para começar a contar do novo valor neste instante
            this.salvarEstadoCronometro(); 

            if (this.tempoRestante === 0 && this.statusCronometro === 'RODANDO') {
                this.pararCronometro(false);
                this.statusCronometro = 'ENCERRADO';
                
                // Atualiza objeto
                this.jogo.cronometro.status = 'ENCERRADO';
                this.jogo.cronometro.tempoRestanteSnapshot = 0;
                this.jogo.cronometro.ultimoUpdate = null;

                this.salvarAlteracoes(true); // Finaliza partida
                this.tocarApitoFinal();
            } else if (this.statusCronometro === 'RODANDO') {
                 // Reinicia loop com o novo base setup
                 this.retomarCronometroVisual(Date.now(), this.tempoRestante);
            }
        },
        tocarApitoFinal() {
            if (this.apitoTocando) return;
            this.apitoTocando = true;
            // Libera a flag após 3s (tempo seguro do apito)
            setTimeout(() => { this.apitoTocando = false; }, 3000);

            // Tenta tocar arquivo MP3 se existir
            try {
                const audio = new Audio('/apito.mp3'); 
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            // Sucesso! O áudio está tocando.
                            // Não precisamos fazer nada.
                        })
                        .catch(error => {
                            console.warn("Áudio MP3 falhou, fallback sintético:", error);
                            // Se falhar o MP3, usamos o sintético
                            this.tocarApitoSintetico();
                        });
                }
            } catch (e) {
                console.warn("Erro crítico no áudio:", e);
                this.tocarApitoSintetico();
            }
        },
        tocarApitoSintetico() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return console.warn("Web Audio API não suportada.");
                
                const ctx = new AudioContext();
                
                // Função auxiliar para tocar um "sopro"
                const tocarSopro = (inicio, duracao) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    // Frequência base alta (apito)
                    osc.type = 'triangle'; // ou 'sine' saturada
                    // Reduzido de 3500 para 2200 para ficar menos "agudo/irritante"
                    // Frequência real de apitos varia, mas 2-3kHz é comum.
                    osc.frequency.setValueAtTime(2200, ctx.currentTime + inicio);
                    
                    // Modulação de amplitude (Trinado - a "bolinha" do apito)
                    const lfo = ctx.createOscillator();
                    lfo.type = 'square';
                    lfo.frequency.value = 25; // Hz do trinado (rápido)
                    
                    const lfoGain = ctx.createGain();
                    lfoGain.gain.value = 800; // Reduzido profundidade para combinar com freq menor
                    
                    lfo.connect(osc.frequency);
                    lfo.start(ctx.currentTime + inicio);
                    lfo.stop(ctx.currentTime + inicio + duracao);

                    // Envelope de volume (Ataque rápido, sustain, decay)
                    gain.gain.setValueAtTime(0, ctx.currentTime + inicio);
                    gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + inicio + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + inicio + duracao);

                    osc.start(ctx.currentTime + inicio);
                    osc.stop(ctx.currentTime + inicio + duracao);
                };

                // Sequência de apitos: Curto - Curto - Longo (Fim de jogo clássico)
                tocarSopro(0, 0.4);
                tocarSopro(0.5, 0.4);
                tocarSopro(1.0, 1.2);

            } catch (e) {
                console.error("Erro ao tocar apito:", e);
            }
        }
    }
}
</script>