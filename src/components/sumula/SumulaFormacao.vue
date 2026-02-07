<template>
    <div class="formacao-wrapper p-1 bg-dark rounded border border-secondary shadow-lg overflow-hidden">
        <!-- Controles Superiores (Uniforme) -->
        <div class="d-flex justify-content-between align-items-center mb-3 px-2">
            <div class="header-time-info text-start">
                <div class="small text-muted mb-1 text-uppercase fw-bold">Time Esquerda</div>
                <div class="fw-bold h6 text-white mb-2">{{ timeA.nome }}</div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" :class="{ active: isUniforme(0, 'A') }" @click="$emit('selecionarCor', 0, 'A')">U1 (CASA)</button>
                    <button v-if="timeFullA.cores && timeFullA.cores.length > 1" class="btn btn-outline-info" :class="{ active: isUniforme(1, 'A') }" @click="$emit('selecionarCor', 1, 'A')">U2 (FORA)</button>
                </div>
            </div>

            <!-- Nomes dos Times Centralizados (GIGANTES) -->
            <div class="flex-grow-1 d-flex justify-content-center align-items-center gap-2 gap-md-5 px-1 px-md-3">
                <div class="display-6 display-md-3 mb-0 fw-black text-info text-uppercase text-shadow-glow text-truncate letter-spacing-tight" style="max-width: 400px;">{{ timeA.nome }}</div>
                <div class="h4 h2 mb-0 text-muted opacity-50 fw-bold">VS</div>
                <div class="display-6 display-md-3 mb-0 fw-black text-danger text-uppercase text-shadow-glow text-truncate letter-spacing-tight" style="max-width: 400px;">{{ timeB.nome }}</div>
            </div>

            <div class="header-time-info text-end">
                <div class="small text-muted mb-1 text-uppercase fw-bold">Time Direita</div>
                <div class="fw-bold h6 text-white mb-2">{{ timeB.nome }}</div>
                <div class="btn-group btn-group-sm">
                    <button v-if="timeFullB.cores && timeFullB.cores.length > 1" class="btn btn-outline-danger" :class="{ active: isUniforme(1, 'B') }" @click="$emit('selecionarCor', 1, 'B')">U2 (FORA)</button>
                    <button class="btn btn-outline-danger" :class="{ active: isUniforme(0, 'B') }" @click="$emit('selecionarCor', 0, 'B')">U1 (CASA)</button>
                </div>
            </div>
        </div>

        <!-- Conteúdo Principal: Campo Primeiro (100% largura) no Mobile/Tablet, Lado a Lado apenas em Desktop XL -->
        <div class="d-flex flex-wrap flex-xl-nowrap gap-2 gap-md-3 align-items-stretch">
            
            <!-- Escalação Time A (Esquerda) - Abaixo do campo em Mobile/Tablet -->
            <div class="escalacao-lateral escalacao-esquerda p-2 rounded bg-opacity-10 bg-info border border-info border-opacity-25 order-2 order-xl-1 col-6 col-xl-auto">
                <div class="esc-header border-bottom border-info border-opacity-50 pb-1 mb-2">
                    <span class="small fw-bold text-info">ESCALAÇÃO</span>
                </div>
                <ul class="list-unstyled mb-2">
                    <li v-for="j in jogadoresOrdenadosA" :key="'listA'+j.id" class="esc-item d-flex gap-2">
                        <span class="esc-num fw-bold text-info">#{{ j.numero }}</span>
                        <span class="esc-nome text-white text-truncate">{{ j.nome }}</span>
                    </li>
                </ul>
                <div class="mt-auto pt-2 border-top border-info border-opacity-25 small text-muted">
                    <span class="fw-bold text-info">Técnico:</span> {{ getTecnico('A') }}
                </div>
            </div>

            <!-- Campo de Futebol (Sempre 100% se não for Desktop XL) -->
            <div class="campo-container position-relative overflow-hidden shadow flex-grow-1 order-1 order-xl-2 w-100">
                <div class="campo-gramado">
                    <!-- Linhas do Campo -->
                <div class="linha-meio"></div>
                <div class="circulo-central"></div>
                
                <!-- Grande Área -->
                <div class="areaarea area-esquerda"></div>
                <div class="areaarea area-direita"></div>

                <!-- Pequena Área -->
                <div class="pequena-area pequena-esquerda"></div>
                <div class="pequena-area pequena-direita"></div>

                <!-- Meia Lua -->
                <div class="meia-lua meia-esquerda"></div>
                <div class="meia-lua meia-direita"></div>
                    
                    <!-- Jogadores Time A (Esquerda) -->
                    <div class="elenco-field elenco-esquerda">
                        <div v-for="i in 11" :key="'A'+i" class="botao-wrapper" :class="'pos-a-' + i">
                            <div class="player-label label-time-a text-truncate shadow-sm">
                                Nº {{ i }} - {{ getNomeJogador(i, 'A') }}
                            </div>
                            
                            <!-- Goleiro Retangular -->
                            <div v-if="i === 1" class="goleiro-rect shadow-sm" :style="getEstiloBotao('A')"></div>
                            
                            <!-- Botão Circular -->
                            <div v-else class="botao-circle shadow-sm" :style="getEstiloBotao('A')">
                                <img v-if="getImagemBotao('A')" :src="getImagemBotao('A')" class="arte-botao" />
                                <span v-else class="numero-placeholder">{{ i }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Jogadores Time B (Direita) -->
                    <div class="elenco-field elenco-direita">
                        <div v-for="i in 11" :key="'B'+i" class="botao-wrapper" :class="'pos-b-' + i">
                            <div class="player-label label-time-b text-truncate shadow-sm">
                                Nº {{ i }} - {{ getNomeJogador(i, 'B') }}
                            </div>
                            
                            <!-- Goleiro Retangular -->
                            <div v-if="i === 1" class="goleiro-rect shadow-sm" :style="getEstiloBotao('B')"></div>
                            
                            <!-- Botão Circular -->
                            <div v-else class="botao-circle shadow-sm" :style="getEstiloBotao('B')">
                                <img v-if="getImagemBotao('B')" :src="getImagemBotao('B')" class="arte-botao" />
                                <span v-else class="numero-placeholder">{{ i }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Escalação Time B (Direita) -->
            <div class="escalacao-lateral escalacao-direita p-2 rounded bg-opacity-10 bg-danger border border-danger border-opacity-25 order-3 col-6 col-xl-auto">
                <div class="esc-header border-bottom border-danger border-opacity-50 pb-1 mb-2">
                    <span class="small fw-bold text-danger">ESCALAÇÃO</span>
                </div>
                <ul class="list-unstyled mb-2">
                    <li v-for="j in jogadoresOrdenadosB" :key="'listB'+j.id" class="esc-item d-flex gap-2">
                        <span class="esc-num fw-bold text-danger">#{{ j.numero }}</span>
                        <span class="esc-nome text-white text-truncate">{{ j.nome }}</span>
                    </li>
                </ul>
                <div class="mt-auto pt-2 border-top border-danger border-opacity-25 small text-muted text-end">
                    <span class="fw-bold text-danger">Técnico:</span> {{ getTecnico('B') }}
                </div>
            </div>

        </div>
        
        <div class="mt-3 text-center text-muted small">
            <i class="bi bi-info-circle"></i> Orientação horizontal seguindo o time à ESQUERDA e DIREITA da rodada.
        </div>
    </div>
</template>

<script>
export default {
    name: 'SumulaFormacao',
    props: ['timeA', 'timeB', 'timeFullA', 'timeFullB', 'uniformeA', 'uniformeB'],
    emits: ['selecionarCor'],
    computed: {
        jogadoresOrdenadosA() {
            if (!this.timeFullA.jogadores) return [];
            return [...this.timeFullA.jogadores].sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));
        },
        jogadoresOrdenadosB() {
            if (!this.timeFullB.jogadores) return [];
            return [...this.timeFullB.jogadores].sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));
        }
    },
    methods: {
        isUniforme(idx, lado) {
            const cores = lado === 'A' ? this.timeFullA.cores : this.timeFullB.cores;
            const selecionado = lado === 'A' ? this.uniformeA : this.uniformeB;
            if (!cores || !selecionado) return false;
            const corAlvo = cores[idx];
            return corAlvo && corAlvo.interno === selecionado.interno && corAlvo.externo === selecionado.externo;
        },
        getEstiloBotao(lado) {
            const uni = lado === 'A' ? this.uniformeA : this.uniformeB;
            if (!uni) return { backgroundColor: '#ccc', borderColor: '#999' };
            
            return {
                backgroundColor: uni.interno || '#ffffff',
                borderColor: uni.externo || '#000000',
                borderStyle: 'solid',
                borderWidth: 'clamp(2px, 0.4vw, 5px)',
                position: 'relative'
            };
        },
        getImagemBotao(lado) {
            const uni = lado === 'A' ? this.uniformeA : this.uniformeB;
            return uni ? uni.arte : null; 
        },
        getNomeJogador(numero, lado) {
            const jogadores = lado === 'A' ? this.timeFullA.jogadores : this.timeFullB.jogadores;
            if (!jogadores) return numero;
            const j = jogadores.find(p => p.numero == numero);
            return j && j.nome && j.nome.trim() !== '' ? j.nome : numero;
        },
        getTecnico(lado) {
            const time = lado === 'A' ? this.timeFullA : this.timeFullB;
            if (!time) return 'N/A';
            return time.tecnico || 'Neutro';
        }
    }
}
</script>

