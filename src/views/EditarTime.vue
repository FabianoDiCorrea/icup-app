<template>
  <div class="container mt-4">
    <!-- Modal de Importação de Texto -->


    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary">Editar Time</h2>
      <BButton variant="outline-secondary" @click="voltar">
        Voltar
      </BButton>
    </div>

    <div v-if="carregando" class="text-center py-5">
      <BSpinner label="Carregando..." />
    </div>

    <div v-else>
      <BCard class="shadow-sm">
        <BForm @submit.prevent="salvarAlteracoes">
          
          <h5 class="mb-3 text-primary">Informações Gerais</h5>
          
          <BRow>
            <BCol md="4">
              <BFormGroup label="Nome do Time:" label-for="nome-time" class="mb-3">
                <BFormInput id="nome-time" v-model="timeEditavel.nome" required />
              </BFormGroup>
            </BCol>

            <BCol md="2">
              <BFormGroup label="Sigla (3 letras):" label-for="sigla-time" class="mb-3">
                <BFormInput 
                  id="sigla-time" 
                  :model-value="timeEditavel.sigla"
                  @update:model-value="v => timeEditavel.sigla = v ? v.toUpperCase() : ''"
                  maxlength="3" 
                  style="text-transform: uppercase;"
                  placeholder="Ex: FLA"
                />
              </BFormGroup>
            </BCol>
            
            <BCol md="6">
              <BFormGroup label="Link do Escudo (URL) ou Upload:" label-for="escudo-time" class="mb-3">
                <BInputGroup>
                  <BFormInput id="escudo-time" v-model="timeEditavel.escudo" required @input="verificarImagem" placeholder="URL da imagem..." />
                  <template #append>
                    <BButton variant="primary" @click="$refs.escudoInput.click()">📁 Upload</BButton>
                    <input type="file" ref="escudoInput" class="d-none" accept="image/*" @change="handleEscudoUpload" />
                  </template>
                </BInputGroup>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol md="6">
              <BFormGroup label="Estádio / Quadra (opcional):" label-for="estadio-time" class="mb-3">
                <BFormInput
  id="estadio-time"
  v-model="timeEditavel.estadio"
/>
              </BFormGroup>
            </BCol>

          </BRow>

          <BCol md="6">
  <BFormGroup label="País do Time:" class="mb-3">
    <BFormInput
      v-model="timeEditavel.pais"
      placeholder="Ex: Brasil, Espanha"
    />
  </BFormGroup>
