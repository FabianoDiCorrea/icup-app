<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-primary fw-bold mb-0">Manual do Treinador</h2>
        <span class="text-muted small">Guia detalhado de funcionalidades</span>
      </div>
      <BButton variant="outline-secondary" @click="$router.push('/')">Voltar</BButton>
    </div>

    <BCard no-body class="shadow-sm border-0 overflow-hidden">
      <BRow class="g-0">
        <BCol md="3" class="bg-dark border-end">
          <div class="nav flex-column nav-pills p-3" role="tablist" aria-orientation="vertical">
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'intro' }" 
              @click="abaAtiva = 'intro'"
            >
              🏁 Introdução
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'clubes' }" 
              @click="abaAtiva = 'clubes'"
            >
              🛡️ Gestão de Clubes
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'tecnicos' }" 
              @click="abaAtiva = 'tecnicos'"
            >
              👔 Gestão de Técnicos
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'campeonatos' }" 
              @click="abaAtiva = 'campeonatos'"
            >
              🏆 Campeonatos
            </button>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'partidas' }" 
              @click="abaAtiva = 'partidas'"
            >
              ⚽ Operando a Partida
            </button>
            <div class="border-top border-secondary my-2"></div>
            <button 
              class="nav-link text-start mb-1" 
              :class="{ active: abaAtiva === 'dados' }" 
              @click="abaAtiva = 'dados'"
            >
              💾 Backup e Segurança
            </button>
          </div>
        </BCol>

        <BCol md="9" class="bg-dark">
          <div class="p-4" style="min-height: 500px;">
            
            <div v-if="abaAtiva === 'intro'" class="fade-in">
              <h4 class="text-primary mb-3">Bem-vindo ao Sistema</h4>
              <p>
                Este sistema foi desenhado para ser um gerenciador de campeonatos <strong>agnóstico</strong>. 
                Isso significa que ele não impõe regras rígidas de futebol profissional (como 11 jogadores ou 3 substituições), 
                permitindo que você gerencie desde peladas de fim de semana, campeonatos de futsal, até ligas de videogame.
              </p>
              <BAlert show variant="info" class="mt-4">
                <h6 class="alert-heading fw-bold">⚠️ Importante: Modo Offline</h6>
                <p class="mb-0 small">
                  Todos os dados ficam salvos no <strong>seu navegador</strong>. Se você limpar o cache ou formatar o PC, os dados somem. 
                  Use a aba <strong>Configurações</strong> frequentemente para baixar um backup dos seus dados.
                </p>
              </BAlert>
            </div>

            <div v-if="abaAtiva === 'clubes'" class="fade-in">
              <h4 class="text-primary mb-3">Gestão de Clubes</h4>
              
              <h6 class="fw-bold mt-4">1. Cadastro Flexível</h6>
              <p class="text-muted small">
                Ao criar um time, você não precisa preencher 11 titulares. Você pode cadastrar apenas 5 (futsal) ou até 22 jogadores.
                O sistema aceita times com qualquer número de atletas.
              </p>

              <h6 class="fw-bold mt-4">2. Uniformes e Arte da Camisa</h6>
              <p class="text-muted small">
                Na edição do time, você pode criar "Combinações de Cores" (Kits).
                <br>
                Além disso, no campo <strong>URL da Camisa</strong>, você pode colar o link de uma imagem (.png) da camisa do time. 
                Essa imagem aparecerá na visualização de "Formação" antes das partidas.
              </p>

              <h6 class="fw-bold mt-4">3. Siglas</h6>
              <p class="text-muted small">
                Defina uma sigla de 3 letras (ex: FLA, VAS, PAL). Ela será usada na visualização mobile para economizar espaço na tabela de jogos.
              </p>
            </div>

            <div v-if="abaAtiva === 'campeonatos'" class="fade-in">
              <h4 class="text-primary mb-3">Formatos de Campeonato</h4>
              
              <div class="d-flex gap-3 mb-4">
                <div class="border rounded p-3 bg-dark w-100">
                  <strong>Pontos Corridos</strong>
                  <p class="small text-muted mb-0">Tabela tradicional. Todos contra todos (Turno ou Turno/Returno).</p>
                </div>
                <div class="border rounded p-3 bg-dark w-100">
                  <strong>Liga + Mata-Mata</strong>
                  <p class="small text-muted mb-0">Fase de grupos seguida de eliminatórias (estilo Copa do Mundo ou Champions).</p>
                </div>
                <div class="border rounded p-3 bg-dark w-100">
                  <strong>Mata-Mata Puro</strong>
                  <p class="small text-muted mb-0">Eliminatórias diretas desde o início. Perdeu, saiu.</p>
                </div>
              </div>

              <h6 class="fw-bold">Funcionalidades Extras</h6>
              <ul class="list-group list-group-flush small bg-transparent">
                <li class="list-group-item bg-transparent text-white border-secondary ps-0">
                  <strong>📄 Clonar Campeonato:</strong> Na lista de campeonatos, use o botão "Clonar" para criar uma cópia idêntica de um torneio existente (útil para criar a "2ª Edição" mantendo os mesmos times).
                </li>
                <li class="list-group-item bg-transparent text-white border-secondary ps-0">
                  <strong>🌍 Exibir País:</strong> Nas configurações do campeonato, você pode escolher se deseja exibir ou ocultar a bandeira do país do time na tabela.
                </li>
                <li class="list-group-item bg-transparent text-white border-secondary ps-0">
                  <strong>✏️ Editar/Configurar:</strong> Use o botão "Configurar" na lista para alterar regras, nome ou times participantes mesmo após o campeonato ter iniciado.
                </li>
              </ul>

              <h6 class="fw-bold mt-3">Avançando Fases (Mata-Mata)</h6>
              <p class="text-muted small">
                Quando todos os jogos da fase forem concluídos, o botão <strong>"Encerrar Fase"</strong> será liberado.
                Se a partida terminar empatada no tempo normal, a aba de <strong>Pênaltis</strong> ficará disponível para preenchimento.
               Caso os pênaltis não sejam informados, o sistema abrirá um menu para que você escolha manualmente quem avança.
              </p>
            </div>

            <div v-if="abaAtiva === 'partidas'" class="fade-in">
              <h4 class="text-primary mb-3">Operando a Partida</h4>
              <p>A tela de Súmula é o coração do sistema. Funcionalidades disponíveis:</p>

              <ul class="list-group list-group-flush small">
                <li class="list-group-item">
                  <strong>⏱️ Cronômetro:</strong> Um relógio simples para acompanhar o tempo de jogo. Você pode pausar e reiniciar.
                </li>
                <li class="list-group-item">
                  <strong>🤖 Simulação:</strong> Se não quiser jogar, pode usar o botão de "Simular Resultado" para gerar um placar aleatório baseado na força dos times.
                </li>
                <li class="list-group-item">
                  <strong>🟦 Cartão Azul:</strong> Opção de configurar expulsão temporária (se habilitado nas regras).
                </li>
                <li class="list-group-item">
                  <strong>🥅 Pênaltis:</strong> Em jogos de mata-mata que terminam empatados, uma aba extra de "Pênaltis" aparece para definir o vencedor.
                </li>
              </ul>

              <h6 class="fw-bold mt-4">Na Prática</h6>
              <p class="text-muted small">
                <strong>Escalação:</strong> Marque quem começou jogando.
                <br>
                <strong>Substituições:</strong> Selecione quem sai (deve estar em campo) e quem entra (deve estar no banco).
              </p>
            </div>

            <div v-if="abaAtiva === 'dados'" class="fade-in">
              <h4 class="text-primary mb-3">Backup e Segurança</h4>
              
              <h6 class="fw-bold">Exportar</h6>
              <p class="text-muted small">
                Gera um arquivo <code>.json</code> com tudo. Faça isso sempre que terminar uma rodada importante.
              </p>

              <h6 class="fw-bold">Importar (Mesclar vs Substituir)</h6>
              <p class="text-muted small">
                Ao importar, você tem duas opções:
                <br>
                <strong>Mesclar:</strong> Adiciona os dados do arquivo ao que você já tem (útil para juntar times criados em PCs diferentes).
                <br>
                <strong>Substituir:</strong> Apaga tudo o que existe agora e coloca o backup no lugar.
              </p>
            </div>

            <div v-if="abaAtiva === 'tecnicos'" class="fade-in">
              <h4 class="text-primary mb-3">Gestão de Técnicos</h4>
              <p>O sistema permite que você crie o perfil de treinadores e vincule aos times nos campeonatos.</p>

              <div class="alert alert-warning border-warning bg-opacity-10 text-warning p-3">
                <strong>⚠️ Ordem Importante:</strong> Cadastre os técnicos <strong>ANTES</strong> de criar os campeonatos.
              </div>

              <h6 class="fw-bold mt-4">Vinculando ao Time</h6>
              <p class="text-muted small">
                Na tela de <strong>Detalhes do Campeonato</strong>, clique no botão de configurações ⚙️ (engrenagem) para editar os participantes.
                Lá você pode selecionar quem será o técnico de cada equipe naquela competição.
              </p>

              <h6 class="fw-bold mt-4">Dashboard do Técnico</h6>
              <p class="text-muted small">
                Ao clicar no nome de um técnico em qualquer lugar do sistema, você abre o <strong>Dashboard de Carreira</strong>.
                Lá você vê todo o histórico dele: títulos, jogos, aproveitamento e até contra quem ele mais perdeu.
              </p>
            </div>

            <div v-if="abaAtiva === 'historico'" class="fade-in">
              <h4 class="text-primary mb-3">Histórico e Sala de Troféus</h4>
              
              <h6 class="fw-bold mt-4">Histórico Geral 🏆</h6>
              <p class="text-muted small">
                Uma linha do tempo com todos os campeões de todas as edições que você já jogou.
                O sistema agrupa campeonatos com o mesmo nome (ex: "Copa do Brasil") e numera as edições automaticamente (1ª, 2ª, 3ª...).
              </p>

              <h6 class="fw-bold mt-4">Sala de Troféus do Clube</h6>
              <p class="text-muted small">
                Na tela de detalhes de um clube, clique no botão <strong>🏆 Sala de Troféus</strong>.
                Você verá uma galeria com todas as taças que aquele time levantou, com data e detalhes da campanha.
              </p>
            </div>

          </div>
        </BCol>
      </BRow>
    </BCard>
  </div>
</template>

<script>
import { BCard, BButton, BRow, BCol, BAlert } from 'bootstrap-vue-next';

export default {
  name: 'ComoFunciona',
  components: {
    BCard, BButton, BRow, BCol, BAlert
  },
  data() {
    return {
      abaAtiva: 'intro'
    }
  }
}
</script>

<style scoped>
.nav-pills .nav-link {
  color: #4b5563;
  border-radius: 0;
  border-left: 4px solid transparent;
  transition: all 0.2s;
}

.nav-pills .nav-link.active {
  /* background-color: #f3f4f6; */
  color: var(--bs-primary);
  border-left-color: var(--bs-primary);
  font-weight: bold;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>