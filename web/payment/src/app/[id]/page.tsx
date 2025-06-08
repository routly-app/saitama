import { Api, type Payment } from "@saitamafun/sdk";

import { getEnv } from "../../env";
import Provider from "../../providers";
import PaymentModal from "../../components/payments";

export default async function PaymentPage({
  params,
  searchParams,
}: PageProps<{ id: string }, { payment: string }>) {
  const { id } = await params;
  const search = await searchParams;

  const appId = getEnv("APP_ID");
  const apiKey = getEnv("API_KEY");
  const apiBaseURL = getEnv("API_BASE_URL");

  const api = new Api(apiBaseURL, apiKey, appId);
  const [networks, paymentLink] = await Promise.all([
    api.network.list().then(({ data }) => data),
    api.paymentLink.retrieve(id).then(({ data }) => data),
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
