import mongoose from 'mongoose';

const AgentProfileSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: 'agent-profile' },
    name: { type: String, required: true, default: 'Your Name' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    areasServed: { type: [String], default: [] },
    experience: { type: String, default: '' },
    profileImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AgentProfile = mongoose.model('AgentProfile', AgentProfileSchema);
