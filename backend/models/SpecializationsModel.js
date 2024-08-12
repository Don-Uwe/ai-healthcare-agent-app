const mongoose = require("mongoose");
const User = require("./UserModel");
const Schema = mongoose.Schema;
const specializationSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    auto: true,
  },
  name: {
    type: String,
    required: [true, "Specialization name is required"],
    unique: true,
    minlength: [3, "Specialization name must be at least 3 characters long"],
  },
  countOfExistingDoctors: {
    type: Number,
    default: 0,
    min: [0, "Count of existing doctors cannot be negative"],
  },
  doctor_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      default: [],
    },
  ],
  last_updated_at: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true, // Ensures this field cannot be changed after creation
  },
  contributed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Contributor information is required"],
  },
});


const Specialization = mongoose.model('Specialization', specializationSchema);
module.exports = Specialization;
