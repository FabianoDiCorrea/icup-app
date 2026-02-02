<template>
  <div class="container mt-4 mb-5">

    <div class="card bg-dark text-white border-secondary shadow-sm">
      <div class="card-body">

        <h5 class="text-primary border-bottom border-secondary pb-2 mb-4">
          CADASTRO DE TÉCNICOS
        </h5>

        <!-- CADASTRAR NOVO -->
        <h6 class="text-success mb-3">
          CADASTRAR NOVO TÉCNICO
        </h6>

        <div class="row mb-4 align-items-end">
          <div class="col-md-6">
            <label class="form-label text-white-50">Nome do Técnico</label>
            <input
              v-model="novo.nome"
              type="text"
              class="form-control bg-secondary text-white border-secondary"
              placeholder="Ex: Fabiano"
            />
          </div>

          <div class="col-md-3">
            <label class="form-label text-white-50">Apelido</label>
            <input
              v-model="novo.apelido"
              type="text"
              maxlength="5"
              class="form-control bg-secondary text-white border-secondary"
              placeholder="Ex: FAB"
            />
          </div>

          <div class="col-md-3">
            <button
              class="btn btn-success w-100 fw-bold"
              @click="adicionar"
            >
              SALVAR
            </button>
          </div>
        </div>

        <!-- LISTA -->
        <h6 class="text-primary border-top border-secondary pt-3 mb-3">
          TÉCNICOS CADASTRADOS
        </h6>

        <div v-if="tecnicos.length === 0" class="text-muted small">
          Nenhum técnico cadastrado.
        </div>

        <div
          v-for="(t, index) in tecnicos"
          :key="index"
          class="bg-secondary bg-opacity-50 p-2 mb-2 rounded d-flex justify-content-between align-items-center"
        >
          <span>
            {{ t.nome }} <strong>- {{ t.apelido }}</strong>
          </span>

          <button
            class="btn btn-sm btn-danger fw-bold"
            @click="remover(index)"
          >
            Excluir
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "Tecnicos",

  data() {
    return {
      tecnicos: [],
      novo: {
        nome: "",
        apelido: ""
      }
    };
  },

  mounted() {
    const salvos = localStorage.getItem("tecnicos");
    this.tecnicos = salvos ? JSON.parse(salvos) : [];
  },

  methods: {
    salvar() {
      localStorage.setItem("tecnicos", JSON.stringify(this.tecnicos));
    },

    adicionar() {
      if (!this.novo.nome.trim() || !this.novo.apelido.trim()) return;

      this.tecnicos.push({
        nome: this.novo.nome.trim(),
        apelido: this.novo.apelido.trim().toUpperCase()
      });

      this.novo.nome = "";
      this.novo.apelido = "";
      this.salvar();
    },

    remover(index) {
      this.tecnicos.splice(index, 1);
      this.salvar();
    }
  }
};
</script>
