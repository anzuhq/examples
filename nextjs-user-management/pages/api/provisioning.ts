import type { NextApiRequest, NextApiResponse } from "next";
import {
  IUserManagementEventUserIdentityCreated,
  verifyWebhookRequest,
} from "../../helpers/api/webhook";
import { confirmProvisioning } from "../../helpers/api/provisioning";
import { redis } from "../../helpers/api/redis";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const ANZU_ACCESS_TOKEN = process.env.ANZU_ACCESS_TOKEN;

export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err instanceof Error ? err.message : "something went wrong",
      });
    }
  };
}

export default withErrorHandler(async function handler(
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

  if (!ANZU_ACCESS_TOKEN) {
    throw new Error("Missing Anzu access token");
  }

  let body;
  try {
    body = await verifyWebhookRequest(req, WEBHOOK_SECRET);
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  switch (body.kind) {
    case "ping":
      res.status(200).json({ message: "pong" });
      return;
    case "user_management.user_identity_created": {
      const { payload, scope } =
        body as IUserManagementEventUserIdentityCreated;

      await redis().set(payload.identity.id, payload.identity.email);

      await confirmProvisioning(
        ANZU_ACCESS_TOKEN,
        scope.workspaceId,
        scope.environmentId,
        payload.identity.id
      );

      res.status(200).json({ success: true });
      return;
    }
    default:
      res.status(400).json({ error: "Unhandled kind", kind: body.kind });
      return;
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
