import { version } from '../../package.json';

const REMOTE_VERSION_URL =
    'https://raw.githubusercontent.com/FabianoDiCorrea/icup-app/master/version.json'; // URL Placeholder

export default {
    async checkVersion() {
        try {
            const response = await fetch(REMOTE_VERSION_URL + '?t=' + new Date().getTime()); // Evitar cache
            if (!response.ok) throw new Error('Falha ao buscar versão remota');

            const data = await response.json();
            const remoteVersion = data.version;
            const localVersion = version;

            return {
                hasUpdate: this.compareVersions(remoteVersion, localVersion) > 0,
                remoteVersion,
                localVersion
            };
        } catch (error) {
            console.error('Erro ao verificar versão:', error);
            return { hasUpdate: false, error };
        }
    },

    compareVersions(v1, v2) {
        if (!v1 || !v2) return 0;

        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;

            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    }
};
