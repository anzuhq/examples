/**
 * Updates provisioning status of given user identity to complete
 * @param endpoint
 * @param token
 * @param teamId
 * @param projectId
 * @param environmentId
 * @param userIdentityId
 */
export async function confirmProvisioning(
  endpoint: string,
  token: string,
  teamId: string,
  projectId: string,
  environmentId: string,
  userIdentityId: string
) {
  const resp = await fetch(
    `${endpoint}/teams/${teamId}/projects/${projectId}/environments/${environmentId}/blocks/user_management/user_identities/${userIdentityId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provisioning_status: "complete",
      }),
    }
  );
  if (!resp.ok) {
    throw new Error(`Failed to confirm provisioning: ${await resp.text()}`);
  }
}
