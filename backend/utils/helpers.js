function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function paginate(array, page = 1, limit = 20) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.total = array.length;
    results.totalPages = Math.ceil(array.length / limit);
    results.currentPage = page;
    results.limit = limit;
    if (endIndex < array.length) results.nextPage = page + 1;
    if (startIndex > 0) results.prevPage = page - 1;
    results.data = array.slice(startIndex, endIndex);
    return results;
}

function filterBySearch(array, query, fields) {
    if (!query) return array;
    const q = query.toLowerCase();
    return array.filter(item =>
        fields.some(field => item[field] && String(item[field]).toLowerCase().includes(q))
    );
}

module.exports = { formatRupiah, paginate, filterBySearch };
