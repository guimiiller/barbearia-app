import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nome é obrigatório"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Preço é obrigatório"],
    min: [0, "Preço não pode ser negativo"],
  },
});

export default mongoose.model("Service", serviceSchema);
