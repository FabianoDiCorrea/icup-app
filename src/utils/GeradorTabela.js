/**
 * Utilitário para geração de tabelas de jogos.
 */

// === FUNÇÕES BÁSICAS (Fase de Grupos / Pontos Corridos) ===

export function gerarRoundRobin(times, turnos) {
    let listaTimes = [...times];

    // Se impar, adiciona o time "fantasma" para folga
    if (listaTimes.length % 2 !== 0) {
        listaTimes.push({ id: 'GHOST', nome: 'FOLGA' });
    }

    const totalTimes = listaTimes.length;
    const totalRodadas = totalTimes - 1;
    const jogosPorRodada = totalTimes / 2;
    let jogosGerados = [];

    for (let rodada = 0; rodada < totalRodadas; rodada++) {
        for (let i = 0; i < jogosPorRodada; i++) {
            let t1 = listaTimes[i];
            let t2 = listaTimes[totalTimes - 1 - i];

            if (t1.id === 'GHOST' || t2.id === 'GHOST') continue;

            // Inversão de mando para balanceamento
            let mandante, visitante;
            if ((rodada + i) % 2 === 0) {
                mandante = t1; visitante = t2;
            } else {
                mandante = t2; visitante = t1;
            }

            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: rodada + 1,
                turno: 1,
                timeA: { id: mandante.id, nome: mandante.nome, escudo: mandante.escudo },
                timeB: { id: visitante.id, nome: visitante.nome, escudo: visitante.escudo },
                golsA: null, golsB: null, finalizado: false
            });
        }
        const ultimo = listaTimes.pop();
        listaTimes.splice(1, 0, ultimo);
    }

    if (turnos === 2) {
        const jogosReturno = jogosGerados.map(jogo => ({
            ...jogo,
            id: crypto.randomUUID(),
            rodada: jogo.rodada + totalRodadas,
            turno: 2,
            timeA: jogo.timeB,
            timeB: jogo.timeA,
            golsA: null, golsB: null, finalizado: false
        }));
        jogosGerados = [...jogosGerados, ...jogosReturno];
    }
    return jogosGerados.sort((a, b) => a.rodada - b.rodada);
}

export function gerarJogosPontosCorridos(times, turnos) {
    return gerarRoundRobin(times, turnos);
}

export function gerarJogosGrupos(grupos, turnos) {
    let todosJogos = [];
    grupos.forEach((grupo, idx) => {
        if (!grupo.times || grupo.times.length < 2) return;
        const jogosGrupo = gerarRoundRobin(grupo.times, turnos);
        const jogosFormatados = jogosGrupo.map(j => ({
            ...j,
            grupo: grupo.nome,
            grupoIndex: idx
        }));
        todosJogos = [...todosJogos, ...jogosFormatados];
    });
    return todosJogos;
}

// === FUNÇÕES DE MATA-MATA ===

export function gerarJogosMataMata(timesPareados, turnos, nomeFase = 'Fase 1', rodadaInicial = 1, confrontoIdInicial = 1) {
    const jogosGerados = [];
    let numeroConfronto = confrontoIdInicial;

    for (let i = 0; i < timesPareados.length; i += 2) {
        if (i + 1 >= timesPareados.length) break;
        const timeA = timesPareados[i];
        const timeB = timesPareados[i + 1];

        // Jogo de Ida
        jogosGerados.push({
            id: crypto.randomUUID(),
            rodada: rodadaInicial,
            fase: nomeFase,
            confrontoId: numeroConfronto,
            turno: 1,
            timeA: { id: timeA.id, nome: timeA.nome, escudo: timeA.escudo },
            timeB: { id: timeB.id, nome: timeB.nome, escudo: timeB.escudo },
            golsA: null, golsB: null, finalizado: false
        });

        // Jogo de Volta
        if (turnos === 2) {
            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: rodadaInicial + 1,
                fase: nomeFase,
                confrontoId: numeroConfronto,
                turno: 2,
                timeA: { id: timeB.id, nome: timeB.nome, escudo: timeB.escudo },
                timeB: { id: timeA.id, nome: timeA.nome, escudo: timeA.escudo },
                golsA: null, golsB: null, finalizado: false
            });
        }
        numeroConfronto++;
    }
    return jogosGerados;
}

