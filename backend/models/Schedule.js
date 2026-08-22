import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    barberId: {
      type: Number,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    slots: [
      {
        time: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Schedule", scheduleSchema);
