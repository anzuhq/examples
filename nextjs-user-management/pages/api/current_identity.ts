import { NextApiRequest, NextApiResponse } from "next";
import { redis } from "../../helpers/api/redis";
import { validateToken } from "../../helpers/api/token";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authToken = req.headers["authorization"];
  if (!authToken) {
    return res.json({ error: "No authorization header" });
  }

  const token = authToken.split(" ")[1];

  const { sub } = await validateToken<{ sub: string }>(token);

  const email = await redis().get(sub);
  res.json({ email });
}
