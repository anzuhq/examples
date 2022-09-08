import type { NextPage } from "next";
import Head from "next/head";
import { Attribution } from "./helper/attribution";
import { BrowserOnly } from "./helper/browser";
import { useLoadIdentity } from "./helper/identity";
import { useStoreToken } from "./helper/token";

const Home: NextPage = () => {
  return (
    <BrowserOnly>
      <PageContent />
    </BrowserOnly>
  );
};

export function PageContent() {
  const { token, setToken } = useStoreToken();
  const { email } = useLoadIdentity(token);

  return (
    <div>
      <Head>
        <title>Anzu User Management for Next.js</title>
      </Head>
      <div className="grid place-items-center w-screen h-screen">
        <div className="w-96 p-4 flex flex-col space-y-4 border border-gray-100 rounded">
          {token ? (
            <SignedInPage email={email} setToken={setToken} />
          ) : (
            <SignInPage />
          )}
        </div>

        <Attribution />
      </div>
    </div>
  );
}

/**
 * Page shown for unauthenticated users
 */
export function SignInPage() {
  const redirectTo = `${process.env.NEXT_PUBLIC_HOSTED_AUTH_PAGE_URL}?redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}`;

  return (
    <>
      <h2 className="text-xl font-semibold">Welcome back!</h2>

      <p className="text-sm text-gray-800">Click Sign in below to continue.</p>

      <a
        className="block text-center w-full bg-gray-50 rounded hover:bg-gray-100 active:bg-gray-200 p-2 text-sm font-semibold"
        href={redirectTo}
      >
        Sign in
      </a>
    </>
  );
}

/**
 * Page shown for authenticated users
 * @param
 * @returns
 */
export function SignedInPage({
  email,
  setToken,
}: {
  email: string | null;
  setToken: (token: string | null) => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold">Signed in as</h2>
      <pre className="font-mono">{email || "<loading>"}</pre>

      <button
        className="w-full bg-gray-50 rounded hover:bg-gray-100 active:bg-gray-200 p-2 text-sm font-semibold"
        onClick={() => {
          setToken(null);
        }}
      >
        Sign out
      </button>
    </>
  );
}

export default Home;
