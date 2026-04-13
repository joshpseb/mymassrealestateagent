import { Request, Response } from 'express';
import { AgentProfile } from '../models/AgentProfile.js';

const defaultProfile = {
  name: 'MyMass Real Estate Agent',
  bio: '',
  phone: '',
  email: '',
  licenseNumber: '',
  areasServed: [],
  experience: '',
  profileImageUrl: '',
};

export const getAgentProfile = async (_req: Request, res: Response) => {
  try {
    const profile = await AgentProfile.findOne({ singletonKey: 'agent-profile' });
    res.json(profile || defaultProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent profile' });
  }
};

export const upsertAgentProfile = async (req: Request, res: Response) => {
  try {
    const { name, bio, phone, email, licenseNumber, areasServed, experience, profileImageUrl } = req.body;

    const profile = await AgentProfile.findOneAndUpdate(
      { singletonKey: 'agent-profile' },
      {
        singletonKey: 'agent-profile',
        name,
        bio,
        phone,
        email,
        licenseNumber,
        areasServed,
        experience,
        profileImageUrl,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update agent profile' });
  }
};
