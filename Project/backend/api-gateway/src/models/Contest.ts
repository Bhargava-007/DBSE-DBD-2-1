import mongoose, { Document, Schema, Types } from 'mongoose';

export type ContestStatus = 'upcoming' | 'live' | 'ended';

export interface IContest extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  problemIds: Types.ObjectId[];
  registeredUserIds: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  status: ContestStatus;
  scoringMode?: string;
  bannerBadge?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new Schema<IContest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 90,
    },
    problemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
      },
    ],
    registeredUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended'],
      default: 'upcoming',
      index: true,
    },
    scoringMode: {
      type: String,
      default: 'ICPC',
    },
    bannerBadge: {
      type: String,
      default: 'Rated',
    },
  },
  {
    timestamps: true,
  }
);

// Method to compute dynamic status based on time
ContestSchema.methods.updateStatusFromTime = function () {
  const now = new Date();
  if (now < this.startTime) {
    this.status = 'upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'live';
  } else {
    this.status = 'ended';
  }
};

// Compound & Performance Indexes
ContestSchema.index({ status: 1, startTime: 1 });
ContestSchema.index({ startTime: 1, endTime: 1 });

export const Contest = mongoose.model<IContest>('Contest', ContestSchema);
