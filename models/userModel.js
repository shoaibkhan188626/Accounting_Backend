import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resetPasswordToken: String,
  expiredToken: Date,
});

const User = mongoose.model("User", userSchema);

export default User;
