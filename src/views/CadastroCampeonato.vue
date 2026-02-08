<template>
  <div class="container mt-4 mb-5">
    <BCard :title="idEdicao ? 'Editar Campeonato' : 'Novo Campeonato'" class="shadow-sm border-secondary bg-dark text-white">
      <BForm @submit.prevent="salvarCampeonato">

        <h5 class="text-primary border-bottom border-secondary pb-2 mb-3">1. Configurações</h5>
        <BRow class="mb-3">
          <BCol md="6">
            <BFormGroup label="Nome do Torneio:" label-for="nome-camp" class="text-white-50">
              <BFormInput id="nome-camp" v-model="campeonato.nome" placeholder="Ex: Copa do Brasil"
                :state="campeonato.nome ? true : null" class="bg-secondary text-white border-secondary" />
            </BFormGroup>
          </BCol>
          <BCol md="6">
            <BFormGroup label="Link da Imagem do Troféu (opcional):" label-for="trofeu-camp" class="text-white-50">
              <BInputGroup>
                <BFormInput id="trofeu-camp" v-model="campeonato.urlTrofeu" placeholder="https://.../trofeu.png"
                  class="bg-secondary text-white border-secondary" />
                <template #append v-if="campeonato.urlTrofeu">
                  <div class="ms-2 border border-secondary rounded overflow-hidden d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                    <img :src="campeonato.urlTrofeu" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                  </div>
                </template>
              </BInputGroup>
            </BFormGroup>
          </BCol>
        </BRow>

        <BRow class="mb-3">
          <BCol md="12">
            <BFormGroup label="Tipo de Campeonato:" label-for="tipo-camp" class="text-white-50">
              <BFormSelect id="tipo-camp" v-model="campeonato.tipo" @change="resetarConfiguracoesEspecificas"
                class="bg-secondary text-white border-secondary">
                <option value="PONTOS_CORRIDOS">Pontos Corridos</option>
                <option value="MATA_MATA">Mata-Mata (Eliminatória)</option>
                <option value="GRUPOS">Fase de Grupos</option>
              </BFormSelect>
            </BFormGroup>

          </BCol>
        </BRow>

        <div class="bg-secondary bg-opacity-25 p-3 rounded mb-4 border border-secondary">

          <div v-if="campeonato.tipo === 'PONTOS_CORRIDOS'">
            <BRow>
              <BCol md="12">
                <BFormGroup label="Formato:" label-for="turnos-camp" class="text-white">
                  <BFormSelect id="turnos-camp" v-model="campeonato.turnos" class="bg-dark text-white border-secondary">
                    <option :value="1">Turno Único (Todos contra todos 1x)</option>
                    <option :value="2">Turno e Returno (Ida e Volta)</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>
            </BRow>
            <BCard class="mt-3 bg-dark border border-secondary p-3">
  <div class="form-check mb-2">
    <input
      class="form-check-input"
      type="checkbox"
      id="ativarMataMata"
      v-model="campeonato.ativarMataMataPontosCorridos"
    />
    <label class="form-check-label text-white fw-bold" for="ativarMataMata">
      Ativar Fase Final (Mata-Mata)
    </label>
  </div>

  <div v-if="campeonato.ativarMataMataPontosCorridos" class="mt-2">
    <BRow>
      <BCol md="6">
        <BFormGroup label="Quantos classificam:" class="text-white">
          <BFormInput
            type="number"
            min="2"
            :max="idsSelecionados.length > 0 ? idsSelecionados.length : 32"
            v-model.number="campeonato.classificadosParaMataMata"
            class="bg-dark text-white border-secondary"
          />
        </BFormGroup>
      </BCol>

      <BCol md="6">
        <BFormGroup label="Formato da Fase Final:" class="text-white">
          <BFormSelect
            v-model="campeonato.turnosMataMata"
            class="bg-dark text-white border-secondary"
          >
            <option :value="1">Jogo Único</option>
            <option :value="2">Ida e Volta</option>
          </BFormSelect>
        </BFormGroup>
      </BCol>
    </BRow>
  </div>