export function gerarJogosProximaFaseMataMata(vencedores, turnos, rodadaAtualMax) {
    const totalTimes = vencedores.length;
    let nomeNovaFase = '';
    if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';
    else nomeNovaFase = `Fase de ${totalTimes}`;

    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now();
    return gerarJogosMataMata(vencedores, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}

// === LÓGICA HÍBRIDA: GRUPOS PARALELOS OU SEEDING GERAL ===

export function gerarJogosMataMataDeGrupos(classificadosPorGrupo, turnos, rodadaAtualMax, timesRepescagem = []) {
    const nomesGrupos = Object.keys(classificadosPorGrupo).sort();
    let timesCruzados = [];

    // LÓGICA DE DECISÃO:
    // Se tivermos grupos ÍMPARES (ex: 3, 5) OU se tivermos times de repescagem (melhores 3ºs),
    // a lógica de parzinho (A x B) falha. 
    // Nesse caso, usamos o "Seeding Geral" (todos contra todos baseados na campanha).
    const usarSeedingGeral = (nomesGrupos.length % 2 !== 0) || (timesRepescagem.length > 0);

    if (usarSeedingGeral) {
        // Junta todos numa lista só: Classificados Diretos + Repescagem
        const diretos = Object.values(classificadosPorGrupo).flat();
        const todos = [...diretos, ...timesRepescagem];

        // Manda para a função que ordena e cruza (Melhor x Pior)
        return gerarJogosMataMataSeedingGeral(todos, turnos, rodadaAtualMax);
    }

    // Se for o caso clássico (Grupos Pares e sem repescagem), mantém a tradição A x B
    for (let i = 0; i < nomesGrupos.length; i += 2) {
        const nomeG1 = nomesGrupos[i];
        const nomeG2 = nomesGrupos[i + 1];

        if (!nomeG2) break; // Segurança

        const g1 = classificadosPorGrupo[nomeG1];
        const g2 = classificadosPorGrupo[nomeG2];

        if (g1 && g2) {
            const qtd = Math.min(g1.length, g2.length);
            for (let k = 0; k < qtd; k++) {
                // Cruzamento: 1º do A pega o último classificado do B
                const timeA = g1[k];
                const timeB = g2[qtd - 1 - k];
                if (timeA && timeB) {
                    timesCruzados.push(timeA);
                    timesCruzados.push(timeB);
                }
            }
        }
    }

    // Geração Padrão
    const totalTimes = timesCruzados.length;
    let nomeNovaFase = `Fase de ${totalTimes}`;
    if (totalTimes === 16) nomeNovaFase = 'Oitavas de Final';
    else if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';

    const novaRodadaInicial = rodadaAtualMax + 1;
    const novoConfrontoId = Date.now();

    return gerarJogosMataMata(timesCruzados, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}

// === NOVA FUNÇÃO: SEEDING GERAL (MELHOR CAMPANHA x PIOR CAMPANHA) ===
// Esta é a função que estava faltando!
export function gerarJogosMataMataSeedingGeral(todosOsTimesClassificados, turnos, rodadaAtualMax) {

    // 1. Ordena todos os classificados pela campanha geral de todos os grupos
    // Critérios: Pontos > Vitórias > Saldo > Gols Pro
    const rankingGeral = [...todosOsTimesClassificados].sort((a, b) => {
        const pB = b.pontos || 0; const pA = a.pontos || 0;
        if (pB !== pA) return pB - pA;

        const sB = b.saldoGols || 0; const sA = a.saldoGols || 0;
        if (sB !== sA) return sB - sA;

        const gB = b.golsPro || 0; const gA = a.golsPro || 0;
        if (gB !== gA) return gB - gA;

        const gcB = b.golsContra || 0; const gcA = a.golsContra || 0;
        return gcA - gcB; // Menos gols contra é melhor
    });

    // Se o número for ímpar (segurança), remove o pior
    if (rankingGeral.length % 2 !== 0) {
        console.warn("Número ímpar de classificados. O último colocado foi removido.");
        rankingGeral.pop();
    }

    const totalTimes = rankingGeral.length;
    const confrontos = [];

    // 2. Cruzamento Olímpico Geral (1º x Último, 2º x Penúltimo...)
    for (let i = 0; i < totalTimes / 2; i++) {
        const melhor = rankingGeral[i];
        const pior = rankingGeral[totalTimes - 1 - i];

        confrontos.push(pior);   // Mandante Ida (Pior campanha)
        confrontos.push(melhor); // Visitante Ida (Melhor campanha)
    }

    let nomeNovaFase = '';
    if (totalTimes === 32) nomeNovaFase = '16 avos de Final';
    else if (totalTimes === 16) nomeNovaFase = 'Oitavas de Final';
    else if (totalTimes === 8) nomeNovaFase = 'Quartas de Final';
    else if (totalTimes === 4) nomeNovaFase = 'Semifinal';
    else if (totalTimes === 2) nomeNovaFase = 'Final';
    else if (totalTimes === 6 || totalTimes === 12) nomeNovaFase = `Playoffs (${totalTimes} times)`;
    else nomeNovaFase = `Fase de ${totalTimes}`;

    const novaRodadaInicial = rodadaAtualMax + 1;

    const novoConfrontoId = Date.now();

    return gerarJogosMataMata(confrontos, turnos, nomeNovaFase, novaRodadaInicial, novoConfrontoId);
}
//
// Adicione esta nova função ao final do arquivo ou junto com as funções de Mata-Mata

export function gerarJogosComByeSystem(timesClassificados, turnos, rodadaAtualMax) {
    // 1. Ranking Técnico (1º ao Último) de todos os times passados
    // Ordena por pontos > vitorias > saldo > golsPro
    const ranking = [...timesClassificados].sort((a, b) => {
        const pB = b.pontos || 0; const pA = a.pontos || 0;
        if (pB !== pA) return pB - pA;

        const sB = b.saldoGols || 0; const sA = a.saldoGols || 0;
        if (sB !== sA) return sB - sA;

        const gB = b.golsPro || 0; const gA = a.golsPro || 0;
        if (gB !== gA) return gB - gA;

        const gcB = b.golsContra || 0; const gcA = a.golsContra || 0;
        return gcA - gcB; // Menos gols contra é melhor
    });

    const N = ranking.length;

    // Encontrar a potência de 2 alvo (4, 8, 16...)
    let targetPowerOf2 = 1;
    while (targetPowerOf2 * 2 < N) {
        targetPowerOf2 *= 2;
    }

    // Se já for perfeito, usa o seeding geral padrão
    if (targetPowerOf2 * 2 === N) {
        return gerarJogosMataMataSeedingGeral(ranking, turnos, rodadaAtualMax);
    }

    // Cálculos
    // Ex: 5 times. Alvo 4. Preliminares = 5 - 4 = 1.
    const qtdJogosPreliminares = N - targetPowerOf2;
    const qtdTimesNoPlayoff = qtdJogosPreliminares * 2;
    const qtdTimesBye = N - qtdTimesNoPlayoff; // Times que passam direto (Top Seeds)

    // Separação
    // Times Bye são os melhores (0 até qtdTimesBye - 1)
    // Times Playoff são os piores (N-1 voltando)
    const timesBye = ranking.slice(0, qtdTimesBye);
    const timesPlayoff = ranking.slice(qtdTimesBye);

    const jogosGerados = [];
    const novaRodada = rodadaAtualMax + 1;
    let confrontoId = Date.now();

    // === CRIAÇÃO DE "SLOTS" PARA A PRÓXIMA FASE ===
    // Precisamos gerar N jogos (alguns fake/bye, outros reais/preliminares) 
    // que representem os seeds para a próxima fase (Quartas/Semi).
    // O número de slots é exatamente targetPowerOf2.
    // Ex: 5 times -> 4 Slots.
    // Slot 1: Time 1 (Bye)
    // Slot 2: Time 2 (Bye)
    // Slot 3: Time 3 (Bye)
    // Slot 4: Time 4 (Vencedor de 4v5)

    const slots = [];

    // Preenche slots com Byes
    timesBye.forEach((time, index) => {
        const seedOriginal = index + 1;
        slots.push({
            tipo: 'BYE',
            seed: seedOriginal, // 1, 2, 3...
            time: time
        });
    });

    // Cria os jogos preliminares e atribui aos slots restantes
    // A lógica é: O melhor do playoff (Seed X) joga contra o pior (Seed Y).
    // O vencedor assume o Seed X.
    const nomeFasePreliminar = `Playoff Preliminar (${qtdTimesNoPlayoff} times)`;

    for (let i = 0; i < qtdJogosPreliminares; i++) {
        const melhor = timesPlayoff[i]; // ex: 4º
        const pior = timesPlayoff[timesPlayoff.length - 1 - i]; // ex: 5º

        // O vencedor deste jogo ocupará o slot do "melhor" (Seed 4)
        // Precisamos saber qual era o seed original na tabela geral.
        // O "melhor" é o time de índice i no array timesPlayoff.
        // Seu índice geral é qtdTimesBye + i.
        const seedFicticio = qtdTimesBye + i + 1;

        slots.push({
            tipo: 'PRELIMINAR',
            seed: seedFicticio, // ex: 4
            timeMelhor: melhor,
            timePior: pior
        });
    }

    // Agora temos `targetPowerOf2` slots.
    // slots = [ {Bye Seed 1}, {Bye Seed 2}, {Bye Seed 3}, {Prelim Seed 4} ]

    // === ORDENAÇÃO PARA PRÓXIMA FASE (Cruzamento Olímpico) ===
    // Para que a PRÓXIMA fase (gerada automaticamente pegando a lista) faça os cruzamentos certos (1v4, 2v3),
    // precisamos entregar a lista na ordem: [Seed 1, Seed 4, Seed 2, Seed 3].
    // Algoritmo:
    // Pega 1º e Último. Depois 2º e Penúltimo.

    // Ordena slots pelo seed (garantia)
    slots.sort((a, b) => a.seed - b.seed);

    const listaFinalOrdenada = [];
    const totalSlots = slots.length;

    for (let i = 0; i < totalSlots / 2; i++) {
        const topo = slots[i]; // Seed 1
        const fundo = slots[totalSlots - 1 - i]; // Seed 4

        // A próxima fase vai pegar (i) e (i+1) pra cruzar.
        // Então empurramos (Seed 1) e (Seed 4).
        // Isso gera o jogo 1v4 na próxima fase.
        listaFinalOrdenada.push(topo);
        listaFinalOrdenada.push(fundo);
    }
    // Resultado [S1, S4, S2, S3] para 4 slots. Correto.

    // === GERAÇÃO DOS OBJETOS DE JOGO ===

    listaFinalOrdenada.forEach(slot => {
        if (slot.tipo === 'BYE') {
            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: novaRodada,
                fase: 'Classificação Direta (Bye)',
                confrontoId: confrontoId++,
                turno: 1,
                timeA: slot.time,
                timeB: { id: 'BYE', nome: 'CLASSIFICADO (BYE)', escudo: null },
                golsA: 1, golsB: 0,
                finalizado: true
            });
        } else {
            // Preliminar
            jogosGerados.push({
                id: crypto.randomUUID(),
                rodada: novaRodada,
                fase: nomeFasePreliminar,
                confrontoId: confrontoId,
                turno: 1,
                timeA: slot.timePior, timeB: slot.timeMelhor, // Ida (Pior manda)
                golsA: null, golsB: null, finalizado: false
            });

            if (turnos === 2) {
                jogosGerados.push({
                    id: crypto.randomUUID(),
                    rodada: novaRodada + 1,
                    fase: nomeFasePreliminar,
                    confrontoId: confrontoId,
                    turno: 2,
                    timeA: slot.timeMelhor, timeB: slot.timePior, // Volta
                    golsA: null, golsB: null, finalizado: false
                });
            }
            confrontoId++;
        }
    });

    return jogosGerados;
}

export const gerarTabela = gerarRoundRobin;