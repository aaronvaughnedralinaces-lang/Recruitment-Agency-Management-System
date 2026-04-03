const splitName = (fullName) => {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    return { first_name: first, last_name: last };
};

module.exports = { splitName };