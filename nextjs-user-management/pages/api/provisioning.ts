// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  UserIdentityCreatedWebhookPayload,
  verifyWebhookRequest,
} from "../../helpers/api/webhook";
import { confirmProvisioning } from "../../helpers/api/provisioning";
import { redis } from "../../helpers/api/redis";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const ANZU_API_ENDPOINT = process.env.ANZU_API_ENDPOINT;
const ANZU_ACCESS_TOKEN = process.env.ANZU_ACCESS_TOKEN;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing webhook secret");
  }

  if (!ANZU_API_ENDPOINT) {
    throw new Error("Missing Anzu API endpoint");
  }

  if (!ANZU_ACCESS_TOKEN) {
    throw new Error("Missing Anzu access token");
  }

  let body;
  try {
    body = await verifyWebhookRequest(req, WEBHOOK_SECRET);
  } catch (err) {
    console.log({ err });
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  switch (body.kind) {
    case "ping":
      res.status(200).json({ message: "pong" });
      break;
    case "blocks.user_management.user_identity_created": {
      const { payload, scope } = body as UserIdentityCreatedWebhookPayload;

      await redis().set(payload.identity.id, payload.identity.email);

      await confirmProvisioning(
        ANZU_API_ENDPOINT,
        ANZU_ACCESS_TOKEN,
        scope.teamId,
        scope.projectId,
        scope.environmentId,
        payload.identity.id
      );
    }
  }

  res.status(200).json({ success: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
