const DEFAULT_API_URL = "http://127.0.0.1:8848/api/v1";
const DEFAULT_TIMEOUT_MS = 5_000;
const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 60_000;

export class CmsReadinessError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = "CmsReadinessError";
    this.code = code;
  }
}

export function cmsApiUrl(environment = process.env) {
  return environment.API_URL || environment.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

export function cmsReadinessUrl(apiUrl = cmsApiUrl()) {
  return `${apiUrl.replace(/\/+$/, "")}/ready`;
}

export function cmsReadinessTimeout(environment = process.env) {
  const configured = environment.CMS_READINESS_TIMEOUT_MS;
  if (configured === undefined || configured === "") {
    return DEFAULT_TIMEOUT_MS;
  }

  const timeoutMs = Number(configured);
  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs < MIN_TIMEOUT_MS ||
    timeoutMs > MAX_TIMEOUT_MS
  ) {
    throw new CmsReadinessError(
      "invalid_timeout",
      `CMS_READINESS_TIMEOUT_MS must be an integer between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}.`,
    );
  }

  return timeoutMs;
}

export function cmsBuildMode(environment = process.env) {
  const mode = environment.CMS_BUILD_MODE || "production";
  if (mode !== "production" && mode !== "preview") {
    throw new CmsReadinessError(
      "invalid_build_mode",
      'CMS_BUILD_MODE must be either "production" or "preview".',
    );
  }

  return mode;
}

export function cmsDiagnosticEnabled(environment = process.env) {
  return environment.NODE_ENV === "development" || cmsBuildMode(environment) === "preview";
}

function hasReadyContract(payload) {
  return (
    typeof payload === "object" &&
    payload !== null &&
    payload.status === "ready" &&
    typeof payload.checks === "object" &&
    payload.checks !== null &&
    payload.checks.database === true &&
    payload.checks.storage === true &&
    payload.checks.scheduler === true
  );
}

function failureMessage(code, readinessUrl, detail) {
  return `[cms-readiness:${code}] ${readinessUrl} ${detail}`;
}

export async function checkCmsReadiness({
  apiUrl = cmsApiUrl(),
  timeoutMs = cmsReadinessTimeout(),
  fetchImpl = globalThis.fetch,
} = {}) {
  const readinessUrl = cmsReadinessUrl(apiUrl);
  const startedAt = performance.now();
  let response;

  try {
    response = await fetchImpl(readinessUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    const code = isTimeout ? "timeout" : "unavailable";
    const detail = isTimeout
      ? `did not respond within ${timeoutMs}ms.`
      : "is unavailable.";

    throw new CmsReadinessError(code, failureMessage(code, readinessUrl, detail), {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new CmsReadinessError(
      "http_status",
      failureMessage(
        "http_status",
        readinessUrl,
        `returned HTTP ${response.status}; a ready CMS must return HTTP 200.`,
      ),
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new CmsReadinessError(
      "invalid_json",
      failureMessage("invalid_json", readinessUrl, "did not return valid JSON."),
      { cause: error },
    );
  }

  if (!hasReadyContract(payload)) {
    throw new CmsReadinessError(
      "invalid_contract",
      failureMessage(
        "invalid_contract",
        readinessUrl,
        'must return status "ready" and true database/storage/scheduler checks.',
      ),
    );
  }

  return {
    url: readinessUrl,
    durationMs: Math.round(performance.now() - startedAt),
  };
}

export async function assertCmsReady(options) {
  const result = await checkCmsReadiness(options);
  console.info(`[cms-readiness:ready] ${result.url} (${result.durationMs}ms)`);

  return result;
}
