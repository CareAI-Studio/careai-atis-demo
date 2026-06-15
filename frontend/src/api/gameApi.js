const API_BASE_URL = "http://localhost:3001";

export async function requestBackendSpin({ bet }) {
  const response = await fetch(`${API_BASE_URL}/api/game/spin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bet,
    }),
  });

  if (!response.ok) {
    throw new Error("Backend spin request failed.");
  }

  return response.json();
}