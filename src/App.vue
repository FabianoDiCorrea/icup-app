<template>
  <div id="app">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top">
      <div class="container">

        <router-link to="/" class="navbar-brand d-flex align-items-center">
  <img
  src="@/assets/icup-logo.png"
  alt="iCup"
  height="50"
  class="d-inline-block align-text-middle"
/>

</router-link>


        <button class="navbar-toggler" type="button" @click="menuAberto = !menuAberto" aria-controls="navbarNav"
          aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" :class="{ 'show': menuAberto }" id="navbarNav">
          <ul class="navbar-nav ms-auto gap-2">

            <li class="nav-item">
              <router-link to="/" class="nav-link" @click="menuAberto = false">
                Home
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/lista-clubes" class="nav-link" @click="menuAberto = false">
                Clubes
              </router-link>
            </li>

            <li class="nav-item"><router-link to="/tecnicos" class="nav-link" @click="menuAberto = false">
                Técnicos
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/novo-time" class="nav-link" @click="menuAberto = false">
                Novo Clube
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/lista-campeonatos" class="nav-link" @click="menuAberto = false">
                Campeonatos
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/novo-campeonato" class="nav-link" @click="menuAberto = false">
                Criar Torneio
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/sobre" class="nav-link" @click="menuAberto = false">
                Sobre
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/como-funciona" class="nav-link" @click="menuAberto = false">
                Como Funciona
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/configuracoes" class="nav-link" @click="menuAberto = false">
                Configurações
              </router-link>
            </li>

          </ul>
        </div>
      </div>
    </nav>

    <main class="py-4">
      <!-- Alerta de Banco Vazio (Possível mudança de porta) -->
      <div v-if="exibirAvisoPorta" class="container mb-3">
        <div class="alert alert-warning border-warning shadow-sm d-flex justify-content-between align-items-center">
          <div>
            <h5 class="alert-heading fw-bold mb-1">⚠️ Seus dados sumiram?</h5>
            <p class="mb-0 small">
              Se você costumava rodar o app em outra porta (ex: 8080), seus dados continuam lá! 
              O navegador separa o armazenamento por porta. 
              <strong>Dica:</strong> Vá em Configurações para exportar/importar seu backup.
            </p>
          </div>
          <button type="button" class="btn-close" @click="exibirAvisoPorta = false"></button>
        </div>
      </div>

      <router-view />

    </main>

    <footer class="text-center py-4 text-muted small border-top border-secondary mt-5 bg-dark">
      <div class="container">
        <p class="mb-0 text-mini">© 2026 iCup. Desenvolvido com Vue 3. <a>Por Fabiano Corrêa</a></p>
      </div>
    </footer>

  </div>
</template>

<script>
import DbService from './services/DbService.js';
export default {
  data() {
    return {
      menuAberto: false, // Controla o estado do menu no mobile
      exibirAvisoPorta: false
    }
  },
  async mounted() {
    document.title = 'iCup'
    // Tenta ativar a persistência silenciosamente ao iniciar
    await DbService.solicitarPersistencia();

    // Verifica se o banco está vazio para disparar o alerta de "Dados Sumiram?"
    const vazio = await DbService.isBancoVazio();
    if (vazio) {
      // Pequeno delay para não assustar o usuário na primeira carga
      setTimeout(() => {
        this.exibirAvisoPorta = true;
      }, 1500);
    }

    // (Opcional) Loga o uso de espaço no console para você monitorar
    await DbService.verificarEspaco();
    
  }

}
</script>

<style lang="scss">
/* Se você estiver usando o manager-theme.css, essas cores virão de lá.
   Caso contrário, definimos alguns fallbacks aqui para garantir o visual. */

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bs-body-bg, #111827);
  /* Fundo Escuro */
  color: var(--bs-body-color, #f9fafb);
}

main {
  flex: 1;
  /* Empurra o rodapé para baixo */
}

/* Estilização da Navbar */
.navbar {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  background-color: #1f2937 !important;
  /* Cor da barra */
}

.tracking-wide {
  letter-spacing: 1px;
}

.nav-link {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  color: #9ca3af !important;
  /* Cinza claro */
  transition: all 0.3s ease;
  padding: 0.5rem 1rem !important;
  border-radius: 4px;

  &:hover {
    color: #fff !important;
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Link Ativo (Rota atual) */
  &.router-link-active {
    color: #fff !important;
    background-color: var(--bs-primary, #10b981);
    /* Verde Manager */
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

/* Botão especial no menu */
.btn-outline-primary.router-link-active {
  background-color: var(--bs-primary, #10b981) !important;
  border-color: var(--bs-primary, #10b981) !important;
}

/* Transição de Páginas (Fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ajuste para o botão toggle no mobile */
.navbar-toggler {
  border: none;

  &:focus {
    box-shadow: none;
  }
}
:root {
  --cor-tecnico: #10b981;
  --cor-pais: #020201; /* 🟡 dourado */
}

.pais-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--cor-pais);
  white-space: nowrap;
}

</style>
