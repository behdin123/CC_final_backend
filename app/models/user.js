/**
 * This file exports a Mongoose model for the user collection.
 * The model defines the schema of users: first name, last name, username, mobile number, roles, email, 
 * password, profile image, skills, teams, token and invite requests.
 * 
 * The model also defines the schema of InviteRequest: teamID, caller, requestDate, status
 */

const mongoose = require("mongoose");

// Define the schema for invite requests
const InviteRequest = new mongoose.Schema({
    teamID : {type : mongoose.Types.ObjectId, required : true},
    caller : {type : String, required : true, lowercase : true},
    requestDate : {type : Date, default : new Date()},
    status : {type : String, default : "pending"} // pending, accepted, rejected
})

// Define the user schema
const UserSchema = new mongoose.Schema({
    first_name : {type : String},
    last_name : {type : String},
    username : {type : String, required : true, unique : true, lowercase : true},
    mobile : {type : String, required : true, unique : true},
    email : {type : String, required : true, unique : true, lowercase : true},
    password : {type : String, required : true},
    profile_image : {type : String, required : false},
    teams : {type : [mongoose.Types.ObjectId], default : []},
    skills : {type : [String], default : []},
    token : {type : String, default : ""},
    roles : {type : [String], default : ["USER"]},
    inviteRequests : {type : [InviteRequest]}
}, {
    timestamps : true
});

// Create the user model
const UserModel = mongoose.model("user", UserSchema);

module.exports = {
    UserModel
}