import { Request, Response } from "express";
import Campaign from "../models/campaignModel";
export const getAllCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find({ status: { $ne: "deleted" } });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getCampaignById = async (req: Request, res: Response): Promise<void> => {
  try {
    const foundCampaign = await Campaign.findById(req.params.id);
    if (!foundCampaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }
    res.json(foundCampaign);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCampaign = new Campaign(req.body);
    await newCampaign.save();
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(500).json({ message: "Error creating campaign", error });
  }
};

export const updateCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCampaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }
    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: "Error updating campaign", error });
  }
};

export const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedCampaign = await Campaign.findByIdAndUpdate(req.params.id, { status: "deleted" });
    if (!deletedCampaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting campaign", error });
  }
};

export const toggleCampaignStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingCampaign = await Campaign.findById(req.params.id);
    if (!existingCampaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }
    existingCampaign.status = existingCampaign.status === "active" ? "inactive" : "active";
    await existingCampaign.save();
    res.json({ message: "Campaign status updated", status: existingCampaign.status });
  } catch (error) {
    res.status(500).json({ message: "Error toggling campaign status", error });
  }
};
