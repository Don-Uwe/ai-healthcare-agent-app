const usersModel = require("../models/usersModel");
class UsersControllers {
    async saveUser(req, res) {
        try {
            let params = {
                userName: req.body.userName,
                userId: '1232',
                userAddress: req.body.userAddress,
                userPhoneNumber: req.body.userPhoneNumber
            }
            let user = new usersModel(params);
            await user.save();
            return res.done('Data saved successfully');
        } catch (error) {
            return res.error(error);
        }
    }
}

module.exports = UsersControllers;