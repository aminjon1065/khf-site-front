const DEFAULT_DEDUPLICATION_WINDOW_MS = 60_000;

function rootFailure(error) {
  let current = error;
  let deepestError = error;

  while (
    typeof current === "object" &&
    current !== null &&
    "cause" in current &&
    current.cause !== undefined
  ) {
    current = current.cause;
    deepestError = current;
  }

  if (typeof deepestError === "object" && deepestError !== null) {
    const code = "code" in deepestError ? String(deepestError.code) : undefined;
    const message =
      "message" in deepestError ? String(deepestError.message) : String(deepestError);

    return {
      fingerprint: `${code || "error"}:${message}`,
      code,
      message,
    };
  }

  return {
    fingerprint: String(deepestError),
    code: undefined,
    message: String(deepestError),
  };
}

export function createCmsErrorReporter({
  logger = console.error,
  now = Date.now,
  deduplicationWindowMs = DEFAULT_DEDUPLICATION_WINDOW_MS,
} = {}) {
  let activeFailure;

  return (operation, error) => {
    const failure = rootFailure(error);
    const occurredAt = now();

    if (
      activeFailure?.fingerprint === failure.fingerprint &&
      occurredAt - activeFailure.loggedAt < deduplicationWindowMs
    ) {
      activeFailure.suppressed += 1;

      return;
    }

    const previousSuppressed = activeFailure?.suppressed || 0;
    activeFailure = {
      fingerprint: failure.fingerprint,
      loggedAt: occurredAt,
      suppressed: 0,
    };

    logger("[cms-api:degraded]", {
      operation,
      code: failure.code,
      message: failure.message,
      previous_duplicates_suppressed: previousSuppressed,
      deduplication_window_ms: deduplicationWindowMs,
    });
  };
}

export const reportCmsFailure = createCmsErrorReporter();
