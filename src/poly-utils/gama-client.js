import axios from "axios";
const API_BASE_URL = "https://gamma-api.polymarket.com";

export async function getMarketBySlug(slug) {
  try {
    const response = await axios.get(`${API_BASE_URL}/markets/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching market by slug: ${error}`);
    throw error;
  }
}

export async function getEventBySlug(slug) {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event by slug: ${error}`);
    throw error;
  }
}
