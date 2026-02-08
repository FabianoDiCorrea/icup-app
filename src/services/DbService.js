import localforage from 'localforage';
import {
    gerarJogosPontosCorridos,
    gerarJogosProximaFaseMataMata,
    gerarJogosMataMataDeGrupos,
    gerarJogosMataMataSeedingGeral,
    gerarJogosComByeSystem
} from '../utils/GeradorTabela.js';

// Configuração inicial do Banco
localforage.config({
    name: 'GeradorCampeonatoApp',
    storeName: 'dados_campeonato',
    description: 'Armazenamento de times e campeonatos'
});

// Chaves para organizar os dados
// ATENÇÃO: Removemos a lista_jogos para forçar o armazenamento embutido
const KEYS = {
    TIMES: 'lista_times',
    CAMPEONATOS: 'lista_campeonatos',
    TECNICOS: 'lista_tecnicos',
    HISTORICO: 'lista_historico'
};

export default {
    // =================================================================
    // MÉTODOS PARA TIMES
    // =================================================================

    async getTimes() {
        const times = await localforage.getItem(KEYS.TIMES);
        return times || [];
    },

    async excluirTime(id) {
        const times = await this.getTimes();
        const filtrados = times.filter(t => String(t.id) !== String(id));
        await localforage.setItem(KEYS.TIMES, filtrados);
    },

    async adicionarTime(novoTime) {
        const timesAtuais = await this.getTimes();
        const timeLimpo = JSON.parse(JSON.stringify(novoTime));
        timeLimpo.id = Date.now() + Math.random().toString(36).substr(2, 9);
        timesAtuais.push(timeLimpo);
        return await localforage.setItem(KEYS.TIMES, timesAtuais);
    },

    async getTimeById(id) {
        const times = await this.getTimes();
        return times.find(t => t.id == id);
    },

    async atualizarTime(timeAtualizado) {
        const times = await this.getTimes();
        const index = times.findIndex(t => t.id == timeAtualizado.id);

        if (index !== -1) {
            times[index] = JSON.parse(JSON.stringify(timeAtualizado));
            return await localforage.setItem(KEYS.TIMES, times);
        } else {
            throw new Error("Time não encontrado");
        }
    },

    async limparTimes() {
        return await localforage.removeItem(KEYS.TIMES);
    },

    // =================================================================
    // MÉTODOS PARA TÉCNICOS
    // =================================================================

    async getTecnicos() {
        const tecnicos = await localforage.getItem(KEYS.TECNICOS);
        return tecnicos || [];
    },

    async salvarTecnicos(lista) {
        return await localforage.setItem(KEYS.TECNICOS, JSON.parse(JSON.stringify(lista)));
    },

    async adicionarTecnico(novoTecnico) {
        const tecnicos = await this.getTecnicos();
        const t = {
            ...novoTecnico,
            id: Date.now() + Math.random().toString(36).substr(2, 5)
        };
        tecnicos.push(t);
        await this.salvarTecnicos(tecnicos);
        return t;
    },

    async removerTecnico(id) {
        const tecnicos = await this.getTecnicos();
        const filtrados = tecnicos.filter(t => t.id !== id);
        return await this.salvarTecnicos(filtrados);
    },

    // =================================================================
    // MÉTODOS PARA CAMPEONATOS (JOGOS EMBUTIDOS)
    // =================================================================

    async getCampeonatos() {
        const camps = await localforage.getItem(KEYS.CAMPEONATOS);
        return camps || [];
    },

    async excluirCampeonato(id) {
        const camps = await localforage.getItem(KEYS.CAMPEONATOS) || [];
        const filtrados = camps.filter(c => String(c.id) !== String(id));
        await localforage.setItem(KEYS.CAMPEONATOS, filtrados);

        // 🔥 CASCATA: Remove também do Histórico
        await this.excluirHistoricoPorCampeonatoId(id);
    },

    async excluirHistoricoPorCampeonatoId(idCampeonato) {
        const hist = await this.getHistorico();
        const filtrados = hist.filter(h => String(h.idCampeonato) !== String(idCampeonato));
        await localforage.setItem(KEYS.HISTORICO, filtrados);
    },

    // 🧹 Limpa históricos de campeonatos que já foram excluídos
    // Útil para corrigir dados antigos
    async limparHistoricosOrfaos() {
        const camps = await this.getCampeonatos();
        const hist = await this.getHistorico();

        const idsExistentes = new Set(camps.map(c => String(c.id)));

        const histLimpo = hist.filter(h => idsExistentes.has(String(h.idCampeonato)));

        if (hist.length !== histLimpo.length) {
            await localforage.setItem(KEYS.HISTORICO, histLimpo);
            return true;
        }
        return false;
    },


    async getCampeonatoById(id) {
        const lista = await this.getCampeonatos();
        // Retorna o objeto campeonato completo (que já contém os jogos dentro)
        const camp = lista.find(c => String(c.id) === String(id));

        // Garante a ordenação dos jogos se eles existirem
        if (camp && camp.jogos) {
            camp.jogos.sort((a, b) => a.rodada - b.rodada);
        }

        return camp;
    },

    async adicionarCampeonato(dadosBasicos) {
        const idCampeonato = Date.now();
        let tabelaJogos = [];

        // 1. Define os jogos (já vindos do front ou gerados agora)
        if (dadosBasicos.jogos && dadosBasicos.jogos.length > 0) {
            tabelaJogos = dadosBasicos.jogos;
        } else {
            // Caso contrário (Pontos Corridos padrão), gera aqui.
            // BUG FIX: O front-end envia 'timesParticipantes'. O gerador espera 'times'.
            const timesParaGerar = dadosBasicos.times || dadosBasicos.timesParticipantes;

            if (!timesParaGerar || timesParaGerar.length < 2) {
                throw new Error("Não é possível gerar jogos com menos de 2 times.");
            }

            tabelaJogos = gerarJogosPontosCorridos(timesParaGerar, dadosBasicos.turnos);
        }

        // 2. Vincula ID (apenas por segurança)
        tabelaJogos = tabelaJogos.map(jogo => ({
            ...jogo,
            campeonatoId: idCampeonato
        }));

        // 3. Monta o objeto completo
        const novoCampeonato = {
            id: idCampeonato,
            nome: dadosBasicos.nome,
            tipo: dadosBasicos.tipo || 'PONTOS_CORRIDOS',
            turnos: dadosBasicos.turnos,
            tipoClassificacao: dadosBasicos.tipoClassificacao,
            modoDefinicao: dadosBasicos.modoDefinicao,

            // ✅ SOMENTE PARA GRUPOS
            classificadosPorGrupo:
                dadosBasicos.tipo === 'GRUPOS'
                    ? dadosBasicos.classificadosPorGrupo
                    : undefined,

            // ✅ NOVO: PONTOS CORRIDOS + MATA-MATA
            classificadosParaMataMata:
                dadosBasicos.tipo === 'PONTOS_CORRIDOS'
                    ? dadosBasicos.classificadosParaMataMata ?? null
                    : null,

            adicionarNacionalidade: dadosBasicos.adicionarNacionalidade === true,

            urlTrofeu: dadosBasicos.urlTrofeu || null,

            grupos: dadosBasicos.tipo === 'GRUPOS'
                ? dadosBasicos.grupos || []
                : [],

            dataCriacao: new Date().toISOString(),
            status: 'EM_ANDAMENTO',

            timesParticipantes: JSON.parse(JSON.stringify(dadosBasicos.times)),
            jogos: JSON.parse(JSON.stringify(tabelaJogos))
        };



        // 4. Salva na lista de campeonatos
        const lista = await this.getCampeonatos();
        lista.push(novoCampeonato);
        await localforage.setItem(KEYS.CAMPEONATOS, lista);

        return idCampeonato;
    },

    // ATUALIZAR JOGO (BUSCA DENTRO DO CAMPEONATO)
    async atualizarJogo(idCampeonato, jogoAtualizado) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];

        // Encontra o jogo dentro do array .jogos do campeonato
        const indexJogo = campeonato.jogos.findIndex(j => j.id == jogoAtualizado.id);

        if (indexJogo !== -1) {
            campeonato.jogos[indexJogo] = JSON.parse(JSON.stringify(jogoAtualizado));

            // Salva a lista de campeonatos inteira novamente
            // Isso substitui o objeto antigo pelo novo (com o jogo atualizado dentro)
            await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);
        } else {
            throw new Error("Jogo não encontrado neste campeonato");
        }
    },

    // AVANÇAR FASE (MATA-MATA)
    async avancarFaseMataMata(idCampeonato, vencedores) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(
            c => String(c.id) === String(idCampeonato)
        );

        if (indexCamp === -1) {
            throw new Error("Campeonato não encontrado");
        }

        const campeonato = listaCamps[indexCamp];

        // ✅ 1. Rodada que está sendo encerrada (vem do front)
        const rodadaAtual = Math.max(
            ...campeonato.jogos
                .filter(j => j.rodada === campeonato.jogos
                    .filter(x => x.finalizado)
                    .map(x => x.rodada)
                    .sort((a, b) => b - a)[0]
                )
                .map(j => j.rodada)
        );



        // 🧹 2. REMOVE TODAS as fases futuras (substituição total)
        campeonato.jogos = campeonato.jogos.filter(
            j => j.rodada <= rodadaAtual
        );

        // ✅ 3. Gera novamente a próxima fase
        let novosJogos = gerarJogosProximaFaseMataMata(
            vencedores,
            campeonato.turnos,
            rodadaAtual
        );

        novosJogos = novosJogos.map(j => ({
            ...j,
            campeonatoId: idCampeonato
        }));

        campeonato.jogos.push(...novosJogos);

        // 💾 4. Salva
        await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);

        return true;
    },



    // AVANÇAR GRUPOS -> MATA-MATA — SUBSTITUI SE JÁ EXISTIR
    async avancarGruposParaMataMata(idCampeonato, classificadosPorGrupo) {
        const listaCamps = await this.getCampeonatos();
        const indexCamp = listaCamps.findIndex(c => String(c.id) === String(idCampeonato));

        if (indexCamp === -1) throw new Error("Campeonato não encontrado");

        const campeonato = listaCamps[indexCamp];

        // 🔹 Descobre a última rodada da fase de grupos
        const maxRodadaGrupos = Math.max(
            ...campeonato.jogos
                .filter(j => !j.fase) // jogos de grupos não têm fase
                .map(j => j.rodada)
        );

        // 🧹 Remove QUALQUER mata-mata já criado
        campeonato.jogos = campeonato.jogos.filter(
            j => j.rodada <= maxRodadaGrupos
        );

        // 🔹 Gera o mata-mata novamente
        let novosJogos = gerarJogosMataMataDeGrupos(
            classificadosPorGrupo,
            campeonato.turnos,
            maxRodadaGrupos
        );

        novosJogos = novosJogos.map(j => ({
            ...j,
            campeonatoId: idCampeonato
        }));

        campeonato.jogos.push(...novosJogos);

        await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);

        return true;
    },


    async resetarBanco() {
        await localforage.clear();
    },

    // =================================================================
    // MÉTODOS PARA HISTÓRICO
    // =================================================================

    async getHistorico() {
        const hist = await localforage.getItem(KEYS.HISTORICO);
        return hist || [];
    },

    async adicionarAoHistorico(item) {
        const hist = await this.getHistorico();

        // Limpeza profunda para remover Proxies do Vue 3 e garantir serialização (evita DataCloneError)
        const itemLimpo = JSON.parse(JSON.stringify({
            ...item,
            dataRegistro: new Date().toISOString()
        }));

        hist.push(itemLimpo);
        return await localforage.setItem(KEYS.HISTORICO, hist);
    },

    async exportarBackup() {
        try {
            const times = await this.getTimes();
            const campeonatos = await this.getCampeonatos();

            const backupData = {
                version: '1.0',
                dataExportacao: new Date().toISOString(),
                times: times,
                campeonatos: campeonatos
            };

            return JSON.stringify(backupData, null, 2);
        } catch (error) {
            console.error("Erro ao gerar backup:", error);
            throw new Error("Falha ao exportar dados.");
        }
    },

    /**
     * Importa dados.
     * @param {string} jsonString - O conteúdo do arquivo JSON
     * @param {string} modo - 'SUBSTITUIR' (limpa tudo antes) ou 'MESCLAR' (adiciona ao existente)
     */
    async importarBackup(jsonString, modo = 'SUBSTITUIR') {
        try {
            const dados = JSON.parse(jsonString);

            if (!Array.isArray(dados.times) || !Array.isArray(dados.campeonatos)) {
                throw new Error("Arquivo de backup inválido ou corrompido.");
            }

            let timesFinais = [];
            let campeonatosFinais = [];

            if (modo === 'MESCLAR') {
                // 1. Recupera dados atuais do banco
                const timesAtuais = await this.getTimes();
                const campeonatosAtuais = await this.getCampeonatos();

                // 2. Mescla Times (Usando Map para evitar duplicidade de ID)
                // A ordem importa: primeiro os atuais, depois os novos sobrescrevem se ID for igual
                const mapaTimes = new Map();
                timesAtuais.forEach(t => mapaTimes.set(String(t.id), t));
                dados.times.forEach(t => mapaTimes.set(String(t.id), t));

                timesFinais = Array.from(mapaTimes.values());

                // 3. Mescla Campeonatos
                const mapaCamps = new Map();
                campeonatosAtuais.forEach(c => mapaCamps.set(String(c.id), c));
                dados.campeonatos.forEach(c => mapaCamps.set(String(c.id), c));

                campeonatosFinais = Array.from(mapaCamps.values());

            } else {
                // Modo SUBSTITUIR: Usa apenas os dados do arquivo
                await localforage.clear(); // Limpa tudo antes
                timesFinais = dados.times;
                campeonatosFinais = dados.campeonatos;
            }

            // Salva os dados finais
            await localforage.setItem(KEYS.TIMES, timesFinais);
            await localforage.setItem(KEYS.CAMPEONATOS, campeonatosFinais);

            return true;
        } catch (error) {
            console.error("Erro ao importar backup:", error);
            throw error;
        }
    },
    async atualizarCampeonato(campAtualizado) {
        const listaCamps = await this.getCampeonatos();
        const index = listaCamps.findIndex(c => String(c.id) === String(campAtualizado.id));

        if (index !== -1) {
            listaCamps[index] = JSON.parse(JSON.stringify(campAtualizado));
            await localforage.setItem(KEYS.CAMPEONATOS, listaCamps);
        } else {
            throw new Error("Campeonato não encontrado");
        }
    },
    async solicitarPersistencia() {
        if (navigator.storage && navigator.storage.persist) {
            // 1. Verifica se já é persistente
            const isPersisted = await navigator.storage.persisted();
            if (isPersisted) {
                return true;
            }

            // 2. Se não for, solicita a permissão
            const granted = await navigator.storage.persist();
            if (granted) {
            } else {
                console.warn("⚠️ Permissão de persistência negada ou não atendida pelo navegador.");
            }
            return granted;
        } else {
            return false;
        }
    },

    /**
     * (Opcional) Verifica quanto espaço está sendo usado
     */
    async verificarEspaco() {
        if (navigator.storage && navigator.storage.estimate) {
            const { usage, quota } = await navigator.storage.estimate();
            const usoMB = (usage / 1024 / 1024).toFixed(2);
            const totalMB = (quota / 1024 / 1024).toFixed(2);
            const porcentagem = ((usage / quota) * 100).toFixed(2);

            return { usoMB, totalMB, porcentagem };
        }
        return null;
    },

    async avancarGruposComSeeding(idCampeonato, listaFinalTimes) {
        const campeonato = await this.getCampeonatoById(idCampeonato);
        if (!campeonato) throw new Error("Campeonato não encontrado");
        const maxRodada = campeonato.jogos.reduce((max, j) => Math.max(max, j.rodada), 0);

        let novosJogos = gerarJogosComByeSystem(listaFinalTimes, campeonato.turnos, maxRodada);
        novosJogos = novosJogos.map(j => ({ ...j, campeonatoId: idCampeonato }));

        campeonato.jogos = [...campeonato.jogos, ...novosJogos];
        await this.atualizarCampeonato(campeonato);
        return true;
    },

    async duplicarCampeonato(id) {
        const lista = await this.getCampeonatos();
        const campOriginal = lista.find(c => String(c.id) === String(id));

        if (!campOriginal) throw new Error("Campeonato não encontrado");

        // Clone profundo para não afetar o original
        const novoCamp = JSON.parse(JSON.stringify(campOriginal));

        // Ajustes para a cópia
        novoCamp.id = Date.now();
        novoCamp.nome = `${novoCamp.nome} CÓPIA`;
        novoCamp.dataCriacao = new Date().toISOString();
        novoCamp.status = 'EM_ANDAMENTO'; // Reinicia o status

        // Atualiza os IDs nos jogos também (apenas segurança)
        if (novoCamp.jogos) {
            novoCamp.jogos = novoCamp.jogos.map(j => ({
                ...j,
                id: Math.random().toString(36).substr(2, 9), // Novos IDs internos
                campeonatoId: novoCamp.id
            }));
        }

        lista.push(novoCamp);
        await localforage.setItem(KEYS.CAMPEONATOS, lista);
        return novoCamp.id;
    },

    /**
     * Verifica se o banco está vazio (útil para detectar mudança de porto/origem)
     */
    async isBancoVazio() {
        const times = await this.getTimes();
        const camps = await this.getCampeonatos();
        return times.length === 0 && camps.length === 0;
    }


};