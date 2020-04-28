const decodeAuthHeader = (authHeader) => {
    // parse login and password from headers
    let b64auth = (authHeader || '').split(' ')[1] || '';
    let decodedAuthHeader = Buffer.from(b64auth, 'base64').toString().split(':');
    return decodedAuthHeader;
};

export { decodeAuthHeader };