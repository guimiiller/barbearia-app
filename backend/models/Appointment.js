import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    barberId: Number,

    services: [
      {
        name: String,
        price: Number,
      },
    ],

    date: String,
    time: String,

    status: {
      type: String,
      enum: ["agendado", "cancelado", "concluido"],
      default: "agendado",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
