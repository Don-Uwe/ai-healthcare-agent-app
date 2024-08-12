const express = require('express');
const router = express.Router();
const {add, getSpecializations, updateDoctorSpecializations, deleteSpecialization} = require("../controllers/specializationsControllers");

// testing
router.get("/test", (req, res) => {
    res.send("Testing specialization route");
});

router.post("/specialization/add",add);
router.get("/specialization/get-specialization",getSpecializations);
router.put("/specialization/update-specialization",updateDoctorSpecializations);
router.delete("/specialization/delete-specialization/:id",deleteSpecialization);


module.exports = router;