<template>
  <div class="container mt-4">
    <!-- Modal de Importação de Texto -->


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
    <BFormGroup label="Link do Escudo (URL) ou Upload:" class="mb-3">
      <BInputGroup>
        <BFormInput
          v-model="novoTime.escudo"
          placeholder="https://..."
          @input="verificarImagem"
        />
        <template #append>
          <BButton variant="primary" @click="$refs.escudoInput.click()">📁 Upload</BButton>
          <input type="file" ref="escudoInput" class="d-none" accept="image/*" @change="handleEscudoUpload" />
        </template>
      </BInputGroup>
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
                <BInputGroup size="sm" class="mb-1">
                  <BFormInput v-model="esquema.arte" placeholder="URL da Arte ou Upload" style="font-size: 0.7rem;" />
                  <template #append>
                    <BButton variant="secondary" @click="$refs['arteInput' + index][0].click()">📁</BButton>
                    <input type="file" :ref="'arteInput' + index" class="d-none" accept="image/*" @change="handleArteUpload($event, index)" />
                  </template>
                </BInputGroup>
                <div v-if="esquema.arte" class="text-center mt-1">
                  <img :src="esquema.arte" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%;" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr />

        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="text-primary mb-0">Elenco</h5>
            <p class="text-muted small mb-0">Preencha os jogadores do time (quantidade livre).</p>
          </div>
          <div>
            <b-button type="button" variant="info" class="mb-3 ms-2" @click="mostrarModalImportacao" v-b-tooltip.hover title="Cole uma escalação de qualquer site">
                📋 Colar Escalação
            </b-button>
            <b-button type="button" variant="warning" class="mb-3 ms-2" @click="atualizarElencoApi" v-if="apiConfigurada" v-b-tooltip.hover title="Atualiza com dados da API (Requer chave configurada)">
                🔄 Atualizar Elenco da API
            </b-button>
          </div>
        </div>
        
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

    <!-- Modal Customizado de Importação -->
    <div v-if="modalImportacaoVisivel" class="modal-overlay">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5>📋 Colar Escalação</h5>
          <button @click="modalImportacaoVisivel = false" class="btn-close-custom">×</button>
        </div>
        <div class="modal-body-custom">
          <p class="text-muted mb-2">Copie a escalação de um site (GE, Google) e cole aqui:</p>
          
          <div class="mb-3 p-2 bg-light rounded border">
             <small class="text-secondary d-block mb-2 fw-bold">🔎 Não achou a escalação? Busque rápido:</small>
             <div class="d-flex gap-2 flex-wrap">
                 <button class="btn btn-outline-primary btn-sm" @click="buscarEscalacao('google')">
                   Google
                 </button>
                 <button class="btn btn-outline-success btn-sm" @click="buscarEscalacao('ge')">
                   Globo Esporte
                 </button>
                 <button class="btn btn-outline-secondary btn-sm" @click="buscarEscalacao('sofascore')">
                   Sofascore
                 </button>
             </div>
          </div>

          <textarea
            v-model="textoEscalacao"
            class="form-control"
            placeholder="Ex: 1. Rossi, 2. Varela, 3. Léo Ortiz..."
            rows="8"
          ></textarea>
          <div class="mt-2 text-info small">
            <i class="bi bi-info-circle"></i> O sistema identificará nomes e números.
          </div>
        </div>
        <div class="modal-footer-custom">
          <button @click="modalImportacaoVisivel = false" class="btn btn-secondary me-2">Cancelar</button>
          <button @click="importarDoTexto" class="btn btn-success">Importar Jogadores</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { BCard, BForm, BFormGroup, BFormInput, BRow, BCol, BButton, BInputGroup, BInputGroupText } from 'bootstrap-vue-next';

import DbService from '@/services/DbService';
import { toBase64 } from '@/utils/ImageUtils';
import FootballApiService from '@/services/FootballApiService';

import ClipboardParser from '../utils/ClipboardParser';

