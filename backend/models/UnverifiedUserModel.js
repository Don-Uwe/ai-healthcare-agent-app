const mongoose = require('mongoose');
const validator = require('validator');

const unverifiedUserSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
    },
    user_handle: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false,
        },
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    isDoctor: {
        type: Boolean,
        required: true,
    },
    specialization: {
        type: String,
        default: null,
    },
    qualification: {
        type: String,
        default: null,
    },
    Years_of_experience: {
        type: Number,
        default: null,
    },
    contact_detail: {
        phone_no: {
            type: String,
            default: null,
        },
        email_id: {
            type: String,
            default: null,
        },
    },
    Profile_image: {
        type: String,
        default: "",
    },
    verificationToken: {
        type: String,
        required: true,
    },
});

const UnverifiedUser = mongoose.model('UnverifiedUser', unverifiedUserSchema);

module.exports = UnverifiedUser;