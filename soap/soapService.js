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
