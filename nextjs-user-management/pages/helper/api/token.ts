import { verify } from "jsonwebtoken";
const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET;

export interface Token {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
}

/**
 * Validates token signed by Anzu
 * @param token
 * @returns
 */
export function validateToken<Token>(token: string) {
  if (!JWT_SIGNING_SECRET) {
    throw new Error("JWT_SIGNING_SECRET is not set");
  }

  return new Promise<Token>((resolve, reject) => {
    verify(
      token,
      JWT_SIGNING_SECRET,
      {
        // Do not allow token to determine the algorithm, enforce HS256 usage
        algorithms: ["HS256"],
        issuer: "api.anzuhq.com",
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as unknown as Token);
        }
      }
    );
  });
}
