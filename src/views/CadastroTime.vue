<template>
  <div class="container mt-4">
    <BCard title="Cadastro de Novo Time" class="mb-4 shadow-sm">
      <BForm @submit.prevent="salvarTime">
        
        <h5 class="mb-3 text-primary">Informações Gerais</h5>

        <BRow>
  <!-- NOME -->
  <BCol md="6">
    <BFormGroup label="Nome do Time:" class="mb-3">
      <BFormInput
        v-model="novoTime.nome"
        placeholder="Ex: iCup Sport Club"
      />
    </BFormGroup>
  </BCol>

  <!-- PAÍS -->
  <BCol md="6">
    <BFormGroup label="País do Time:" class="mb-3">
      <BFormInput
        v-model="novoTime.pais"
        placeholder="Ex: Brasil"
      />
    </BFormGroup>
  </BCol>

  <!-- ESCUDO -->
  <BCol md="6">
    <BFormGroup label="Link do Escudo (URL):" class="mb-3">
      <BFormInput
        v-model="novoTime.escudo"
        placeholder="https://..."
      />
    </BFormGroup>
  </BCol>

  <!-- ESTÁDIO -->
  <BCol md="6">
    <BFormGroup label="Estádio / Quadra:" class="mb-3">
      <BFormInput
        v-model="novoTime.estadio"
        placeholder="Ex: Maracanã"
      />
    </BFormGroup>
  </BCol>
</BRow>



        <BRow v-if="novoTime.escudo" class="mb-4 justify-content-center text-center">
          <BCol md="4">
            <div class="border p-2 rounded">
              <small class="d-block mb-2 text-muted">Pré-visualização</small>
              <img 
                :src="novoTime.escudo" 
                alt="Escudo" 
                style="max-height: 100px; max-width: 100%; object-fit: contain;"
                @error="imagemErro = true"
                @load="imagemErro = false"
              />
              <div v-if="imagemErro" class="text-danger mt-1 small">
                Erro ao carregar imagem
              </div>
            </div>
          </BCol>
        </BRow>

        <hr />

        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="text-primary mb-0">Cores do Time (Uniformes)</h5>
            <BButton 
              size="sm" 
              variant="outline-primary" 
              @click="adicionarCor" 
              :disabled="novoTime.cores.length >= 10"
            >
              + Adicionar Combinação
            </BButton>
          </div>
          
          <div class="d-flex flex-wrap gap-3">
            <div 
              v-for="(esquema, index) in novoTime.cores" 
              :key="index" 
              class="border rounded p-2 d-flex flex-column align-items-center position-relative"
              style="min-width: 140px;"
            >
              <button 
                type="button"
                class="btn-close position-absolute top-0 end-0 m-1 small" 
                aria-label="Close" 
                style="font-size: 0.7rem;"
                @click="removerCor(index)"
              ></button>

              <div class="mb-2 fw-bold small text-muted">
                {{ index === 0 ? '🏠 Uniforme 1 (CASA)' : (index === 1 ? '🚌 Uniforme 2 (FORA)' : '👕 Opção ' + (index + 1)) }}
              </div>

              <div 
                class="color-badge mb-2"
                :style="{ 
                  backgroundColor: esquema.interno, 
                  borderColor: esquema.externo 
                }"
              ></div>

              <div class="d-flex gap-1 justify-content-center mb-2">
                <div class="text-center">
                  <input type="color" class="form-control form-control-color form-control-sm" v-model="esquema.externo">
                  <span class="d-block" style="font-size: 0.6rem;">Externo</span>
                </div>
                <div class="text-center">
                  <input type="color" class="form-control form-control-color form-control-sm" v-model="esquema.interno">
                  <span class="d-block" style="font-size: 0.6rem;">Interno</span>
                </div>
              </div>

              <div class="w-100 mt-1">
                <BFormInput v-model="esquema.arte" size="sm" placeholder="URL da Arte (PNG/JPG)" class="mb-1" style="font-size: 0.7rem;" />
              </div>
            </div>
          </div>
        </div>

        <hr />

        <h5 class="mb-3 text-primary">Elenco</h5>
        <p class="text-muted small">Preencha os jogadores do time (quantidade livre).</p>
        
        <BRow>
          <BCol md="6">
            <div v-for="(jogador, index) in novoTime.jogadores.slice(0, 11)" :key="index" class="mb-2">
              <BInputGroup>
                <BInputGroupText style="width: 45px; justify-content: center;">
                  {{ index + 1 }}
                </BInputGroupText>
                <BFormInput
                  v-model="novoTime.jogadores[index].nome"
                  placeholder="Nome do Jogador"
                />
              </BInputGroup>
            </div>
          </BCol>

          <BCol md="6">
            <div v-for="(jogador, index) in novoTime.jogadores.slice(11, 22)" :key="index + 11" class="mb-2">
              <BInputGroup>
                <BInputGroupText style="width: 45px; justify-content: center;">
                  {{ index + 12 }}
                </BInputGroupText>
                <BFormInput
                  v-model="novoTime.jogadores[index + 11].nome"
                  placeholder="Nome do Jogador"
                />
              </BInputGroup>
            </div>
          </BCol>
        </BRow>

        <div class="mt-4 d-grid gap-2">
          <BButton type="submit" variant="primary" size="lg">
            Cadastrar Time
          </BButton>
        </div>

      </BForm>
    </BCard>
  </div>
