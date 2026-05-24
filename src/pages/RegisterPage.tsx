// This component manages user registration. It handles client-side form validation. It submits the registration data to the Noroff API and provides user feedback based on the response. The form includes fields for name, surname, email, password, and password confirmation, with real-time validation and error handling to ensure a smooth user experience.
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// The RegisterPage component is responsible for rendering the registration form and managing its state, including form data, validation errors, server responses, and loading status. It provides a user-friendly interface for new users to create an account by entering their name, surname, email, and password, while ensuring that all input adheres to the requirements of the Noroff API.
export default function RegisterPage() {
  const navigate = useNavigate();

  // Form State Management: Centralized object for all input values. This simplifies state handling and allows for easy expansion if more fields are added in the future.
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI State: Tracks validation errors, server responses, and loading status. This state management allows for dynamic feedback to the user, such as displaying specific error messages or showing a loading spinner during API calls.
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic input handler. Instantly clears specific field errors upon typing.This provides immediate feedback to the user, improving the form's usability by allowing them to see which errors have been resolved as they correct their input.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Client-Side Validation: Validates against Noroff API constraints prior to submission. This includes checks for required fields, email format, password length, and matching passwords. By performing these validations on the client side, we can provide instant feedback to the user and reduce unnecessary API calls, enhancing the overall user experience.
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";

    // Noroff API strictly prohibits spaces in the name field. By combining the name and surname for validation, we can ensure that the user is immediately informed of any formatting issues that would cause the API to reject their registration, allowing them to correct it before submission.
    const combinedName = `${formData.name}${formData.surname}`;
    if (!/^[a-zA-Z0-9_]+$/.test(combinedName)) {
      newErrors.name =
        "Names can only contain letters, numbers, and underscores";
    }
    // The email must end with @stud.noroff.no to be valid for registration. This is a specific requirement of the Noroff API, and by enforcing this rule on the client side, we can prevent users from attempting to register with an invalid email address, which would result in a failed API call and a poor user experience.
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith("@stud.noroff.no")) {
      newErrors.email = "Must use a @stud.noroff.no email address";
    }
    // Password must be at least 8 characters long. This is a common security requirement, and by enforcing it on the client side, we can ensure that users create stronger passwords that are less likely to be compromised, while also providing immediate feedback if their chosen password does not meet the criteria.
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    // Confirm password must match the password field. This validation ensures that users have correctly entered their desired password twice, reducing the likelihood of typos and ensuring that they know what their password is, which is crucial for a successful registration process.
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    // Update the errors state with any validation errors found. This allows the UI to display specific error messages next to the relevant form fields, guiding the user in correcting their input before attempting to submit the form.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Submit Handler: Orchestrates the validation, API POST request, and navigation sequence. It provides comprehensive error handling to manage both client-side validation issues and server responses, ensuring that users receive clear feedback throughout the registration process. On successful registration, it redirects users to the login page, streamlining their onboarding experience.
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Combine name and surname to satisfy the API schema requirement for a single "name" field without spaces. This approach allows us to maintain the user's full name while adhering to the constraints of the Noroff API, which expects a single string for the name field that cannot contain spaces. By concatenating the name and surname, we can ensure that the registration data is formatted correctly for successful submission.
      const apiName = `${formData.name}${formData.surname}`;

      // Make the API call to register the user. The request includes the combined name, email, and password in the body, formatted as JSON. This call interacts with the Noroff API's registration endpoint, and we handle the response to provide appropriate feedback to the user based on whether the registration was successful or if there were any errors.
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}auth/register`, // The API endpoint for user registration, constructed using an environment variable for the base URL to allow for flexibility across different deployment environments.
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: apiName,
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.errors?.[0]?.message ||
            "Registration failed. Please try again.",
        );
      }

      // Success: Route to login page after successful registration. This provides a seamless transition for the user, allowing them to immediately proceed to log in with their newly created account, enhancing the overall user experience and encouraging engagement with the platform.
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred during registration."); // Fallback error message for non-Error exceptions, ensuring that the user receives feedback even if an unexpected issue arises during the registration process.
      }
    } finally {
      setIsLoading(false); // Reset loading state regardless of success or failure to ensure the UI accurately reflects the current status of the registration process, allowing users to attempt resubmission if needed without being stuck in a loading state.
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-8 font-kadwa">
      {/* Ember & Stone Card Container */}
      <div className="bg-[#FFFFFF] border-[3px] border-[#C5A059] rounded-4xl p-10 w-full max-w-md shadow-lg flex flex-col items-center">
        {/* Brand Logo */}
        <img
          src="/Logo.png"
          alt="Ember & Stone Logo"
          className="h-28 object-contain mb-6"
        />

        {/* Global Server Error Alert */}
        {serverError && (
          <div role="alert" aria-live="assertive" className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-bold text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate aria-label="Registration form">
          {/* Name Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-xs text-red-500 font-bold">
                {errors.name}
              </p>
            )}
          </div>

          {/* Surname Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="surname">
              Surname
            </label>
            <input
              id="surname"
              name="surname"
              type="text"
              value={formData.surname}
              onChange={handleChange}
              placeholder="Doe"
              aria-invalid={!!errors.surname}
              aria-describedby={errors.surname ? "surname-error" : undefined}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
            />
            {errors.surname && (
              <p id="surname-error" role="alert" className="mt-1 text-xs text-red-500 font-bold">
                {errors.surname}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Example@stud.noroff.no"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-red-500 font-bold">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter wanted password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-xs text-red-500 font-bold">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              className="block text-lg font-bold text-[#000000] mb-1"
              htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter wanted password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              className="w-full border border-[#C5A059] rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[#C5A059] text-[#000000] placeholder-[#605F5F] transition-colors"
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" role="alert" className="mt-1 text-xs text-red-500 font-bold">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submission Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              aria-label={isLoading ? "Registering account..." : "Register"}
              className="bg-[#4A1D1A] text-[#C5A059] border border-[#C5A059] rounded-full px-12 py-2 text-lg font-bold hover:bg-[#3A1412] transition-colors disabled:opacity-70 flex items-center justify-center min-w-40">
              {isLoading ? (
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="animate-spin h-5 w-5 text-[#C5A059]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}