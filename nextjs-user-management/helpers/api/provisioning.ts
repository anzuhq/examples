import { api, userManagement } from "@anzuhq/sdk-node";

/**
 * Updates provisioning status of given user identity to complete
 * @param token
 * @param workspaceId
 * @param environmentId
 * @param userIdentityId
 */
export async function confirmProvisioning(
  token: string,
  workspaceId: string,
  environmentId: string,
  userIdentityId: string
) {
  const client = api.createClient({
    token,
    workspaceId,
    environmentId,
  });

  await userManagement.confirmUserIdentityProvisioning(client, userIdentityId);
}
