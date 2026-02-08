<template>
  <div v-if="loading" class="container mt-5 text-center text-white">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>
    <p class="mt-2">Carregando perfil do técnico...</p>
  </div>

  <div v-else-if="!tecnicoNome" class="container mt-5 text-center text-white">
    <div class="alert alert-warning">Técnico não encontrado.</div>
    <button class="btn btn-primary" @click="$router.back()">Voltar</button>
  </div>

  <div v-else class="container-fluid py-4 bg-dark min-vh-100 text-white main-container">
    <div class="container mb-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
            <button class="btn btn-link text-white p-0 me-3" @click="$router.push('/tecnicos')">
                <i class="bi bi-arrow-left fs-4"></i>
            </button>
            <h4 class="mb-0 fw-bold">Perfil do Técnico</h4>
        </div>
        <button class="btn btn-outline-light btn-sm rounded-pill px-3" @click="$router.push('/tecnicos')">
            <i class="bi bi-people me-1"></i> Lista de Técnicos
        </button>
    </div>

    <div class="container px-0 px-md-3">
        <div class="row g-4">
            <!-- 1. CABEÇALHO - LADO ESQUERDO (DESKTOP) / TOPO (MOBILE) -->
            <div class="col-12 col-lg-4">
                <div class="card bg-secondary bg-opacity-25 border-secondary shadow-lg h-100">
                    <div class="card-body text-center py-5">
                        <div class="avatar-container mb-4 mx-auto">
                            <div class="avatar-circle">
                                <span class="fs-1 fw-bold text-primary">{{ tecnicoNome.charAt(0).toUpperCase() }}</span>
                            </div>
                        </div>
                        <h2 class="fw-bold mb-1">{{ tecnicoNome }}</h2>
                        <div class="d-flex align-items-center justify-content-center mb-4">
                             <span class="badge bg-primary px-3 py-2 fs-6">Técnico</span>
                        </div>

                        <div class="row g-3 text-start">
                            <div class="col-6">
                                <div class="stat-mini-card">
                                    <small class="text-white-50 d-block">🏆 Títulos</small>
                                    <span class="fs-4 fw-bold text-warning">{{ totalTitulos }}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-mini-card">
                                    <small class="text-white-50 d-block">🏆 Campeonatos</small>
                                    <span class="fs-4 fw-bold text-info">{{ totalCampeonatos }}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-mini-card">
                                    <small class="text-white-50 d-block">⚽ Jogos</small>
                                    <span class="fs-4 fw-bold">{{ statsGerais.jogos }}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="stat-mini-card">
                                    <small class="text-white-50 d-block">📊 Aproveit.</small>
                                    <span class="fs-4 fw-bold" :class="corAproveitamento(statsGerais.aproveitamento)">{{ statsGerais.aproveitamento }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. CONTEÚDO PRINCIPAL (ABAS) -->
            <div class="col-12 col-lg-8">
                <!-- MENU FIXO (ABAS) -->
                <div class="tabs-scroll-container mb-4">
                    <ul class="nav nav-pills nav-fill flex-nowrap bg-dark p-1 rounded-pill border border-secondary shadow-sm">
                        <li class="nav-item" v-for="aba in abas" :key="aba.id">
                            <button 
                                class="nav-link rounded-pill py-2 px-4 transition-all fw-bold text-nowrap"
                                :class="{ 'active': activeTab === aba.id, 'text-white-50': activeTab !== aba.id }"
                                @click="activeTab = aba.id"
                            >
                                <i :class="aba.icon + ' me-1'"></i> {{ aba.label }}
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- CONTEÚDO DA ABA -->
                <div class="tab-content border-top border-secondary pt-4">
                    
                    <!-- ABA: RESUMO -->
                    <div v-if="activeTab === 'resumo'" class="animate-fade-in">
                        <div class="row g-4">
                            <!-- Desempenho Geral -->
                            <div class="col-md-6">
                                <div class="stats-card h-100">
                                    <h6 class="text-uppercase text-primary border-bottom border-secondary pb-2 mb-3">📊 Desempenho Geral</h6>
                                    <div class="row text-center mb-3">
                                        <div class="col-4">
                                            <div class="fw-bold text-success">{{ statsGerais.v }}</div>
                                            <small class="text-white-50">V</small>
                                        </div>
                                        <div class="col-4 border-start border-end border-secondary">
                                            <div class="fw-bold text-warning">{{ statsGerais.e }}</div>
                                            <small class="text-white-50">E</small>
                                        </div>
                                        <div class="col-4">
                                            <div class="fw-bold text-danger">{{ statsGerais.d }}</div>
                                            <small class="text-white-50">D</small>
                                        </div>
                                    </div>
                                    <div class="row text-center border-top border-secondary pt-3">
                                        <div class="col-4">
                                            <div class="fw-bold">{{ statsGerais.gp }}</div>
                                            <small class="text-white-50">GP</small>
                                        </div>
                                        <div class="col-4 border-start border-end border-secondary">
                                            <div class="fw-bold">{{ statsGerais.gc }}</div>
                                            <small class="text-white-50">GC</small>
                                        </div>
                                        <div class="col-4">
                                            <div class="fw-bold" :class="statsGerais.sg >= 0 ? 'text-success' : 'text-danger'">
                                                {{ statsGerais.sg > 0 ? '+' : '' }}{{ statsGerais.sg }}
                                            </div>
                                            <small class="text-white-50">SG</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Resumo de Títulos -->
                            <div class="col-md-6">
                                <div class="stats-card h-100">
                                    <h6 class="text-uppercase text-warning border-bottom border-secondary pb-2 mb-3">🏆 Títulos Conquistados</h6>
                                    <div v-if="titulosAgrupados.length === 0" class="text-center py-4 text-white-50">
                                        Nenhum título conquistado ainda.
                                    </div>
                                    <div v-else class="list-group list-group-flush bg-transparent">
                                        <div v-for="t in titulosAgrupados" :key="t.nome" class="list-group-item bg-transparent text-white border-secondary px-0 d-flex justify-content-between">
                                            <span>🥇 {{ t.nome }}</span>
                                            <span class="badge bg-warning text-dark rounded-pill fw-bold">{{ t.qtd }}x</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ABA: TIMES TREINADOS -->
                    <div v-if="activeTab === 'times'" class="animate-fade-in">
                        <div class="timeline">
                            <div 
                                v-for="(clube, index) in timesTreinados" 
                                :key="index" 
                                class="timeline-item mb-4 animate-slide-up"
                                :style="{ 'animation-delay': (index * 0.1) + 's' }"
                                @click="abrirModalClube(clube)"
                                style="cursor: pointer;"
                            >
                                <div class="timeline-dot"></div>
                                <div class="timeline-content card bg-secondary bg-opacity-25 border-secondary border-start-0 hover-scale">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="me-3 flex-shrink-0">
                                                <img v-if="clube.escudo" :src="clube.escudo" class="rounded" style="width: 48px; height: 48px; object-fit: contain;">
                                                <div v-else class="fs-3">
                                                    <i class="bi bi-shield-shaded text-primary"></i>
                                                </div>
                                            </div>
                                            <div class="flex-grow-1">
                                                <h5 class="mb-0 fw-bold">{{ clube.nomeTime }}</h5>
                                                <small class="text-white-50">{{ clube.totalJogos }} Jogos • {{ clube.totalTitulos }} Títulos</small>
                                            </div>
                                            <div class="text-end">
                                                <i class="bi bi-chevron-right text-white-50"></i>
                                            </div>
                                        </div>
                                        <!-- Mini Lista de Competições -->
                                        <div class="d-flex flex-wrap gap-2">
                                            <div v-for="comp in clube.competicoes" :key="comp.nome" class="badge bg-dark border border-secondary fw-normal py-2 px-3">
                                                <span class="text-primary fw-bold">{{ comp.nome }}:</span>
                                                <span class="ms-1">{{ comp.edicoes.length }}x</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ABA: GRÁFICOS -->
                    <div v-if="activeTab === 'graficos'" class="animate-fade-in">
                        <div class="card bg-secondary bg-opacity-25 border-secondary mb-4">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-4">
                                    <h6 class="text-uppercase text-info mb-0">📉 Evolução de Colocação</h6>
                                    <select v-model="graficoCompFiltro" class="form-select form-select-sm w-auto bg-dark border-secondary text-white shadow-none">
                                        <option value="TODAS">Selecione o Campeonato</option>
                                        <option v-for="c in listaNomesCampeonatos" :key="c" :value="c">{{ c }}</option>
                                    </select>
                                </div>
                                <div v-if="graficoCompFiltro === 'TODAS'" class="text-center py-5 text-white-50">
                                    <i class="bi bi-graph-up fs-1 d-block mb-2 opacity-25"></i>
                                    Selecione um campeonato acima para ver a evolução.
                                </div>
                                <div v-else-if="chartData.series[0].data.length === 0" class="text-center py-5 text-white-50">
                                    Nenhum dado encontrado para este campeonato.
                                </div>
                                <div v-else>
                                <div class="chart-wrapper rounded bg-dark bg-opacity-50 p-3" style="overflow-x: auto; overflow-y: hidden;">
                                    <div :style="{ width: chartWidth, minWidth: '100%' }">
                                        <apexchart 
                                            :key="graficoCompFiltro + chartWidth"
                                            type="line" 
                                            height="350" 
                                            :options="chartOptions" 
                                            :series="chartData.series"
                                        ></apexchart>
                                    </div>
                                </div>
                                    <p class="text-center text-white-50 small mt-2">
                                        <i class="bi bi-info-circle"></i> Eixo invertido: 1º lugar no topo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ABA: CONFRONTOS -->
                    <div v-if="activeTab === 'confrontos'" class="animate-fade-in">
                        <div class="card bg-secondary bg-opacity-25 border-secondary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-3">
                                    <h6 class="text-uppercase text-danger mb-0">⚔️ Técnico x Técnico</h6>
                                    <select v-model="ordenacaoConfrontos" class="form-select form-select-sm w-auto bg-dark border-secondary text-white shadow-none">
                                        <option v-for="(label, key) in labelsOrdenacao" :key="key" :value="key">
                                            {{ label }}
                                        </option>
                                    </select>
                                </div>

                                <div v-if="confrontosFiltrados.length === 0" class="text-center py-5 text-white-50">
                                    Nenhum confronto histórico registrado.
                                </div>
                                
                                <div v-else class="confrontos-list">
                                    <div 
                                        v-for="c in confrontosFiltrados" 
                                        :key="c.nome" 
                                        class="confronto-item bg-dark bg-opacity-50 p-3 mb-3 rounded border border-secondary shadow-sm"
                                    >
                                        <div class="row align-items-center">
                                            <div class="col-md-4">
                                                <h6 class="mb-0 fw-bold">{{ c.nome }}</h6>
                                                <small class="text-white-50">{{ c.jogos }} {{ c.jogos === 1 ? 'Jogo' : 'Jogos' }}</small>
                                            </div>
                                            <div class="col-md-5">
                                                <div class="d-flex justify-content-center text-center">
                                                    <div class="px-2">
                                                        <div class="fw-bold text-success">{{ c.v }}</div>
                                                        <small class="text-white-50 x-small">V</small>
                                                    </div>
                                                    <div class="px-2 border-start border-end border-secondary">
                                                        <div class="fw-bold text-warning">{{ c.e }}</div>
                                                        <small class="text-white-50 x-small">E</small>
                                                    </div>
                                                    <div class="px-2">
                                                        <div class="fw-bold text-danger">{{ c.d }}</div>
                                                        <small class="text-white-50 x-small">D</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-3 text-end">
                                                <div class="fw-bold" :class="corAproveitamento(c.aproveitamento)">
                                                    {{ c.aproveitamento }}%
                                                </div>
                                                <small class="text-white-50 x-small">Aprov.</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ABA: ARTILHARIA -->
                    <div v-if="activeTab === 'artilharia'" class="animate-fade-in">
                         <div class="card bg-secondary bg-opacity-25 border-secondary">
                            <div class="card-body">
                                <h6 class="text-uppercase text-primary border-bottom border-secondary pb-2 mb-4">⚽ Artilheiros com o Técnico</h6>
                                <div v-if="topArtilheiros.length === 0" class="text-center py-5 text-white-50">
                                    Nenhum dado de artilharia disponível.
                                </div>
                                <div v-else class="list-group list-group-flush bg-transparent">
                                    <div v-for="(art, idx) in topArtilheiros" :key="idx" class="list-group-item bg-transparent text-white border-secondary px-0 py-3 d-flex align-items-center justify-content-between">
                                        <div class="d-flex align-items-center">
                                            <div class="medal-circle me-3" :class="'medal-' + (idx + 1)">
                                                {{ idx + 1 }}
                                            </div>
                                            <div class="flex-grow-1 d-flex align-items-center">
                                                <img v-if="art.logo" :src="art.logo" class="me-2" style="width: 24px; height: 24px; object-fit: contain;">
                                                <div class="flex-grow-1">
                                                    <h6 class="mb-0 fw-bold">{{ art.nome }}</h6>
                                                    <div class="small text-white-50">
                                                        {{ art.timeNome }}
                                                        <span v-if="art.bandeira" class="ms-1">{{ art.bandeira }}</span>
                                                    </div>
                                                    <small class="text-white-50 x-small">Média: {{ (art.gols / art.jogos).toFixed(2) }} g/j</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-end">
                                            <div class="fs-4 fw-bold text-primary">{{ art.gols }}</div>
                                            <small class="text-white-50 x-small" style="font-size: 0.75rem;">{{ art.jogos }} {{ art.jogos === 1 ? 'jogo' : 'jogos' }}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ABA: STATS AVANÇADAS (REGISTROS DE CARREIRA) -->
                    <div v-if="activeTab === 'stats'" class="animate-fade-in">
                        <div class="row g-3 row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5">
                            <!-- Maior Invencibilidade -->
                            <div class="col">
                                <div class="stat-advanced-card h-100 p-3 bg-secondary bg-opacity-25 rounded border border-secondary shadow-sm d-flex flex-column align-items-center">
                                    <span class="fs-1 d-block mb-1">🔥</span>
                                    <h3 class="fw-bold mb-0 text-success">{{ statsAvancadas.invencibilidade.valor }}</h3>
                                    <small class="text-white-50 d-block mb-3">Maior Invencibilidade em uma Competição</small>
                                    
                                    <div v-if="statsAvancadas.invencibilidade.time" class="mt-auto pt-3 border-top border-secondary border-opacity-25 w-100 text-center">
                                        <!-- Escudo no Topo -->
                                        <div class="mb-2">
                                            <img v-if="statsAvancadas.invencibilidade.logo" :src="statsAvancadas.invencibilidade.logo" style="width: 48px; height: 48px; object-fit: contain;">
                                        </div>
                                        <div class="mb-2">
                                            <div class="fw-bold fs-6 text-white text-uppercase line-height-1" style="letter-spacing: 0.5px;">{{ statsAvancadas.invencibilidade.time }}</div>
                                        </div>
                                        <!-- Campeonato e Edição -->
                                        <div class="mt-1">
                                            <div class="x-small text-info fw-bold mb-0" style="font-size: 0.75rem;">{{ statsAvancadas.invencibilidade.torneio }}</div>
                                            <div class="x-small text-white-50" v-if="statsAvancadas.invencibilidade.edicao">{{ statsAvancadas.invencibilidade.edicao }}ª Edição</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Maior Goleada -->
                            <div class="col">
                                <div class="stat-advanced-card h-100 p-3 bg-secondary bg-opacity-25 rounded border border-secondary shadow-sm d-flex flex-column align-items-center">
                                    <span class="fs-1 d-block mb-1">🚀</span>
                                    <h3 class="fw-bold mb-0 text-info">{{ statsAvancadas.maiorGoleada.placar || '0 x 0' }}</h3>
                                    <small class="text-white-50 d-block mb-2">Maior Goleada</small>
                                    
                                    <div v-if="statsAvancadas.maiorGoleada.time" class="mt-auto pt-2 border-top border-secondary border-opacity-25 w-100">
                                        <!-- Oponente Reduzido Central -->
                                        <div class="text-center mb-2 pb-2 border-bottom border-secondary border-opacity-10">
                                            <div class="d-flex flex-column align-items-center gap-1">
                                                <img v-if="statsAvancadas.maiorGoleada.adversario.logo" :src="statsAvancadas.maiorGoleada.adversario.logo" style="width: 24px; height: 24px; object-fit: contain;">
                                                <div class="fw-bold text-white-50 text-uppercase" style="font-size: 0.65rem;">{{ statsAvancadas.maiorGoleada.adversario.nome }}</div>
                                            </div>
                                            <div class="px-2 py-0 bg-info bg-opacity-10 rounded d-inline-block mt-1">
                                                <span class="text-info fw-bold" style="font-size: 0.65rem;">Téc: {{ statsAvancadas.maiorGoleada.adversario.tecnico }}</span>
                                            </div>
                                        </div>

                                        <!-- Meu Time Centralizado -->
                                        <div class="text-center mt-2">
                                            <div class="mb-2">
                                                <img v-if="statsAvancadas.maiorGoleada.logo" :src="statsAvancadas.maiorGoleada.logo" style="width: 48px; height: 48px; object-fit: contain;">
                                            </div>
                                            <div class="mb-1">
                                                <div class="fw-bold fs-6 text-white text-uppercase line-height-1">{{ statsAvancadas.maiorGoleada.time }}</div>
                                            </div>
                                            <div class="x-small text-info fw-bold mb-0" style="font-size: 0.75rem;">{{ statsAvancadas.maiorGoleada.torneio }}</div>
                                            <div class="x-small text-white-50" v-if="statsAvancadas.maiorGoleada.edicao">{{ statsAvancadas.maiorGoleada.edicao }}ª Edição</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Maior Goleada Sofrida -->
                            <div class="col">
                                <div class="stat-advanced-card h-100 p-3 bg-secondary bg-opacity-25 rounded border border-secondary shadow-sm d-flex flex-column align-items-center">
                                    <span class="fs-1 d-block mb-1">💥</span>
                                    <h3 class="fw-bold mb-0 text-danger">{{ statsAvancadas.maiorDerrota.placar || '0 x 0' }}</h3>
                                    <small class="text-danger opacity-75 d-block mb-2 fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">MAIOR GOLEADA SOFRIDA</small>
                                    
                                    <div v-if="statsAvancadas.maiorDerrota.time" class="mt-auto pt-2 border-top border-secondary border-opacity-25 w-100">
                                        <!-- Oponente Reduzido Central -->
                                        <div class="text-center mb-2 pb-2 border-bottom border-secondary border-opacity-10">
                                            <div class="d-flex flex-column align-items-center gap-1">
                                                <img v-if="statsAvancadas.maiorDerrota.adversario.logo" :src="statsAvancadas.maiorDerrota.adversario.logo" style="width: 24px; height: 24px; object-fit: contain;">
                                                <div class="fw-bold text-white-50 text-uppercase" style="font-size: 0.65rem;">{{ statsAvancadas.maiorDerrota.adversario.nome }}</div>
                                            </div>
                                            <div class="px-2 py-0 bg-danger bg-opacity-10 rounded d-inline-block mt-1">
                                                <span class="text-danger fw-bold" style="font-size: 0.65rem;">Téc: {{ statsAvancadas.maiorDerrota.adversario.tecnico }}</span>
                                            </div>
                                        </div>

                                        <!-- Meu Time Centralizado -->
                                        <div class="text-center mt-2">
                                            <div class="mb-2">
                                                <img v-if="statsAvancadas.maiorDerrota.logo" :src="statsAvancadas.maiorDerrota.logo" style="width: 48px; height: 48px; object-fit: contain;">
                                            </div>
                                            <div class="mb-1">
                                                <div class="fw-bold fs-6 text-white text-uppercase line-height-1">{{ statsAvancadas.maiorDerrota.time }}</div>
                                            </div>
                                            <div class="x-small text-danger fw-bold mb-0 opacity-75" style="font-size: 0.75rem;">{{ statsAvancadas.maiorDerrota.torneio }}</div>
                                            <div class="x-small text-white-50" v-if="statsAvancadas.maiorDerrota.edicao">{{ statsAvancadas.maiorDerrota.edicao }}ª Edição</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Melhor Ataque -->
                            <div class="col">
                                <div class="stat-advanced-card h-100 p-3 bg-secondary bg-opacity-25 rounded border border-secondary shadow-sm d-flex flex-column align-items-center">
                                    <span class="fs-1 d-block mb-1">⚽</span>
                                    <h3 class="fw-bold mb-0 text-primary">{{ statsAvancadas.melhorAtaque.valor }}</h3>
                                    <small class="text-white-50 d-block mb-3">Mais Gols Feitos em um Torneio</small>
                                    
                                    <div v-if="statsAvancadas.melhorAtaque.time" class="mt-auto pt-3 border-top border-secondary border-opacity-25 w-100 text-center">
                                        <div class="mb-2">
                                            <img v-if="statsAvancadas.melhorAtaque.logo" :src="statsAvancadas.melhorAtaque.logo" style="width: 48px; height: 48px; object-fit: contain;">
                                        </div>
                                        <div class="mb-2">
                                            <div class="fw-bold fs-6 text-white text-uppercase line-height-1" style="letter-spacing: 0.5px;">{{ statsAvancadas.melhorAtaque.time }}</div>
                                        </div>
                                        <div class="mt-1">
                                            <div class="x-small text-primary fw-bold mb-0" style="font-size: 0.75rem;">{{ statsAvancadas.melhorAtaque.torneio }}</div>
                                            <div class="x-small text-white-50" v-if="statsAvancadas.melhorAtaque.edicao">{{ statsAvancadas.melhorAtaque.edicao }}ª Edição</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Maior Sequência de Vitórias -->
                            <div class="col">
                                <div class="stat-advanced-card h-100 p-3 bg-secondary bg-opacity-25 rounded border border-secondary shadow-sm d-flex flex-column align-items-center">
                                    <span class="fs-1 d-block mb-1">🧱</span>
                                    <h3 class="fw-bold mb-0 text-warning">{{ statsAvancadas.vitoriasSeguidas.valor }}</h3>
                                    <small class="text-white-50 d-block mb-3">Sequência de Vitórias (Recorde)</small>
                                    
                                    <div v-if="statsAvancadas.vitoriasSeguidas.time" class="mt-auto pt-3 border-top border-secondary border-opacity-25 w-100 text-center">
                                        <div class="mb-2">
                                            <img v-if="statsAvancadas.vitoriasSeguidas.logo" :src="statsAvancadas.vitoriasSeguidas.logo" style="width: 48px; height: 48px; object-fit: contain;">
                                        </div>
                                        <div class="mb-2">
                                            <div class="fw-bold fs-6 text-white text-uppercase line-height-1" style="letter-spacing: 0.5px;">{{ statsAvancadas.vitoriasSeguidas.time }}</div>
                                        </div>
                                        <div class="mt-1">
                                            <div class="x-small text-warning fw-bold mb-0" style="font-size: 0.75rem;">{{ statsAvancadas.vitoriasSeguidas.torneio }}</div>
                                            <div class="x-small text-white-50" v-if="statsAvancadas.vitoriasSeguidas.edicao">{{ statsAvancadas.vitoriasSeguidas.edicao }}ª Edição</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- MODAL DETALHES CLUBE -->
    <div v-if="clubeSelecionado" class="modal-overlay d-flex align-items-center justify-content-center p-3 animate-fade-in">
        <div class="modal-content bg-dark border border-secondary rounded-lg shadow-2xl w-100 max-w-lg p-4 animate-zoom-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="d-flex align-items-center">
                    <img v-if="clubeSelecionado.escudo" :src="clubeSelecionado.escudo" class="me-3" style="width: 48px; height: 48px; object-fit: contain;">
                    <h4 class="fw-bold text-primary mb-0">
                        <span v-if="clubeSelecionado.bandeira && !clubeSelecionado.escudo" class="me-2">{{ clubeSelecionado.bandeira }}</span>
                        {{ clubeSelecionado.nomeTime }}
                    </h4>
                </div>
                <button class="btn btn-sm btn-outline-secondary" @click="clubeSelecionado = null">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <div class="mb-4 text-white-50">
                <i class="bi bi-calendar3 me-2"></i> Período: {{ clubeSelecionado.temporadasDisplay }}
            </div>

            <h6 class="text-uppercase text-white-50 border-bottom border-secondary pb-2 mb-3">Histórico de Competições</h6>
            <div class="participacoes-scroll">
                <div v-for="comp in clubeSelecionado.competicoes" :key="comp.nome" class="mb-4">
                    <div class="text-primary fw-bold small text-uppercase mb-2">{{ comp.nome }}</div>
                    <div v-for="ed in comp.edicoes" :key="ed.edicao" class="d-flex justify-content-between align-items-center mb-1 p-2 bg-secondary bg-opacity-10 rounded">
                        <div class="small">
                            {{ ed.edicao }}ª Edição
                            <div class="text-white-50 x-small">{{ ed.dataDisplay }}</div>
                        </div>
                        <div class="text-end">
                            <span v-if="ed.posicao === 1" class="badge bg-warning text-dark border border-warning shadow-sm"><i class="bi bi-trophy-fill me-1"></i>CAMPEÃO</span>
                            <span v-else-if="ed.posicao === 2" class="badge bg-light text-dark border border-white shadow-sm">VICE</span>
                            <span v-else-if="ed.posicao === 3" class="badge bg-warning text-dark border border-warning bg-opacity-50 shadow-sm" style="background-color: #cd7f32 !important; border-color: #a0522d !important;"><i class="bi bi-award-fill me-1"></i>3º LUGAR</span>
                            <span v-else class="badge" :class="posicaoBadgeClass(ed.posicao)">{{ formatarPosicao(ed.posicao) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3 text-center mt-3 border-top border-secondary pt-3">
                <div class="col-3">
                    <div class="fw-bold">{{ clubeSelecionado.stats.j }}</div>
                    <small class="text-white-50 x-small">Jogos</small>
                </div>
                <div class="col-3">
                    <div class="fw-bold text-success">{{ clubeSelecionado.stats.v }}</div>
                    <small class="text-white-50 x-small">V</small>
                </div>
                <div class="col-3">
                    <div class="fw-bold text-warning">{{ clubeSelecionado.stats.e }}</div>
                    <small class="text-white-50 x-small">E</small>
                </div>
                <div class="col-3">
                    <div class="fw-bold text-danger">{{ clubeSelecionado.stats.d }}</div>
                    <small class="text-white-50 x-small">D</small>
                </div>
            </div>

             <div class="mt-4">
                <button class="btn btn-secondary w-100 rounded-pill" @click="clubeSelecionado = null">Fechar</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import DbService from '@/services/DbService.js';
import apexchart from 'vue3-apexcharts';

export default {
  name: "DashboardTecnico",
  props: ['nome'],
  components: {
    apexchart
  },
  
  data() {
    return {
      loading: true,
      activeTab: 'resumo',
      tecnicoNome: null,
      paisTecnico: 'Brasil', // Default
      historicoCompleto: [],
      tecnicosDb: [],
      timesDb: [],
      clubeSelecionado: null,
      ordenacaoConfrontos: 'jogos',
      labelsOrdenacao: {
          'jogos': 'Mais Jogos',
          'aproveitamento': 'Melhor Aproveitamento',
          'derrotas': 'Maior Rival'
      },
      abas: [
        { id: 'resumo', label: 'Resumo', icon: 'bi-grid-1x2' },
        { id: 'times', label: 'Times', icon: 'bi-shield-shaded' },
        { id: 'graficos', label: 'Gráficos', icon: 'bi-graph-up' },
        { id: 'confrontos', label: 'Confrontos', icon: 'bi-swords' },
        { id: 'artilharia', label: 'Artilharia', icon: 'bi-person-badge' },
        { id: 'stats', label: 'Stats', icon: 'bi-bar-chart' }
      ],
      chartOptions: {
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 4 },
        colors: ['#0d6efd'],
        theme: { mode: 'dark' },
        xaxis: { categories: [] },
        yaxis: {
          reversed: true,
          min: 1,
          decimalsInFloat: 0,
          labels: {
              formatter: (val) => {
                  if (val === null || val === undefined) return '';
                  const v = typeof val === 'number' ? val : Number(val);
                  if (isNaN(v)) return '';
                  if (v >= 17) return 'Grupos';
                  return Math.round(v) + 'º';
              }
          }
        },
        dataLabels: {
            enabled: true,
            background: { enabled: true, borderRadius: 4, padding: 4, opacity: 0.9, borderWidth: 1, borderColor: '#fff' },
            style: { fontSize: '12px', fontWeight: 'bold' },
            formatter: (val) => {
                if (val === null || val === undefined) return '';
                const v = typeof val === 'number' ? val : Number(val);
                if (isNaN(v)) return '';
                if (v >= 17) return 'Grupos';
                return Math.round(v) + 'º';
            }
        },
        markers: { size: 6, strokeWidth: 2, hover: { size: 8 } },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => {
                    const v = Math.round(val);
                    if (v >= 17) return 'Eliminado nos Grupos';
                    return v + 'º Lugar';
                }
            }
        }
      },
      mapaTecnicos: {}, // Cache de nomes
      graficoCompFiltro: 'TODAS'
    };
  },

  async mounted() {
    this.tecnicoNome = this.nome || this.$route.params.nome;
    if (!this.tecnicoNome) {
      this.loading = false;
      return;
    }

    try {
      this.historicoCompleto = await DbService.getHistorico();
      this.tecnicosDb = await DbService.getTecnicos();
      this.timesDb = await DbService.getTimes();
      
      this.mapaTecnicos = this.tecnicosDb.reduce((acc, t) => {
          acc[t.apelido] = t.nome;
          return acc;
      }, {});

      // RESOLVER O NOME DO TÉCNICO DA URL PARA O NOME COMPLETO
      const tech = this.tecnicosDb.find(t => t.apelido === this.tecnicoNome || t.nome === this.tecnicoNome);
      if (tech) {
          this.tecnicoNome = tech.nome;
      }
      
      this.loading = false;
    } catch (e) {
      console.error(e);
      this.loading = false;
    }
  },

  computed: {
    // 1. ESTATÍSTICAS GERAIS
    statsGerais() {
      let stats = { v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, jogos: 0, aproveitamento: 0 };
      
      this.historicoCompleto.forEach(h => {
        (h.jogos || []).forEach(j => {
          const comandouA = this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoNome;
          const comandouB = this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoNome;
          
          if (comandouA || comandouB) {
            stats.jogos++;
            if (comandouA) {
              stats.gp += j.golsA;
              stats.gc += j.golsB;
              if (j.golsA > j.golsB) stats.v++;
              else if (j.golsA === j.golsB) stats.e++;
              else stats.d++;
            } else {
              stats.gp += j.golsB;
              stats.gc += j.golsA;
              if (j.golsB > j.golsA) stats.v++;
              else if (j.golsB === j.golsA) stats.e++;
              else stats.d++;
            }
          }
        });
      });
      
      stats.sg = stats.gp - stats.gc;
      const totalPontos = stats.jogos * 3;
      const pontosGanhos = (stats.v * 3) + stats.e;
      stats.aproveitamento = totalPontos > 0 ? ((pontosGanhos / totalPontos) * 100).toFixed(1) : 0;
      
      return stats;
    },

    // 2. TÍTULOS AGRUPADOS
    titulosAgrupados() {
      const mapa = {};
      this.historicoCompleto.forEach(h => {
        if (h.campeao && this.resolverNomeTecnico(h.campeao.tecnico) === this.tecnicoNome) {
          const nome = h.nome || 'Campeonato';
          mapa[nome] = (mapa[nome] || 0) + 1;
        }
      });
      return Object.entries(mapa)
        .map(([nome, qtd]) => ({ nome, qtd }))
        .sort((a,b) => b.qtd - a.qtd);
    },

    totalTitulos() {
      return this.titulosAgrupados.reduce((acc, current) => acc + current.qtd, 0);
    },

    totalTitulos() {
      return this.titulosAgrupados.reduce((acc, current) => acc + current.qtd, 0);
    },

    // 3. TIMES TREINADOS (LINEA DO TEMPO) - REESTRUTURADO
    timesTreinados() {
      const clubesMap = {}; // nomeTime -> info
      
      this.historicoCompleto.forEach(h => {
        const equipes = h.tabelaResumo || h.times || [];
        const timesDoTecnico = equipes.filter(t => this.resolverNomeTecnico(t.tecnico) === this.tecnicoNome);

        timesDoTecnico.forEach(timeParticipante => {
          const nome = timeParticipante.nome;
          
          // Fallback para escudo e bandeira (Historico antigo pode não ter na tabelaResumo)
          const infoTimeExtra = (h.timesParticipantes || []).find(tp => tp.id === timeParticipante.id || tp.nome === nome);
          const timeReal = this.timesDb.find(tr => tr.nome === nome);
          
          const escudoFinal = timeParticipante.escudo || timeParticipante.urlLogo || timeParticipante.logo || 
                             infoTimeExtra?.escudo || infoTimeExtra?.urlLogo || infoTimeExtra?.logo || 
                             timeReal?.escudo || '';
                             
          const bandeiraFinal = timeParticipante.bandeira || infoTimeExtra?.bandeira || timeReal?.pais || '';

          if (!clubesMap[nome]) {
            clubesMap[nome] = {
              nomeTime: nome,
              bandeira: bandeiraFinal,
              escudo: escudoFinal,
              competicoes: {}, // nomeComp -> { nome, edicoes: [] }
              stats: { j:0, v:0, e:0, d:0, gp:0, gc:0 },
              totalTitulos: 0,
              totalJogos: 0,
              dataUltima: new Date(h.dataFim)
            };
          }

          if (new Date(h.dataFim) > clubesMap[nome].dataUltima) {
              clubesMap[nome].dataUltima = new Date(h.dataFim);
          }

          const nomeComp = h.nome;
          if (!clubesMap[nome].competicoes[nomeComp]) {
              clubesMap[nome].competicoes[nomeComp] = { nome: nomeComp, edicoes: [] };
          }

          const posFinal = this.calcularPosicaoFinal(h, timeParticipante);
          if (posFinal == 1) clubesMap[nome].totalTitulos++;

          clubesMap[nome].competicoes[nomeComp].edicoes.push({
            edicao: this.obterNumeroEdicao(h),
            posicao: posFinal,
            data: new Date(h.dataFim),
            dataDisplay: new Date(h.dataFim).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
          });

          // Somar stats
          (h.jogos || []).forEach(j => {
             const cmdA = this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoNome && j.timeA.nome === nome;
             const cmdB = this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoNome && j.timeB.nome === nome;
             if (cmdA || cmdB) {
                 clubesMap[nome].stats.j++;
                 clubesMap[nome].totalJogos++;
                 const gP = cmdA ? parseInt(j.golsA) : parseInt(j.golsB);
                 const gA = cmdA ? parseInt(j.golsB) : parseInt(j.golsA);
                 clubesMap[nome].stats.gp += gP;
                 clubesMap[nome].stats.gc += gA;
                 if (gP > gA) clubesMap[nome].stats.v++;
                 else if (gP === gA) clubesMap[nome].stats.e++;
                 else clubesMap[nome].stats.d++;
             }
          });
        });
      });

      return Object.values(clubesMap).map(c => {
         c.competicoes = Object.values(c.competicoes).map(comp => {
             comp.edicoes.sort((a,b) => a.edicao - b.edicao);
             return comp;
         }).sort((a,b) => a.nome.localeCompare(b.nome));
         return c;
      }).sort((a,b) => b.dataUltima - a.dataUltima);
    },

    totalCampeonatos() {
        let count = 0;
        this.historicoCompleto.forEach(h => {
             const equipes = h.tabelaResumo || h.times || [];
             const tecnicoAtivo = equipes.some(t => this.resolverNomeTecnico(t.tecnico) === this.tecnicoNome);
             if (tecnicoAtivo) count++;
        });
        return count;
    },

    listaNomesCampeonatos() {
        const nomes = new Set();
        this.historicoCompleto.forEach(h => {
             const equipes = h.tabelaResumo || h.times || [];
             if (equipes.some(t => this.resolverNomeTecnico(t.tecnico) === this.tecnicoNome)) {
                 nomes.add(h.nome);
             }
        });
        return Array.from(nomes).sort();
    },

    // 4. CHART DATA
    chartData() {
        if (!this.graficoCompFiltro || this.graficoCompFiltro === 'TODAS') return { series: [{ data: [] }], categories: [] };

        const coalizao = [];
        this.historicoCompleto.forEach(h => {
             if (h.nome !== this.graficoCompFiltro) return;

             const equipes = h.tabelaResumo || h.times || [];
             const p = equipes.find(t => {
                 const tNome = this.resolverNomeTecnico(t.tecnico);
                 return tNome === this.tecnicoNome;
             });

             if (p) {
                 const posFinal = this.calcularPosicaoFinal(h, p);
                 let posNum = parseInt(posFinal);
                 
                 // Validação estrita para evitar NaN
                 if (isNaN(posNum) || !isFinite(posNum)) {
                     posNum = 17; // Valor para "fora do mata-mata/grupos"
                 }

                 coalizao.push({
                     data: new Date(h.dataFim),
                     pos: posNum,
                     label: posFinal,
                     time: p.nome,
                     edicao: this.obterNumeroEdicao(h)
                 });
             }
        });
        
        coalizao.sort((a,b) => a.data - b.data);

        return {
            series: [{
                name: "Posição Final",
                data: coalizao.map(c => c.pos)
            }],
            categories: coalizao.map(c => [`${c.edicao}ª Edição`, c.time])
        };
    },

    chartWidth() {
        const items = this.chartData.series[0].data.length;
        if (items <= 6) return '100%';
        // Pelo menos 120px por ponto para garantir leitura
        return (items * 120) + 'px';
    },

    // 5. CONFRONTOS TÉCNICO x TÉCNICO
    confrontosFiltrados() {
        const rivais = {}; // nomeTecnico -> stats

        this.historicoCompleto.forEach(h => {
            (h.jogos || []).forEach(j => {
                const cmdA = this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoNome;
                const cmdB = this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoNome;
                
                if (cmdA || cmdB) {
                    const rivalApelido = cmdA ? j.timeB.tecnico : j.timeA.tecnico;
                    const rivalNome = this.resolverNomeTecnico(rivalApelido);
                    if (!rivalNome || rivalNome === 'N/A' || rivalNome === 'Téc. Desconhecido' || rivalNome === this.tecnicoNome) return;

                    if (!rivais[rivalNome]) {
                        rivais[rivalNome] = { nome: rivalNome, v: 0, e: 0, d: 0, gp: 0, gc: 0, jogos: 0 };
                    }

                    const r = rivais[rivalNome];
                    r.jogos++;
                    const golsEu = cmdA ? j.golsA : j.golsB;
                    const golsEle = cmdA ? j.golsB : j.golsA;
                    r.gp += golsEu;
                    r.gc += golsEle;

                    if (golsEu > golsEle) r.v++;
                    else if (golsEu === golsEle) r.e++;
                    else r.d++;
                }
            });
        });

        return Object.values(rivais).map(r => {
            const totalPontos = r.jogos * 3;
            const pontosGanhos = (r.v * 3) + r.e;
            r.aproveitamento = totalPontos > 0 ? ((pontosGanhos / totalPontos) * 100).toFixed(0) : 0;
            return r;
        }).sort((a,b) => {
            if (this.ordenacaoConfrontos === 'jogos') return b.jogos - a.jogos;
            if (this.ordenacaoConfrontos === 'aproveitamento') return b.aproveitamento - a.aproveitamento;
            if (this.ordenacaoConfrontos === 'derrotas') return b.d - a.d;
            return 0;
        });
    },

    // 6. TOP ARTILHEIROS
    topArtilheiros() {
        const mapa = {}; // nomeJogador -> { gols, jogos }
        
        this.historicoCompleto.forEach(h => {
             // Verificar se o técnico comandou o time nesse campeonato
             const equipes = h.tabelaResumo || h.times || [];
             const timeDoTecnico = equipes.find(t => this.resolverNomeTecnico(t.tecnico) === this.tecnicoNome);
              if (timeDoTecnico) {
                   const idTime = timeDoTecnico.id;
                   const timeNome = timeDoTecnico.nome;
                   
                   // Fallback para escudo e bandeira
                   const infoTimeExtra = (h.timesParticipantes || []).find(tp => tp.id === idTime || tp.nome === timeNome);
                   const timeReal = this.timesDb.find(tr => tr.nome === timeNome);
                   
                   const bandeira = timeDoTecnico.bandeira || infoTimeExtra?.bandeira || timeReal?.pais || '';
                   const logo = timeDoTecnico.escudo || timeDoTecnico.urlLogo || timeDoTecnico.logo || 
                                infoTimeExtra?.escudo || infoTimeExtra?.urlLogo || infoTimeExtra?.logo || 
                                timeReal?.escudo || '';
                   
                   (h.artilheiros || []).forEach(art => {
                       if (art.timeId === idTime || art.timeNome === timeNome) {
                           const nome = art.nome;
                           if (!mapa[nome]) mapa[nome] = { nome: nome, gols: 0, jogos: 0, timeNome: timeNome, bandeira: bandeira, logo: logo };
                           mapa[nome].gols += parseInt(art.gols);
                          
                          // Tenta inferir participação do jogador em jogos
                          (h.jogos || []).forEach(j => {
                              const cmdA = this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoNome && j.timeA.nome === timeNome;
                              const cmdB = this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoNome && j.timeB.nome === timeNome;
                              if (cmdA || cmdB) {
                                  // Se temos scorers detalhados no jogo, procuramos. Caso contrário, se o jogador marcou GOLS no comp, 
                                  // assumimos ao menos 1 jogo por gol para não dar "0 jogos".
                                  // Melhor ainda: se no histórico os artilheiros tiverem 'jogos', usamos.
                                  if (art.jogos) {
                                      mapa[nome].jogos = Math.max(mapa[nome].jogos, art.jogos);
                                  } else {
                                      // Fallback: se marcou, jogou pelo menos 1.
                                      if (mapa[nome].jogos === 0) mapa[nome].jogos = 1;
                                  }
                              }
                          });
                      }
                  });

                 // Opcional: contar jogos do jogador sob comando do técnico (precisaria do elenco em cada jogo no historico)
                 // Por enquanto simplificamos para gols agregados
             }
        });

        return Object.values(mapa)
            .sort((a,b) => b.gols - a.gols)
            .slice(0, 5);
    },

    statsAvancadas() {
        let maxInv = { valor: 0, time: '', torneio: '', edicao: '', bandeira: '', logo: '' };
        let melhorAtaque = { valor: 0, time: '', torneio: '', edicao: '', bandeira: '', logo: '' };
        let winStreak = { valor: 0, time: '', torneio: '', edicao: '', bandeira: '', logo: '' };
        let maiorGoleada = { valor: 0, golsPro: 0, placar: '', time: '', torneio: '', edicao: '', logo: '', adversario: { nome: '', logo: '', tecnico: '' } };
        let maiorDerrota = { valor: 0, golsContra: 0, placar: '', time: '', torneio: '', edicao: '', logo: '', adversario: { nome: '', logo: '', tecnico: '' } };

        this.historicoCompleto.forEach(h => {
            let golsProCamp = 0;
            let participou = false;
            let localInv = 0;
            let localStreak = 0;
            let currentInv = 0;
            let currentStreak = 0;
            
            const equipes = h.tabelaResumo || h.times || [];
            const timeDoTecnico = equipes.find(t => this.resolverNomeTecnico(t.tecnico) === this.tecnicoNome);
            
            if (!timeDoTecnico) return;
            
            const timeNome = timeDoTecnico.nome;
            const idTime = timeDoTecnico.id;

            // Resolve logo/bandeira
            const infoTimeExtra = (h.timesParticipantes || []).find(tp => tp.id === idTime || tp.nome === timeNome);
            const timeReal = this.timesDb.find(tr => tr.nome === timeNome);
            const bandeira = timeDoTecnico.bandeira || infoTimeExtra?.bandeira || timeReal?.pais || '';
            const logo = timeDoTecnico.escudo || timeDoTecnico.urlLogo || timeDoTecnico.logo || 
                        infoTimeExtra?.escudo || infoTimeExtra?.urlLogo || infoTimeExtra?.logo || 
                        timeReal?.escudo || '';

            (h.jogos || []).forEach(j => {
                const cmdA = this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoNome && j.timeA.nome === timeNome;
                const cmdB = this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoNome && j.timeB.nome === timeNome;
                
                if (cmdA || cmdB) {
                    participou = true;
                    const gPro = cmdA ? parseInt(j.golsA) : parseInt(j.golsB);
                    const gContra = cmdA ? parseInt(j.golsB) : parseInt(j.golsA);
                    
                    golsProCamp += gPro;

                    // Invencibilidade (dentro do torneio)
                    if (gPro >= gContra) {
                        currentInv++;
                        if (currentInv > localInv) localInv = currentInv;
                    } else {
                        currentInv = 0;
                    }

                    // Sequência de Vitórias
                    if (gPro > gContra) {
                        currentStreak++;
                        if (currentStreak > localStreak) localStreak = currentStreak;
                    } else {
                        currentStreak = 0;
                    }

                    // Goleada Pro e Contra
                    const saldo = gPro - gContra;
                    
                    // Maior Vitória (Critério: Saldo > Gols Pró)
                    if (saldo > maiorGoleada.valor || (saldo === maiorGoleada.valor && gPro > maiorGoleada.golsPro)) {
                        const adv = cmdA ? j.timeB : j.timeA;
                        const infoAdvExtra = (h.timesParticipantes || []).find(tp => tp.id === adv.id || tp.nome === adv.nome);
                        const advReal = this.timesDb.find(tr => tr.nome === adv.nome);
                        const advLogo = adv.escudo || adv.urlLogo || adv.logo || 
                                       infoAdvExtra?.escudo || infoAdvExtra?.urlLogo || infoAdvExtra?.logo || 
                                       advReal?.escudo || '';

                        maiorGoleada = {
                            valor: saldo,
                            golsPro: gPro,
                            placar: cmdA ? `${j.golsA} x ${j.golsB}` : `${j.golsB} x ${j.golsA}`,
                            time: timeNome,
                            torneio: h.nome,
                            edicao: this.obterNumeroEdicao(h),
                            logo,
                            adversario: {
                                nome: adv.nome,
                                logo: advLogo,
                                tecnico: adv.tecnico || 'Desconhecido'
                            }
                        };
                    }

                    // Maior Derrota (Critério: Saldo < OU (Saldo == e Gols Sofridos >))
                    // Ex: Perder de 1x3 (-2, tomou 3) é "maior goleada sofrida" que 0x2 (-2, tomou 2)
                    if (saldo < maiorDerrota.valor || (saldo === maiorDerrota.valor && gContra > maiorDerrota.golsContra)) {
                        const adv = cmdA ? j.timeB : j.timeA;
                        const infoAdvExtra = (h.timesParticipantes || []).find(tp => tp.id === adv.id || tp.nome === adv.nome);
                        const advReal = this.timesDb.find(tr => tr.nome === adv.nome);
                        const advLogo = adv.escudo || adv.urlLogo || adv.logo || 
                                       infoAdvExtra?.escudo || infoAdvExtra?.urlLogo || infoAdvExtra?.logo || 
                                       advReal?.escudo || '';

                        maiorDerrota = {
                            valor: saldo,
                            golsContra: gContra,
                            placar: cmdA ? `${j.golsA} x ${j.golsB}` : `${j.golsB} x ${j.golsA}`,
                            time: timeNome,
                            torneio: h.nome,
                            edicao: this.obterNumeroEdicao(h),
                            logo,
                            adversario: {
                                nome: adv.nome,
                                logo: advLogo,
                                tecnico: adv.tecnico || 'Desconhecido'
                            }
                        };
                    }
                }
            });

            if (participou) {
                const edicao = this.obterNumeroEdicao(h);
                if (localInv > maxInv.valor) {
                    maxInv = { valor: localInv, time: timeNome, torneio: h.nome, edicao: edicao, bandeira, logo };
                }
                if (localStreak > winStreak.valor) {
                    winStreak = { valor: localStreak, time: timeNome, torneio: h.nome, edicao: edicao, bandeira, logo };
                }
                if (golsProCamp > melhorAtaque.valor) {
                    melhorAtaque = { valor: golsProCamp, time: timeNome, torneio: h.nome, edicao: edicao, bandeira, logo };
                }
            }
        });

        return {
            invencibilidade: maxInv,
            melhorAtaque: melhorAtaque,
            vitoriasSeguidas: winStreak,
            maiorGoleada: maiorGoleada,
            maiorDerrota: maiorDerrota
        };
    }
  },

  watch: {
    listaNomesCampeonatos: {
        immediate: true,
        handler(newVal) {
            if (newVal && newVal.length > 0 && (this.graficoCompFiltro === 'TODAS' || !this.graficoCompFiltro)) {
                this.graficoCompFiltro = newVal[0];
            }
        }
    },
    chartData: {
        immediate: true,
        handler(newVal) {
            if (newVal && newVal.categories && newVal.categories.length > 0) {
                // Forçar min/max dinâmico para garantir visibilidade
                const valores = newVal.series[0].data;
                const minPos = Math.min(...valores);
                const maxPos = Math.max(...valores, 10);

                const minY = Math.max(1, minPos - 1);
                const maxY = maxPos + 1;
                const interval = maxY - minY;

                this.chartOptions = {
                    ...this.chartOptions,
                    xaxis: { 
                        ...this.chartOptions.xaxis,
                        categories: newVal.categories 
                    },
                    yaxis: { 
                        ...this.chartOptions.yaxis, 
                        min: minY,
                        max: maxY,
                        tickAmount: interval 
                    }
                };
            }
        }
    }
  },

  methods: {
    corAproveitamento(val) {
      if (val >= 60) return 'text-success';
      if (val >= 40) return 'text-warning';
      return 'text-danger';
    },

    formatarPosicao(pos) {
        if (!pos || isNaN(parseInt(pos))) return pos;
        return pos + 'º Lugar';
    },

    posicaoBadgeClass(pos) {
        const p = parseInt(pos);
        if (p === 1) return 'bg-warning text-dark';
        if (p === 2) return 'bg-light text-dark';
        if (p === 3) return 'bg-brown text-white';
        if (p <= 4) return 'bg-info text-dark';
        if (String(pos).includes('Grupo')) return 'bg-dark text-white-50';
        return 'bg-secondary';
    },

    calcularPosicaoFinal(h, timeParticipante) {
        // 1. Se já tem posição numérico gravada (legado ou forçado), usa
        if (timeParticipante.posicao && !isNaN(parseInt(timeParticipante.posicao))) {
            return parseInt(timeParticipante.posicao);
        }

        // 2. Verifica Pódio Explícito (Salvo pelo HistoryService)
        if (h.campeao && h.campeao.nome === timeParticipante.nome) return 1;
        if (h.vice && h.vice.nome === timeParticipante.nome) return 2;
        if (h.terceiro && h.terceiro.nome === timeParticipante.nome) return 3;
        if (h.quarto && h.quarto.nome === timeParticipante.nome) return 4;

        // 3. Verifica na Tabela Resumo (Já ordenada por Fase > Pontos pelo HistoryService)
        if (h.tabelaResumo && h.tabelaResumo.length > 0) {
            const idx = h.tabelaResumo.findIndex(t => t.nome === timeParticipante.nome);
            if (idx !== -1) return idx + 1;
        }

        // Fallback
        return '-';
    },
    abrirModalClube(clube) {
        this.clubeSelecionado = clube;
    },

    resolverNomeTecnico(nomeOuApelido) {
        if (!nomeOuApelido) return 'Téc. Desconhecido';
        return this.mapaTecnicos[nomeOuApelido] || nomeOuApelido;
    },

    obterNumeroEdicao(h) {
        if (!h || !this.historicoCompleto) return 1;
        const compsSimilares = this.historicoCompleto
            .filter(item => item.nome === h.nome)
            .sort((a,b) => new Date(a.dataFim) - new Date(b.dataFim));
        
        const index = compsSimilares.findIndex(item => item.idCampeonato === h.idCampeonato);
        return index !== -1 ? index + 1 : h.edicao || 1;
    }
  }
};
</script>

