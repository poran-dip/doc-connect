import User from "./User";
import { Schema } from "mongoose";

const Doctor = User.discriminator("Doctor", new Schema({
  specialization: { type: String, required: true },
  status: { type: String, enum: ["available", "busy", "dnd"], default: "available" },
}));

export default Doctor;
