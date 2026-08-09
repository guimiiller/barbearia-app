import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  date: String,

  slots: [
    {
      time: String,
    },
  ],
});

export default mongoose.model("Schedule", scheduleSchema);
