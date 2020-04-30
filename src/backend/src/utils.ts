/**
 * Decodes the HTTP Authorization header
 * @param authHeader - Authorization header as a String
 * @returns [username, password]
 */
function decodeAuthHeader(authHeader: string): string[] {
    let b64auth = (authHeader || '').split(' ')[1] || '';
    let decodedAuthHeader = Buffer.from(b64auth, 'base64').toString().split(':');
    return decodedAuthHeader;
}

/**
 * Decodes the HTTP Authorization header
 */
function createBasicAuthHeader(username, password) {
    var encodedCreds = Buffer.from(username + ':' + password).toString('base64');
    var basicAuthHeader = 'Basic ' + encodedCreds;
    return basicAuthHeader;
}

export { decodeAuthHeader, createBasicAuthHeader };
