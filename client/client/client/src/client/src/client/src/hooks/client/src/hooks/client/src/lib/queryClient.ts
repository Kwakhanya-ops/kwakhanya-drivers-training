import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any
) {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }

  return response;
}

export function getQueryFn({ on401 }: { on401?: "returnNull" } = {}) {
  return async ({ queryKey }: { queryKey: any[] }) => {
    const url = queryKey[0];
    try {
      const response = await apiRequest("GET", url);
      return await response.json();
    } catch (error: any) {
      if (error.message.includes("401") && on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
}