<style scoped>
.main-container {
    font-family: 'Inter', sans-serif;
}

.avatar-circle {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 4px solid #334155;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

.stat-mini-card {
    background: rgba(15, 23, 42, 0.4);
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.tabs-scroll-container {
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
}
.tabs-scroll-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
}

.nav-pills .nav-link {
    border: none;
    color: #94a3b8;
}
.nav-pills .nav-link.active {
    background: #0d6efd !important;
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.stats-card {
    background: rgba(30, 41, 59, 0.5);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline {
    position: relative;
    padding-left: 2rem;
}
.timeline::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    top: 5px;
    bottom: 5px;
    width: 2px;
    background: #334155;
}

.timeline-item {
    position: relative;
}
.timeline-dot {
    position: absolute;
    left: -1.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #0d6efd;
    border-radius: 50%;
    border: 3px solid #0f172a;
    z-index: 2;
}

.hover-scale {
    transition: transform 0.2s, box-shadow 0.2s;
}
.hover-scale:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.medal-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.8rem;
}
.medal-1 { background: linear-gradient(135deg, #ffd700, #b8860b); color: #000; }
.medal-2 { background: linear-gradient(135deg, #c0c0c0, #808080); color: #000; }
.medal-3 { background: linear-gradient(135deg, #cd7f32, #8b4513); color: #fff; }
.medal-4, .medal-5 { background: #334155; color: #fff; }

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    z-index: 1050;
}

.max-w-lg { max-width: 512px; }
.x-small { font-size: 0.75rem; }
.line-height-1 { line-height: 1.1; }
.bg-brown { background: #8b4513; }

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-up { animation: slideUp 0.4s ease-out both; }
.animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* Gráfico Scroll */
.chart-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #0d6efd #1a1a1a;
}
.chart-wrapper::-webkit-scrollbar {
  height: 8px;
}
.chart-wrapper::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 10px;
}
.chart-wrapper::-webkit-scrollbar-thumb {
  background-color: #0d6efd;
  border-radius: 10px;
  border: 1px solid #1a1a1a;
}

/* Desktop Adaptations */
@media (min-width: 992px) {
    .main-container { padding-left: 2rem; padding-right: 2rem; }
}
</style>
