<template>
    <div>
        <div class="sticky-top bg-dark border-bottom border-secondary py-3 mb-4" style="z-index: 10;">
            <p class="text-center text-muted small mb-2">
                <span v-if="!ferramentaAtiva">Selecione uma ação e clique no jogador.</span>
                <span v-else class="text-primary fw-bold">Modo Ativo: APLICAR {{ ferramentaAtiva }}</span>
            </p>

            <div class="d-flex justify-content-center gap-1 gap-md-2 flex-wrap px-1">
                <BButton size="sm" :variant="ferramentaAtiva === 'GOL' ? 'success' : 'outline-success'" class="btn-acao" @click="alternar('GOL')">⚽ Gol</BButton>
                <BButton size="sm" :variant="ferramentaAtiva === 'AZUL' ? 'info' : 'outline-info'" class="btn-acao" @click="alternar('AZUL')">🟦 Azul</BButton>
                <BButton size="sm" :variant="ferramentaAtiva === 'AMARELO' ? 'warning' : 'outline-warning'" class="btn-acao" @click="alternar('AMARELO')">🟨 Amarelo</BButton>
                <BButton size="sm" :variant="ferramentaAtiva === 'VERMELHO' ? 'danger' : 'outline-danger'" class="btn-acao" @click="alternar('VERMELHO')">🟥 Vermelho</BButton>
                <BButton size="sm" :variant="ferramentaAtiva === 'CRAQUE' ? 'primary' : 'outline-primary'" class="btn-acao" @click="alternar('CRAQUE')">⭐ Craque</BButton>
                <BButton
                    size="sm"
                    variant="outline-light"
                    class="ms-1"
                    @click="$emit('simular')"
                >
                    🎲 SIMULAR
                </BButton>

                <BButton v-if="jogo.fase && !jogo.grupo && golsA === golsB"
                    size="sm"
                    variant="outline-warning"
                    @click="$emit('simularPenaltis')"
                >
                    ⚽ PÊNALTIS
                </BButton>



            </div>
        </div>

        <BRow>
            <BCol md="6" class="mb-4">
                <h6 class="text-center border-bottom border-secondary pb-2 text-white">{{ timeA.nome }}</h6>
                <div class="list-group">
                    <button v-for="jogador in elencoA" :key="getId(jogador)"
                        class="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-center border-secondary"
                        :class="getClasse(jogador, timeA.id)" @click="$emit('aplicar', jogador, timeA.id)"
                        style="cursor: pointer;">

                        <div class="d-flex align-items-center">
                            <span class="badge bg-secondary me-2" style="width: 30px;">{{ jogador.numero }}</span>
                            <span class="me-2">{{ jogador.nome }}</span>
                            <span v-if="ehTitular(jogador, titularesA)" class="badge text-info border border-info me-1"
                                title="Titular">T</span>
                            <span v-if="entrou(jogador, timeA.id)" class="text-success me-1" title="Entrou">⬆</span>
                            <span v-if="saiu(jogador, timeA.id)" class="text-danger me-1" title="Saiu">⬇</span>
                            <span v-if="ehCraque(jogador, timeA.id)" title="Craque">⭐</span>
                        </div>

                        <div class="d-flex gap-1 event-icons">
                            <span v-for="ev in getEventos(jogador, timeA.id, 'GOL')" :key="ev.id">⚽</span>
                            <span v-for="ev in getEventos(jogador, timeA.id, 'AZUL')" :key="ev.id">🟦</span>
                            <span v-for="ev in getEventos(jogador, timeA.id, 'AMARELO')" :key="ev.id">🟨</span>
                            <span v-for="ev in getEventos(jogador, timeA.id, 'VERMELHO')" :key="ev.id">🟥</span>
                        </div>
                    </button>
                </div>
            </BCol>

            <BCol md="6" class="mb-4">
                <h6 class="text-center border-bottom border-secondary pb-2 text-white">{{ timeB.nome }}</h6>
                <div class="list-group">
                    <button v-for="jogador in elencoB" :key="getId(jogador)"
                        class="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-center border-secondary"
                        :class="getClasse(jogador, timeB.id)" @click="$emit('aplicar', jogador, timeB.id)"
                        style="cursor: pointer;">

                        <div class="d-flex align-items-center">
                            <span class="badge bg-secondary me-2" style="width: 30px;">{{ jogador.numero }}</span>
                            <span class="me-2">{{ jogador.nome }}</span>
                            <span v-if="ehTitular(jogador, titularesB)" class="badge text-info border border-info me-1"
                                title="Titular">T</span>
                            <span v-if="entrou(jogador, timeB.id)" class="text-success me-1" title="Entrou">⬆</span>
                            <span v-if="saiu(jogador, timeB.id)" class="text-danger me-1" title="Saiu">⬇</span>
                            <span v-if="ehCraque(jogador, timeB.id)" title="Craque">⭐</span>
                        </div>

                        <div class="d-flex gap-1 event-icons">
                            <span v-for="ev in getEventos(jogador, timeB.id, 'GOL')" :key="ev.id">⚽</span>
                            <span v-for="ev in getEventos(jogador, timeB.id, 'AZUL')" :key="ev.id">🟦</span>
                            <span v-for="ev in getEventos(jogador, timeB.id, 'AMARELO')" :key="ev.id">🟨</span>
                            <span v-for="ev in getEventos(jogador, timeB.id, 'VERMELHO')" :key="ev.id">🟥</span>
                        </div>
                    </button>
                </div>
            </BCol>
        </BRow>
    </div>
