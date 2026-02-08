<template>
  <div class="container mt-4 mb-5" v-if="time">
    
    <!-- HEADER DO TIME (MODERNO) -->
    <div class="card border-0 shadow-lg mb-4 overflow-hidden position-relative text-white" 
         style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); min-height: 280px;">
         
         <!-- EFEITO DE FUNDO (LOGO GRANDE DE COR PÁLIDA) -->
         <div class="position-absolute" 
              style="top: -20%; right: -5%; opacity: 0.1; transform: rotate(-15deg); pointer-events: none;">
             <img :src="time.escudo" style="width: 500px; height: 500px; filter: grayscale(100%);" />
         </div>

      <div class="card-body p-0 d-flex flex-column flex-md-row">
          
          <!-- LADO ESQUERDO: ESCUDO E IDENTIFICAÇÃO -->
          <div class="col-md-3 p-4 text-center d-flex flex-column justify-content-center align-items-center position-relative z-1 border-end border-white border-opacity-10" 
               style="background: rgba(255,255,255,0.02); backdrop-filter: blur(5px);">
             
             <!-- Botão Voltar (Estilizado) -->
             <div class="position-absolute top-0 start-0 m-3">
                <button class="btn btn-sm btn-link text-white-50 text-decoration-none p-0 hover-white transition-all d-flex align-items-center gap-1" @click="$router.back()" title="Voltar">
                    <i class="bi bi-arrow-left fs-5"></i> 
                    <span class="d-none d-md-inline small text-uppercase fw-bold" style="font-size: 0.7rem; letter-spacing: 1px;">Voltar</span>
                </button>
             </div>

             <div class="mt-3 position-relative">
                 <div class="position-absolute top-50 start-50 translate-middle" 
                      style="width: 140px; height: 140px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                 <img :src="time.escudo" style="width: 110px; height: 110px; object-fit: contain; position: relative; z-index: 2;" class="drop-shadow-lg mb-3" />
             </div>
             
             <h2 class="fw-bold mb-1 ls-1 text-shadow">{{ time.nome }}</h2>
             <div class="d-flex align-items-center gap-2 mt-1">
                 <span class="badge bg-white text-dark text-uppercase px-2 py-1 rounded-1 fw-bold border border-white border-opacity-25" style="letter-spacing: 1px; font-size: 0.65rem;">
                    {{ time.pais || 'Mundo' }}
                 </span>
             </div>
             
             <div class="mt-3 text-white-50 small d-flex align-items-center justify-content-center gap-2">
                 <i class="bi bi-geo-alt-fill text-primary"></i> {{ time.estadio || 'Estádio Desconhecido' }}
             </div>
          </div>

          <!-- LADO DIREITO: RESUMO ESTATÍSTICO (GRID UNIFICADO) -->
          <div class="col-md-9 p-4 d-flex flex-column justify-content-center position-relative z-1">
             
             <!-- GRID DE STATS (3 LINHAS) -->
             <div class="d-flex flex-column gap-3 align-items-center w-100 h-100 justify-content-center">
                
                <!-- LINHA 1: TÍTULOS | JOGOS | APROV -->
                <div class="row w-100 text-center justify-content-center align-items-end">
                    <div class="col-4 col-md-3">
                        <div class="text-white-50 text-uppercase fw-bold mb-1" style="font-size: 0.65rem; letter-spacing: 1px;">Títulos</div>
                        <div class="display-6 fw-bold text-warning text-shadow lh-1">{{ totalTitulos }}</div>
                    </div>
                    <div class="col-4 col-md-3 px-0 position-relative">
                        <div class="position-absolute start-0 top-50 translate-middle-y h-50 border-start border-white border-opacity-10"></div>
                        <div class="text-white-50 text-uppercase fw-bold mb-1" style="font-size: 0.65rem; letter-spacing: 1px;">Jogos</div>
                        <div class="display-6 fw-bold text-white text-shadow lh-1">{{ statsGerais.jogos }}</div>
                        <div class="position-absolute end-0 top-50 translate-middle-y h-50 border-end border-white border-opacity-10"></div>
                    </div>
                    <div class="col-4 col-md-3">
                        <div class="text-white-50 text-uppercase fw-bold mb-1" style="font-size: 0.65rem; letter-spacing: 1px;">Aprov.</div>
                        <div class="display-6 fw-bold text-info text-shadow lh-1">{{ aproveitamento }}<span class="fs-6 text-white-50">%</span></div>
                    </div>
                </div>

                <!-- LINHA 2: VIT | EMP | DER -->
                <div class="row w-100 text-center justify-content-center">
                    <div class="col-4 col-md-3">
                       <div class="bg-success bg-opacity-10 rounded p-1 border border-success border-opacity-25 h-100 d-flex flex-column justify-content-center">
                           <span class="h5 fw-bold text-white mb-0">{{ statsGerais.vitorias }}</span>
                           <span class="text-success text-uppercase fw-bold" style="font-size: 0.55rem; letter-spacing: 1px;">VIT</span>
                       </div>
                    </div>
                    <div class="col-4 col-md-3">
                       <div class="bg-secondary bg-opacity-10 rounded p-1 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-center">
                           <span class="h5 fw-bold text-white mb-0">{{ statsGerais.empates }}</span>
                           <span class="text-secondary text-uppercase fw-bold" style="font-size: 0.55rem; letter-spacing: 1px;">EMP</span>
                       </div>
                    </div>
                    <div class="col-4 col-md-3">
                       <div class="bg-danger bg-opacity-10 rounded p-1 border border-danger border-opacity-25 h-100 d-flex flex-column justify-content-center">
                           <span class="h5 fw-bold text-white mb-0">{{ statsGerais.derrotas }}</span>
                           <span class="text-danger text-uppercase fw-bold" style="font-size: 0.55rem; letter-spacing: 1px;">DER</span>
                       </div>
                    </div>
                </div>

                <!-- LINHA 3: GOLS -->
                <div class="row w-100 text-center justify-content-center mt-1">
                     <div class="col-4 col-md-3">
                        <div class="text-white-50 text-uppercase fw-bold mb-0" style="font-size: 0.65rem; letter-spacing: 1px;">Gols Pró</div>
                        <div class="h5 fw-bold text-white mb-0">{{ statsGerais.golsPro }}</div>
                     </div>
                     <div class="col-4 col-md-3 px-0 position-relative">
                        <div class="position-absolute start-0 top-50 translate-middle-y h-50 border-start border-white border-opacity-10"></div>
                        <div class="text-white-50 text-uppercase fw-bold mb-0" style="font-size: 0.65rem; letter-spacing: 1px;">Gols Sofr.</div>
                        <div class="h5 fw-bold text-white mb-0">{{ statsGerais.golsContra }}</div>
                        <div class="position-absolute end-0 top-50 translate-middle-y h-50 border-end border-white border-opacity-10"></div>
                     </div>
                     <div class="col-4 col-md-3">
                        <div class="text-white-50 text-uppercase fw-bold mb-0" style="font-size: 0.65rem; letter-spacing: 1px;">Saldo</div>
                        <div class="h5 fw-bold mb-0" :class="saldoGols >= 0 ? 'text-success' : 'text-danger'">
                            {{ saldoGols > 0 ? '+' : '' }}{{ saldoGols }}
                        </div>
                     </div>
                 </div>
                 
                 <!-- BOTÃO E FILTRO -->
                 <div class="mt-3 w-100 px-3">
                     <div class="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
                         
                         <!-- BOTÃO HISTÓRICO -->
                         <button class="btn btn-outline-light rounded-pill px-4 py-2 hover-scale transition-all border-opacity-25 btn-sm flex-grow-1" 
                                 style="max-width: 250px;"
                                 @click="$router.push(`/historico-confrontos/${time.id}`)">
                            <span class="fw-bold small text-uppercase me-2" style="letter-spacing: 1px;">Confrontos</span>
                            <i class="bi bi-chevron-right small"></i>
                         </button>

                          <!-- FILTRO TÉCNICO -->
                          <div class="d-flex gap-1" style="max-width: 250px; flex-grow: 1;">
                              <div class="input-group input-group-sm flex-grow-1">
                                  <span class="input-group-text bg-dark border-secondary border-opacity-25 text-white-50">
                                      <i class="bi bi-funnel-fill"></i>
                                  </span>
                                  <select class="form-select bg-dark text-white border-secondary border-opacity-25 shadow-none" 
                                          v-model="tecnicoFiltro" 
                                          style="font-size: 0.8rem;">
                                      <option value="TODOS">Todos os Técnicos</option>
                                      <option v-for="tec in listaTecnicosDoTime" :key="tec" :value="tec">
                                          {{ tec }}
                                      </option>
                                  </select>
                              </div>
                              <button v-if="tecnicoFiltro !== 'TODOS'" 
                                      class="btn btn-sm btn-primary px-2" 
                                      @click="$router.push(`/dashboard/tecnico/${tecnicoFiltro}`)" 
                                      title="Ver Perfil do Técnico">
                                  <i class="bi bi-person-badge"></i>
                              </button>
                          </div>
                     </div>
                 </div>

             </div>
          </div>
      </div>
    </div>

    <div class="row">
        <!-- COLUNA PRINCIPAL (Esquerda) -->
        <div class="col-12 col-lg-8">
            
            <!-- TROFÉUS -->
            <div class="d-flex align-items-center justify-content-between border-bottom border-secondary pb-2 mb-3 mt-2">
                <h5 class="text-primary mb-0 fw-bold ls-1 d-flex align-items-center gap-2">
                    <i class="bi bi-trophy"></i> SALA DE TROFÉUS
                </h5>
                <button class="btn btn-sm btn-outline-warning rounded-pill px-3 py-1" @click="$router.push(`/times/${time.id}/trofeus`)">
                    <i class="bi bi-grid-fill me-1"></i> Ver Sala Completa
                </button>
            </div>

            <div v-if="titulosAgrupados.length === 0" class="text-muted small mb-4 italic p-4 text-center bg-dark rounded border border-secondary border-dashed border-opacity-25">
              <i class="bi bi-award fs-1 text-secondary opacity-25 mb-2 d-block"></i>
              Ainda não conquistou títulos registrados.
            </div>
            <div class="row g-2 mb-4">
               <!-- Mostra apenas os 4 primeiros no dashboard -->
               <div v-for="(grupo, idx) in titulosAgrupados.slice(0, 4)" :key="idx" class="col-12 col-md-6">
                  <div class="bg-dark border border-warning rounded p-3 d-flex align-items-start gap-3 position-relative h-100 shadow-sm hover-elevate transition-all" :title="grupo.nome">
                     <span v-if="grupo.qtd > 1" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light shadow-sm">
                        {{ grupo.qtd }}x
                     </span>
                     
                     <!-- ICONE DO TROFÉU: Fundo transparente, maior e com sombra -->
                     <div class="p-1 flex-shrink-0">
                        <img :src="grupo.urlTrofeu || require('@/assets/icup-logo.png')" style="width: 60px; height: 60px; object-fit: contain; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));" v-if="grupo.urlTrofeu" />
                     </div>
                     
                     <div class="d-flex flex-column w-100">
                        <span class="text-warning fw-bold lh-1 mb-2 fs-6">{{ grupo.nome }}</span>
                        <div v-for="(c, cIdx) in grupo.conquistas" :key="cIdx" class="d-flex justify-content-between small text-white-50 border-bottom border-secondary border-opacity-10 pb-1 mb-1">
                           <span class="fw-bold text-white">{{ c.edicao }}ª Edição</span>
                            <span class="text-end italic" style="font-size: 0.75rem;">
                               <i class="bi bi-person text-secondary me-1"></i>
                               <router-link :to="`/dashboard/tecnico/${c.tecnico}`" class="text-info text-decoration-none hover-underline">
                                  {{ resolverNomeTecnico(c.tecnico) }}
                               </router-link>
                            </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <!-- HISTÓRICO DE TORNEIOS -->
            <h5 class="text-primary border-bottom border-secondary pb-2 mb-3 mt-5 fw-bold ls-1 d-flex align-items-center gap-2">
                <i class="bi bi-journal-text"></i> HISTÓRICO DE COMPETIÇÕES
            </h5>
            <div v-if="participacoes.length === 0" class="text-muted small mb-4 italic text-center py-5 bg-dark rounded border border-secondary border-dashed border-opacity-25">
                <i class="bi bi-calendar-x fs-1 text-secondary opacity-25 mb-2 d-block"></i>
                <span v-if="tecnicoFiltro !== 'TODOS'">Nenhuma competição encontrada para o técnico selecionado.</span>
                <span v-else>Ainda não participou de competições encerradas.</span>
            </div>
            <div v-else class="d-flex flex-column gap-2 mb-4">
                <div v-for="p in participacoes" :key="p.id" class="bg-dark border border-secondary border-opacity-25 rounded overflow-hidden shadow-sm transition-all">
                    <!-- HEADER DO ITEM (COMPACTO) -->
                    <div class="d-flex align-items-center justify-content-between p-3 cursor-pointer hover-bg-light transition-colors" @click="alternarJogos(p.id)">
                        <!-- Lado Esquerdo: Logo e Info Básica -->
                        <div class="d-flex align-items-center gap-3 flex-grow-1" style="min-width: 0;">
                            
                            <!-- ICONE DO TROFEU NA LISTA: Sem fundo branco, maior -->
                            <div class="rounded p-0 flex-shrink-0" v-if="p.urlTrofeu" style="width: 50px; height: 50px;">
                                <img :src="p.urlTrofeu" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 2px rgba(255,255,255,0.2));" />
                            </div>
                            
                            <div class="d-flex flex-column lh-1 overflow-hidden">
                                <span class="text-white fw-bold text-truncate mb-1">{{ p.nomeCamp }}</span>
                                <span class="text-muted small text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">{{ p.edicao }}ª Edição</span>
                            </div>
                        </div>

                        <!-- Lado Direito: Posição e Stats -->
                        <div class="d-flex align-items-center gap-3 ms-2">
                            <!-- Posição -->
                            <div class="text-end d-none d-sm-block me-2">
                                <span v-if="p.posicao === 1" class="badge bg-warning text-dark border border-warning shadow-sm"><i class="bi bi-trophy-fill me-1"></i>CAMPEÃO</span>
                                <span v-else-if="p.posicao === 2" class="badge bg-light text-dark border border-white shadow-sm">VICE-CAMPEÃO</span>
                                <span v-else-if="p.posicao === 3" class="badge bg-warning text-dark border border-warning bg-opacity-50 shadow-sm" style="background-color: #cd7f32 !important; border-color: #a0522d !important;"><i class="bi bi-award-fill me-1"></i>3º LUGAR</span>
                                <span v-else class="fw-bold text-white-50 small">{{ p.posicao }}º Lugar</span>
                            </div>

                            <!-- Resumo de Stats (Mini Badges) -->
                            <div class="d-flex gap-1 d-none d-md-flex">
                                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" title="Vitórias">{{ p.vitorias }}V</span>
                                <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25" title="Empates">{{ p.empates }}E</span>
                                <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" title="Derrotas">{{ p.derrotas }}D</span>
                            </div>

                            <!-- Ícone Expandir -->
                            <button class="btn btn-sm btn-icon btn-dark border-secondary border-opacity-25 rounded-circle" :class="{'rotate-180': p.expandidio}">
                                <i class="bi" :class="p.aberto ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                            </button>
                        </div>
                    </div>

                    <!-- JOGOS DESTE TORNEIO (EXPANSÍVEL) -->
                    <div v-if="p.aberto" class="border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
                         <!-- Linha de Técnico DO TORNEIO (Header da seção) -->
                          <div class="py-2 px-3 border-bottom border-secondary border-opacity-10 bg-secondary bg-opacity-10 small text-end text-muted fst-italic">
                              <i class="bi bi-person-workspace me-1"></i> Comandado por: 
                              <router-link v-if="p.tecnico" :to="`/dashboard/tecnico/${p.tecnico}`" class="text-white text-decoration-none hover-underline">
                                  {{ p.tecnico }}
                              </router-link>
                              <span v-else class="text-white">N/A</span>
                          </div>
                        
                        <div v-for="(j, idx) in p.confrontos" :key="idx" 
                                class="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-10 py-2 px-3 small hover-bg-dark transition-colors">
                            
                            <div class="text-muted text-center flex-shrink-0 me-3" style="width: 40px; font-size: 0.7rem;">
                                {{ j.fase === 'Fase de Grupos' ? 'FG' : (j.fase || `R${j.rodada}`) }}
                            </div>
                            
                            <!-- Jogo -->
                            <div class="d-flex align-items-center justify-content-center flex-grow-1">
                                <!-- TIME A -->
                                <div class="d-flex align-items-center justify-content-end gap-2 text-end" style="width: 45%;">
                                    <div class="d-flex flex-column lh-1 overflow-hidden align-items-end">
                                        <span class="text-truncate d-none d-sm-block bg-transparent" :class="{'fw-bold text-white': j.timeA.id === time.id}">
                                            <span v-if="p.adicionarNacionalidade && j.timeA.pais" class="text-success me-1 small" style="font-size: 0.7em;">{{ j.timeA.pais }}</span>
                                            {{ j.timeA.nome }}
                                        </span>
                                        <!-- TÉCNICO A (RESTAURADO) -->
                                         <small class="text-muted" style="font-size: 0.65em;" v-if="j.timeA.tecnico">
                                             <router-link :to="`/dashboard/tecnico/${j.timeA.tecnico}`" class="text-muted text-decoration-none hover-underline">
                                                 {{ resolverNomeTecnico(j.timeA.tecnico) }}
                                             </router-link>
                                         </small>
                                    </div>
                                    <img :src="j.timeA.escudo" style="width: 24px; height: 24px;" />
                                </div>
                                
                                <span class="mx-3 badge bg-dark border border-secondary shadow-sm" style="min-width: 40px;">{{ j.golsA }} x {{ j.golsB }}</span>

                                <!-- TIME B -->
                                <div class="d-flex align-items-center justify-content-start gap-2 text-start" style="width: 45%;">
                                    <img :src="j.timeB.escudo" style="width: 24px; height: 24px;" />
                                    <div class="d-flex flex-column lh-1 overflow-hidden align-items-start">
                                        <span class="text-truncate d-none d-sm-block bg-transparent" :class="{'fw-bold text-white': j.timeB.id === time.id}">
                                            {{ j.timeB.nome }}
                                            <span v-if="p.adicionarNacionalidade && j.timeB.pais" class="text-success ms-1 small" style="font-size: 0.7em;">{{ j.timeB.pais }}</span>
                                        </span>
                                        <!-- TÉCNICO B (RESTAURADO) -->
                                         <small class="text-muted" style="font-size: 0.65em;" v-if="j.timeB.tecnico">
                                              <router-link :to="`/dashboard/tecnico/${j.timeB.tecnico}`" class="text-muted text-decoration-none hover-underline">
                                                  {{ resolverNomeTecnico(j.timeB.tecnico) }}
                                              </router-link>
                                         </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- COLUNA LATERAL (Direita) -->
        <div class="col-12 col-lg-4">
            
            <!-- TOP ARTILHEIROS (MODERNIZADO) -->
            <div class="card bg-dark border-secondary border-opacity-50 mb-3 shadow-sm overflow-hidden">
               <div class="card-header border-secondary border-opacity-25 bg-secondary bg-opacity-10 text-white d-flex justify-content-between align-items-center py-3">
                  <span class="fw-bold small text-uppercase ls-1 d-flex align-items-center">
                      <i class="bi bi-person-badge me-2 text-primary fs-5"></i>
                      Artilharia Histórica
                  </span>
               </div>
               
               <div v-if="topArtilheiros.length > 0" class="list-group list-group-flush bg-transparent">
                  <div v-for="(art, idx) in topArtilheiros" :key="idx" 
                       class="list-group-item bg-transparent border-secondary border-opacity-10 text-white d-flex align-items-center justify-content-between px-3 py-3 position-relative hover-bg-dark transition-colors">
                       
                       <!-- Efeito de Hover -->
                       <div class="position-absolute start-0 top-0 bottom-0 bg-primary opacity-0 transition-all hover-bar" style="width: 4px;"></div>
                       
                       <div class="d-flex align-items-center gap-2 overflow-hidden">
                          <!-- 1. Ranking / Medalha -->
                          <div class="flex-shrink-0 d-flex justify-content-center align-items-center" style="width: 32px; height: 32px;">
                              <span v-if="idx === 0" class="fs-4" title="1º Lugar">🥇</span>
                              <span v-else-if="idx === 1" class="fs-4" title="2º Lugar">🥈</span>
                              <span v-else-if="idx === 2" class="fs-4" title="3º Lugar">🥉</span>
                              <span v-else class="text-secondary fw-bold fs-6 opacity-50">{{ idx + 1 }}º</span>
                          </div>

                          <!-- 2. Camisa do Jogador (NOVO) -->
                          <div class="position-relative d-flex justify-content-center align-items-center mx-1" style="width: 38px; height: 38px;">
                              <!-- SVG da Camisa -->
                              <svg viewBox="0 0 24 24" class="w-100 h-100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2C9 2 7 3.5 7 5L4 6L5 10L8 9V20H16V9L19 10L20 6L17 5C17 3.5 15 2 12 2Z" 
                                        :fill="time.cores && time.cores.length > 0 ? time.cores[0].interno : '#333'"
                                        :stroke="time.cores && time.cores.length > 0 ? time.cores[0].externo : '#666'"
                                        stroke-width="1.5"
                                        stroke-linejoin="round"/>
                              </svg>
                              
                              <!-- Número -->
                              <span class="position-absolute fw-bold" 
                                    :style="{ 
                                        color: time.cores && time.cores.length > 0 ? time.cores[0].externo : '#fff',
                                        fontSize: '0.75rem', 
                                        marginTop: '1px',
                                        textShadow: '0px 1px 2px rgba(0,0,0,0.8)' 
                                    }">
                                  {{ art.numero || '?' }}
                              </span>
                          </div>
                          
                          <!-- 3. Nome do Jogador -->
                          <div class="d-flex flex-column lh-1 overflow-hidden ms-1">
                              <span class="fw-bold text-truncate" :class="idx < 3 ? 'text-white' : 'text-white-50'" style="font-size: 0.95rem;">
                                  {{ isNaN(art.nome) ? art.nome : 'Jogador sem nome' }}
                              </span>
                          </div>
                       </div>
                       
                       <!-- Gols -->
                       <div class="d-flex flex-column align-items-end lh-1">
                           <span class="h5 mb-0 fw-bold" :class="idx === 0 ? 'text-warning' : 'text-primary'">{{ art.gols }}</span>
                           <span class="text-muted small text-uppercase" style="font-size: 0.6rem; letter-spacing: 1px;">gols</span>
                       </div>
                  </div>
               </div>
               
               <div v-else class="p-5 text-center text-muted small fst-italic">
                   <i class="bi bi-emoji-frown fs-1 mb-2 d-block opacity-25"></i>
                   Nenhum artilheiro registrado.
               </div>
            </div>

             <!-- ESTATÍSTICAS E GRÁFICOS -->
             <div class="d-flex justify-content-between align-items-center mb-2 mt-4 border-bottom border-secondary border-opacity-50 pb-2">
                 <h6 class="text-primary mb-0 fw-bold ls-1 small text-uppercase"><i class="bi bi-graph-up me-2"></i>Análise de Performance</h6>
                 <select class="form-select form-select-sm w-auto bg-dark text-light border-secondary shadow-none py-0 px-2 small" 
                         v-model="competicaoFiltro" @change="prepararGrafico" style="height: 24px; font-size: 0.75rem;">
                     <option value="TODAS">Total</option>
                     <option v-for="c in estatisticasPorCompeticao" :key="c.nome" :value="c.nome">{{ c.nome }}</option>
                 </select>
             </div>

             <div class="card bg-dark border-secondary border-opacity-50 mb-3 shadow-sm">
               <div class="card-body p-2 position-relative">
                 <h6 class="position-absolute top-0 start-0 m-2 badge bg-dark border border-secondary text-white-50 fw-normal">Aproveitamento (%)</h6>
                 <div v-if="chartSeries[0].data.length > 0">
                    <apexchart type="line" height="200" :options="chartOptions" :series="chartSeries"></apexchart>
                 </div>
                 <div v-else class="text-center py-5 text-muted small">
                    <i class="bi bi-bar-chart fs-2 opacity-25 d-block mb-1"></i>
                    Faltam dados históricos.
                 </div>
              </div>
           </div>

           <div class="card bg-dark border-secondary border-opacity-50 mb-3 shadow-sm">
              <div class="card-body p-2 position-relative">
                 <h6 class="position-absolute top-0 start-0 m-2 badge bg-dark border border-secondary text-white-50 fw-normal">Colocação Final</h6>
                 <div v-if="chartSeriesColocacao.length > 0">
                    <apexchart type="line" height="200" :options="chartOptionsColocacao" :series="chartSeriesColocacao"></apexchart>
                 </div>
                 <div v-else class="text-center py-5 text-muted small">
                    <i class="bi bi-sort-numeric-down fs-2 opacity-25 d-block mb-1"></i>
                    Dados insuficientes.
                 </div>
              </div>
           </div>

        </div>
    </div>


  </div>
  <div v-else-if="carregando" class="text-center py-5">
     <div class="spinner-grow text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
     </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BButton } from 'bootstrap-vue-next'; // Mantendo apenas o BButton se necessario, mas troquei por button html