</BCard>

          </div>

          <div v-if="campeonato.tipo === 'MATA_MATA'">
            <BRow>
              <BCol md="4">
                <BFormGroup label="Jogos por Confronto:" class="text-white">
                  <BFormSelect v-model="campeonato.turnos" class="bg-dark text-white border-secondary">
                    <option :value="1">Jogo Único</option>
                    <option :value="2">Ida e Volta</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>

              <BCol md="4">
                <BFormGroup label="Classificação p/ Próx. Fase:" class="text-white">
                  <BFormSelect v-model="campeonato.tipoClassificacao" class="bg-dark text-white border-secondary">
                    <option value="AUTOMATICA">Automática (Pts > Saldo > Manual)</option>
                    <option value="MANUAL">Sempre Manual</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>

              <BCol md="4">
                <BFormGroup label="Definição dos Confrontos:" class="text-white">
                  <BFormSelect v-model="campeonato.modoDefinicao" @change="resetarPreviews"
                    class="bg-dark text-white border-secondary">
                    <option value="AUTOMATICO">Sorteio Aleatório</option>
                    <option value="MANUAL">Escolha Manual</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>
            </BRow>
            <BAlert show variant="info" class="mt-2 py-2 small bg-dark border-info text-info">
              Nota: Selecione uma quantidade de times potência de 2 (2, 4, 8, 16...) para fechar a chave.
            </BAlert>
          </div>

          <div v-if="campeonato.tipo === 'GRUPOS'">
            <BRow>
              <BCol md="2">
                <BFormGroup label="Qtd. de Grupos:" class="text-white">
                  <BFormInput type="number" min="2" max="8" v-model.number="configGrupos.qtdGrupos"
                    @change="recalcularSlotsManuais" class="bg-dark text-white border-secondary" />
                </BFormGroup>
              </BCol>
              
              <BCol md="3">
                <BFormGroup class="text-white" label="Máx. times p/ técnico:">
                  <BFormInput
                    type="number"
                    min="1"
                    class="bg-dark text-white border-secondary mb-1"
                    v-model.number="configGrupos.maxPorTecnico"
                  />
                  <small class="text-muted d-block" style="font-size: 0.7rem;">
                    Limite por grupo.
                  </small>
                </BFormGroup>
              </BCol>
              <BCol md="3">
                <BFormGroup label="Turnos (Fase de Grupos):" class="text-white">
                  <BFormSelect v-model="campeonato.turnos" class="bg-dark text-white border-secondary">
                    <option :value="1">Turno Único</option>
                    <option :value="2">Ida e Volta</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>

              <BCol md="3">
                <BFormGroup label="P/ Mata-Mata:" class="text-white">
                  <BFormInput type="number" min="1" max="4" v-model.number="configGrupos.classificadosPorGrupo"
                    class="bg-dark text-white border-secondary" />
                </BFormGroup>
              </BCol>

              <BCol md="3">
                <BFormGroup label="Definição dos Grupos:" class="text-white">
                  <BFormSelect v-model="campeonato.modoDefinicao" @change="resetarPreviews"
                    class="bg-dark text-white border-secondary">
                    <option value="TECNICOS">Sorteio (Técnicos)</option>
                    <option value="MANUAL">Escolha Manual</option>
                  </BFormSelect>
                </BFormGroup>
              </BCol>
            </BRow>

            <BRow class="mt-3">
              <BCol md="3" v-if="campeonato.modoDefinicao === 'AUTOMATICO'">
                <BFormGroup label="Qtd. de Potes:" class="text-white">
                  <BFormInput type="number" min="1" max="4" v-model.number="configGrupos.qtdPotes"
                    @change="recalcularPotes" class="bg-dark text-white border-secondary" />
                </BFormGroup>
              </BCol>

              <BCol md="9" class="border-start border-secondary ps-4">
                <label class="text-white mb-2 fw-bold">Regra de Classificação (Pós-Grupos):</label>
                
                <div class="d-flex flex-column gap-3">
                  <div class="form-check p-2 rounded bg-secondary bg-opacity-10 border border-secondary" :class="{'border-primary': configGrupos.modoKnockout === 'PADRAO'}">
                    <input class="form-check-input" type="radio" name="modoKnockout" id="modoPadrao" value="PADRAO"
                      v-model="configGrupos.modoKnockout">
                    <label class="form-check-label text-white fw-bold" for="modoPadrao">
                      Padrão (Completar Chave)
                    </label>
                    <div class="ms-2 mt-1">
                       <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="checkRepescagem"
                            v-model="configGrupos.usarRepescagem" :disabled="configGrupos.modoKnockout !== 'PADRAO'">
                          <label class="form-check-label text-white-50 small" for="checkRepescagem">
                            Ativar Repescagem (Classificar melhores 3ºs se necessário)
                          </label>
                        </div>
                    </div>
                  </div>

                  <div class="form-check p-2 rounded bg-secondary bg-opacity-10 border border-secondary" :class="{'border-primary': configGrupos.modoKnockout === 'BYE'}">
                    <input class="form-check-input" type="radio" name="modoKnockout" id="modoBye" value="BYE"
                      v-model="configGrupos.modoKnockout">
                    <label class="form-check-label text-white fw-bold" for="modoBye">
                      Sistema "Bye" (Rodada Preliminar)
                    </label>
                    <small class="d-block text-muted ms-2 mt-1">
                      Os melhores 1º colocados folgam. Os restantes disputam um Playoff para completar a chave. Ideal para 6, 12 ou 24 classificados.
                    </small>
                  </div>
                </div>


              </BCol>
            </BRow>
          </div>
        </div>

        <BFormGroup label="Adicionar Nacionalidade no nome do time" class="mb-3">
  <div class="d-flex gap-3">
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        id="nac-nao"
        :value="false"
        v-model="campeonato.adicionarNacionalidade"
      />
      <label class="form-check-label text-white" for="nac-nao">
        Não
      </label>
    </div>

    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        id="nac-sim"
        :value="true"
        v-model="campeonato.adicionarNacionalidade"
      />
      <label class="form-check-label text-white" for="nac-sim">
        Sim
      </label>
    </div>
  </div>
</BFormGroup>

        <BFormGroup label="Filtrar clubes por país" class="mb-3">
  <BFormSelect
    v-model="filtroPais"
    :options="opcoesPais"
  />
</BFormGroup>


<h5 class="text-primary border-bottom border-secondary pb-2 mb-3">
  2. Seleção de Clubes
</h5>

<BInputGroup class="mb-3">
  <BInputGroupText class="bg-secondary text-white border-secondary">
    🔍
  </BInputGroupText>
  <BFormInput
    v-model="termoBusca"
    placeholder="Filtrar times..."
    class="bg-dark text-white border-secondary"
  />
</BInputGroup>

<!-- TOGGLE PARA DISTRIBUIÇÃO - MAIS DISCRETO -->
<div class="d-flex align-items-center gap-3 mb-3 px-1">
  <span class="text-white-50 small fw-bold">Deseja distribuir os técnicos automático?</span>
  <div class="btn-group btn-group-sm shadow-sm">
    <input type="radio" class="btn-check" name="toggleDist" id="distNao" :value="false" v-model="mostrarDistribuidorTecnicos">
    <label class="btn btn-outline-secondary px-3" for="distNao">Não</label>

    <input type="radio" class="btn-check" name="toggleDist" id="distSim" :value="true" v-model="mostrarDistribuidorTecnicos">
    <label class="btn btn-outline-info px-3" for="distSim">Sim</label>
  </div>
</div>

