import { Emails } from "./emails/emails";
import { isThunderMailErrorResponse } from "./error";
import { ErrorResponse, GetOptions, PostOptions } from "./interfaces";

const defaultBaseUrl = "https://thundermail.thepradipvc.com/api/v1";
const baseUrl =
  typeof process !== "undefined" && process.env
    ? process.env.THUNDERMAIL_BASE_URL || defaultBaseUrl
    : defaultBaseUrl;

export class ThunderMail {
  private readonly headers: Headers;
  readonly emails = new Emails(this);

  constructor(private readonly key?: string) {
    if (!key) {
      if (typeof process !== "undefined" && process.env) {
        this.key = process.env.THUNDERMAIL_API_KEY;
      }

      if (!this.key) {
        throw new Error(
          'Missing API key. Pass it to the constructor `new ThunderMail("tim_123")`'
        );
      }
    }

    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "Content-Type": "application/json",
    });
  }

  private async fetchRequest<T>(
    path: string,
    options = {}
  ): Promise<{ data: T | null; error: ErrorResponse | null }> {
    const response = await fetch(`${baseUrl}${path}`, options);

    if (!response.ok) {
      let error: ErrorResponse = {
        message: response.statusText,
        name: "application_error",
      };

      try {
        error = await response.json();
        if (isThunderMailErrorResponse(error)) {
          return { data: null, error };
        }

        return { data: null, error };
      } catch (err) {
        if (err instanceof Error) {
          return { data: null, error: { ...error, message: err.message } };
        }

        return { data: null, error };
      }
    }

    const data = await response.json();
    return { data, error: null };
  }

  async post<T>(path: string, entity?: unknown, options: PostOptions = {}) {
    const requestOptions = {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(entity),
      ...options,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }

  async get<T>(path: string, options: GetOptions = {}) {
    const requestOptions = {
      method: "GET",
      headers: this.headers,
      ...options,
    };

    return this.fetchRequest<T>(path, requestOptions);
  }
}
