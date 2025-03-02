require("dotenv").config();
const express = require("express");
const soap = require("soap");
const fs = require("fs");
const connectDB = require("./config/db");
const enrollmentService = require("./soap/soapService");

const app = express();
connectDB();

const wsdl = fs.readFileSync("./soap/enrollmentService.wsdl", "utf8");

app.listen(5050, () => {
    console.log("SOAP API running on http://127.0.0.1:5050");
    soap.listen(app, "/wsdl", enrollmentService, wsdl);
});
