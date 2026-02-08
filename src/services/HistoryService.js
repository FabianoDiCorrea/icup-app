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
    /**
     * Calcula quem foi o campeão, vice e artilheiros
     */
    calcularEstatisticasFinais(camp) {
        const artilheiros = this.obterTopArtilheiros(camp);
        let campeao = null;
        let vice = null;
        let terceiro = null;
        let quarto = null;

        const jogos = camp.jogos || [];

        // Lógica para Mata-Mata ou Grupos com Mata-Mata
        if (camp.tipo === 'MATA_MATA' || (camp.tipo === 'GRUPOS' && jogos.some(j => j.fase))) {

            // 1. FINAL (Decide 1º e 2º)
            const final = [...jogos]
                .filter(j => j.finalizado && j.fase && (j.fase.toLowerCase() === 'final'))
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

            // 2. DISPUTA DE 3º LUGAR (Decide 3º e 4º)
            const disputa3 = [...jogos]
                .filter(j => j.finalizado && j.fase && (j.fase.toLowerCase().includes('3º') || j.fase.toLowerCase().includes('terceiro')))
                .sort((a, b) => b.rodada - a.rodada)[0];

            if (disputa3 && disputa3.timeA && disputa3.timeB) {
                const totalA = (disputa3.golsA || 0) + (disputa3.penaltisA || 0);
                const totalB = (disputa3.golsB || 0) + (disputa3.penaltisB || 0);

                if (totalA > totalB) {
                    terceiro = camp.timesParticipantes.find(t => t.id === disputa3.timeA.id);
                    quarto = camp.timesParticipantes.find(t => t.id === disputa3.timeB.id);
                } else {
                    terceiro = camp.timesParticipantes.find(t => t.id === disputa3.timeB.id);
                    quarto = camp.timesParticipantes.find(t => t.id === disputa3.timeA.id);
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
            terceiro,
            quarto,
            artilheiros,
            totalGols
        };
    },

    calcularTabelaCompleta(camp) {
        const mapaStats = {};
        const times = camp.timesParticipantes || [];
        const jogos = camp.jogos || [];

        // 1. Inicializa Stats
        times.forEach(time => {
            mapaStats[time.id] = {
                id: time.id,
                nome: time.nome,
                tecnico: time.tecnico || null,
                escudo: time.escudo || time.urlLogo || time.logo || '',
                bandeira: time.bandeira || '',
                pontos: 0,
                jogos: 0,
                vitorias: 0,
                empates: 0,
                derrotas: 0,
                saldoGols: 0,
                golsPro: 0,
                golsContra: 0,
                faseAlcancada: 0 // PESO PARA ORDENAÇÃO
            };
        });

        // 2. Computa Jogos e Define Pesos de Fase
        jogos.forEach(jogo => {
            // Define PESO da fase para os times envolvidos
            // Final = 100, 3º Lugar = 90, Semi = 80, Quartas = 70, Oitavas = 60, Grupos = 10
            let pesoA = 10;
            let pesoB = 10;

            if (jogo.fase) {
                const f = jogo.fase.toLowerCase();

                if (f === 'final') {
                    // Se finalizado, quem ganhou recebe +1 (101 vs 100)
                    if (jogo.finalizado) {
                        const golsA = (jogo.golsA || 0) + (jogo.penaltisA || 0);
                        const golsB = (jogo.golsB || 0) + (jogo.penaltisB || 0);
                        pesoA = golsA > golsB ? 101 : 100;
                        pesoB = golsB > golsA ? 101 : 100;
                    } else {
                        pesoA = 100; pesoB = 100;
                    }
                }
                else if (f.includes('3º') || f.includes('terceiro')) {
                    if (jogo.finalizado) {
                        const golsA = (jogo.golsA || 0) + (jogo.penaltisA || 0);
                        const golsB = (jogo.golsB || 0) + (jogo.penaltisB || 0);
                        pesoA = golsA > golsB ? 91 : 90;
                        pesoB = golsB > golsA ? 91 : 90;
                    } else {
                        pesoA = 90; pesoB = 90;
                    }
                }
                else if (f.includes('semifinal')) { pesoA = 80; pesoB = 80; }
                else if (f.includes('quartas')) { pesoA = 70; pesoB = 70; }
                else if (f.includes('oitavas')) { pesoA = 60; pesoB = 60; }
                else if (f.includes('16 avos')) { pesoA = 50; pesoB = 50; }
                else if (f.includes('playoff')) { pesoA = 40; pesoB = 40; }
            }

            // Atualiza peso se for maior que o atual (o time chegou pelo menos até aqui)
            if (mapaStats[jogo.timeA.id]) mapaStats[jogo.timeA.id].faseAlcancada = Math.max(mapaStats[jogo.timeA.id].faseAlcancada, pesoA);
            if (mapaStats[jogo.timeB.id]) mapaStats[jogo.timeB.id].faseAlcancada = Math.max(mapaStats[jogo.timeB.id].faseAlcancada, pesoB);

            if (!jogo.finalizado) return;

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

        // 3. Ordenação Final
        return Object.values(mapaStats).map(t => ({
            ...t,
            saldoGols: t.golsPro - t.golsContra
        })).sort((a, b) => {
            // Critério 1: Fase Alcançada (Quem chegou mais longe fica na frente)
            if (b.faseAlcancada !== a.faseAlcancada) return b.faseAlcancada - a.faseAlcancada;

            // Critério 2: Pontos Totais (Campanha)
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;

            // Critério 3: Vitórias
            if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;

            // Critério 4: Saldo
            if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;

            // Critério 5: Gols Pró
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