<!-- FERRAMENTA DE DISTRIBUIÇÃO - CONDICIONAL -->
<BCard class="bg-dark text-white border-info mb-4 shadow" v-if="mostrarDistribuidorTecnicos && idsSelecionados.length > 0">
  <template #header>
    <div class="d-flex justify-content-between align-items-center">
      <h6 class="mb-0 text-info fw-bold">🤝 Distribuição Automática de Técnicos</h6>
      <small class="text-muted">Selecione quem vai jogar e o sistema divide os times entre eles.</small>
    </div>
  </template>
  
  <BRow class="mb-3">
    <BCol cols="12">
      <div class="d-flex flex-wrap gap-2 mb-3 px-2">
        <div v-for="tec in tecnicos" :key="tec.id" class="form-check form-check-inline bg-secondary bg-opacity-25 px-3 py-1 rounded-pill border border-secondary shadow-sm">
          <input 
            class="form-check-input" 
            type="checkbox" 
            :id="'checkTec' + tec.id" 
            :value="tec.nome" 
            v-model="tecnicosParticipantesIds"
          >
          <label class="form-check-label small text-white cursor-pointer mb-0" :for="'checkTec' + tec.id">
            {{ tec.nome }}
          </label>
        </div>
      </div>
      <div v-if="tecnicosParticipantesIds.length > 0" class="small text-muted mb-2 px-2">
        Média: Cada técnico ficará com aprox. <strong>{{ Math.ceil(idsSelecionados.length / tecnicosParticipantesIds.length) }}</strong> times.
      </div>
    </BCol>
  </BRow>

  <BButton 
    variant="info" 
    class="w-100 text-white fw-bold shadow-sm py-2" 
    :disabled="tecnicosParticipantesIds.length === 0"
    @click="distribuirTecnicosAutomaticamente"
  >
    🎲 Sortear Técnicos nos {{ idsSelecionados.length }} Times Selecionados
  </BButton>
</BCard>

<div
  class="border border-secondary rounded p-3 mb-3 bg-dark"
  style="max-height: 250px; overflow-y: auto;"
>
  <div
    v-if="timesFiltradosFinal.length === 0"
    class="text-center text-muted"
  >
    Nenhum time encontrado.
  </div>

  <div v-else>
    <div
      v-for="time in timesFiltradosFinal"
      :key="time.id"
      class="d-flex align-items-center justify-content-between mb-2 px-2 py-1 hover-item text-white"
      :class="{
        'border-start border-4 border-primary bg-secondary bg-opacity-25':
          isSelecionado(time.id)
      }"
    >
      <!-- ESQUERDA -->
      <div class="d-flex align-items-center gap-2">
        <input
          type="checkbox"
          class="form-check-input bg-dark border-secondary"
          :value="String(time.id)"
          v-model="idsSelecionados"
          @change="atualizarSelecaoTimes"
        />

        <img
          :src="time.escudo"
          style="width: 24px; height: 24px; object-fit: contain;"
        />
        <span>
  {{ time.nome }}
  <small class="text-muted ms-1">
    ({{ time.pais?.substring(0, 3).toUpperCase() }})
  </small>
</span>

      </div>

      <!-- DIREITA -->
      <select
        class="form-select form-select-sm"
        style="width: 130px"
        v-model="time.tecnico"
        @click.stop
      >
        <option value="">---</option>
        <option
          v-for="tecnico in tecnicos"
          :key="tecnico.id"
          :value="tecnico.nome"
        >
          {{ tecnico.nome }}
        </option>
      </select>
    </div>
  </div>
</div>

<div class="d-flex justify-content-between align-items-center mb-4 mt-2">
  <BBadge variant="primary" class="p-2">{{ idsSelecionados.length }} times selecionados</BBadge>
