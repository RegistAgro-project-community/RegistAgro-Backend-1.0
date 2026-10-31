export interface EmailDeliverabilityValidator {
  isDeliverable(email: string): Promise<boolean>;
}

interface ReputationResponse {
  email_deliverability?: { status?: string; status_detail?: string };
}

export class AbstractApiEmailValidator implements EmailDeliverabilityValidator {
  constructor(
    private readonly apiKey = process.env.EMAIL_KEY,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async isDeliverable(email: string): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const url = new URL("https://emailreputation.abstractapi.com/v1/");
      url.searchParams.set("api_key", this.apiKey);
      url.searchParams.set("email", email);
      const response = await this.fetcher(url, { redirect: "error", signal: AbortSignal.timeout(4000) });
      if (!response.ok) return false;
      const result = await response.json() as ReputationResponse;
      return result.email_deliverability?.status === "deliverable"
        && result.email_deliverability.status_detail !== "invalid_mailbox";
    } catch {
      return false;
    }
  }
}
