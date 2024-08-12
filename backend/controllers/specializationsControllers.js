const SpecializationsModel = require("../models/SpecializationsModel");
const User = require("../models/UserModel");
var mongoose = require("mongoose");

module.exports.add = async (req, res) => {
  try {
    const { name, contributed_by, doctor_ids } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is empty" });
    }
    
    // const isValidContributed_by =
    //   mongoose.Types.ObjectId.isValid(contributed_by); //true
    // if (!isValidContributed_by) {
    //   return res.status(400).json({ error: "Invalid Contributor ID" });
    // }

    // // Validate user IDs
    // const contributor = await User.find({
    //   _id: contributed_by,
    //   isDoctor: false,
    // });

    // if (!contributor) {
    //   return res.status(400).json({ error: "User doesn't exist" });
    // }


    // Validate if each doctor_id is a valid ObjectId
    for (const id of doctor_ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `Invalid doctor ID format` });
      }
    }
    // Validate doctor IDs
    const doctors = await User.find({
      _id : { $in: doctor_ids },
      isDoctor: true,
    }).select("_id");
    if (doctors.length !== doctor_ids.length) {
      return res
        .status(400)
        .json({ error: "One or more doctor IDs are not valid doctors" });
    }
    const newSpecialization = new SpecializationsModel({
      name,
      countOfExistingDoctors: doctors.length,
      doctor_ids,
      contributed_by,
    });
    const saveSpecialization = newSpecialization.save();
    if (!saveSpecialization) {
      return res.status(400).json({ error: "Failed to save Specialization" });
    }
    res.status(201).json({
      message: "Specialization inserted successfully",
    });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.getSpecializations = async (req, res) => {
  try {
    const { name, id } = req.query;
    let specialization;

    if (name) {
      // Find the specialization by name
      specialization = await SpecializationsModel.findOne({ name }).populate('contributed_by');
    } else if (id && mongoose.Types.ObjectId.isValid(id)) {
      // Find the specialization by ID
      specialization = await SpecializationsModel.findById(id).populate('contributed_by');
    } else {
      return res
        .status(400)
        .json({ error: "Please provide a valid name or ID" });
    }

    if (!specialization) {
      return res.status(404).json({ error: "Specialization not found" });
    }

    res.status(200).json(specialization);
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.updateDoctorSpecializations = async (req, res) => {
  try {
    const { id, doctor_ids } = req.body;
    const isValidSpecialization = mongoose.Types.ObjectId.isValid(id);
    if (!isValidSpecialization) {
      return res.status(400).json({ error: "Invalid Specializations ID" });
    }
    // Validate if each doctor_id is a valid ObjectId
    for (const id of doctor_ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `Invalid doctor ID format` });
      }
    }
    // Validate doctor IDs
    const doctors = await User.find({
      _id: { $in: doctor_ids },
      isDoctor: true,
    }).select("user_id");
    if (doctors.length !== doctor_ids.length) {
      return res
        .status(400)
        .json({ error: "One or more doctor IDs are not valid doctors" });
    }
    const updatedDoctorSpecializations =
      await SpecializationsModel.findByIdAndUpdate(id, {
        doctor_ids: doctor_ids,
        countOfExistingDoctors: doctors.length,
        last_updated_at: Date.now()
      });
    if (!updatedDoctorSpecializations) {
      return res
        .status(400)
        .json({ error: "Failed to update the doctor Specialization" });
    }
    res.status(200).json({
      message: "Doctor ID has updated successfully",
    });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const isValidSpecialization = mongoose.Types.ObjectId.isValid(id);
    if (!isValidSpecialization) {
      return res.status(400).json({ error: "Invalid Specializations ID" });
    }
    const deleteSpecialization = await SpecializationsModel.findByIdAndDelete(id);
    if (!deleteSpecialization) {
      return res.status(400).json({ error: "Failed to delete Specialization" });
    }
    res.status(200).json({
      message: "Specialization deleted successfully!",
    });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
