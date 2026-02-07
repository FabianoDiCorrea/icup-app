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

        <BCard class="text-center shadow-sm mb-4 border-secondary bg-dark text-white">
            <div class="position-relative py-3" style="min-height: 220px;">
                
                <!-- Wrapper Central do Placar (Centralizado) -->
                <div class="d-flex justify-content-center align-items-center mb-3">
                    
                    <div class="d-flex justify-content-center align-items-center" style="pointer-events: auto;">
                        <!-- Time A -->
                        <div class="text-center mx-2 mx-md-4" style="width: 120px;">
                            <div class="position-relative d-inline-block">
                                <img :src="timeA.escudo" class="mb-2 d-block mx-auto img-fluid escudo-time" />
                                <div v-if="uniformeA" class="uniforme-mini" 
                                     :style="{ backgroundColor: uniformeA.interno, borderColor: uniformeA.externo, width: '25px', height: '25px', borderWidth: '4px' }">
                                </div>
                            </div>
                            <div class="fw-bold text-truncate mt-1 d-block h6 mb-0">{{ timeA.nome }}</div>
                        </div>

                        <!-- Placar -->
                        <div class="d-flex align-items-center px-3 px-md-4 py-2 rounded shadow border border-secondary bg-secondary mx-2">
                            <h1 class="m-0 fw-bold text-white d-md-none display-5">{{ golsA }}</h1>
                            <h1 class="m-0 fw-bold text-white d-none d-md-block display-3">{{ golsA }}</h1>
                            <span class="mx-2 mx-md-3 text-white-50 h3 m-0">x</span>
                            <h1 class="m-0 fw-bold text-white d-md-none display-5">{{ golsB }}</h1>
                            <h1 class="m-0 fw-bold text-white d-none d-md-block display-3">{{ golsB }}</h1>
                        </div>

                        <!-- Time B -->
                        <div class="text-center mx-2 mx-md-4" style="width: 120px;">
                            <div class="position-relative d-inline-block">
                                <img :src="timeB.escudo" class="mb-2 d-block mx-auto img-fluid escudo-time" />
                                <div v-if="uniformeB" class="uniforme-mini" 
                                     :style="{ backgroundColor: uniformeB.interno, borderColor: uniformeB.externo, width: '25px', height: '25px', borderWidth: '4px' }">
                                </div>
                            </div>
                            <div class="fw-bold text-truncate mt-1 d-block h6 mb-0">{{ timeB.nome }}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer (Data e Estrelas) -->
                <div class="d-flex justify-content-center align-items-center gap-4">
                    <BFormGroup label-cols="auto" class="mb-0 text-white-50">
                        <BFormInput type="datetime-local" :model-value="dataHora" size="sm" 
                            class="bg-secondary text-white border-secondary" 
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
                
                <!-- CRONÔMETRO (Absoluto à Direita - Centralizado Verticalmente no Container Total) -->
                <div class="position-absolute end-0 top-50 translate-middle-y me-1 me-md-3 border border-secondary rounded p-2 bg-black d-flex flex-column align-items-center shadow-lg" 
                     style="z-index: 10; min-width: 250px;">
                    
                    <!-- Tempo -->
                    <div class="fw-bold text-monospace mb-1" 
                         :class="{'text-success': statusCronometro === 'RODANDO', 'text-danger': statusCronometro === 'ENCERRADO', 'text-white': statusCronometro === 'PARADO'}"
                         style="font-family: 'Courier New', monospace; letter-spacing: 2px; font-size: 4rem; line-height: 1;">
                        {{ tempoFormatado }}
                    </div>
                    
                    <!-- Controles -->
                    <div class="d-flex gap-2 mb-2 w-100 justify-content-center">
                         <BButton v-if="statusCronometro === 'RODANDO'" variant="warning" size="lg" class="flex-grow-1 fw-bold py-3" @click="$emit('pausar')">
                            ⏸️
                         </BButton>
                         <BButton v-else variant="success" size="lg" class="flex-grow-1 fw-bold py-3" :disabled="tempoRestante <= 0" @click="$emit('iniciar')">
                            ▶️
                         </BButton>
                         
                         <BButton variant="outline-secondary" size="lg" class="py-3 px-3" @click="$emit('resetar')" title="Reiniciar">
                            🔄
                         </BButton>
                    </div>

                    <!-- Ajuste Fino -->
                    <div class="d-flex gap-2 mb-2 w-100">
                        <BButton variant="dark" size="sm" class="flex-grow-1 border-secondary" @click="$emit('ajustarSegundos', -10)">
                            - 10s
                        </BButton>
                        <BButton variant="dark" size="sm" class="flex-grow-1 border-secondary" @click="$emit('ajustarSegundos', 10)">
                            + 10s
                        </BButton>
                    </div>

                    <BButton variant="dark" size="sm" class="text-muted w-100 border-secondary py-1" style="font-size: 0.85rem;" @click="$emit('editarTempo')">
                         ⏱️ EDITAR TEMPO
                    </BButton>
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
    // ADICIONADO: props do cronômetro
    props: ['rodada', 'timeA', 'timeB', 'golsA', 'golsB', 'uniformeA', 'uniformeB', 'dataHora', 'abaAtiva', 'nota', 'tempoFormatado', 'statusCronometro', 'tempoRestante'],
    // ADICIONADO: emits do cronômetro
    emits: ['voltar', 'salvar', 'update:dataHora', 'update:abaAtiva', 'sharear', 'update:nota', 'iniciar', 'pausar', 'resetar', 'editarTempo', 'ajustarSegundos'],
    data() {
        return {
            abas: [
                { key: 'EVENTOS', label: '📝 Súmula' },
                { key: 'TIMELINE', label: '⏱️ Lances' },
                { key: 'ESCALACAO', label: '📋 Escalação' },
                { key: 'SUBS', label: '🔄 Subs' },
                { key: 'UNIFORMES', label: '👕 Uniformes' }
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
.nav-link { cursor: pointer; font-size:0.7rem }
.star-icon {
    transition: transform 0.1s;
    user-select: none;
}
.star-icon:hover {
    transform: scale(1.3);
}
.cursor-pointer { cursor: pointer; }
.escudo-time {
    height: 60px;
}
@media (min-width: 768px) {
    .escudo-time {
        height: 80px;
    }
}
</style>