import { useState, useEffect } from "react";
import {
  getAllCampaigns,
  createCampaign,
  updateCampaign as updateCampaignAPI,
  deleteCampaign as deleteCampaignAPI,
  toggleCampaignStatus as toggleCampaignStatusAPI,
} from "../utils/campaignsQueries";

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  leads: string[];
  accountIDs: string[];
}

export default function CampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leads: [""],
    accountIDs: [""],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setIsLoading(true);
        const data = await getAllCampaigns();
        setCampaigns(data);
        setError("");
      } catch (err) {
        setError("Failed to load campaigns");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const toggleCampaignStatus = async (id: string) => {
    try {
      const updatedCampaign = await toggleCampaignStatusAPI(id);
      if (updatedCampaign) {
        setCampaigns(
          campaigns.map((campaign) =>
            campaign._id === id
              ? { ...campaign, status: updatedCampaign.status }
              : campaign
          )
        );
      }
    } catch (err) {
      setError("Failed to update campaign status");
      console.error(err);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const result = await deleteCampaignAPI(id);
      if (result) {
        setCampaigns(campaigns.filter((campaign) => campaign._id !== id));
      }
    } catch (err) {
      setError("Failed to delete campaign");
      console.error(err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
    field?: "leads" | "accountIDs"
  ) => {
    const { name, value } = e.target;

    if (typeof index === "number" && field) {
      const updatedArray = [...formData[field]];
      updatedArray[index] = value;
      setFormData((prev) => ({ ...prev, [field]: updatedArray }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addInputField = (field: "leads" | "accountIDs") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleEditClick = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      description: campaign.description,
      leads: campaign.leads.length > 0 ? [...campaign.leads, ""] : [""],
      accountIDs:
        campaign.accountIDs.length > 0 ? [...campaign.accountIDs, ""] : [""],
    });
    setEditingId(campaign._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      setError("Campaign name and description are required");
      return;
    }

    try {
      const processedData = {
        ...formData,
        leads: formData.leads.filter((lead) => lead.trim()),
        accountIDs: formData.accountIDs.filter((account) => account.trim()),
        status: "active" as const,
      };

      if (editingId) {
        const updatedCampaign = await updateCampaignAPI(
          editingId,
          processedData
        );
        setCampaigns(
          campaigns.map((c) => (c._id === editingId ? updatedCampaign : c))
        );
      } else {
        const newCampaign = await createCampaign(processedData);
        setCampaigns([...campaigns, newCampaign]);
      }

      resetForm();
    } catch (err) {
      setError(
        editingId ? "Failed to update campaign" : "Failed to create campaign"
      );
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", leads: [""], accountIDs: [""] });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Campaign Management 
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-gray-700 bg-gray-100 rounded-md border border-gray-200">
              Error: {error}
            </div>
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Edit Campaign" : "New Campaign"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Lead IDs
                  </label>
                  {formData.leads.map((lead, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={lead}
                        onChange={(e) => handleInputChange(e, index, "leads")}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder={`Lead ID ${index + 1}`}
                      />
                      {index === formData.leads.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addInputField("leads")}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Account IDs
                  </label>
                  {formData.accountIDs.map((account, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={account}
                        onChange={(e) =>
                          handleInputChange(e, index, "accountIDs")
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder={`Account ID ${index + 1}`}
                      />
                      {index === formData.accountIDs.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addInputField("accountIDs")}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md"
                  >
                    {editingId ? "Save Changes" : "Create Campaign"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center p-8 text-gray-500">
                  Loading campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center text-gray-500 py-6 border-t border-gray-200">
                  No campaigns found
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign._id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {campaign.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {campaign.description}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 space-x-3">
                            <span>Leads: {campaign.leads.length}</span>
                            <span>Accounts: {campaign.accountIDs.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              campaign.status === "active"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {campaign.status}
                          </span>
                          <button
                            onClick={() => toggleCampaignStatus(campaign._id)}
                            className={`w-11 h-6 rounded-full relative ${
                              campaign.status === "active"
                                ? "bg-gray-900"
                                : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                campaign.status === "active"
                                  ? "translate-x-5"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleEditClick(campaign)}
                          className="text-xs px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign._id)}
                          className="text-xs px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors"
              >
                Create New Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
