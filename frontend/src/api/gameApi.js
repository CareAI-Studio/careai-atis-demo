const API_BASE_URL = "http://localhost:3001";
const REQUEST_TIMEOUT_MS = 700;

export async function requestBackendSpin({ bet }) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/game/spin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bet,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Backend spin request failed.");
    }

    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}