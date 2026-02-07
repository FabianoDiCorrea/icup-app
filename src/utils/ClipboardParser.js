/**
 * Parser inteligente para escalações de futebol copiadas da internet (GE, Google, Sofascore)
 */
export default {
    /**
     * Processa um texto livre e retorna lista de 11 jogadores
     * @param {string} texto - Texto copiado pelo usuário
     * @returns {Array} Array com { nome, numero, posicao }
     */
    parse(texto) {
        if (!texto) return [];

        // Normaliza quebras de linha
        const rawText = texto.replace(/\r\n/g, '\n');

        // Estratégia: Agrupar linhas que estão "juntas" (sem linha vazia entre elas)
        // Divide por linhas duplas (blocos)
        let blocos = rawText.split(/\n\s*\n/);

        // Se não tiver linhas duplas, tenta dividir linha a linha normal (fallback) ou considera tudo um bloco
        if (blocos.length < 5) {
            // Tenta ver se o texto tem linhas vazias explicitas que o split comeu
            // Se não, vamos processar como linear, mas filtrando pares
            blocos = [rawText];
        }

        const jogadoresEncontrados = [];
        const stopWords = [
            'goleiro', 'zagueiro', 'lateral', 'meia', 'atacante', 'volante', 'ponta', 'centroavante',
            'técnico', 'treinador', 'reservas', 'escalação', 'time', 'banco', 'pendurados', 'lesionados',
            'subs', 'substitutos', 'coach', 'manager', 'entra', 'sai'
        ];

        // Processa cada bloco como um potencial "Titular (+ Reserva opcional)"
        for (let bloco of blocos) {
            // Divide o bloco em linhas não vazias
            let linhasDoBloco = bloco.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            // Filtra stopWords e linhas de substituição explícita
            linhasDoBloco = linhasDoBloco.filter(linha => {
                const lLower = linha.toLowerCase().replace(/[:\-\.]/g, '');
                if (stopWords.includes(lLower)) return false;
                if (/[↑↓↕↔⇆⇅🔄⇄⬇⬆]/.test(linha)) return false;
                return true;
            });

            if (linhasDoBloco.length === 0) continue;

            const candidatosNoBloco = [];

            for (let i = 0; i < linhasDoBloco.length; i++) {
                let linha = linhasDoBloco[i];
                let numero = null;
                let nome = linha;

                // Tenta achar número na linha atual
                const matchInicio = linha.match(/^(\d{1,2})[.\s\-\)]*\s*(.*)/);

                // Cenário 1: Linha tem Número + Nome ("10 Gabigol")
                if (matchInicio && matchInicio[2].length > 0) {
                    numero = parseInt(matchInicio[1]);
                    nome = matchInicio[2];
                    candidatosNoBloco.push({ nome, numero, linhaOriginal: linha });
                }
                // Cenário 2: Linha é só Número ("10"), Nome na próxima ("Gabigol")
                else if (matchInicio && matchInicio[2].length === 0) {
                    // Verifica próxima linha
                    if (i + 1 < linhasDoBloco.length) {
                        const proxLinha = linhasDoBloco[i + 1];
                        // Se a próxima linha NÃO for um número isolado tbm
                        if (!/^\d{1,2}$/.test(proxLinha)) {
                            numero = parseInt(matchInicio[1]);
                            nome = proxLinha;
                            candidatosNoBloco.push({ nome, numero, linhaOriginal: linha + ' ' + proxLinha });
                            i++; // Pula a próxima linha pois já usamos
                        }
                    }
                }
                // Cenário 3: Só nome ("Gabigol" ou "Gabigol (10)")
                else {
                    const matchFim = linha.match(/(.+)\s+[\(#](\d{1,2})[\)]?/);
                    if (matchFim) {
                        nome = matchFim[1];
                        numero = parseInt(matchFim[2]);
                    }
                    if (nome.length > 2) {
                        candidatosNoBloco.push({ nome, numero, linhaOriginal: linha });
                    }
                }
            }

            // A MÁGICA: Se identificamos candidatos neste bloco, assumimos que o PRIMEIRO é o Titular.
            // Os demais no mesmo bloco (colados) são ignorados (reservas/substituições).
            if (candidatosNoBloco.length > 0) {
                let titular = candidatosNoBloco[0];

                // Limpeza final do nome
                titular.nome = titular.nome.replace(/^(Goleiro|Gol|Zagueiro|Zag|Lateral|Lat|Meia|Mei|Volante|Vol|Atacante|Ata)[:\s]*/i, '');
                titular.nome = titular.nome.replace(/[.;,]*$/, '');

                jogadoresEncontrados.push({
                    nome: titular.nome.trim(),
                    numeroOriginal: titular.numero
                });
            }
        }

        // Se a estratégia de blocos falhou (ex: copiou de lugar sem linhas duplas),
        // fallback para o método antigo mas usando o regex de substituição já filtrado?
        // Na verdade, se "blocos" foi [rawText], o loop acima já processou tudo linearmente,
        // mas pegou APENAS o primeiro "candidato" do texto inteiro? NÃO!
        // Se blocos = [rawText], linhasDoBloco terá TODAS as linhas.
        // E candidatesNoBloco terá TODOS os jogadores.
        // E pegaremos apenas candidatesNoBloco[0]! ISSO SERIA UM BUG SE NÃO TIVER LINHAS DUPLAS.

        // CORREÇÃO: Se só tem 1 bloco gigante, devemos tratar todos como titulares (mas limitando a 11 depois).
        // MAS queremos filtrar os "pares". Se o texto não tem linhas vazias, impossível saber quem é par.
        // Vamos assumir que se o usuário colou do Google, TEM linhas vazias entre os titulares (como no exemplo dele).

        // Se detectou MUITO poucos (ex: 1), é provável que a quebra de linha falhou.
        if (jogadoresEncontrados.length < 5) {
            return this.parseLinear(texto);
        }

        return this.formatarParaApp(jogadoresEncontrados.slice(0, 11));
    },

    parseLinear(texto) {
        // Lógica simplificada de fallback (ignora agrupamento, pega sequencial)
        // Útil para listas separadas por vírgula ou sem quebras duplas
        let linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 2);
        // Se tiver vírgulas (formato horizontal)
        if (texto.includes(',') && linhas.length < 5) {
            const partes = texto.split(/,| e /).map(p => ({ nome: p.trim(), numero: null }));
            return this.formatarParaApp(partes.slice(0, 11));
        }

        // Processamento linha a linha simples
        const jogadores = [];
        const stopWords = ['goleiro', 'zagueiro', 'lateral', 'meia', 'atacante', 'volante', 'ponta', 'centroavante', 'técnico', 'treinador', 'reservas', 'escalação', 'time', 'banco', 'pendurados', 'lesionados', 'subs', 'substitutos', 'coach', 'manager', 'entra', 'sai'];

        for (let linha of linhas) {
            if (/[↑↓↕↔⇆⇅🔄⇄⬇⬆]|(\b(sai|entra)\b)/i.test(linha)) continue;
            const lLower = linha.toLowerCase().replace(/[:\-\.]/g, '');
            if (stopWords.includes(lLower)) continue;

            // Extração simples (Tenta achar nome)
            // ... (código similar ao antigo, simplificado)
            // Assume que toda linha válida é um jogador
            jogadores.push({ nome: linha, numeroOriginal: null }); // Simplificação
        }
        return this.formatarParaApp(jogadores.slice(0, 11));
    },

    formatarParaApp(jogadores) {
        return jogadores.map((j, index) => {
            const posIndex = index + 1;
            let posicaoLabel = 'Jogador';
            if (posIndex === 1) posicaoLabel = 'Goleiro';
            else if (posIndex >= 2 && posIndex <= 6) posicaoLabel = 'Defensor';
            else if (posIndex >= 7 && posIndex <= 8) posicaoLabel = 'Meia';
            else if (posIndex >= 9) posicaoLabel = 'Atacante';

            const nomeFinal = j.numeroOriginal ? `(${j.numeroOriginal}) ${j.nome}` : j.nome;
            return {
                numero: posIndex,
                nome: nomeFinal,
                posicao: posicaoLabel
            };
        });
    }
}
