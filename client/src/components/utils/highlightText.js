export const highlightText = (text, keyword) => {
    if (!keyword) return text;
    const words = keyword.trim().split(/\s+/);
    const pattern = words.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('[\\s\u00A0]+');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};