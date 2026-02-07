/**
 * Serviço de integração com API-Football
 * Documentação: https://www.api-football.com/documentation-v3
 * 
 * Plano Gratuito: 100 requisições/dia
 * 
 * IMPORTANTE: O usuário precisa:
 * 1. Criar conta em https://www.api-football.com/
 * 2. Obter a chave API gratuita
 * 3. Configurar a chave nas configurações do app
 */

const BASE_URL = 'https://v3.football.api-sports.io';

export default {
    /**
     * Obtém a chave da API do localStorage
     */
    getApiKey() {
        return localStorage.getItem('football_api_key') || '';
    },

    /**
     * Salva a chave da API no localStorage
     */
    setApiKey(key) {
        localStorage.setItem('football_api_key', key);
    },

    /**
     * Verifica se a API está configurada
     */
    isConfigured() {
        return !!this.getApiKey();
    },

    /**
     * Faz requisição para a API
     */
    async request(endpoint, params = {}) {
        const apiKey = this.getApiKey();

        if (!apiKey) {
            throw new Error('API não configurada. Configure sua chave nas Configurações.');
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `${BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors && Object.keys(data.errors).length > 0) {
            throw new Error(`Erro da API: ${JSON.stringify(data.errors)}`);
        }

        return data;
    },

    /**
     * Busca times pelo nome
     */
    async buscarTime(nomeTime) {
        try {
            const data = await this.request('/teams', { search: nomeTime });
            return data.response || [];
        } catch (error) {
            console.error('Erro ao buscar time:', error);
            throw error;
        }
    },

    /**
     * Busca a última partida de um time com escalação
     */
    async buscarUltimaPartida(teamId) {
        try {
            // Busca últimas 5 partidas do time
            const data = await this.request('/fixtures', {
                team: teamId,
                last: 5
            });

            if (!data.response || data.response.length === 0) {
                throw new Error('Nenhuma partida encontrada para este time');
            }

            // Retorna a partida mais recente
            return data.response[0];
        } catch (error) {
            console.error('Erro ao buscar partida:', error);
            throw error;
        }
    },

    /**
     * Busca a escalação de uma partida específica
     */
    async buscarEscalacao(fixtureId, teamId) {
        try {
            const data = await this.request('/fixtures/lineups', {
                fixture: fixtureId
            });

            if (!data.response || data.response.length === 0) {
                throw new Error('Escalação não disponível para esta partida');
            }

            // Encontra a escalação do time específico
            const lineup = data.response.find(l => l.team.id === teamId);

            if (!lineup) {
                throw new Error('Escalação do time não encontrada');
            }

            return lineup;
        } catch (error) {
            console.error('Erro ao buscar escalação:', error);
            throw error;
        }
    },

    /**
     * Mapeia posição da API para formato do app
     */
    mapearPosicao(posicao) {
        if (!posicao) return 'Jogador';

        const posUpper = posicao.toUpperCase();

        const mapa = {
            'G': 'Goleiro',
            'GOALKEEPER': 'Goleiro',
            'D': 'Zagueiro',
            'DEFENDER': 'Zagueiro',
            'M': 'Meia',
            'MIDFIELDER': 'Meia',
            'F': 'Atacante',
            'ATTACKER': 'Atacante',
            'FORWARD': 'Atacante'
        };

        return mapa[posUpper] || posicao;
    },

    /**
     * Busca os 11 titulares mais recentes de um time
     * V2: Busca por ESTATÍSTICAS (minutos jogados) para identificar titulares reais
     * @param {string} nomeTime - Nome do time para buscar
     * @returns {Promise<Array>} Array com {numero, nome, posicao}
     */
    async buscarElencoRecente(nomeTime) {
        try {
            // 1. Buscar o time pelo nome
            const times = await this.buscarTime(nomeTime);

            if (times.length === 0) {
                throw new Error(`Time "${nomeTime}" não encontrado. Tente outro nome ou verifique a ortografia.`);
            }

            const time = times[0];
            const teamId = time.team.id;

            // Tenta buscar na temporada atual (2025) e, se falhar, tenta 2024
            const anoAtual = new Date().getFullYear();
            let jogadoresDetalhados = [];

            // Define a temporada alvo (se estamos no início do ano, a API pode ainda estar na season anterior)
            let season = anoAtual;

            try {
                // Busca a primeira página de jogadores (20 jogadores)
                const data1 = await this.request('/players', {
                    team: teamId,
                    season: season
                });

                let listaJogadores = data1.response || [];

                // Se não veio ninguém, tenta o ano anterior
                if (listaJogadores.length === 0) {
                    season = anoAtual - 1;
                    const dataAnt = await this.request('/players', {
                        team: teamId,
                        season: season
                    });
                    listaJogadores = dataAnt.response || [];
                } else {
                    // Se veio gente em 2025/2026, busca a página 2 para garantir que temos pelo menos 40 jogadores (titulares + reservas imediatos)
                    if (data1.paging && data1.paging.total > 1) {
                        const data2 = await this.request('/players', {
                            team: teamId,
                            season: season,
                            page: 2
                        });
                        listaJogadores = [...listaJogadores, ...(data2.response || [])];
                    }
                }

                jogadoresDetalhados = listaJogadores;

            } catch (e) {
                console.error("Erro ao buscar stats, tentando fallback squads:", e);
                // Se der erro de cota ou outro, tenta o método antigo (squads) que gasta menos
                return this.buscarElencoRecenteSquads(teamId);
            }

            if (jogadoresDetalhados.length === 0) {
                return this.buscarElencoRecenteSquads(teamId);
            }

            // 2. ORDENAR POR MINUTOS JOGADOS (Titularidade)
            // A estrutura no endpoint /players é item.statistics[0].games.minutes
            jogadoresDetalhados.sort((a, b) => {
                const minA = (a.statistics[0]?.games?.minutes || 0);
                const minB = (b.statistics[0]?.games?.minutes || 0);

                // Se minutos forem iguais (0), desempata pelo ID (pode ajudar com novos cadastros)
                if (minA === minB) {
                    return (b.player.id || 0) - (a.player.id || 0);
                }

                return minB - minA; // Decrescente (quem jogou mais primeiro)
            });

            // Mapeia para formato simplificado
            const elencoPrincipal = jogadoresDetalhados.map(item => {
                const stat = item.statistics?.[0] || {};
                return {
                    id: item.player.id,
                    name: item.player.name,
                    number: stat.games?.number || item.player.number || null,
                    position: stat.games?.position || 'Midfielder' // Fallback
                };
            });

            // 3. Separar por posição
            const goleiros = elencoPrincipal.filter(p => this.mapearPosicao(p.position) === 'Goleiro');
            const defensores = elencoPrincipal.filter(p => this.mapearPosicao(p.position) === 'Zagueiro');
            const meias = elencoPrincipal.filter(p => this.mapearPosicao(p.position) === 'Meia');
            const atacantes = elencoPrincipal.filter(p => this.mapearPosicao(p.position) === 'Atacante');

            // 4. Montar "Escalação Ideal" (Lógica Clássica 2-3-4-6 / 5-7-8-9-10-11)
            const timeIdeal = new Array(11).fill(null);

            // Goleiro -> Posição 1
            if (goleiros.length > 0) timeIdeal[0] = goleiros[0];

            // Defensores -> 2, 3, 4, 6
            const vagasDefesa = [1, 2, 3, 5];
            let defIndex = 0;
            vagasDefesa.forEach(vaga => {
                if (defensores[defIndex]) {
                    timeIdeal[vaga] = defensores[defIndex];
                    defIndex++;
                }
            });

            // Atacantes -> Posição 9 (índice 8) é prioritária para o CA
            if (atacantes.length > 0) {
                timeIdeal[8] = atacantes[0];
            }

            // Meias e Atacantes -> 5, 7, 8, 10, 11
            const vagasMeioAtaque = [4, 6, 7, 9, 10];
            // Prioriza meias primeiro, depois atacantes que sobraram
            const restoMeioAtaque = [...meias, ...atacantes.slice(1)];

            let meiAtkIndex = 0;
            vagasMeioAtaque.forEach(vaga => {
                if (!timeIdeal[vaga] && restoMeioAtaque[meiAtkIndex]) {
                    timeIdeal[vaga] = restoMeioAtaque[meiAtkIndex];
                    meiAtkIndex++;
                }
            });

            // Preencher com sobras
            const usadosIds = new Set(timeIdeal.filter(p => p).map(p => p.id));
            const sobrasGeral = elencoPrincipal.filter(p => !usadosIds.has(p.id));
            let sobraIndex = 0;
            for (let i = 0; i < 11; i++) {
                if (timeIdeal[i] === null && sobrasGeral[sobraIndex]) {
                    timeIdeal[i] = sobrasGeral[sobraIndex];
                    sobraIndex++;
                }
            }

            const escalacao = timeIdeal.filter(p => p !== null);

            return escalacao.map((jogador, index) => ({
                numero: index + 1,
                nome: `(${jogador.number || '?'}) ${jogador.name}`,
                posicao: this.mapearPosicao(jogador.position)
            }));

        } catch (error) {
            console.error('Erro ao buscar elenco V2:', error);
            throw error;
        }
    },

    /**
     * Fallback: Busca elenco por Squads (sem stats)
     * Usado se a busca por temporada falhar
     */
    async buscarElencoRecenteSquads(teamId) {
        try {
            const data = await this.request('/players/squads', { team: teamId });
            if (!data.response || data.response.length === 0) throw new Error('Elenco não disponível');

            const squad = data.response[0];
            let jogadores = squad.players || [];

            if (jogadores.length === 0) throw new Error('Nenhum jogador encontrado');

            // Lógica simplificada de formação (cópia da anterior para fallback)
            const goleiros = jogadores.filter(p => this.mapearPosicao(p.position) === 'Goleiro');
            const defensores = jogadores.filter(p => this.mapearPosicao(p.position) === 'Zagueiro');
            const meias = jogadores.filter(p => this.mapearPosicao(p.position) === 'Meia');
            const atacantes = jogadores.filter(p => this.mapearPosicao(p.position) === 'Atacante');

            const timeIdeal = new Array(11).fill(null);

            if (goleiros.length > 0) timeIdeal[0] = goleiros[0];

            const vagasDefesa = [1, 2, 3, 5];
            let defIndex = 0;
            vagasDefesa.forEach(v => { if (defensores[defIndex]) { timeIdeal[v] = defensores[defIndex]; defIndex++; } });

            if (atacantes.length > 0) timeIdeal[8] = atacantes[0];

            const vagasMeio = [4, 6, 7, 9, 10];
            const resto = [...meias, ...atacantes.slice(1)];
            let mIndex = 0;
            vagasMeio.forEach(v => { if (!timeIdeal[v] && resto[mIndex]) { timeIdeal[v] = resto[mIndex]; mIndex++; } });

            const usados = new Set(timeIdeal.filter(p => p).map(p => p.id));
            const sobras = jogadores.filter(p => !usados.has(p.id));
            let sIndex = 0;
            for (let i = 0; i < 11; i++) { if (timeIdeal[i] === null && sobras[sIndex]) { timeIdeal[i] = sobras[sIndex]; sIndex++; } }

            return timeIdeal.filter(p => p !== null).map((j, i) => ({
                numero: i + 1,
                nome: `(${j.number || '?'}) ${j.name}`,
                posicao: this.mapearPosicao(j.position)
            }));

        } catch (e) {
            throw new Error("Não foi possível obter dados do time (Squads). Tente novamente.");
        }
    },

    /**
     * Testa a conexão com a API
     */
    async testarConexao() {
        try {
            await this.request('/status');
            return true;
        } catch (error) {
            return false;
        }
    }
};