<style scoped>
.formacao-wrapper {
    min-height: 400px;
}

/* Cabeçalho e Nomes */
.header-time-info {
    flex: 0 0 150px;
}

.fw-black {
    font-weight: 900;
}

.text-shadow-glow {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.letter-spacing-tight {
    letter-spacing: -2px;
}

/* Colunas Laterais */
.escalacao-lateral {
    flex: 0 0 210px;
    display: flex;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.03);
}

.esc-num {
    min-width: 25px;
    font-size: 0.9rem;
}

.esc-nome {
    font-size: 0.95rem;
}

.esc-item {
    margin-bottom: 3px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Campo de Futebol */
.campo-container {
    flex-grow: 1;
    aspect-ratio: 16 / 9;
    background-color: #2e7d32;
    border: 4px solid #fff;
    border-radius: 8px;
    padding: 0.5%;
}

.campo-gramado {
    width: 100%;
    height: 100%;
    position: relative;
    background-image: repeating-linear-gradient(90deg, #388e3c, #388e3c 10%, #2e7d32 10%, #2e7d32 20%);
}

.linha-meio {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: rgba(255,255,255,0.8);
    transform: translateX(-50%);
}

.circulo-central {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 15%;
    aspect-ratio: 1;
    border: 2px solid rgba(255,255,255,0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
}

.areaarea {
    position: absolute;
    top: 25%;
    bottom: 25%;
    width: 15%;
    border: 2px solid rgba(255,255,255,0.8);
    z-index: 1;
}
.area-esquerda { left: 0; border-left: 0; }
.area-direita { right: 0; border-right: 0; }

/* Pequena Área */
.pequena-area {
    position: absolute;
    top: 35%;
    bottom: 35%;
    width: 6%;
    border: 2px solid rgba(255,255,255,0.8);
    z-index: 1;
}
.pequena-esquerda { left: 0; border-left: 0; }
.pequena-direita { right: 0; border-right: 0; }

/* Meia Lua */
.meia-lua {
    position: absolute;
    top: 50%;
    width: 12%;
    aspect-ratio: 1;
    border: 2px solid rgba(255,255,255,0.8);
    border-radius: 50%;
    z-index: 0; /* Por trás da grande área para esconder metade */
}
.meia-esquerda { 
    left: 15%; 
    transform: translate(-50%, -50%); 
    clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%);
}
.meia-direita { 
    right: 15%; 
    transform: translate(50%, -50%); 
    clip-path: polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%);
}

.botao-wrapper {
    position: absolute;
    width: 5.5%;
    aspect-ratio: 1;
    z-index: 10;
    transition: all 0.3s ease, transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
}

.player-label {
    position: absolute;
    bottom: 110%;
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    font-size: clamp(8px, 0.8vw, 12px);
    padding: 2px 5px;
    border-radius: 3px;
    white-space: nowrap;
    max-width: 140px;
    z-index: 20;
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    pointer-events: none;
}

.label-time-a {
    background-color: rgba(0, 20, 40, 0.9);
    border-left: 2px solid #0dcaf0;
}

.label-time-b {
    background-color: rgba(40, 0, 0, 0.9);
    border-left: 2px solid #ff4444;
}

.botao-circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-clip: padding-box;
}

