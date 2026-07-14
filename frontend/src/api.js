const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore non-JSON error body
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/auth/me", { token }),
  listQuestions: (token) => request("/questions", { token }),
  adminListQuestions: (token) => request("/admin/questions", { token }),
  adminCreateQuestion: (token, question) =>
    request("/admin/questions", { method: "POST", body: question, token }),
  adminDeleteQuestion: (token, id) =>
    request(`/admin/questions/${id}`, { method: "DELETE", token }),
  submitAttempt: (token, answers) =>
    request("/attempts/submit", { method: "POST", body: { answers }, token }),
};
