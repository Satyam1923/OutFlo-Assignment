import axios from "axios";
const BACKEND_URL = "http://localhost:5000/campaigns";

export const getAllCampaigns = async () => {
  try {
    const response = await axios.get(BACKEND_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
};


export const getCampaignById = async (id: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
};


export const createCampaign = async (campaignData: { name: string; description: string; status: "active" | "inactive" }) => {
  try {
    const response = await axios.post(BACKEND_URL, campaignData);
    return response.data;
  } catch (error) {
    console.error("Error creating campaign:", error);
    return null;
  }
};


export const updateCampaign = async (id: string, updateData: Partial<{ name: string; description: string; status: "active" | "inactive" }>) => {
  try {
    const response = await axios.put(`${BACKEND_URL}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating campaign:", error);
    return null;
  }
};


export const deleteCampaign = async (id: string) => {
  try {
    const response = await axios.delete(`http://localhost:5000/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return null;
  }
};
  

export const toggleCampaignStatus = async (_id: string) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}/${_id}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling campaign status:", error);
    return null;
  }
};
