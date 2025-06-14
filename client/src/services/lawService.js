const API_URL = process.env.REACT_APP_API_URL;

export const lawService = {
    getAllLaws: async (type = '', page = 1) => {
        const url = type
            ? `${API_URL}/api/laws?type=${encodeURIComponent(type)}&page=${page}`
            : `${API_URL}/api/laws?page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    },

    searchLaws: async (search, type = '', page = 1) => {
        const url = type
            ? `${API_URL}/api/laws/search?q=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}&page=${page}`
            : `${API_URL}/api/laws/search?q=${encodeURIComponent(search)}&page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    },

    getLawDetail: async (lawNumber) => {
        const res = await fetch(`${API_URL}/api/laws/${encodeURIComponent(lawNumber)}`);
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    }
};