export default {
  name: 'CadastroTime',
  components: {
    BCard, BForm, BFormGroup, BFormInput, BRow, BCol, BButton, BInputGroup, BInputGroupText
  },
  data() {
    return {
      imagemErro: false,
      apiConfigurada: false,
      textoEscalacao: '', // Texto do modal
      modalImportacaoVisivel: false,
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
    async handleEscudoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const base64 = await toBase64(file);
          this.novoTime.escudo = base64;
          this.verificarImagem();
        } catch (error) {
          console.error("Erro ao converter escudo:", error);
          alert("Erro ao carregar imagem.");
        }
      }
    },
    async handleArteUpload(event, index) {
      const file = event.target.files[0];
      if (file) {
        try {
          const base64 = await toBase64(file);
          this.novoTime.cores[index].arte = base64;
        } catch (error) {
          console.error("Erro ao converter arte:", error);
          alert("Erro ao carregar imagem.");
        }
      }
    },
    resetarFormulario() {
      this.novoTime = {
        nome: '',
        pais: '',
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
    },

    mostrarModalImportacao() {
        this.textoEscalacao = '';
        this.modalImportacaoVisivel = true;
    },
    
    importarDoTexto() {
        if (!this.textoEscalacao.trim()) return;
        
        const jogadoresImportados = ClipboardParser.parse(this.textoEscalacao);
        
        if (jogadoresImportados.length === 0) {
            alert("⚠️ Não consegui entender a escalação. Tente copiar apenas a lista de jogadores.");
            return;
        }

        // Preenche os inputs com os dados importados
        jogadoresImportados.forEach(jogador => {
            // Encontra o slot correspondente (1 a 22)
            const index = jogador.numero - 1; 
            if (index >= 0 && index < this.novoTime.jogadores.length) {
                this.$set(this.novoTime.jogadores, index, {
                    numero: jogador.numero,
                    nome: jogador.nome
                });
            }
        });


        this.modalImportacaoVisivel = false;
        alert(`Importados ${jogadoresImportados.length} jogadores com sucesso!`);
    },

    buscarEscalacao(site) {
      const termo = this.novoTime.nome ? `${this.novoTime.nome} escalação` : 'escalação time futebol';
      let url = '';
      if (site === 'google') {
          url = `https://www.google.com/search?q=${encodeURIComponent(termo)}`;
      } else if (site === 'ge') {
          url = `https://www.google.com/search?q=${encodeURIComponent('site:ge.globo.com ' + termo)}`;
      } else if (site === 'sofascore') {
          url = `https://www.google.com/search?q=${encodeURIComponent('site:sofascore.com ' + termo)}`;
      }
      window.open(url, '_blank');
    },


    async atualizarElencoApi() {
      // Verifica se a API está configurada
      if (!FootballApiService.isConfigured()) {
        const configurar = confirm(
          "⚠️ API não configurada!\n\n" +
          "Para usar esta funcionalidade, você precisa:\n" +
          "1. Criar conta gratuita em api-football.com\n" +
          "2. Obter sua chave API (100 buscas/dia grátis)\n" +
          "3. Configurar a chave nas Configurações do app\n\n" +
          "Deseja ir para as Configurações agora?"
        );
        
        if (configurar) {
          this.$router.push('/configuracoes');
        }
        return;
      }

      if (!this.novoTime.nome) {
        alert("⚠️ Digite o nome do time primeiro!");
        return;
      }

      const confirma = confirm(
        `🔍 Buscar elenco de "${this.novoTime.nome}" na API?\n\n` +
        "Isso irá buscar os 11 titulares da última partida oficial."
      );

      if (!confirma) return;

      try {
        const jogadores = await FootballApiService.buscarElencoRecente(this.novoTime.nome);
        
        if (jogadores.length === 0) {
          alert("❌ Nenhum jogador encontrado.");
          return;
        }

        this.novoTime.jogadores = jogadores;
        alert(`✅ ${jogadores.length} jogadores importados com sucesso!`);
        
      } catch (error) {
        console.error('Erro ao buscar elenco:', error);
        alert(
          `❌ Erro ao buscar elenco:\n\n${error.message}\n\n` +
          "Dicas:\n" +
          "- Verifique se o nome do time está correto\n" +
          "- Tente usar o nome em inglês (ex: 'Flamengo' ou 'Palmeiras')\n" +
          "- Verifique sua chave API nas Configurações"
        );
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content-custom {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}


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