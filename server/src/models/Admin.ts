import User from "./User";
import { Schema } from "mongoose";

const Admin = User.discriminator("Admin", new Schema({
  location: { type: String, required: true },
}));

export default Admin;
