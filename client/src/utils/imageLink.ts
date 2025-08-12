export const getImageUrl = (path: string) => {
    if (!path) return;

    try {
        new URL(path);
        return path;
    }
    catch (err) {
        const base = import.meta.env.VITE_SERVER_HOST.replace(/\/+$/, '');
        const normalizedPath = path.replace(/^\/+/, '');
        return new URL(normalizedPath, base).toString();
    }
}