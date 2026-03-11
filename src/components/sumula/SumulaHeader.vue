<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <BButton variant="outline-secondary" size="sm" @click="$emit('voltar')">
                ← Voltar
            </BButton>
            <div class="d-flex gap-2 align-items-center">
                <span class="text-muted small">Rodada {{ rodada }}</span>
                <BButton variant="primary" size="sm" @click="$emit('sharear')">
                    📸 Compartilhar
                </BButton>
            </div>
        </div>

        <BCard class="text-center shadow-sm mb-4 border-secondary bg-dark text-white p-0 overflow-hidden">
            <div class="d-flex flex-column flex-lg-row position-relative">
                
                <!-- Área Principal (Placar e Infos) -->
                <div class="flex-grow-1 py-3 px-2 order-1">
                    <!-- Wrapper Central do Placar -->
                    <div class="d-flex justify-content-center align-items-center mb-3">
                        <div class="d-flex justify-content-center align-items-center">
                            <!-- Time A -->
                            <div class="text-center mx-1 mx-md-4" style="width: 100px;">
                                <div class="position-relative d-inline-block">
                                    <img :src="timeA.escudo" class="mb-1 d-block mx-auto img-fluid escudo-time" />
                                    <div v-if="uniformeA" class="uniforme-mini" 
                                         :style="{ backgroundColor: uniformeA.interno, borderColor: uniformeA.externo, width: '20px', height: '20px', borderWidth: '3px' }">
                                    </div>
                                </div>
                                <div class="fw-bold text-truncate mt-1 d-block small mb-0">{{ timeA.nome }}</div>
                            </div>

                            <!-- Placar -->
                            <div class="d-flex align-items-center px-2 px-md-4 py-1 py-md-2 rounded shadow border border-secondary bg-secondary mx-1 mx-md-2">
                                <h1 class="m-0 fw-bold text-white d-md-none h3">{{ golsA }}</h1>
                                <h1 class="m-0 fw-bold text-white d-none d-md-block display-3">{{ golsA }}</h1>
                                <span class="mx-1 mx-md-3 text-white-50 h4 m-0">x</span>
                                <h1 class="m-0 fw-bold text-white d-md-none h3">{{ golsB }}</h1>
                                <h1 class="m-0 fw-bold text-white d-none d-md-block display-3">{{ golsB }}</h1>
                            </div>

                            <!-- Time B -->
                            <div class="text-center mx-1 mx-md-4" style="width: 100px;">
                                <div class="position-relative d-inline-block">
                                    <img :src="timeB.escudo" class="mb-1 d-block mx-auto img-fluid escudo-time" />
                                    <div v-if="uniformeB" class="uniforme-mini" 
                                         :style="{ backgroundColor: uniformeB.interno, borderColor: uniformeB.externo, width: '20px', height: '20px', borderWidth: '3px' }">
                                    </div>
                                </div>
                                <div class="fw-bold text-truncate mt-1 d-block small mb-0">{{ timeB.nome }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer (Data e Estrelas) -->
                    <div class="d-flex justify-content-center align-items-center gap-2 gap-md-4">
                        <BFormGroup label-cols="auto" class="mb-0 text-white-50">
                            <BFormInput type="datetime-local" :model-value="dataHora" size="sm" 
                                class="bg-secondary text-white border-secondary date-input-mobile" 
                                @update:model-value="$emit('update:dataHora', $event)" 
                                @change="$emit('salvar')" />
                        </BFormGroup>

                        <div class="d-flex align-items-center gap-1" title="Avalie a qualidade do jogo">
                            <span 
                                v-for="i in 5" :key="i"
                                class="star-icon fs-5 cursor-pointer"
                                :class="i <= (nota || 0) ? 'text-warning' : 'text-secondary opacity-25'"
                                @click="setNota(i)"
                            >
                                ★
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- CRONÔMETRO (Barra no Mobile/Tablet Landscape, Lateral no Desktop LG+) -->
                <div class="crono-wrapper order-2 shadow-lg border-top border-lg-top-0 border-lg-start border-secondary bg-black">
                    <div class="p-2 p-md-3 h-100 d-flex flex-column flex-md-row flex-lg-column align-items-center justify-content-center justify-content-md-between justify-content-lg-center gap-2 gap-md-3">
                        
                        <!-- Seletor de Modo e Display -->
                        <div class="d-flex flex-column align-items-center w-100 flex-grow-1">
                            <BButton 
                                variant="outline-light" size="sm" 
                                class="mb-2 w-100 text-uppercase fw-bold rounded-pill p-1 mx-auto d-flex align-items-center justify-content-center gap-1 border-secondary" 
                                style="font-size: 0.65rem; max-width: 200px;"
                                @click="$emit('trocarModo')" 
                            >
                                <span v-if="modoCronometro === 'REAL'">⏱️ TEMPO REAL</span>
                                <span v-else-if="modoCronometro === 'SIM_90'">⏩ SIMULADO 90 MIN</span>
                                <span v-else-if="modoCronometro === 'SIM_45'">⏩ SIMULADO 45/45</span>
                                <small class="opacity-50 ms-1 text-lowercase">({{ duracaoPartida || 10 }}m)</small>
                            </BButton>
                            
                            <!-- Label 1º/2º Tempo -->
                            <div v-if="labelTempo" class="text-warning fw-bold mb-1" style="font-size: 0.9rem; letter-spacing: 1px;">
                                {{ labelTempo }}
                            </div>

                            <!-- Relógio Gigante -->
                            <div class="fw-bold text-monospace tempo-display" 
                                :class="{'text-success': statusCronometro === 'RODANDO', 'text-danger': statusCronometro === 'ENCERRADO', 'text-white': statusCronometro === 'PARADO'}"
                                style="font-family: 'Courier New', monospace; letter-spacing: 2px;">
                                {{ tempoFormatado }}
                            </div>
                        </div>
                        
                        <!-- Controles Group -->
                        <div class="flex-grow-1 d-flex flex-column gap-1 w-100 btn-crono-group">
                            <div class="d-flex gap-1 w-100">
                                 <BButton v-if="statusCronometro === 'RODANDO'" variant="warning" size="sm" class="flex-grow-1 fw-bold main-btn" @click="$emit('pausar')">
                                    ⏸️
                                 </BButton>
                                 <BButton v-else variant="success" size="sm" class="flex-grow-1 fw-bold main-btn" :disabled="tempoRestante <= 0" @click="$emit('iniciar')">
                                    ▶️
                                 </BButton>
                                 
                                 <BButton variant="outline-secondary" size="sm" class="px-2" @click="$emit('resetar')" title="Reiniciar">
                                    🔄
                                 </BButton>
                            </div>

                            <!-- Atalhos Rápidos e Editar (Sempre visíveis, mas compactos) -->
                            <div class="d-flex gap-1 w-100">
                                <BButton variant="dark" size="sm" class="flex-grow-1 border-secondary" @click="$emit('ajustarSegundos', -10)">- 10s</BButton>
                                <BButton variant="dark" size="sm" class="flex-grow-1 border-secondary" @click="$emit('ajustarSegundos', 10)">+ 10s</BButton>
                            </div>
                            <BButton variant="dark" size="sm" class="text-muted w-100 border-secondary py-1" style="font-size: 0.70rem;" @click="$emit('editarTempo')">
                                 ⏱️ EDITAR
                            </BButton>
                        </div>

                    </div>
                </div>

            </div>
        </BCard>

        <ul class="nav nav-tabs mb-4 nav-justified border-secondary">
            <li class="nav-item" v-for="aba in abas" :key="aba.key">
                <a class="nav-link" 
                   :class="{ active: abaAtiva === aba.key, 'text-white': abaAtiva !== aba.key }" 
                   href="#" @click.prevent="$emit('update:abaAtiva', aba.key)">
                    {{ aba.label }}
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { BButton, BCard, BFormGroup, BFormInput } from 'bootstrap-vue-next';

export default {
    components: { BButton, BCard, BFormGroup, BFormInput },
    // ADICIONADO: prop 'nota'
    // ADICIONADO: props do cronômetro (modo, label etc)
    props: ['rodada', 'timeA', 'timeB', 'golsA', 'golsB', 'uniformeA', 'uniformeB', 'dataHora', 'abaAtiva', 'nota', 'tempoFormatado', 'statusCronometro', 'tempoRestante', 'modoCronometro', 'labelTempo', 'duracaoPartida'],
    // ADICIONADO: emits do cronômetro (novo emit trocarModo)
    emits: ['voltar', 'salvar', 'update:dataHora', 'update:abaAtiva', 'sharear', 'update:nota', 'iniciar', 'pausar', 'resetar', 'editarTempo', 'ajustarSegundos', 'trocarModo'],
    data() {
        return {
            abas: [
                { key: 'EVENTOS', label: '📝 Súmula' },
                { key: 'TIMELINE', label: '⏱️ Lances' },
                { key: 'ESCALACAO', label: '📋 Escalação' },
                { key: 'SUBS', label: '🔄 Subs' },
                { key: 'UNIFORMES', label: '👕 Uniformes' },
                { key: 'FORMACAO', label: '📐 Formação' }
            ]
        }
    },
    methods: {
        setNota(valor) {
            // Se clicar na mesma nota, zera (opcional, remove se não quiser)
            const novaNota = this.nota === valor ? 0 : valor;
            this.$emit('update:nota', novaNota);
            this.$emit('salvar');
        }
    }
}
</script>

<style scoped>
.uniforme-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-style: solid;
  border-width: 3px;
  position: absolute;
  bottom: -10px;
  right: -10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.nav-link { 
    cursor: pointer; 
    font-size: 0.65rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    height: 100%;
    min-height: 48px;
    padding: 5px 2px;
    text-align: center;
    line-height: 1.1;
}
.nav-tabs .nav-item {
    display: flex;
}
.cursor-pointer { cursor: pointer; }
@media (min-width: 768px) {
    .escudo-time {
        height: 80px;
    }
}

/* NOVO LAYOUT CRONÔMETRO */
.crono-wrapper {
    background-color: #000;
    width: 100%;
}

.tempo-display {
    font-size: 4rem;
    line-height: 1;
    text-align: center;
    width: 100%;
}

.main-btn {
    min-height: 45px;
}

.date-input-mobile {
    max-width: 150px;
}

@media (min-width: 992px) {
    .crono-wrapper {
        width: 250px;
    }
    .tempo-display {
        font-size: 3.5rem;
    }
    .main-btn {
        min-height: 60px;
    }
    .date-input-mobile {
        max-width: 100%;
    }
    .border-lg-start {
        border-left: 1px solid #dee2e6 !important;
    }
    .border-lg-top-0 {
        border-top: 0 !important;
    }
}

/* Ajustes finos de botões no mobile-tablet */
@media (max-width: 991px) {
    .btn-crono-group {
        max-width: 100%;
    }
    .crono-wrapper {
        border-top: 2px solid #444;
    }
}

@media (min-width: 768px) and (max-width: 991px) {
     .tempo-display {
        font-size: 3rem;
        width: auto;
    }
    .btn-crono-group {
        max-width: 240px;
    }
}
</style>