</BCol>

          <BRow v-if="timeEditavel.escudo" class="mb-4 justify-content-center text-center">
            <BCol md="4">
              <div class="border p-2 rounded">
                <img 
                  :src="timeEditavel.escudo" 
                  style="max-height: 100px; max-width: 100%; object-fit: contain;"
                  @error="imagemErro = true"
                  @load="imagemErro = false"
                />
                <div v-if="imagemErro" class="text-danger mt-1 small">Erro na imagem</div>
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
                :disabled="timeEditavel.cores.length >= 10"
              >
                + Adicionar Combinação
              </BButton>
            </div>
            
            <p class="text-muted small" v-if="timeEditavel.cores.length === 0">
              Nenhuma cor definida. Adicione combinações para representar os uniformes.
            </p>

            <div class="d-flex flex-wrap gap-3">
              <div 
                v-for="(esquema, index) in timeEditavel.cores" 
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
                  title="Externo (Borda) / Interno (Centro)"
                ></div>

                <div class="d-flex gap-1 justify-content-center mb-2">
                  <div class="text-center">
                    <input type="color" class="form-control form-control-color form-control-sm" v-model="esquema.externo" title="Cor Externa (Anel)">
                    <span class="d-block" style="font-size: 0.6rem;">Externo</span>
                  </div>
                  <div class="text-center">
                    <input type="color" class="form-control form-control-color form-control-sm" v-model="esquema.interno" title="Cor Interna (Miolo)">
                    <span class="d-block" style="font-size: 0.6rem;">Interno</span>
                  </div>
                </div>

                <!-- Campo para a Arte do Botão -->
                <div class="w-100 mt-1">
                  <BInputGroup size="sm" class="mb-1">
                    <BFormInput v-model="esquema.arte" placeholder="URL da Arte ou Upload" style="font-size: 0.7rem;" />
                    <template #append>
                      <BButton variant="secondary" @click="$refs['arteInput' + index][0].click()">📁</BButton>
                      <input type="file" :ref="'arteInput' + index" class="d-none" accept="image/*" @change="handleArteUpload($event, index)" />
                    </template>
                  </BInputGroup>
                  <div v-if="esquema.arte" class="text-center">
                    <img :src="esquema.arte" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%;" />
                  </div>
                </div>
              </div>
            </div>
            <div v-if="timeEditavel.cores.length >= 10" class="text-danger small mt-1">
              Limite máximo de 10 cores atingido.
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
                <b-button type="button" variant="warning" class="mb-3 ms-2" @click="atualizarElencoAPI" v-if="apiConfigurada" v-b-tooltip.hover title="Atualiza com dados da API (Requer chave configurada)">
                    🔄 Atualizar Elenco da API
                </b-button>
            </div>
          </div>
          
          <BRow>
            <BCol md="6">
              <div v-for="(jogador, index) in timeEditavel.jogadores.slice(0, 11)" :key="jogador.numero" class="mb-2">
                <BInputGroup>
                  <BInputGroupText style="width: 45px; justify-content: center;">
                    {{ jogador.numero }}
                  </BInputGroupText>
                  <BFormInput v-model="timeEditavel.jogadores[index].nome" placeholder="Nome do Jogador" />
                </BInputGroup>
              </div>
            </BCol>

            <BCol md="6">
              <div v-for="(jogador, index) in timeEditavel.jogadores.slice(11, 22)" :key="jogador.numero" class="mb-2">
                <BInputGroup>
                  <BInputGroupText style="width: 45px; justify-content: center;">
                    {{ jogador.numero }}
                  </BInputGroupText>
                  <BFormInput v-model="timeEditavel.jogadores[index + 11].nome" placeholder="Nome do Jogador" />
                </BInputGroup>
              </div>
            </BCol>
          </BRow>

          <div class="mt-4 d-flex justify-content-end gap-2">
            <BButton variant="secondary" @click="voltar">Cancelar</BButton>
            <BButton type="submit" variant="success" size="lg">Salvar Alterações</BButton>
          </div>

        </BForm>
      </BCard>
    </div>
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
import DbService from '../services/DbService.js';
import { toBase64 } from '../utils/ImageUtils.js';
import FootballApiService from '../services/FootballApiService.js';
import { BCard, BForm, BFormGroup, BFormInput, BFormSelect, BRow, BCol, BButton, BInputGroup, BInputGroupText, BSpinner } from 'bootstrap-vue-next';

import ClipboardParser from '../utils/ClipboardParser';