</div>

        <div v-if="campeonato.tipo !== 'PONTOS_CORRIDOS'">
          <h5 class="text-primary border-bottom border-secondary pb-2 mb-3">3. Definição de Jogos/Grupos</h5>

          <div v-if="campeonato.tipo === 'GRUPOS' && campeonato.modoDefinicao === 'AUTOMATICO'" class="mb-4">
            <p class="small text-muted">Distribua os times nos potes para equilibrar o sorteio.</p>
            <BRow>
              <BCol v-for="(pote, index) in configGrupos.potes" :key="index" md="6" class="mb-3">
                <BCard :header="`Pote ${index + 1}`" class="h-100 bg-dark text-white border-secondary">
                  <div v-for="time in pote.times" :key="time.id"
                    class="d-flex justify-content-between align-items-center mb-1 small text-white-50">
                    <span>{{ time.nome }}</span>
                    <BButton size="sm" variant="outline-danger" class="py-0 px-1"
                      @click="removerDoPote(index, time.id)">x</BButton>
                  </div>
                  <div class="mt-2">
                    <BFormSelect size="sm" v-model="auxiliares.timeSelecionadoParaPote[index]"
                      @change="adicionarAoPote(index)" class="bg-secondary text-white border-secondary">
                      <option :value="null">Adicionar time...</option>
                      <option v-for="t in timesDisponiveisParaPote" :key="t.id" :value="t">{{ t.nome }}</option>
                    </BFormSelect>
                  </div>
                </BCard>
              </BCol>
            </BRow>
            <BButton variant="info" class="w-100 mt-2 text-white fw-bold" @click="executarSorteioGrupos">
              🎲 Sortear Grupos Agora
            </BButton>
          </div>

          <div v-if="campeonato.tipo === 'GRUPOS' && campeonato.modoDefinicao === 'TECNICOS'" class="mb-4">
             <BAlert show variant="info" class="mb-3 small bg-dark border-info text-info">
                 O sistema irá distribuir os times tentando evitar que o mesmo técnico caia no mesmo grupo.
             </BAlert>
             <BButton variant="info" class="w-100 text-white fw-bold" @click="executarSorteioGrupos">
               🎲 Sortear Grupos (Por Técnico)
             </BButton>
          </div>

          <div v-if="campeonato.tipo === 'GRUPOS' && campeonato.modoDefinicao === 'MANUAL'" class="mb-4">
            <BRow>
              <BCol v-for="(grupo, index) in configGrupos.gruposManuais" :key="index" md="6" class="mb-3">
                <BCard :header="`Grupo ${String.fromCharCode(65 + index)}`"
                  class="h-100 bg-dark text-white border-secondary">
                  <div v-for="time in grupo.times" :key="time.id"
                    class="d-flex justify-content-between align-items-center mb-1 small text-white-50">
                    <span>{{ time.nome }}</span>
                    <BButton size="sm" variant="outline-danger" class="py-0 px-1"
                      @click="removerDoGrupoManual(index, time.id)">x</BButton>
                  </div>
                  <div class="mt-2">
                    <BFormSelect size="sm" v-model="auxiliares.timeSelecionadoParaGrupo[index]"
                      @change="adicionarAoGrupoManual(index)" class="bg-secondary text-white border-secondary">
                      <option :value="null">Adicionar time...</option>
                      <option v-for="t in timesDisponiveisParaGrupo" :key="t.id" :value="t">{{ t.nome }}</option>
                    </BFormSelect>
                  </div>
                </BCard>
              </BCol>
            </BRow>
            <BButton variant="success" class="w-100 mt-2" @click="confirmarGruposManuais"
              :disabled="!todosTimesAlocadosEmGrupos">
              ✔ Confirmar Grupos
            </BButton>
          </div>

          <div v-if="campeonato.tipo === 'MATA_MATA'" class="mb-4">
            <div v-if="campeonato.modoDefinicao === 'AUTOMATICO'">
              <BButton variant="info" class="w-100 text-white fw-bold" @click="executarSorteioMataMata">
                🎲 Sortear Confrontos Aleatoriamente
              </BButton>
            </div>
            <div v-else>
              <p class="small text-muted">Defina quem enfrenta quem na primeira fase.</p>
              <div v-for="(confronto, idx) in auxiliares.confrontosManuais" :key="idx"
                class="d-flex align-items-center justify-content-center mb-2 gap-2 p-2 rounded bg-secondary bg-opacity-10 border border-secondary">
                <strong class="me-2 text-white">#{{ idx + 1 }}</strong>
                <BFormSelect size="sm" v-model="confronto.timeA" style="max-width: 200px;"
                  class="bg-dark text-white border-secondary">
                  <option :value="null">Selecione...</option>
                  <option v-for="t in getTimesDisponiveisConfronto(confronto.timeA)" :key="t.id" :value="t">{{ t.nome }}
                  </option>
                </BFormSelect>
                <span class="badge bg-secondary">vs</span>
                <BFormSelect size="sm" v-model="confronto.timeB" style="max-width: 200px;"
                  class="bg-dark text-white border-secondary">
                  <option :value="null">Selecione...</option>
                  <option v-for="t in getTimesDisponiveisConfronto(confronto.timeB)" :key="t.id" :value="t">{{ t.nome }}
                  </option>
                </BFormSelect>
              </div>
              <BButton variant="success" class="w-100 mt-2" @click="confirmarMataMataManual"
                :disabled="!todosConfrontosPreenchidos">
                ✔ Confirmar Confrontos
              </BButton>
            </div>
          </div>

          <div v-if="previewJogos.length > 0 || previewGrupos.length > 0"
            class="border border-success rounded p-3 mt-3 bg-secondary bg-opacity-10">
            <h6 class="text-success text-center border-bottom border-success pb-2 mb-3">✅ Prévia Gerada</h6>

            <div v-if="campeonato.tipo === 'MATA_MATA'">
              <div v-for="(jogo, i) in previewJogosApenasIda" :key="i"
                class="d-flex justify-content-center align-items-center mb-3 border-bottom border-secondary pb-2 small text-white">
                
                <!-- Time A -->
                <div class="d-flex align-items-center justify-content-end flex-grow-1 text-end gap-2">
                   <small v-if="campeonato.adicionarNacionalidade && jogo.timeA.pais" class="text-muted text-uppercase" style="font-size: 0.7rem;">
                     {{ jogo.timeA.pais.substring(0,3) }}
                   </small>
                   <BBadge v-if="abreviarTecnico(jogo.timeA.tecnico)" 
                           pill
                           :style="{ backgroundColor: corTecnico(jogo.timeA.tecnico) }" 
                           size="sm" class="fw-bold px-2 text-white border-0">
                     {{ abreviarTecnico(jogo.timeA.tecnico) }}
                   </BBadge>
                   <span class="fw-bold">{{ jogo.timeA.nome }}</span>
                   <img :src="jogo.timeA.escudo" width="22" style="object-fit: contain;" />
                </div>

                <span class="mx-3 badge bg-secondary bg-opacity-25 border border-secondary text-muted">VS</span>

                <!-- Time B -->
                <div class="d-flex align-items-center justify-content-start flex-grow-1 text-start gap-2">
                   <img :src="jogo.timeB.escudo" width="22" style="object-fit: contain;" />
                   <span class="fw-bold">{{ jogo.timeB.nome }}</span>
                   <BBadge v-if="abreviarTecnico(jogo.timeB.tecnico)" 
                           pill
                           :style="{ backgroundColor: corTecnico(jogo.timeB.tecnico) }" 
                           size="sm" class="fw-bold px-2 text-white border-0">
                     {{ abreviarTecnico(jogo.timeB.tecnico) }}
                   </BBadge>
                   <small v-if="campeonato.adicionarNacionalidade && jogo.timeB.pais" class="text-muted text-uppercase" style="font-size: 0.7rem;">
                     {{ jogo.timeB.pais.substring(0,3) }}
                   </small>
                </div>

              </div>
            </div>

            <div v-if="campeonato.tipo === 'GRUPOS'">
              <BRow>
                <BCol v-for="(grupo, idx) in previewGrupos" :key="idx" md="6" class="mb-3">
                  <div class="border border-secondary rounded p-2 h-100 bg-dark text-white">
                    <strong class="text-primary">{{ grupo.nome }}</strong>
                    <ul class="list-unstyled mb-0 ms-2 small mt-2">
                      <li v-for="t in grupo.times" :key="t.id"
                        class="border-bottom border-secondary py-2 text-white-50 d-flex align-items-center gap-2">
                        <img :src="t.escudo" width="18" class="me-1" /> 
                        <span class="text-white fw-bold">{{ t.nome }}</span>
                        <BBadge v-if="abreviarTecnico(t.tecnico)" 
                                pill
                                :style="{ backgroundColor: corTecnico(t.tecnico) }" 
                                size="sm" class="px-2 text-white border-0" style="font-size: 0.65rem;">
                          {{ abreviarTecnico(t.tecnico) }}
                        </BBadge>
                        <small v-if="campeonato.adicionarNacionalidade && t.pais" class="text-muted ms-auto" style="font-size: 0.65rem;">
                          {{ t.pais.substring(0, 3).toUpperCase() }}
                        </small>
                      </li>
                    </ul>
                  </div>
                </BCol>
              </BRow>
              <BAlert show variant="warning" class="mt-2 small text-center bg-dark border-warning text-warning"
                v-if="configGrupos.classificadosPorGrupo">
                Os <strong>{{ configGrupos.classificadosPorGrupo }}</strong> melhores de cada grupo avançam direto.
                <span v-if="configGrupos.modoKnockout === 'PADRAO' && configGrupos.usarRepescagem"><br>+ Melhores não-classificados para fechar a chave (Repescagem).</span>
                <span v-if="configGrupos.modoKnockout === 'BYE'"><br>Sistema BYE ativo: Melhores folgam, restantes jogam preliminar.</span>
              </BAlert>
            </div>
          </div>
        </div>

        <div class="mt-4 d-grid gap-2">
          <BButton type="submit" variant="success" size="lg">
            Salvar Campeonato
          </BButton>
        </div>

      </BForm>
    </BCard>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { gerarJogosGrupos, gerarJogosMataMata } from '../utils/GeradorTabela.js';