import VueApexCharts from "vue3-apexcharts";

export default {
  name: 'DashboardTime',
  components: { 
    apexchart: VueApexCharts,
  },
  props: ['id'],
  data() {
    return {
      time: null,
      historico: [],
      mapaEdicoes: {}, // Novo cache para edições
      tecnicoFiltro: 'TODOS', // Filtro de Técnico
      carregando: true,
      chartOptions: {
        chart: {
          type: 'area',
          height: 350,
          toolbar: { show: false },
          background: 'transparent'
        },
        theme: { mode: 'dark' },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#10b981'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
          }
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: [],
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { colors: '#aaa' } },
          tooltip: { enabled: false }
        },
        yaxis: {
          labels: {
             formatter: (val) => val.toFixed(0) + '%',
             style: { colors: '#aaa' }
          }
        },
        grid: {
          borderColor: '#374151',
          strokeDashArray: 4,
        },
        tooltip: {
          y: {
            formatter: (val) => val.toFixed(1) + '%'
          },
          theme: 'dark'
        }
      },
      chartSeries: [{
        name: 'Aproveitamento',
        data: []
      }],
      // Gráfico de Colocação
      chartSeriesColocacao: [],
      chartOptionsColocacao: {
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'monotoneCubic', width: 4 }, // Linhas mais grossas
        markers: { size: 6, strokeWidth: 0, hover: { size: 8 } }, // Bolinhas maiores para facilitar o toque
        colors: ['#0d6efd', '#ffc107', '#dc3545', '#198754', '#6610f2'], // Cores variadas
        dataLabels: { enabled: true, style: { fontSize: '10px' }, background: { enabled: true, foreColor: '#000' } },
        xaxis: { categories: [], labels: { style: { colors: '#aaa' } }, tooltip: { enabled: false } },
        yaxis: { 
            reversed: true, // INVERTIDO: 1º lugar no topo
            min: 1, 
            forceNiceScale: true,
            labels: { style: { colors: '#aaa' }, formatter: (val) => Math.floor(val) + 'º' } 
        },
        theme: { mode: 'dark' },
        grid: { borderColor: '#444' },
        tooltip: { theme: 'dark' },
        legend: { position: 'bottom' }
      },
      expandidio: {}, // Controle de UI para expandir jogos
      mapaTecnicos: {}, // Cache de técnicos
      competicaoFiltro: 'TODAS' // Filtro de competição para os gráficos
    };
  },
  computed: {
    // Lista TODOS os técnicos que já comandaram o time em pelo menos 1 jogo oficial
    listaTecnicosDoTime() {
      if (!this.historico || !this.time) return [];
      const tecnicosSet = new Set();
      
      this.historico.forEach(h => {
        const jogos = h.jogos || []; // Garante array
        const confrontos = jogos.filter(j => j.finalizado && (j.timeA?.id == this.time.id || j.timeB?.id == this.time.id));

        confrontos.forEach(j => {
            let tec = null;
            if (j.timeA?.id == this.time.id) tec = j.timeA.tecnico;
            else if (j.timeB?.id == this.time.id) tec = j.timeB.tecnico;

            if (tec) {
                const nomeResolvido = this.resolverNomeTecnico(tec);
                if (nomeResolvido) tecnicosSet.add(nomeResolvido);
            }
        });

        // Também tentar pegar do resumo se não tiver jogos detalhados (ex: legado)
        const tabela = h.tabelaResumo || [];
        const stats = tabela.find(t => t.id == this.time.id);
        if (stats && stats.tecnico) {
            tecnicosSet.add(this.resolverNomeTecnico(stats.tecnico));
        }
      });

      return Array.from(tecnicosSet).sort();
    },

    // Filtra histórico e recalcula TUDO com base no técnico
    historicoFiltrado() {
        if (!this.historico) return [];
        
        // Se for TODOS, retorna original
        if (this.tecnicoFiltro === 'TODOS') return this.historico;

        // Se tiver filtro, retorna apenas campeonatos onde o técnico atuou
        return this.historico.filter(h => {
             const jogos = h.jogos || [];
             const confrontos = jogos.filter(j => 
                 j.finalizado && (
                    (j.timeA?.id == this.time.id && this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoFiltro) || 
                    (j.timeB?.id == this.time.id && this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoFiltro)
                 )
             );
             // Se houver pelo menos 1 jogo comandado por ele, inclui campeonato
             // OU se ele consta como técnico principal no resumo
             const tabela = h.tabelaResumo || [];
             const stats = tabela.find(t => t.id == this.time.id);
             const ehTecnicoPrincipal = stats && this.resolverNomeTecnico(stats.tecnico) === this.tecnicoFiltro;

             return confrontos.length > 0 || ehTecnicoPrincipal;
        });
    },

    titulosAgrupados() {
      // Usa historicoFiltrado para só contar títulos onde o técnico participou
      const base = this.historicoFiltrado; 
      if (!base) return [];

      const grupos = {};
      base.forEach(h => {
        // Só conta título se time foi campeão E o técnico participou da campanha
        if (h.campeao?.id === this.time?.id) {
           const nomeNorm = h.nome.trim(); 
           if (!grupos[nomeNorm]) {
             grupos[nomeNorm] = { 
               nome: nomeNorm, 
               qtd: 0, 
               conquistas: [],
               urlTrofeu: h.urlTrofeu 
             };
           }
           grupos[nomeNorm].qtd++;
           grupos[nomeNorm].conquistas.push({
             ano: new Date(h.dataFim).getFullYear(),
             tecnico: h.campeao.tecnico,
             data: h.dataFim,
             edicao: this.mapaEdicoes[h.idCampeonato] || '?'
           });
        }
      });
      return Object.values(grupos).sort((a,b) => b.qtd - a.qtd);
    },

    totalTitulos() {
      return this.titulosAgrupados.reduce((acc, g) => acc + g.qtd, 0);
    },

    totalGols() {
      // Recalcula gols baseado nos jogos filtrados
      return this.statsGerais.golsPro;
    },

    statsGerais() {
      // RECALCULO TOTAL BASEADO NOS JOGOS FILTRADOS
      const stats = { jogos: 0, vitorias: 0, empates: 0, derrotas: 0, golsPro: 0, golsContra: 0 };
      
      const fonte = this.historico || [];
      
      fonte.forEach(h => {
         const jogos = h.jogos || [];
         jogos.forEach(j => {
             if (!j.finalizado) return;

             let participou = false;
             let meuTime = null; 
             let placarA = parseInt(j.golsA);
             let placarB = parseInt(j.golsB);
             
             // Identifica se é jogo do time e qual lado
             if (j.timeA?.id == this.time.id) {
                 meuTime = 'A';
                 // Filtro de Técnico
                 if (this.tecnicoFiltro === 'TODOS' || this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoFiltro) {
                     participou = true;
                 }
             } else if (j.timeB?.id == this.time.id) {
                 meuTime = 'B';
                 // Filtro de Técnico
                 if (this.tecnicoFiltro === 'TODOS' || this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoFiltro) {
                     participou = true;
                 }
             }

             if (participou && meuTime) {
                 stats.jogos++;
                 const golsFeitos = meuTime === 'A' ? placarA : placarB;
                 const golsSofridos = meuTime === 'A' ? placarB : placarA;
                 
                 stats.golsPro += golsFeitos;
                 stats.golsContra += golsSofridos;

                 if (golsFeitos > golsSofridos) stats.vitorias++;
                 else if (golsFeitos === golsSofridos) stats.empates++;
                 else stats.derrotas++;
             }
         });
      });

      return stats;
    },
    
    saldoGols() { return this.statsGerais.golsPro - this.statsGerais.golsContra; },
    aproveitamento() {
       const s = this.statsGerais;
       if (s.jogos === 0) return 0;
       const pontos = (s.vitorias * 3) + s.empates;
       const maxPontos = s.jogos * 3;
       return ((pontos / maxPontos) * 100).toFixed(1);
    },

    participacoes() {
      if (!this.time || !this.historico) return [];
      
      return this.historico
        .map(h => {
           // Filtra jogos relevantes para este técnico neste campeonato
           const confrontos = (h.jogos || []).filter(j => {
               if (!j.finalizado) return false;
               if (j.timeA?.id == this.time.id) {
                   return this.tecnicoFiltro === 'TODOS' || this.resolverNomeTecnico(j.timeA.tecnico) === this.tecnicoFiltro;
               }
               if (j.timeB?.id == this.time.id) {
                   return this.tecnicoFiltro === 'TODOS' || this.resolverNomeTecnico(j.timeB.tecnico) === this.tecnicoFiltro;
               }
               return false;
           });

           // Se filtro ativo e 0 jogos, retorna null (não participou desta comp sob comando dele)
           // EXCETO se ele for o técnico principal declarado (para casos legados sem detalhe de jogo)
           const tabela = h.tabelaResumo || [];
           const statsOriginal = tabela.find(t => t.id == this.time.id);
           const ehTecnicoPrincipal = statsOriginal && this.resolverNomeTecnico(statsOriginal.tecnico) === this.tecnicoFiltro;

           // FIX: Garantir que o time realmente participou (tem jogos ou está na tabela)
           // Independentemente do filtro de técnico, se não tem registro, não deve aparecer.
           const participouRealmente = confrontos.length > 0 || statsOriginal;
           
           if (!participouRealmente) return null;

           if (this.tecnicoFiltro !== 'TODOS' && confrontos.length === 0 && !ehTecnicoPrincipal) {
               return null; 
           }

           // Recalcula stats para o card (V/E/D) baseados nos confrontos filtrados
           let v = 0, e = 0, d = 0, gp = 0;
           confrontos.forEach(j => {
               const meuLado = j.timeA?.id == this.time.id ? 'A' : 'B';
               const gF = meuLado === 'A' ? parseInt(j.golsA) : parseInt(j.golsB);
               const gS = meuLado === 'A' ? parseInt(j.golsB) : parseInt(j.golsA);
               gp += gF;
               if (gF > gS) v++;
               else if (gF === gS) e++;
               else d++;
           });

           const posicao = statsOriginal ? (tabela.findIndex(t => t.id == this.time.id) + 1) : '-';

           // Recupera lista de técnicos para exibição
           const tecnicosSet = new Set();
           if (this.tecnicoFiltro === 'TODOS') {
                confrontos.forEach(j => {
                   let t = j.timeA?.id == this.time.id ? j.timeA.tecnico : j.timeB.tecnico;
                   if (t) tecnicosSet.add(this.resolverNomeTecnico(t));
                });
                if (statsOriginal?.tecnico) tecnicosSet.add(this.resolverNomeTecnico(statsOriginal.tecnico));
           } else {
                tecnicosSet.add(this.tecnicoFiltro);
           }

           return {
            id: h.idCampeonato,
            nomeCamp: h.nome,
            data: h.dataFim,
            urlTrofeu: h.urlTrofeu,
            posicao: posicao,
            vitorias: v, // Stats Recalculados
            empates: e,
            derrotas: d,
            golsPro: gp,
            confrontos: confrontos, // Jogos filtrados
            aberto: !!this.expandidio[h.idCampeonato],
            adicionarNacionalidade: h.adicionarNacionalidade,
            tecnico: Array.from(tecnicosSet).join(' / '),
            edicao: this.mapaEdicoes[h.idCampeonato] || '?'
          };
        })
        .filter(Boolean)
        .sort((a,b) => new Date(b.data) - new Date(a.data));
    },

    estatisticasPorCompeticao() {
        if (!this.participacoes) return [];
        const comps = {};
        this.participacoes.forEach(p => {
            const nome = p.nomeCamp; 
            if (!comps[nome]) {
                comps[nome] = { nome, participacoes: [] };
            }
            comps[nome].participacoes.push(p);
        });
        return Object.values(comps).map(c => {
           if (c.participacoes && c.participacoes.length) {
               c.participacoes.sort((a,b) => new Date(a.data) - new Date(b.data));
           }
           return c;
        });
    },
    topArtilheiros() {
      // Usa historicoFiltrado para refletir a seleção do técnico
      const base = this.historicoFiltrado || [];
      const mapa = {};
      
      base.forEach(h => {
        (h.artilheiros || []).forEach(art => {
           // Defensive check: Ensure art object and name exist
           if (art && art.timeId === this.time?.id && art.nome) {
            const nomeKey = String(art.nome).trim(); // Force string conversion
            if (!mapa[nomeKey]) mapa[nomeKey] = 0;
            mapa[nomeKey] += (Number(art.gols) || 0);
          }
        });
      });

      // Cache de jogadores para lookup rápido
      const jogadoresDoTime = this.time?.jogadores || [];

      return Object.entries(mapa)
        .map(([nome, gols]) => {
            let numero = null;
            
            // 1. Se o nome for numérico, ele É o número
            if (!isNaN(nome)) {
                numero = parseInt(nome);
            } 
            // 2. Se for texto, busca no elenco
            else {
                const jogador = jogadoresDoTime.find(j => j.nome && j.nome.trim().toLowerCase() === nome.trim().toLowerCase());
                if (jogador) numero = jogador.numero;
            }

            return { nome, gols, numero };
        })
        .sort((a,b) => b.gols - a.gols)
        .slice(0, 5);
    }
  },
  watch: {
    tecnicoFiltro() {
       this.prepararGrafico();
    }
  },
  async mounted() {
    this.carregando = true;
    try {
      this.time = await DbService.getTimeById(this.id);
      this.historico = await DbService.getHistorico();
      const todosTecnicos = await DbService.getTecnicos();
      
      // Cria mapa Apelido -> Nome
      this.mapaTecnicos = todosTecnicos.reduce((acc, t) => {
         acc[t.apelido] = t.nome;
         return acc;
      }, {});

      // LÓGICA DE EDIÇÃO
      this.calcularEdicoes();

      this.prepararGrafico();
    } catch (e) {
      console.error(e);
    } finally {
      this.carregando = false;
    }
  },
  methods: {
    calcularEdicoes() {
       if (!this.historico) return;
       
       // 1. Agrupar historico por nome da competicao
       const comps = {};
       this.historico.forEach(h => {
           if (!h.nome) return; // Proteção contra crash
           const nome = String(h.nome).trim();
           if (!comps[nome]) comps[nome] = [];
           comps[nome].push(h);
       });

       // 2. Ordenar por data e atribuir número da edição
       Object.values(comps).forEach(lista => {
           lista.sort((a,b) => new Date(a.dataFim) - new Date(b.dataFim));
           lista.forEach((h, index) => {
               this.mapaEdicoes[h.idCampeonato] = index + 1;
           });
       });
    },

    // 🔹 Helper para corrigir nomes antigos (Apelido -> Nome Completo)
    resolverNomeTecnico(nomeOuApelido) {
       if (!nomeOuApelido) return 'Téc. Desconhecido';
       return this.mapaTecnicos[nomeOuApelido] || nomeOuApelido;
    },
    formatarDataCurta(iso) {
      if (!iso) return '-';
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    formatarData(iso) {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('pt-BR');
    },
    alternarJogos(idCamp) {
       this.expandidio[idCamp] = !this.expandidio[idCamp];
    },
    prepararGrafico() {
       // 0. Filtrar competições baseadas na seleção
       let listaCompeticoes = this.estatisticasPorCompeticao;
       
       if (this.competicaoFiltro !== 'TODAS') {
           listaCompeticoes = listaCompeticoes.filter(c => c.nome === this.competicaoFiltro);
       }

       // 1. Descobrir o máximo de participações, mas agora vamos usar a EDIÇÃO REAL como categoria
       // Em vez de 1..N, vamos pegar todas as edições distintas que aparecem nos dados filtrados
       const edicoesSet = new Set();
       listaCompeticoes.forEach(comp => {
           comp.participacoes.forEach(p => {
               // p.edicao já vem do mapaEdicoes calculado no mounted (1..N real da competição)
               // Se p.edicao for '?', usamos um fallback
               if (p.edicao && p.edicao !== '?') {
                   edicoesSet.add(parseInt(p.edicao));
               }
           });
       });

       // Ordena edições para o eixo X (ex: [4, 5, 8])
       const edicoesOrdenadas = Array.from(edicoesSet).sort((a,b) => a - b);
       
       // Se não tiver nada, fallback para vazio
       const categoriasX = edicoesOrdenadas.length > 0 
            ? edicoesOrdenadas.map(e => `${e}ª Edição`)
            : [];

       // 1. Aproveitamento por Competição (Refatorado)
       const neonColors = ['#00ff00', '#00d2ff', '#ff00ff', '#ffff00', '#ff4500']; // Verde Neon, Azul Neon, Magenta, Amarelo, Laranja
       
       this.chartOptions = {
          ...this.chartOptions,
          chart: { 
              ...this.chartOptions.chart, 
              type: 'line', 
              background: 'transparent',
              height: 400, // Aumentado de 350 (implícito) para 400
              zoom: { enabled: false }
          }, 
          colors: neonColors,
          stroke: { curve: 'smooth', width: 3 }, // Reduzido de 4 para 3
          markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
          fill: { type: 'solid', opacity: 1 }, // Garante que a linha seja sólida e visível
          xaxis: {
             ...this.chartOptions.xaxis,
             categories: categoriasX
          },
          tooltip: {
               y: {
                   formatter: (val, opts) => {
                       const seriesIndex = opts.seriesIndex;
                       const dataPointIndex = opts.dataPointIndex;
                       const w = opts.w;
                       const seriesData = w.config.series[seriesIndex].data;
                       const dataPoint = seriesData[dataPointIndex];
                       
                       const tecnico = dataPoint && dataPoint.tecnico ? dataPoint.tecnico : null;
                       const nomeTecnico = tecnico || 'Sem Técnico';
                       
                       return `${val.toFixed(1)}% (${nomeTecnico})`;
                   }
               },
               theme: 'dark'
          }
       };

       this.chartSeries = listaCompeticoes.map(comp => {
           const partsOrdenadas = [...comp.participacoes].sort((a, b) => new Date(a.data) - new Date(b.data));
           
           const data = partsOrdenadas.map((p, index) => {
               const totalJogos = p.vitorias + p.empates + p.derrotas;
               let aproveitamento = 0;
               if (totalJogos > 0) {
                   const pontos = (p.vitorias * 3) + p.empates;
                   aproveitamento = (pontos / (totalJogos * 3)) * 100;
               }

               // O x deve bater com a string da categoria
               return {
                   x: `${p.edicao}ª Edição`, 
                   y: parseFloat(aproveitamento.toFixed(1)),
                   tecnico: p.tecnico // Metadado extra para tooltip se precisar customizar
               };
           });

           return {
               name: comp.nome,
               data: data
           };
       });

       // 2. Evolução de Colocação (Por Edição Sequencial)
       if (!this.participacoes || this.participacoes.length === 0) {
           this.chartSeriesColocacao = [];
           return;
       }

       this.chartOptionsColocacao = {
           ...this.chartOptionsColocacao,
           colors: neonColors,
           chart: { 
               ...this.chartOptions.chart, 
               type: 'line', 
               background: 'transparent', 
               height: 400,
               zoom: { enabled: false }
           },
           colors: neonColors,
           stroke: { curve: 'monotoneCubic', width: 3 }, // Reduzido de 4 para 3
           markers: { size: 5 },
           xaxis: {
               ...this.chartOptionsColocacao.xaxis,
               categories: categoriasX
           },
           tooltip: {
               y: {
                   formatter: (val, opts) => {
                       const seriesIndex = opts.seriesIndex;
                       const dataPointIndex = opts.dataPointIndex;
                       const w = opts.w;
                       const seriesData = w.config.series[seriesIndex].data;
                       const dataPoint = seriesData[dataPointIndex];
                       
                       const tecnico = dataPoint && dataPoint.tecnico ? dataPoint.tecnico : null;
                       const nomeTecnico = tecnico || 'Sem Técnico';
                       
                       return `${val}º lugar (${nomeTecnico})`;
                   }
               }
           }
       };

       this.chartSeriesColocacao = listaCompeticoes.map(comp => {
           const partsOrdenadas = [...comp.participacoes].sort((a, b) => new Date(a.data) - new Date(b.data));

           const data = partsOrdenadas.map(p => {
               // Converter posição string '1' ou 'Campeão' -> numero
               let pos = parseInt(p.posicao);
               if (isNaN(pos)) pos = null;

               return {
                   x: `${p.edicao}ª Edição`,
                   y: pos,
                   tecnico: p.tecnico
               };
           });

           return {
               name: comp.nome,
               data: data
           };
       });
    }
  }
};
</script>

<style scoped>
.hover-scale:hover {
    transform: scale(1.03);
}
.hover-elevate:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}
.hover-bg-light:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
}
.hover-bg-dark:hover {
    background-color: rgba(0, 0, 0, 0.15) !important;
}
.hover-bar:hover {
    opacity: 1 !important;
}
.transition-all {
    transition: all 0.2s ease-in-out;
}
.transition-colors {
    transition: background-color 0.2s ease;
}
.text-shadow {
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.drop-shadow-gold {
    filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
}
.drop-shadow-silver {
    filter: drop-shadow(0 0 3px rgba(192, 192, 192, 0.5));
}
.drop-shadow-bronze {
    filter: drop-shadow(0 0 3px rgba(205, 127, 50, 0.5));
}
.rotate-180 {
    transform: rotate(180deg);
}
</style>
