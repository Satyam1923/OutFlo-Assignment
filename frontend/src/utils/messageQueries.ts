import axios from "axios";


export const getPersonalizedMessage = async (data: {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}) => {
  try {
    const response = await axios.post("http://localhost:5000/personalized-message", {
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