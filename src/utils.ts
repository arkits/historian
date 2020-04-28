/**
 * Decodes the HTTP Authorization header
 * @param authHeader - Authorization header as a String
 * @returns [username, password]
 */
function decodeAuthHeader(authHeader: string): string[] {
  let b64auth = (authHeader || "").split(" ")[1] || "";
  let decodedAuthHeader = Buffer.from(b64auth, "base64").toString().split(":");
  return decodedAuthHeader;
}

export { decodeAuthHeader };
