# ⚽ iCup - Football Manager System

Bem-vindo ao **iCup**, o sistema de gestão esportiva que aposenta suas planilhas de Excel e centraliza seus campeonatos na palma da mão.

Este projeto é uma **Single Page Application (SPA)** e também um **Aplicativo Android (via Capacitor)** desenvolvido para organizar torneios de futebol (campo, futsal, society), futebol de botão ou campeonatos de e-sports (FIFA, PES) de forma agnóstica, offline e reativa.

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-blue?style=for-the-badge)
![IndexedDB](https://img.shields.io/badge/IndexedDB-LocalForage-yellow?style=for-the-badge)

---

## 🚀 O que este sistema faz?

As principais *features* incluem:

* **Gestão de Clubes:** Cadastro de times com escudos personalizados, técnicos e esquemas de cores.
* **Motor de Campeonatos Profissional:**
    * Pontos Corridos (Turno/Returno).
    * Mata-Mata (Sorteio ou Manual).
    * **Fase de Grupos Híbrida:** Evolução automática para Mata-Mata com cruzamentos configuráveis.
    * **Tabela Espelho:** Visualize a classificação atualizada em tempo real dentro da tela de registro de jogos.
* **Súmula Digital:** Interface completa para operar a partida, registrando gols, cartões e timeline.
* **Sincronização em Nuvem (Cloud Sync):** Backup fragmentado via GitHub Gists. O sistema utiliza compressão `pako` e divide arquivos grandes em partes de 10MB para evitar estouro de memória em dispositivos móveis.
* **Atualização OTA (Over-the-Air):** Verificação automática de novas versões com download direto do APK pelo navegador nativo do Android.
* **Persistência Offline:** Tudo é salvo no `IndexedDB`. Sem necessidade de internet constante para jogar.

---

## 🛠️ Stack Tecnológica

O motor debaixo do capô:

* **Core:** [Vue.js 3](https://vuejs.org/) (Options API).
* **Mobile Engine:** [Capacitor JS](https://capacitorjs.com/) (Builds nativas para Android).
* **UI Framework:** [Bootstrap 5](https://getbootstrap.com/) + `bootstrap-vue-next`.
* **Banco de Dados:** [LocalForage](https://localforage.github.io/localForage/) (IndexedDB).
* **Compressão:** [Pako](https://github.com/nodeca/pako) (Zlib) para otimização de backup.

---

## 💻 Como rodar localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/FabianoDiCorrea/icup-app.git
    cd icup-app
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run serve
    ```

4.  **Sincronizar com Android (opcional):**
    ```bash
    npm run build
    npx cap sync android
    ```

---

## 📂 Estrutura do Projeto (Mapa da Mina)

* `src/services/DbService.js`: O Cérebro. Toda persistência e lógica de backup local.
* `src/services/cloudSync.service.js`: **O Viajante.** Gerencia a fragmentação e o upload/download dos dados para o GitHub.
* `src/services/VersionService.js`: **O Vigia.** Controla a verificação de versões remotas.
* `src/utils/GeradorTabela.js`: O Matemático dos algoritmos de torneio.
* `src/views/Configuracoes.vue`: Interface para gestão de tokens GitHub e Importação/Exportação.
* `src/views/DetalhesCampeonato.vue`: Gerencia a classificação e a interface de Tabela Espelho.

---

## 🔧 Guia de Customização

### "Quero mudar a regra de pontuação"
Vá em `src/views/TabelaClassificacao.vue`, procure o método `calcularStatsBase` e altere a lógica:
```javascript
if (jogo.golsA > jogo.golsB) {
    tA.pontos += 3; // Altere para a pontuação desejada
}
```

---
⚽ **iCup** - Organizando a paixão pelo futebol de botão e além.
