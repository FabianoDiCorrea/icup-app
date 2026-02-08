import DbService from './DbService.js';

export default {
    /**
     * Gera um snapshot completo do campeonato para o histórico
     */
    async registrarEncerramento(campeonato) {
        try {
            const estatisticas = this.calcularEstatisticasFinais(campeonato);
            const tabelaResumo = this.calcularTabelaCompleta(campeonato);

            // 🔥 HIDRATAÇÃO DOS JOGOS: Garante que o snapshot do jogo tenha os dados completos dos times (Tecnico, Pais, etc)
            const jogosCompletos = (campeonato.jogos || []).map(j => {
                const timeACompleto = campeonato.timesParticipantes.find(t => t.id === j.timeA.id) || j.timeA;
                const timeBCompleto = campeonato.timesParticipantes.find(t => t.id === j.timeB.id) || j.timeB;

                return {
                    ...j,
                    timeA: JSON.parse(JSON.stringify(timeACompleto)),
                    timeB: JSON.parse(JSON.stringify(timeBCompleto))
                };
            });

            const snapshot = {
                idCampeonato: campeonato.id,
                nome: campeonato.nome,
                tipo: campeonato.tipo,
                adicionarNacionalidade: campeonato.adicionarNacionalidade, // ✅ Salva a configuração
                urlTrofeu: campeonato.urlTrofeu,
                dataFim: new Date().toISOString(),
                campeao: estatisticas.campeao,
                vice: estatisticas.vice,
                artilheiros: estatisticas.artilheiros,
                timesParticipantes: campeonato.timesParticipantes,
                tabelaResumo: tabelaResumo,
                jogos: jogosCompletos, // ✅ Salva jogos hidratados
                resumo: {
                    totalGols: estatisticas.totalGols,
                    totalJogos: jogosCompletos.length
                }
            };

            return await DbService.adicionarAoHistorico(snapshot);
        } catch (error) {
            console.error("Erro no HistoryService.registrarEncerramento:", error);
            throw error;
        }
    },

    /**
     * Calcula quem foi o campeão, vice e artilheiros
     */
    calcularEstatisticasFinais(camp) {
        const artilheiros = this.obterTopArtilheiros(camp);
        let campeao = null;
        let vice = null;

        const jogos = camp.jogos || [];

        // Lógica para Mata-Mata ou Grupos com Mata-Mata
        if (camp.tipo === 'MATA_MATA' || (camp.tipo === 'GRUPOS' && jogos.some(j => j.fase))) {
            const final = [...jogos]
                .filter(j => j.finalizado && j.fase && (j.fase.toLowerCase().includes('final') && !j.fase.toLowerCase().includes('semifinal')))
                .sort((a, b) => b.rodada - a.rodada)[0];

            if (final && final.timeA && final.timeB) {
                const totalA = (final.golsA || 0) + (final.penaltisA || 0);
                const totalB = (final.golsB || 0) + (final.penaltisB || 0);

                if (totalA > totalB) {
                    campeao = camp.timesParticipantes.find(t => t.id === final.timeA.id);
                    vice = camp.timesParticipantes.find(t => t.id === final.timeB.id);
                } else {
                    campeao = camp.timesParticipantes.find(t => t.id === final.timeB.id);
                    vice = camp.timesParticipantes.find(t => t.id === final.timeA.id);
                }
            }
        }

        // Fallback ou Pontos Corridos Puro: Pega os dois primeiros da tabela
        if (!campeao) {
            const tabela = this.calcularTabelaCompleta(camp);
            if (tabela.length > 0) {
                campeao = camp.timesParticipantes.find(t => t.id === tabela[0].id);
                if (tabela.length > 1) {
                    vice = camp.timesParticipantes.find(t => t.id === tabela[1].id);
                }
            }
        }

        const totalGols = jogos.reduce((acc, j) => acc + (j.golsA || 0) + (j.golsB || 0), 0);

        return {
            campeao,
            vice,
            artilheiros,
            totalGols
        };
    },

    calcularTabelaCompleta(camp) {
        const mapaStats = {};
        const times = camp.timesParticipantes || [];
        const jogos = camp.jogos || [];

        times.forEach(time => {
            mapaStats[time.id] = {
                id: time.id,
                nome: time.nome,
                tecnico: time.tecnico || null, // ✅ Salva o técnico
                pontos: 0,
                jogos: 0,
                vitorias: 0,
                empates: 0,
                derrotas: 0,
                saldoGols: 0,
                golsPro: 0,
                golsContra: 0
            };
        });

        jogos.forEach(jogo => {
            if (!jogo.finalizado || !jogo.timeA || !jogo.timeB) return;
            // Se for mata-mata, ignoramos para a tabela de classificação básica (estilo liga)
            // A menos que queiramos estatísticas totais históricas. 
            // Para o Dashboard, queremos TUDO que o time fez.

            const tA = mapaStats[jogo.timeA.id];
            const tB = mapaStats[jogo.timeB.id];
            if (!tA || !tB) return;

            tA.jogos++; tB.jogos++;
            const gA = jogo.golsA || 0;
            const gB = jogo.golsB || 0;

            tA.golsPro += gA; tA.golsContra += gB;
            tB.golsPro += gB; tB.golsContra += gA;

            if (gA > gB) {
                tA.pontos += 3; tA.vitorias++; tB.derrotas++;
            } else if (gB > gA) {
                tB.pontos += 3; tB.vitorias++; tA.derrotas++;
            } else {
                tA.pontos += 1; tB.pontos += 1;
                tA.empates++; tB.empates++;
            }
        });

        return Object.values(mapaStats).map(t => ({
            ...t,
            saldoGols: t.golsPro - t.golsContra
        })).sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
            if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
            return b.golsPro - a.golsPro;
        });
    },

    obterTopArtilheiros(camp) {
        if (!camp || !camp.jogos) return [];
        const golsMap = {};
        const jogos = camp.jogos || [];

        jogos.forEach(jogo => {
            if (!jogo || !jogo.eventos) return;
            jogo.eventos.forEach(evt => {
                if (evt.tipo !== 'GOL') return;

                const jogadorNome = evt.jogador?.nome || 'Jogador Desconhecido';
                const timeId = evt.timeId;
                if (!timeId) return;

                const chave = `${jogadorNome}-${timeId}`;

                if (!golsMap[chave]) {
                    golsMap[chave] = {
                        nome: jogadorNome,
                        timeId: timeId,
                        gols: 0
                    };
                }
                golsMap[chave].gols++;
            });
        });

        return Object.values(golsMap)
            .sort((a, b) => b.gols - a.gols)
            .slice(0, 10);
    }
};