export default {
  name: 'EditarTime',
  components: {
    BCard, BForm, BFormGroup, BFormInput, BFormSelect, BRow, BCol, BButton, BInputGroup, BInputGroupText, BSpinner
  },
  props: {},
  data() {
    return {
      carregando: true,
      imagemErro: false,
      idTime : '',
      timeEditavel: {
        nome: '',
        pais: '',
        sigla: '',
        escudo: '',
        estadio: '',
        cores: [], // Array de objetos { interno: hex, externo: hex }
        jogadores: []
      },
      originalData: '',
      editedTime: [],
      apiConfigurada: false,
      textoEscalacao: '', // Texto do modal
      modalImportacaoVisivel: false,

    }
  },
  computed: {
    foiAlterado() {
      if (!this.originalData) return false;
      return this.originalData !== JSON.stringify(this.timeEditavel);
    }
  },
  async mounted() {
    this.idTime = this.$route.params.id || this.$route.params.idTime;
    await this.carregarTime();
    this.apiConfigurada = FootballApiService.isConfigured();
  },
  methods: {
    async carregarTime() {
      try {
        const timeBanco = await DbService.getTimeById(this.idTime);
        
        if (!timeBanco) {
          alert("Time não encontrado!");
          this.$emit('cancelar'); 
          this.$router.push('/');
          return;
        }

        // 1. CLONE PROFUNDO
        const timeClone = JSON.parse(JSON.stringify(timeBanco));

        // 2. TRATAMENTO DE LEGADO
        if (!timeClone.sigla) timeClone.sigla = '';
        if (!timeClone.cores) timeClone.cores = []; // Inicia array vazio se não existir

        // 3. RECONSTRUIR ARRAY DE JOGADORES (22 POSIÇÕES)
        const jogadoresPreenchidos = timeClone.jogadores || [];
        const totalSlots = 22;
        
        const elencoCompleto = Array.from({ length: totalSlots }, (_, i) => {
          const numeroCamisa = i + 1;
          const jogadorEncontrado = jogadoresPreenchidos.find(j => j.numero == numeroCamisa);

          if (jogadorEncontrado) {
            return jogadorEncontrado;
          }
          return { numero: numeroCamisa, nome: '' };
        });

        timeClone.jogadores = elencoCompleto;
        this.timeEditavel = timeClone;
        
        // Salva estado original para comparação (após o clone para garantir igualdade de tipos)
        this.$nextTick(() => {
          this.originalData = JSON.stringify(this.timeEditavel);
        });

      } catch (error) {
        console.error("Erro ao carregar time:", error);
      } finally {
        this.carregando = false;
      }
    },

    verificarImagem() {
      this.imagemErro = false;
    },

    // --- CORES ---
    adicionarCor() {
      if (this.timeEditavel.cores.length < 10) {
        // Adiciona padrão: Branco no centro, Preto na borda
        this.timeEditavel.cores.push({ interno: '#ffffff', externo: '#000000' });
      }
    },
    removerCor(index) {
      this.timeEditavel.cores.splice(index, 1);
    },

    async salvarAlteracoes() {
      // 1. Validação
      if (!this.timeEditavel.nome || !this.timeEditavel.escudo || !this.timeEditavel.pais) {
  alert("Nome, Escudo e País são obrigatórios.");
  return;
}


      // 2. Preparar objeto
      const objetoLimpo = JSON.parse(JSON.stringify(this.timeEditavel));
      
      if (objetoLimpo.sigla) {
          objetoLimpo.sigla = objetoLimpo.sigla.toUpperCase();
      }

      // 3. Filtrar jogadores válidos
      const jogadoresValidos = objetoLimpo.jogadores.filter(j => j.nome && j.nome.trim() !== '');

      if (jogadoresValidos.length === 0) {
        if(!confirm("Tem certeza que deseja salvar o time sem jogadores?")) {
            return;
        }
      }

      const timeFinal = {
        ...objetoLimpo,
        jogadores: jogadoresValidos
      };

      try {
        await DbService.atualizarTime(timeFinal);
        alert("Time atualizado com sucesso!");
        this.$emit('sucesso');
        this.$router.push({ name: 'ListaClubes' }); 
      } catch (error) {
        console.error(error);
        alert("Erro ao atualizar time.");
      }
    },

    async handleEscudoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const base64 = await toBase64(file);
          this.timeEditavel.escudo = base64;
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
          this.timeEditavel.cores[index].arte = base64;
        } catch (error) {
          console.error("Erro ao converter arte:", error);
          alert("Erro ao carregar imagem.");
        }
      }
    },

    voltar() {
      if (this.foiAlterado) {
        if (!confirm("Você fez alterações que não foram salvas. Deseja sair mesmo assim?")) {
          return;
        }
      }
      this.$router.push({ name: 'ListaClubes' });
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
            if (index >= 0 && index < this.timeEditavel.jogadores.length) {
                this.timeEditavel.jogadores[index].nome = jogador.nome;
            }
        });

        this.modalImportacaoVisivel = false;
        alert(`Importados ${jogadoresImportados.length} jogadores com sucesso!`);
    },

    buscarEscalacao(site) {
      const termo = this.timeEditavel.nome ? `${this.timeEditavel.nome} escalação` : 'escalação time futebol';
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

    async atualizarElencoAPI() {
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

      if (!this.timeEditavel.nome) {
        alert("⚠️ Digite o nome do time primeiro!");
        return;
      }

      const confirma = confirm(
        `🔍 Buscar elenco de "${this.timeEditavel.nome}" na API?\n\n` +
        "Isso irá buscar os 11 titulares da última partida oficial."
      );

      if (!confirma) return;

      try {
        this.carregando = true;
        const jogadores = await FootballApiService.buscarElencoRecente(this.timeEditavel.nome);
        
        if (jogadores.length === 0) {
          alert("❌ Nenhum jogador encontrado.");
          return;
        }

        this.timeEditavel.jogadores = jogadores;
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
      } finally {
        this.carregando = false;
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

/* Estilo para simular os 2 círculos */
.color-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-style: solid;
  border-width: 8px; /* Anel externo grosso para parecer "metade da largura" */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.color-badge:hover {
  transform: scale(1.1);
}
</style>