// Decodes the payload of a JWT without verifying its signature. Safe here
// because we're only reading a claim (applicantId) from a token our own
// backend just issued to us seconds earlier over HTTPS — we are not
// trusting an externally-supplied token, just reading back what we sent.
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}