</template>

<script>
import {
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BRow,
  BCol,
  BButton,
  BInputGroup,
  BInputGroupText
} from 'bootstrap-vue-next'

import DbService from '@/services/DbService';

export default {
  name: 'CadastroTime',
  components: {
    BCard,
    BForm,
    BFormGroup,
    BFormInput,
    BRow,
    BCol,
    BButton,
    BInputGroup,
    BInputGroupText
  },
  data() {
    return {
      imagemErro: false,
      novoTime: {
        nome: '',
        pais: '',
        escudo: '',
        estadio: '',
        cores: [],
        // Inicializa array com 22 slots disponíveis
        jogadores: Array.from({ length: 22 }, (_, i) => ({
          numero: i + 1,
          nome: ''
        }))
      }
    }
  },
  methods: {
    verificarImagem() {
      this.imagemErro = false; 
    },
    adicionarCor() {
      if (this.novoTime.cores.length < 10) {
        this.novoTime.cores.push({ interno: '#ffffff', externo: '#000000', arte: '' });
      }
    },
    removerCor(index) {
      this.novoTime.cores.splice(index, 1);
    },
    async salvarTime() {
      // 1. Validação Manual para Feedback Detalhado
      const erros = [];

      if (!this.novoTime.nome) erros.push("Nome do Time");
      if (!this.novoTime.pais) erros.push('País');
      if (!this.novoTime.escudo) erros.push("Link do Escudo");
      
      if (this.imagemErro) {
        erros.push("A imagem do escudo não pôde ser carregada (URL inválida).");
      }

      // Se houver erros, mostra alerta e para a execução
      if (erros.length > 0) {
        alert("Atenção! Preencha os seguintes campos obrigatórios:\n\n- " + erros.join("\n- "));
        return;
      }

      // 2. Filtra jogadores vazios
      const jogadoresValidos = this.novoTime.jogadores.filter(j => j.nome.trim() !== '');

      if (jogadoresValidos.length === 0) {
        if(!confirm("Tem certeza que deseja cadastrar um time sem jogadores?")) {
            return;
        }
      }

      const timeParaSalvar = {
        ...this.novoTime,
        jogadores: jogadoresValidos
      };

      try {
        await DbService.adicionarTime(timeParaSalvar);
        
        this.$emit('ao-salvar-time', timeParaSalvar);

        alert('Time salvo com sucesso no banco de dados!');
        this.resetarFormulario();
        
      } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar o time. Tente novamente.');
      }
    },
    resetarFormulario() {
      this.novoTime = {
        nome: '',
        escudo: '',
        estadio: '',
        cores: [],
        tecnico: '',
        jogadores: Array.from({ length: 22 }, (_, i) => ({
          numero: i + 1,
          nome: ''
        }))
      };
      this.imagemErro = false;
    }
  }
}
</script>

<style scoped>
.color-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-style: solid;
  border-width: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .btn-group-vertical {
    width: 100%;
  }
}
</style>