const mongoose = require("mongoose");

//Defining the schema for Employee
//This schema will be used to create a model for the Employee collection in MongoDB
const EmployeeSchema = new mongoose.Schema({
    email: String,
    password: String
});

const EmployeeModel = mongoose.model("Users", EmployeeSchema, "users");
module.exports = EmployeeModel;