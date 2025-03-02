# Building a SOAP API for T2S Enrollment

**SOAP (Simple Object Access Protocol)** is widely used in enterprise environments where structured communication, security, and reliability are essential. 

This guide explains how to build a **SOAP-based enrollment API for T2S**, replacing the traditional REST API with an enterprise-ready SOAP implementation.

---

## Project Overview

This SOAP API provides a **secure, structured, and reliable enrollment system** for users registering for courses. It ensures:

- **Standardized communication** via XML-based requests and responses.
- **Security & Compliance** for enterprise systems.
- **Interoperability** with legacy applications.

---

## Project Structure
```plaintext
t2s-enrollment-soap-api/
│── config/
│   ├── db.js                # Database connection configuration
│── models/
│   ├── Enrollment.js        # Mongoose schema for enrollments
│── soap/
│   ├── soapService.js       # SOAP service logic
│   ├── enrollmentService.wsdl # SOAP WSDL file
│── public/
│   ├── index.html           # Enrollment form
│   ├── script.js            # SOAP client logic
│   ├── styles.css           # Frontend styles
│── app.js                   # Express.js server setup
│── package.json             # Dependencies and project metadata
│── .env                     # Environment variables
│── README.md                # Documentation
```

---

## Step 1: Installing Dependencies

- Run the following command to initialize the project and install necessary dependencies:
```bash
npm init -y
npm install express soap xml2js body-parser dotenv mongoose cors
```
-**express** → Web framework
- **soap** → SOAP web service library
- **xml2js** → XML-to-JSON parsing
- **mongoose** → MongoDB ODM
- **dotenv** → Environment variable management
- **body-parser** → Parses incoming requests
- **cors** → Enables Cross-Origin Resource Sharing

---

## Step 2: Database Configuration

- Create **config/db.js** to connect to MongoDB:
```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

---

## Step 3: Define the Enrollment Model

- Create **models/Enrollment.js**:
```javascript
const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, required: true }
});

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
```

---

Step 4: Implement the SOAP Service

- Create **soap/soapService.js**:
```javascript
const Enrollment = require("../models/Enrollment");

const service = {
    EnrollmentService: {
        EnrollmentPort: {
            enrollUser: async function (args, callback) {
                try {
                    const { firstName, lastName, phone, email, course } = args;
                    const newEnrollment = new Enrollment({ firstName, lastName, phone, email, course });
                    await newEnrollment.save();

                    callback(null, { message: "Enrollment successful", enrollmentId: newEnrollment._id.toString() });
                } catch (error) {
                    callback({ message: "Error enrolling user", error: error.message });
                }
            },
            getEnrollments: async function (_, callback) {
                try {
                    const enrollments = await Enrollment.find();
                    callback(null, { enrollments });
                } catch (error) {
                    callback({ message: "Error retrieving enrollments", error: error.message });
                }
            }
        }
    }
};

module.exports = service;
```

- ***enrollUser***: Registers a new user for a course.
- ***getEnrollments***: Retrieves all enrolled users.

---

## Step 5: Define the SOAP WSDL

- Create **soap/enrollmentService.wsdl**:

```xml
<definitions name="EnrollmentService" targetNamespace="http://t2s.com/enroll"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:tns="http://t2s.com/enroll"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

    <message name="enrollUserRequest">
        <part name="firstName" type="xsd:string"/>
        <part name="lastName" type="xsd:string"/>
        <part name="phone" type="xsd:string"/>
        <part name="email" type="xsd:string"/>
        <part name="course" type="xsd:string"/>
    </message>

    <message name="enrollUserResponse">
        <part name="message" type="xsd:string"/>
        <part name="enrollmentId" type="xsd:string"/>
    </message>

    <portType name="EnrollmentPortType">
        <operation name="enrollUser">
            <input message="tns:enrollUserRequest"/>
            <output message="tns:enrollUserResponse"/>
        </operation>
    </portType>

    <binding name="EnrollmentBinding" type="tns:EnrollmentPortType">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="enrollUser">
            <soap:operation soapAction="http://t2s.com/enroll/enrollUser"/>
            <input><soap:body use="literal"/></input>
            <output><soap:body use="literal"/></output>
        </operation>
    </binding>

    <service name="EnrollmentService">
        <port name="EnrollmentPort" binding="tns:EnrollmentBinding">
            <soap:address location="http://localhost:5050/wsdl"/>
        </port>
    </service>
</definitions>
```

---

## Step 6: Configure Express Server

- Modify **app.js*:
```javascript
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
```

---

## Step 7: Testing the SOAP API

### 1. Start the SOAP API Server
```bash
node app.js
```
- The server should start on **http://127.0.0.1:5050/wsdl**

### 2. Using a SOAP Client (SoapUI)
- Import the WSDL file into SoapUI.
- Use the enrollUser operation with XML input:
```xml
<enrollUserRequest>
    <firstName>John</firstName>
    <lastName>Doe</lastName>
    <phone>1234567890</phone>
    <email>johndoe@example.com</email>
    <course>Cloud Computing</course>
</enrollUserRequest>
```

### 3. Using curl

- Run the following command:
```bash
curl -X POST http://127.0.0.1:5050/wsdl -d @enrollmentRequest.xml
```

### 4. Using Postman (via raw XML)
- Open Postman.
- Select POST.
- Paste the SOAP XML request in Body.

### 5. Verify in MongoDB
- Open MongoDB shell: 
```bash
mongosh
use t2s-enrollment
db.enrollments.find().pretty()
```

- You should see the **newly enrolled user** in the database. 

---

## Future Improvements
- **Add Authentication**: Use **WS-Security** to protect sensitive user data.
- **Deploy to AWS**: Host the API using **AWS Lambda + API Gateway**.
- **Payment Integration**: Add **Stripe or PayPal** for paid courses.
- **Logging & Monitoring**: Use **ELK Stack** to monitor API activity.

---

## Use Cases
- Enterprise Applications that require structured SOAP communication.
- Secure Enrollment Systems for universities and online platforms.
- Banking & Finance where SOAP is preferred for transactional security.

---

## Use Cases
- **Enterprise Applications** that require structured SOAP communication.
- **Secure Enrollment Systems** for universities and online platforms.
- **Banking & Finance** where SOAP is preferred for transactional security.

---

## Conclusion

This SOAP API **modernizes enrollment systems** while ensuring **enterprise-grade security and interoperability**. By integrating **SOAP-based messaging**, we enable **scalable, structured, and secure** registration systems for future-ready e-learning platforms. 
