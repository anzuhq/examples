import { createHmac } from "crypto";
import { NextApiRequest } from "next";
import { Readable } from "stream";

export interface UserIdentityCreatedWebhookPayload {
  webhookId: string;
  version: "2022.8";
  createdAt: string;
  id: string;
  payload: {
    provisionedWith: string;
    authAttempt: {
      id: string;
      createdAt: string;
      acceptedAt: string;
      ipAddress: string | null;
      redirectUri: string | null;
      userAgent: string | null;
    };
    identity: {
      id: string;
      email: string;
      provider: string;
    };
  };
  kind: "blocks.user_management.user_identity_created";
  scope: {
    projectId: string;
    teamId: string;
    environmentId: string;
  };
}

/**
 * Verify incoming webhook request
 * @param req
 * @param webhookSecret secret found on webhook details page
 * @returns
 */
export async function verifyWebhookRequest(
  req: NextApiRequest,
  webhookSecret: string
) {
  const signature = req.headers["anzu-signature"];
  if (!signature) {
    throw new Error("Missing signature");
  }

  if (typeof signature !== "string") {
    throw new Error("Invalid signature");
  }

  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");

  validateSignature(signature, rawBody, webhookSecret);

  try {
    const parsed = JSON.parse(rawBody);
    return parsed;
  } catch (err) {
    throw new Error("Invalid JSON body");
  }
}

/**
 * Read body of incoming request as buffer
 * @param readable
 * @returns
 */
async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Validates signature with request body and secret
 *
 * Uses timestamp and sig from signature value
 *
 * @param signature full signature header including ts, alg, and sig
 * @param requestBody
 * @param secret
 */
function validateSignature(
  signature: string,
  requestBody: string,
  secret: string
) {
  const params = new URLSearchParams(signature);

  const ts = params.get("ts");
  const alg = params.get("alg");
  const sig = params.get("sig");

  if (!ts || !alg || !sig) {
    throw new Error("Invalid signature");
  }

  const expectedSig = getHmac(secret, ts, requestBody);

  if (sig !== expectedSig) {
    throw new Error("Invalid signature");
  }
}

function getHmac(secret: string, ts: string, requestBody: string) {
  const hmac = createHmac("sha256", secret);

  const signedPayload = `${ts}.${requestBody}`;
  hmac.update(signedPayload);

  return hmac.digest("hex");
}
