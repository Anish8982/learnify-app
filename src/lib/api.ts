const BASE_URL = 'https://api.freeapi.app/api/v1';

export const apiService = {
  async getCourses(limit = 15) {
    try {
      const res = await fetch(`${BASE_URL}/public/randomproducts?limit=${limit}`);
      const data = await res.json();
      return data.data?.data || data.data || []; // Adjust based on actual response
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getInstructors() {
    try {
      const res = await fetch(`${BASE_URL}/public/randomusers?limit=10`);
      const data = await res.json();
      return data.data?.data || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
};