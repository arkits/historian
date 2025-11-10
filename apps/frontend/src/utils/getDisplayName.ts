export function getDisplayName(user?: any): string | undefined {
    if (!user) return undefined;

    // Prefer explicit username, then name, then email local-part
    if (user.username) return user.username;
    if (user.name) return user.name;
    if (user.email) return String(user.email).split('@')[0];

    return undefined;
}

export default getDisplayName;
