// src/api/gameApi.js

const SPIN_ENDPOINT = "/api/game/spin";
const REQUEST_TIMEOUT_MS = 700;

export async function requestBackendSpin({ bet }) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(SPIN_ENDPOINT, {
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