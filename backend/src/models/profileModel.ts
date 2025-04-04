import { Schema, model, Document } from 'mongoose';


interface IProfile extends Document {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    job_title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true
    }
  },
  {
    timestamps: true 
  }
);

const Profile = model<IProfile>('Profile', profileSchema);
export default Profile;