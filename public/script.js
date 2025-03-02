document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("enrollmentForm");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const course = document.getElementById("course").value;

        // Hide messages initially
        successMessage.style.display = "none";
        errorMessage.style.display = "none";

        if (!firstName || !lastName || !phone || !email || !course) {
            errorMessage.innerText = "All fields are required.";
            errorMessage.style.display = "block";
            return;
        }

        // Construct SOAP XML request
        const soapRequest = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://t2s.com/enroll">
                <soapenv:Header/>
                <soapenv:Body>
                    <tns:enrollUserRequest>
                        <firstName>${firstName}</firstName>
                        <lastName>${lastName}</lastName>
                        <phone>${phone}</phone>
                        <email>${email}</email>
                        <course>${course}</course>
                    </tns:enrollUserRequest>
                </soapenv:Body>
            </soapenv:Envelope>`;

        try {
            console.log("Submitting SOAP request:", soapRequest); // Debugging log

            const response = await fetch("http://127.0.0.1:5050/wsdl", {
                method: "POST",
                headers: { "Content-Type": "text/xml" },
                body: soapRequest,
            });

            const responseText = await response.text(); // Expecting XML response
            console.log("Received response:", responseText); // Debugging log

            // Check if response contains success message
            if (response.ok && responseText.includes("Enrollment successful")) {
                successMessage.innerText = "Enrollment successful!";
                successMessage.style.display = "block";
                form.reset();
            } else {
                throw new Error("Error submitting the form.");
            }
        } catch (error) {
            console.error("SOAP request error:", error);
            errorMessage.innerText = "Error: Unable to process enrollment.";
            errorMessage.style.display = "block";
        }
    });
});