</template>

<script>
import { BButton, BRow, BCol } from 'bootstrap-vue-next';

export default {
    components: { BButton, BRow, BCol },
    props: ['timeA', 'timeB', 'elencoA', 'elencoB', 'titularesA', 'titularesB', 'ferramentaAtiva', 'jogo', 'golsA', 'golsB'],
    emits: ['update:ferramentaAtiva', 'aplicar', 'simular', 'simularPenaltis'],
    methods: {
        getId(j) { return j.id || j.numero },
        alternar(tool) {
            this.$emit('update:ferramentaAtiva', (this.ferramentaAtiva === tool) ? null : tool);
        },
        // Helpers locais delegando para props/lógica
        getEventos(jogador, timeId, tipo) {
            const jId = this.getId(jogador);
            return (this.jogo.eventos || []).filter(e => e.jogador && e.jogador.id == jId && e.timeId == timeId && e.tipo === tipo);
        },
        temCartao(jogador, timeId, tipo) {
            return this.getEventos(jogador, timeId, tipo).length > 0;
        },
        ehTitular(jogador, lista) { return (lista || []).some(t => t?.id == this.getId(jogador)); },
        ehCraque(jogador, timeId) {
            if (!this.jogo.craque) return false;
            return this.jogo.craque.id == this.getId(jogador) && this.jogo.craqueTimeId == timeId;
        },
        // Subs helpers (lógica simples baseada em jogo.substituicoes)
        entrou(jogador, timeId) {
            const jId = this.getId(jogador);
            return (this.jogo.substituicoes || []).some(s => s.timeId == timeId && s.entra?.id == jId);
        },
        saiu(jogador, timeId) {
            const jId = this.getId(jogador);
            return (this.jogo.substituicoes || []).some(s => s.timeId == timeId && s.sai?.id == jId);
        },
        getClasse(jogador, timeId) {
            const jId = this.getId(jogador);
            if (this.temCartao(jogador, timeId, 'VERMELHO')) return 'list-group-item-danger';

            const titular = (timeId == this.timeA.id ? this.titularesA : this.titularesB).some(t => t?.id == jId);
            const saiu = this.saiu(jogador, timeId);
            const entrou = this.entrou(jogador, timeId);

            if ((titular && !saiu) || (entrou && !saiu)) return 'border-start border-1 border-info';
            else if (saiu) return 'text-muted bg-black opacity-50';
            else return '';
        }
    }
}
</script>

<style scoped>
.list-group-item {
    background-color: transparent;
}

.list-group-item-action:not(.active):hover {
    background-color: rgb(19, 4, 73);
    color: #FFF;
}

[title="Entrou"],
[title="Saiu"] {
    font-size: 1.5rem;
}
</style>