import {
  BCard, BForm, BFormGroup, BFormInput, BFormSelect,
  BRow, BCol, BButton, BBadge, BInputGroup, BInputGroupText, BAlert
} from 'bootstrap-vue-next';

export default {
  name: 'CadastroCampeonato',
  components: {
    BCard, BForm, BFormGroup, BFormInput, BFormSelect,
    BRow, BCol, BButton, BBadge, BInputGroup, BInputGroupText, BAlert
  },
  data() {
    return {
      carregando: true,
      termoBusca: '',
      todosOsTimes: [],
      idsSelecionados: [],
      filtroPais: '',
      tecnicosParticipantesIds: [], // Novos técnicos que vão participar do sorteio

      campeonato: {
        nome: '',
        tipo: 'PONTOS_CORRIDOS',
        turnos: 1,
        tipoClassificacao: 'AUTOMATICA',
        modoDefinicao: 'AUTOMATICO',
        urlTrofeu: '', // Novo campo
        adicionarNacionalidade: false,
        classificadosParaMataMata: 4, // Valor padrão de classificados (se ativado)
        turnosMataMata: 1,
        ativarMataMataPontosCorridos: false // Controle UI separado
      },

      configGrupos: {
  qtdGrupos: 2,
  qtdPotes: 2,
  classificadosPorGrupo: 2,
  usarRepescagem: false,
  tipoSorteioMataMata: 'GRUPOS', // GRUPOS, GERAL
  modoKnockout: 'PADRAO',
  maxTimesPorTecnico: 1, // 👈 NOVO
  potes: [{ times: [] }, { times: [] }],
  gruposManuais: []
},


      auxiliares: {
        timeSelecionadoParaPote: [null, null, null, null],
        timeSelecionadoParaGrupo: [null, null, null, null, null, null, null, null],
        confrontosManuais: []
      },

      previewJogos: [],
      previewGrupos: [],
      tecnicos: [],
      idEdicao: null,
      mostrarDistribuidorTecnicos: false // Controle de exibição do distribuidor
    }
  },
    computed: {

  opcoesPais() {
  const lista = this.todosOsTimes || [];

  if (lista.length === 0) {
    return [{ value: '', text: 'Todos os países' }];
  }

  const paisesUnicos = [...new Set(lista.map(t => t.pais).filter(Boolean))];

  return [
    { value: '', text: 'Todos os países' },
    ...paisesUnicos.map(pais => ({
      value: pais,
      text: pais
    }))
  ];
},


    timesParaExibir() {
      if (!this.termoBusca) return this.todosOsTimes;
      const termo = this.termoBusca.toLowerCase();
      return this.todosOsTimes.filter(t => t.nome.toLowerCase().includes(termo));
    },
    timesSelecionadosObj() {
      // Usa Set de Strings para garantir comparação correta
      const idsSet = new Set(this.idsSelecionados.map(id => String(id)));
      return this.todosOsTimes
        .filter(t => idsSet.has(String(t.id)))
        .map(t => ({
          ...t,
          pais: t.pais || '',
          tecnico: t.tecnico || 'SEM_TECNICO'
        }));
    },

    timesDisponiveisParaPote() {
      const timesEmPotes = this.configGrupos.potes.flatMap(p => p.times.map(t => t.id));
      return this.timesSelecionadosObj.filter(t => !timesEmPotes.includes(t.id));
    },
    timesDisponiveisParaGrupo() {
      const timesEmGrupos = this.configGrupos.gruposManuais.flatMap(g => g.times.map(t => t.id));
      return this.timesSelecionadosObj.filter(t => !timesEmGrupos.includes(t.id));
    },
    todosTimesAlocadosEmGrupos() {
      const totalAlocados = this.configGrupos.gruposManuais.reduce((acc, g) => acc + g.times.length, 0);
      return totalAlocados === this.idsSelecionados.length && this.idsSelecionados.length > 0;
    },
    todosConfrontosPreenchidos() {
      if (this.auxiliares.confrontosManuais.length === 0) return false;
      return this.auxiliares.confrontosManuais.every(c => c.timeA && c.timeB);
    },
    previewJogosApenasIda() {
      return this.previewJogos.filter(j => j.turno === 1);
    },
     
    timesFiltradosFinal() {
      // 1. Filtragem por busca
      let lista = this.todosOsTimes;
      if (this.termoBusca) {
        const termo = this.termoBusca.toLowerCase();
        lista = lista.filter(t => t.nome.toLowerCase().includes(termo));
      }

      // 2. Filtragem por país
      if (this.filtroPais) {
        lista = lista.filter(t => t.pais === this.filtroPais);
      }

      return lista;
    }




  },
  async mounted() {
    await this.carregarTimes();
    this.tecnicos = await DbService.getTecnicos(); // Usando DbService agora

    // Lógica de Edição
    if (this.$route.params.id) {
      this.idEdicao = this.$route.params.id;
      await this.carregarCampeonatoParticipante();
    }
  },
  methods: {
    distribuirTecnicosAutomaticamente() {
      if (this.tecnicosParticipantesIds.length === 0) return;
      if (!confirm(`Deseja distribuir os ${this.tecnicosParticipantesIds.length} técnicos selecionados entre os ${this.idsSelecionados.length} times?`)) return;

      // 1. Pega os objetos dos times que estão selecionados (Garantindo comparação String)
      const idsSet = new Set(this.idsSelecionados.map(id => String(id)));
      const timesSelecionados = this.todosOsTimes.filter(t => idsSet.has(String(t.id)));
      
      if (timesSelecionados.length === 0) {
        alert("Selecione os times primeiro!");
        return;
      }

      // 2. Embaralha os times para o sorteio ser justo
      const timesEmbaralhados = [...timesSelecionados].sort(() => Math.random() - 0.5);
      
      // 3. Embaralha os técnicos participantes
      const tecnicosEmbaralhados = [...this.tecnicosParticipantesIds].sort(() => Math.random() - 0.5);

      // 4. Distribui ciclicamente e força a reatividade
      timesEmbaralhados.forEach((time, index) => {
          const tecnicoIndex = index % tecnicosEmbaralhados.length;
          time.tecnico = tecnicosEmbaralhados[tecnicoIndex];
      });

      // 🔥 FORÇA REATIVIDADE (Vue 3 às vezes precisa de re-trigger em arrays de objetos modificados internamente)
      this.todosOsTimes = [...this.todosOsTimes];

      alert("🎲 Técnicos distribuídos nos " + timesSelecionados.length + " times!");
    },

    formatarNomeTime(time) {
  if (!time) return '';

  const partes = [];

  // Técnico
  if (time.tecnico) {
    partes.push(time.tecnico);
  }

  // País (só se a flag estiver ligada)
  if (this.campeonato.adicionarNacionalidade === true && time.pais) {
    partes.push(time.pais.substring(0, 3).toUpperCase());
  }

  // Nome do time
  partes.push(time.nome);

  return partes.join(' ');
},

abreviarTecnico(nome) {
  if (!nome || nome === '' || nome === '---' || nome === 'Neutro' || nome === 'SEM_TECNICO') return null;
  
  // Se for nome composto, tenta pegar iniciais ou apenas os 3 primeiros
  const partes = nome.split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase(); // Ex: Fabiano Correa -> FC
  }
  return nome.substring(0, 3).toUpperCase();
},

corTecnico(nome) {
  if (!nome) return 'secondary';
  // Cores mais pastéis/modernas
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#06b6d4'  // cyan
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
},


    async carregarTimes() {
      try {
        const rawTimes = await DbService.getTimes();
        
        // USA MAP PARA GARANTIR UNICIDADE POR ID (Normalizado como String)
        const mapaUnico = new Map();
        (rawTimes || []).forEach(t => {
          const idStr = String(t.id);
          if (!mapaUnico.has(idStr)) {
            mapaUnico.set(idStr, {
              ...t,
              id: idStr, // Mantém como String
              tecnico: t.tecnico || ''
            });
          }
        });

        this.todosOsTimes = Array.from(mapaUnico.values());
      } catch (error) { 
        console.error("Erro ao carregar times:", error); 
      } finally { 
        this.carregando = false; 
      }
    },
     
    // 🔹 NOVO MÉTODO — AGRUPA TIMES POR TÉCNICO
  agruparTimesPorTecnico(times) {
    const mapa = {};

    times.forEach(time => {
      const tecnico = time.tecnico || 'SEM_TECNICO';

      if (!mapa[tecnico]) {
        mapa[tecnico] = [];
      }

      mapa[tecnico].push(time);
    });

    return mapa;
  },

    isSelecionado(id) {
      if (!id) return false;
      const idStr = String(id);
      return this.idsSelecionados.some(selId => String(selId) === idStr);
    },
    resetarConfiguracoesEspecificas() {
      this.resetarPreviews();
      this.configGrupos = {
        qtdGrupos: 2, qtdPotes: 2, classificadosPorGrupo: 2,
        usarRepescagem: false,
        tipoSorteioMataMata: 'GRUPOS', // GRUPOS, GERAL
        modoKnockout: 'PADRAO',
        potes: [{ times: [] }, { times: [] }],
        gruposManuais: []
      };
    },
    resetarPreviews() {
      this.previewJogos = [];
      this.previewGrupos = [];
      this.recalcularSlotsManuais();
    },
    atualizarSelecaoTimes() {
      this.atualizarPotesSeNecessario();
      this.recalcularSlotsManuais();
    },
    recalcularPotes() {
      const novaQtd = this.configGrupos.qtdPotes;
      while (this.configGrupos.potes.length < novaQtd) this.configGrupos.potes.push({ times: [] });
      while (this.configGrupos.potes.length > novaQtd) this.configGrupos.potes.pop();
    },
    atualizarPotesSeNecessario() {
      const ids = new Set(this.idsSelecionados.map(Number));
      this.configGrupos.potes.forEach(pote => {
        pote.times = pote.times.filter(t => ids.has(Number(t.id)));
      });
      this.configGrupos.gruposManuais.forEach(grupo => {
        grupo.times = grupo.times.filter(t => ids.has(Number(t.id)));
      });
    },
    adicionarAoPote(indexPote) {
      const time = this.auxiliares.timeSelecionadoParaPote[indexPote];
      if (time) {
        this.configGrupos.potes[indexPote].times.push(time);
        this.auxiliares.timeSelecionadoParaPote[indexPote] = null;
      }
    },
    removerDoPote(indexPote, timeId) {
      this.configGrupos.potes[indexPote].times = this.configGrupos.potes[indexPote].times.filter(t => t.id !== timeId);
    },
    recalcularSlotsManuais() {
      if (this.campeonato.tipo === 'GRUPOS' && this.campeonato.modoDefinicao === 'MANUAL') {
        const qtd = this.configGrupos.qtdGrupos;
        while (this.configGrupos.gruposManuais.length < qtd) this.configGrupos.gruposManuais.push({ times: [] });
        while (this.configGrupos.gruposManuais.length > qtd) this.configGrupos.gruposManuais.pop();
      }
      if (this.campeonato.tipo === 'MATA_MATA' && this.campeonato.modoDefinicao === 'MANUAL') {
        const qtdTimes = this.idsSelecionados.length;
        const qtdConfrontos = Math.floor(qtdTimes / 2);
        if (this.auxiliares.confrontosManuais.length !== qtdConfrontos) {
          this.auxiliares.confrontosManuais = Array.from({ length: qtdConfrontos }, () => ({ timeA: null, timeB: null }));
        }
      }
    },
    adicionarAoGrupoManual(index) {
      const time = this.auxiliares.timeSelecionadoParaGrupo[index];
      if (time) {
        this.configGrupos.gruposManuais[index].times.push(time);
        this.auxiliares.timeSelecionadoParaGrupo[index] = null;
      }
    },
    removerDoGrupoManual(index, timeId) {
      this.configGrupos.gruposManuais[index].times = this.configGrupos.gruposManuais[index].times.filter(t => t.id !== timeId);
    },
    getTimesDisponiveisConfronto(timeAtualNoSelect) {
      const timesUsados = this.auxiliares.confrontosManuais.flatMap(c => [c.timeA?.id, c.timeB?.id]).filter(Boolean);
      return this.timesSelecionadosObj.filter(t => !timesUsados.includes(t.id) || t.id === timeAtualNoSelect?.id);
    },

    executarSorteioGrupos() {
      // 1. FILTRAGEM RÍGIDA: Usa apenas times selecionados que existem na lista geral
      const idsValidos = new Set(this.idsSelecionados.map(id => String(id)));
      const timesParaSortear = this.todosOsTimes.filter(t => idsValidos.has(String(t.id)));
      
      if (timesParaSortear.length === 0) {
        alert("Nenhum time válido selecionado para o sorteio.");
        return;
      }

      const qtdGrupos = this.configGrupos.qtdGrupos || 2;
      const maxPorTecnico = this.configGrupos.maxPorTecnico || 1;

      // 2. Embaralha os times
      const timesEmbaralhados = [...timesParaSortear].sort(() => Math.random() - 0.5);

      // 3. Inicializa grupos vazios
      const grupos = Array.from({ length: qtdGrupos }, (_, i) => ({
        nome: `Grupo ${String.fromCharCode(65 + i)}`,
        times: []
      }));

      // 4. DISTRIBUIÇÃO EQUILIBRADA (ROUND-ROBIN)
      // Tenta respeitar o limite de técnicos, mas prioriza o equilíbrio numérico
      timesEmbaralhados.forEach(time => {
        const tec = time.tecnico || 'SEM_TECNICO';

        // Encontra grupos que:
        // a) Ainda não atingiram o limite desse técnico
        // b) Estão com menos times (mais vazios)
        let grupoAlvo = grupos
          .filter(g => {
            const timesDoTecnicoNoGrupo = g.times.filter(t => (t.tecnico || 'SEM_TECNICO') === tec).length;
            return timesDoTecnicoNoGrupo < maxPorTecnico;
          })
          .sort((a, b) => a.times.length - b.times.length)[0];

        // Se todos os grupos já atingiram o limite para esse técnico, pega o grupo mais vazio
        if (!grupoAlvo) {
          grupoAlvo = [...grupos].sort((a, b) => a.times.length - b.times.length)[0];
        }

        if (grupoAlvo) {
          grupoAlvo.times.push({ ...time });
        }
      });

      // 5. Embaralha a ordem INTERNA para evitar previsibilidade nos confrontos
      grupos.forEach(g => {
        g.times.sort(() => Math.random() - 0.5);
      });

      // 6. Atualiza Previews
      this.previewGrupos = grupos;
      this.previewJogos = gerarJogosGrupos(grupos, this.campeonato.turnos);
      alert("🏆 Sorteio completo e equilibrado!");
    },




    confirmarGruposManuais() {
      const gruposTemp = this.configGrupos.gruposManuais.map((g, i) => ({
        nome: `Grupo ${String.fromCharCode(65 + i)}`,
        times: g.times
      }));
      this.previewGrupos = gruposTemp;
      this.previewJogos = gerarJogosGrupos(gruposTemp, this.campeonato.turnos);
    },

    executarSorteioMataMata() {
      const times = [...this.timesSelecionadosObj];
      if (times.length % 2 !== 0) {
        alert("Para Mata-Mata, selecione uma quantidade par de times!");
        return;
      }
      times.sort(() => Math.random() - 0.5);
      this.previewJogos = gerarJogosMataMata(times, this.campeonato.turnos);
    },

    confirmarMataMataManual() {
      const timesOrdenados = [];
      this.auxiliares.confrontosManuais.forEach(c => {
        timesOrdenados.push(c.timeA);
        timesOrdenados.push(c.timeB);
      });
      this.previewJogos = gerarJogosMataMata(timesOrdenados, this.campeonato.turnos);
    },

    async salvarCampeonato() {

      // garante flag de nacionalidade

      const erros = [];

      // 🔹 SORTEIO AUTOMÁTICO PARA GRUPOS POR TÉCNICO
if (
  this.campeonato.tipo === 'GRUPOS' &&
  this.campeonato.modoDefinicao === 'TECNICOS' &&
  this.previewGrupos.length === 0
) {
  this.executarSorteioGrupos();
}


      if (!this.campeonato.nome) erros.push("Nome do Torneio");
      if (this.idsSelecionados.length < 2) erros.push("Selecione pelo menos 2 times");

      if (this.campeonato.tipo !== 'PONTOS_CORRIDOS') {
        if (this.campeonato.tipo === 'GRUPOS' && this.previewGrupos.length === 0) {
          erros.push("Defina os grupos (Sorteie ou Confirme a escolha manual)");
        }
        if (this.campeonato.tipo === 'MATA_MATA' && this.previewJogos.length === 0) {
          erros.push("Defina os confrontos (Sorteie ou Confirme a escolha manual)");
        }
      }

      if (erros.length > 0) {
        alert("Atenção! Resolva os seguintes itens antes de salvar:\n\n- " + erros.join("\n- "));
        return;
      }

      // 🔧 FIXA TÉCNICO E PAÍS NOS JOGOS (dados internos do campeonato)
this.previewJogos = this.previewJogos.map(jogo => ({
  ...jogo,
  timeA: {
    ...jogo.timeA,
    tecnico: jogo.timeA?.tecnico || '',
    pais: jogo.timeA?.pais || ''
  },
  timeB: {
    ...jogo.timeB,
    tecnico: jogo.timeB?.tecnico || '',
    pais: jogo.timeB?.pais || ''
  }
}));


      const timesComPais = this.timesSelecionadosObj.map(t => ({
  ...t,
  pais: t.pais || ''
}));

const dados = {
  id: Date.now(),
  nome: this.campeonato.nome,
  tipo: this.campeonato.tipo,
  turnos: this.campeonato.turnos,
  tipoClassificacao: this.campeonato.tipoClassificacao,
  modoDefinicao: this.campeonato.modoDefinicao,
  urlTrofeu: (this.campeonato.urlTrofeu && this.campeonato.urlTrofeu.trim()) ? this.campeonato.urlTrofeu.trim() : null, // Salvando opcionalmente
  status: 'EM_ANDAMENTO',

  // ✅ SALVA DE VERDADE
  adicionarNacionalidade: this.campeonato.adicionarNacionalidade === true,

  // ✅ AQUI ESTÁ O CAMPO QUE FALTAVA
  classificadosParaMataMata:
    (this.campeonato.tipo === 'PONTOS_CORRIDOS' && this.campeonato.ativarMataMataPontosCorridos)
      ? (Number(this.campeonato.classificadosParaMataMata) || 4)
      : null,

  // 🔥 LIMPA COMPLETAMENTE COISAS DE GRUPO
  classificadosPorGrupo:
  this.campeonato.tipo === 'GRUPOS'
    ? this.configGrupos.classificadosPorGrupo
    : null,

usarRepescagem:
  this.campeonato.tipo === 'GRUPOS'
    ? this.configGrupos.usarRepescagem
    : false,

modoKnockout:
  this.campeonato.tipo === 'GRUPOS'
    ? this.configGrupos.modoKnockout
    : null,

  tipoSorteioMataMata: 'GRUPOS', // Padrão inicial

grupos:
  this.campeonato.tipo === 'GRUPOS'
    ? this.previewGrupos
    : [],

// ⚽ jogos
jogos:
  this.campeonato.tipo === 'PONTOS_CORRIDOS'
    ? []
    : this.previewJogos,


  timesParticipantes: this.timesSelecionadosObj.map(t => ({
    ...t,
    tecnico: t.tecnico || '',
    pais: t.pais || null
  })),

  // Retrocompatibilidade
  times: this.timesSelecionadosObj.map(t => ({
    ...t,
    tecnico: t.tecnico || '',
    pais: t.pais || null
  })),

  dataCriacao: new Date().toISOString()
};





      try {
        this.carregando = true;
        
        const payload = JSON.parse(JSON.stringify(dados));
        
        if (this.idEdicao) {
          payload.id = Number(this.idEdicao);
          await DbService.atualizarCampeonato(payload);
          alert(`Campeonato "${this.campeonato.nome}" atualizado com sucesso!`);
          this.$router.push('/lista-campeonatos');
        } else {
          await DbService.adicionarCampeonato(payload);
          alert(`Campeonato "${this.campeonato.nome}" criado com sucesso!`);
          this.idsSelecionados = [];
          this.campeonato.nome = '';
          this.resetarConfiguracoesEspecificas();
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao salvar campeonato.");
      } finally {
        this.carregando = false;
      }
    },

    async carregarCampeonatoParticipante() {
      try {
        this.carregando = true;
        const camp = await DbService.getCampeonatoById(this.idEdicao);
        if (!camp) {
          alert("Campeonato não encontrado!");
          this.$router.push('/lista-campeonatos');
          return;
        }

        // Mapear dados basicos
        this.campeonato.nome = camp.nome;
        this.campeonato.tipo = camp.tipo;
        this.campeonato.turnos = camp.turnos;
        this.campeonato.tipoClassificacao = camp.tipoClassificacao || 'AUTOMATICA';
        this.campeonato.modoDefinicao = camp.modoDefinicao || 'AUTOMATICO';
        this.campeonato.adicionarNacionalidade = camp.adicionarNacionalidade === true;
        this.campeonato.classificadosParaMataMata = camp.classificadosParaMataMata || 4;
        this.campeonato.ativarMataMataPontosCorridos = !!camp.classificadosParaMataMata;
        this.campeonato.urlTrofeu = camp.urlTrofeu || ''; // Carregando para edição

        // Mapear times selecionados
        const timesDocamp = camp.timesParticipantes || camp.times || [];
        if (timesDocamp.length > 0) {
          // 🔧 LIMPEZA RÍGIDA: IDs no banco podem ser strings/números, normalizamos para STRING
          const idsUnicos = [...new Set(timesDocamp.map(t => String(t.id)))];
          
          // Sincroniza idsSelecionados (Sempre String e Único)
          this.idsSelecionados = idsUnicos;

          // Restaura técnicos na lista mestre de todosOsTimes
          const tecsNoCamp = new Set();
          timesDocamp.forEach(tSalvo => {
            const timeNaLista = this.todosOsTimes.find(t => String(t.id) === String(tSalvo.id));
            if (timeNaLista) {
              timeNaLista.tecnico = tSalvo.tecnico || '';
              if (timeNaLista.tecnico && timeNaLista.tecnico !== 'SEM_TECNICO' && timeNaLista.tecnico !== 'Neutro') {
                 tecsNoCamp.add(timeNaLista.tecnico);
              }
            }
          });
          this.tecnicosParticipantesIds = Array.from(tecsNoCamp);
        }

        // Mapear grupos
        if (camp.tipo === 'GRUPOS') {
          this.configGrupos.qtdGrupos = camp.grupos?.length || 2;
          this.configGrupos.classificadosPorGrupo = camp.classificadosPorGrupo || 2;
          this.configGrupos.usarRepescagem = camp.usarRepescagem || false;
          this.configGrupos.modoKnockout = camp.modoKnockout || 'PADRAO';
          this.previewGrupos = camp.grupos || [];
          
          if (camp.modoDefinicao === 'MANUAL') {
             this.configGrupos.gruposManuais = (camp.grupos || []).map(g => ({ times: [...g.times] }));
          }
        }

        // Mapear jogos preview (exceto pontos corridos que gera no save)
        if (camp.tipo !== 'PONTOS_CORRIDOS') {
          this.previewJogos = camp.jogos || [];
        }

      } catch (error) {
        console.error("Erro ao carregar para edição:", error);
      } finally {
        this.carregando = false;
      }
    }
    
  }
}
</script>

<style scoped>
.hover-item:hover {
  background-color: #232530;
}
</style>