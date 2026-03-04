import User from "./User";
import { Schema } from "mongoose";

const Patient = User.discriminator("Patient", new Schema({
  age: { type: Number, required: true, min: 0, max: 120 },
}));

export default Patient;
