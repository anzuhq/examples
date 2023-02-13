import { NextApiRequest } from "next";
import { Readable } from "stream";
import { webhooks } from "@anzuhq/sdk-node";

export interface IUserManagementEventUserIdentityCreated
  extends webhooks.IWebhookDeliveryContent {
  kind: "user_identity_created";
  payload: {
    provisionedWith: string;
    isSecondaryIdentity?: boolean;
    identity: {
      id: string;
      email?: string;
      provider: string;
      name?: string;
      givenName?: string;
      familyName?: string;
      userName?: string;
      avatarUrl?: string;
      phoneNumber?: string;
      primaryIdentity?: string;
    };
    authAttempt: {
      id: string;
      createdAt: string;
      referrer?: string;
      ipAddress?: string;
      userAgent?: string;
      redirectUri?: string;
      acceptedAt?: string;
    } | null;
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
): Promise<webhooks.IWebhookDeliveryContent> {
  const signature = req.headers["anzu-signature"];
  if (!signature) {
    throw new Error("Missing signature");
  }

  if (typeof signature !== "string") {
    throw new Error("Invalid signature");
  }

  const buf = await buffer(req);

  return webhooks.constructEvent(buf, signature, webhookSecret);
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
