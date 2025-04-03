import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const BACKEND_URL = `${API_BASE_URL}/personalized-message`;


export const getPersonalizedMessage = async (data: {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}) => {
  try {
    const response = await axios.post(BACKEND_URL, {
      name: data.name,
      job_title: data.job_title,
      company: data.company,
      location: data.location,
      summary: data.summary
    });
    
    return response.data.message;
  } catch (err) {
    console.error("Error in personalised message:", err);
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Failed to generate message");
    }
    throw new Error("Failed to generate message");
  }
};