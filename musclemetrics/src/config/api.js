const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (path, options = {}, retries = 1) => {
  try {
    const res = await fetch(`${API}${path}`, options);

    if (!res.ok && retries > 0 && res.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return apiFetch(path, options, retries - 1);
    }

    return res;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return apiFetch(path, options, retries - 1);
    }

    throw error;
  }
};

export default API;