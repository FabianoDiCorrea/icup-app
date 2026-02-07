/**
 * Converte um objeto File em uma string Base64.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};
