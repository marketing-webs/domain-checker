/**
 * Przetwarza elementy w partiach (batches), wykonując dla każdego elementu asynchroniczną funkcję.
 *
 * @param {Array} items - Tablica elementów do przetworzenia.
 * @param {Function} asyncFn - Funkcja asynchroniczna wywoływana dla każdego elementu.
 * @param {number} batchSize - Liczba elementów przetwarzanych jednocześnie (domyślnie 50).
 * @param {Function} [onBatchComplete] - Opcjonalna funkcja wywoływana po zakończeniu każdej partii.
 */
const processInBatches = async (items, asyncFn, batchSize = 50, onBatchComplete) => {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const promises = batch.map(item => asyncFn(item, i));

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        if (onBatchComplete) {
            onBatchComplete(i + batch.length, items.length);
        }
    }
    return results;
};

module.exports = { processInBatches };