.goleiro-rect {
    width: 70%;
    height: 120%;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.arte-botao {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.numero-placeholder {
    color: #fff;
    text-shadow: 1px 1px 2px #000;
    font-size: 0.8em;
    font-weight: 800;
}

/* 
   FORMAÇÃO 4-3-3 TIPO BOTÃO
*/

/* Time A (Esquerda) */
.pos-a-1  { left: 1.5%; top: 50%; } /* Goleiro Centralizado */
.pos-a-6  { left: 17%; top: 12%; }   /* Lat Esq */
.pos-a-4  { left: 17%; top: 35%; }   /* Zag Esq */
.pos-a-3  { left: 17%; top: 65%; }   /* Zag Dir */
.pos-a-2  { left: 17%; top: 88%; }   /* Lat Dir */

.pos-a-5  { left: 24%; top: 50%; }   /* Volante */
.pos-a-7  { left: 32%; top: 32%; }   /* MC Esq */
.pos-a-8  { left: 32%; top: 68%; }   /* MC Dir */

.pos-a-10 { left: 42%; top: 25%; }   /* Meia Esq */
.pos-a-9  { left: 41%; top: 50%; }   /* CA */
.pos-a-11 { left: 42%; top: 75%; }   /* Meia Dir */

/* Time B (Direita) */
.pos-b-1  { right: 1.5%; top: 50%; } 
.pos-b-6  { right: 17%; top: 12%; } 
.pos-b-4  { right: 17%; top: 35%; } 
.pos-b-3  { right: 17%; top: 65%; } 
.pos-b-2  { right: 17%; top: 88%; } 

.pos-b-5  { right: 24%; top: 50%; } 
.pos-b-7  { right: 32%; top: 32%; } 
.pos-b-8  { right: 32%; top: 68%; } 

.pos-b-10 { right: 42%; top: 25%; } 
.pos-b-9  { right: 41%; top: 50%; } 
.pos-b-11 { right: 42%; top: 75%; } 

@media (max-width: 1199px) { /* Tablet e Celular Landscape */
    .escalacao-lateral {
        flex: 1 1 48% !important; /* Aproximadamente metade para ficarem lado a lado */
        min-height: auto;
        max-width: none !important;
    }
    .campo-container {
        width: 100% !important;
        margin-bottom: 10px;
    }
    .esc-num, .esc-nome { font-size: 0.75rem; }
    .esc-header { font-size: 0.7rem; }
}

@media (max-width: 576px) {
    .campo-container { border-width: 2px; }
    .btn-group-sm > .btn { font-size: 0.6rem; padding: 0.1rem 0.3rem; }
    .display-6 { font-size: 1.5rem; }
    .h4 { font-size: 1rem; }
    .h6 { font-size: 0.8rem; }
    .small { font-size: 0.6rem; }
    .player-label { 
        font-size: 7px; 
        bottom: 115% !important; 
        padding: 1px 3px; 
        max-width: 60px;
        background-color: rgba(0, 0, 0, 0.9);
        border-radius: 2px;
    }
    .label-time-a, .label-time-b {
        border-width: 1px !important;
    }
    .esc-num, .esc-nome { font-size: 0.75rem; }
}
</style>
