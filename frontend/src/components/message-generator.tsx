"use client";

import React, { useState } from "react";
import { getPersonalizedMessage } from "../utils/messageQueries";

interface FormData {
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  summary: string;
}

export default function Dashboard() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    jobTitle: "",
    company: "",
    location: "",
    summary: "",
  });

  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const message = await getPersonalizedMessage({
        name: formData.name,
        job_title: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        summary: formData.summary,
      });

      setGeneratedMessage(message);
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate message"
      );
      setGeneratedMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      jobTitle: "",
      company: "",
      location: "",
      summary: "",
    });
    setGeneratedMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              LinkedIn Message Generator
            </h1>
          </div>

          {!generatedMessage ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Recipient's name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="Job position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Professional summary"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-md font-medium text-white ${
                  isLoading ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"
                } transition-colors`}
              >
                {isLoading ? "Generating..." : "Generate Message"}
              </button>

              {error && (
                <div className="p-3 text-sm text-gray-700 bg-gray-100 rounded-md border border-gray-200">
                  Error: {error}
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Generated Message
                </h3>
                <div className="prose whitespace-pre-wrap text-gray-800">
                  {generatedMessage}
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors"
              >
                Generate New Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
