import { Api, type Payment } from "@saitamafun/sdk";

import { getEnv } from "../env";
import Provider from "../providers";
import PaymentModal from "../components/payments";
import { MdLink } from "react-icons/md";

export default async function PaymentPage({
  searchParams,
}: PageProps<null, { paymentLink?: string; payment: string }>) {
  const search = await searchParams;

  if (search && search.paymentLink) {
    const appId = getEnv("APP_ID");
    const apiKey = getEnv("API_KEY");
    const apiBaseURL = getEnv("API_BASE_URL");

    const api = new Api(apiBaseURL, apiKey, appId);
    const [networks, paymentLink] = await Promise.all([
      api.network.list().then(({ data }) => data),
      api.paymentLink
        .retrieve((await searchParams).paymentLink)
        .then(({ data }) => data),
    ]);

    let payment: Payment | null = null;

    if (search.payment)
      payment = await api.payment
        .retrieve(search.payment)
        .then(({ data }) => data);

    return (
      <Provider
        appId={appId}
        apiKey={apiKey}
        payment={payment}
        networks={networks}
        baseURL={apiBaseURL}
        paymentLink={paymentLink}
      >
        <PaymentModal />
      </Provider>
    );
  }

  return (
    <div className="m-auto max-w-sm flex-1 flex flex-col items-center justify-center text-center space-y-4">
      <div className="p-4 bg-red-100 rounded-full">
        <MdLink className="text-red-500 text-2xl" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg">Invalid payment link</h1>
        <p className="text-sm text-black/75 dark:text-white/75">
          This payment link is either invalid or has expired. Please
          double-check to ensure it has the correct query params.
        </p>
      </div>
    </div>
  );
}
