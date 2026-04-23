import DbService from './DbService';
import pako from 'pako';

const SYNC_REPO_NAME = 'icup-cloud-sync';
const DATA_FILENAME = 'backup.json.gz';
const MAX_CHUNK_SIZE = 15 * 1024 * 1024; // 15MB fragmentação de chunks para a API do Github

export const cloudSyncService = {
    /**
     * Valida o token e retorna os dados do usuário do GitHub
     */
    async authenticate(token) {
        if (!token) throw new Error("Token não fornecido.");
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error("Token Inválido ou sem permissão de acesso repo/user.");
        }
        return await response.json();
    },

    /**
     * Tenta encontrar ou criar o repositório de sincronização
     */
    async getOrCreateRepo(token) {
        const user = await this.authenticate(token);
        const repoUrl = `https://api.github.com/repos/${user.login}/${SYNC_REPO_NAME}`;

        const checkRes = await fetch(repoUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (checkRes.ok) return await checkRes.json();

        // Se não existe, cria um privado
        const createRes = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: SYNC_REPO_NAME,
                description: '[iCup] Sincronização em Nuvem do Backup',
                private: true,
                auto_init: true
            })
        });

        if (!createRes.ok) {
            throw new Error("Não foi possível criar o repositório de sincronização. Verifique se o seu Token tem a permissão 'repo'.");
        }

        return await createRes.json();
    },

    /**
     * Faz upload dos dados para o Repositório
     */
    async uploadData(token) {
        if (!token) throw new Error("Você precisa configurar seu Token do GitHub com permissão 'repo'.");

        const repo = await this.getOrCreateRepo(token);
        
        // Pega todo o backup em JSON do IndexedDB
        const exportDataString = await DbService.exportarBackup();

        // Em vez de processar uma string inteira e dar erro de RAM, vamos quebrar em fatias (chunks)
        // 10 Milhões de caracteres (~10MB) por arquivo/fatia antes da compressão
        const CHUNK_SIZE = 10 * 1024 * 1024;
        const treeEntries = [];

        let chunkIndex = 0;
        for (let i = 0; i < exportDataString.length; i += CHUNK_SIZE) {
            const chunkString = exportDataString.slice(i, i + CHUNK_SIZE);
            
            // Compactar somente o chunk isolado
            const dataCompressed = pako.gzip(chunkString);
            const dataBase64 = await arrayBufferToBase64Async(dataCompressed);

            treeEntries.push({
                path: `backup_part_${chunkIndex}.txt.gz`,
                mode: '100644',
                type: 'blob',
                contentBase64: dataBase64
            });
            chunkIndex++;
        }

        // Criar BLOBS no GitHub para cada arquivo
        for (const entry of treeEntries) {
            const blobRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: entry.contentBase64,
                    encoding: 'base64'
                })
            });
            if (!blobRes.ok) throw new Error(`Erro ao criar blob para ${entry.path}`);
            const bData = await blobRes.json();
            entry.sha = bData.sha;
            delete entry.contentBase64;
        }

        // Fluxo Git Data: Tree -> Commit -> Ref
        const branchRes = await fetch(`https://api.github.com/repos/${repo.full_name}/branches/main`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!branchRes.ok) throw new Error("Erro ao localizar branch principal.");
        const branchData = await branchRes.json();
        const lastCommitSha = branchData.commit.sha;

        const treeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/trees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tree: treeEntries 
            })
        });
        if (!treeRes.ok) throw new Error("Erro ao criar árvore de arquivos.");
        const treeData = await treeRes.json();

        const commitRes = await fetch(`https://api.github.com/repos/${repo.full_name}/git/commits`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `iCup Cloud Sync: Backup de dados`,
                tree: treeData.sha,
                parents: [lastCommitSha]
            })
        });
        const commitData = await commitRes.json();

        await fetch(`https://api.github.com/repos/${repo.full_name}/git/refs/heads/main`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sha: commitData.sha })
        });

        return true;
    },

    /**
     * Baixa os dados da nuvem e restaura
     */
    async downloadData(token) {
        if (!token) throw new Error("Token não configurado.");
        const user = await this.authenticate(token);
        const repoFull = `${user.login}/${SYNC_REPO_NAME}`;

        // Obter a Tree mais recente
        const branchRes = await fetch(`https://api.github.com/repos/${repoFull}/branches/main`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!branchRes.ok) throw new Error("Nenhum backup encontrado na nuvem para este token.");
        const branchData = await branchRes.json();
        const treeSha = branchData.commit.commit.tree.sha;

        const treeRes = await fetch(`https://api.github.com/repos/${repoFull}/git/trees/${treeSha}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const treeData = await treeRes.json();

        // Achar todos os blobs que sejam pedaços do backup
        const fileNodes = treeData.tree.filter(f => f.path.startsWith('backup_part_'));
        
        if (fileNodes.length === 0) {
            // Tenta achar o modelo antigo por segurança
            const oldFileNode = treeData.tree.find(f => f.path === DATA_FILENAME);
            if (oldFileNode) fileNodes.push(oldFileNode);
            else throw new Error("Arquivos de backup não encontrados no repositório.");
        }

        // Garante que a ordem será a correta (0, 1, 2, 3...)
        fileNodes.sort((a, b) => {
            const numA = parseInt(a.path.replace('backup_part_', '').replace('.txt.gz', '')) || 0;
            const numB = parseInt(b.path.replace('backup_part_', '').replace('.txt.gz', '')) || 0;
            return numA - numB;
        });

        let fullJsonString = '';

        // Baixar, descompactar e colar cada fatia na ordem
        for (const fileNode of fileNodes) {
            const blobRes = await fetch(`https://api.github.com/repos/${repoFull}/git/blobs/${fileNode.sha}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            });
            
            const arrayBuffer = await blobRes.arrayBuffer();
            const decompressedChunk = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
            fullJsonString += decompressedChunk;
        }
        
        // Passar a string JSON completa descompactada para o DbService
        await DbService.importarBackup(fullJsonString, 'SUBSTITUIR');
        
        return true;
    }
};

// Função auxiliar assíncrona para conversão Base64 amigável à memória
// Evita "Out of Memory" do navegador processando via FileReader (C++ nativo)
function arrayBufferToBase64Async(buffer) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(blob);
    });
}
