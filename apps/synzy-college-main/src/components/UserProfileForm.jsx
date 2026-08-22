import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { getUserProfile, getUserPreferences } from "../api/userService";


const UserProfileForm = ({ currentUser, onProfileUpdate }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // UserProfileForm.jsx mein isse update karein

useEffect(() => {
    const fetchCurrent = async () => {
        // Agar user login nahi hai, to aage mat badho
        if (!currentUser) {
            return;
        }

        // No student profile for college users
        if (currentUser.userType === 'college') {
            return;
        }

        try {
            const res = await getUserProfile(currentUser.authId || currentUser._id);
            const data = res.data;
            console.log("Profile data loaded:", data);
            
            if (data) {
                // Fetch preferences separately using the student's _id
                try {
                    const prefRes = await getUserPreferences(data._id);
                    if (prefRes && prefRes.data) {
                        data.preferences = prefRes.data;
                    }
                } catch (prefErr) {
                    console.log("No preferences found or error fetching them");
                }
                console.log("Preferences:", data.preferences);
                
                // Form ko fetched data se bhar do
                reset({
                    name: data.name || "",
                    email: data.email || "",
                    contactNo: data.contactNo || "",
                    dateOfBirth: data.dateOfBirth
                        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
                        : "",
                    gender: data.gender || "",
                    state: data.state || "",
                    city: data.city || "",
                    userType: data.userType || "parent",
                    preferredStream: data.preferences?.preferredStream || "",
                    currentGrade: data.preferences?.currentGrade || "",
                    interests: data.preferences?.interests || "",
                    collegeType: data.preferences?.collegeType || "",
                    shift: data.preferences?.shifts?.[0] || "",
                });
            } else {
                // No profile data found, reset with basic info and default preferences
                console.log("No profile data found, using basic user info with defaults");
                reset({ 
                    email: currentUser.email,
                    userType: "parent",
                    preferredStream: "Engineering", // Default stream
                    currentGrade: "12th Grade", // Default grade
                    collegeType: "private", // Default college type
                    shift: "morning", // Default shift
                    interests: "Focusing on Academics" // Default interest
                }); 
            }

        } catch (error) {
            // Agar profile nahi milta (naya user), to form ko khaali rakho, sirf email bhar do
            if (error.response?.data?.message === 'Student Not Found') {
                console.log("New user, no profile to fetch yet.");
                reset({ email: currentUser.email }); 
            } else {
                console.error("Failed to fetch profile:", error);
            }
        }
    };

    fetchCurrent(); // Ab yeh useEffect ke andar hai

}, [currentUser, reset]);

  const onSubmit = async (data) => {
    console.log("Form data:", data);
    
    // Ensure all required preference fields have valid values
    const preferencesData = {
      state: data.state || 'Unknown',
      city: data.city || 'Unknown',
        preferredStream: data.preferredStream || 'Engineering',
        currentGrade: data.currentGrade || '12th Grade',
        interests: data.interests || 'Focusing on Academics',
        collegeType: data.collegeType || 'private',
        shifts: data.shift ? [data.shift] : ['morning']
    };
    
    // Structure the data to include preferences
    const profileData = {
      name: data.name,
      email: data.email,
      contactNo: data.contactNo,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      state: data.state,
      city: data.city,
      userType: data.userType,
      preferences: preferencesData
    };
    console.log("Profile data to send:", profileData);
    
    await onProfileUpdate(profileData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-4">
          Your Profile Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Name is required" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              disabled
              className="w-full p-2 border bg-gray-100 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="contactNo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNo"
              {...register("contactNo", {
                required: "Contact number is required",
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.contactNo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactNo.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register("dateOfBirth", {
                required: "Date of birth is required",
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              {...register("gender", { required: "Please select a gender" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              I am a
            </label>
            <select
              id="userType"
              {...register("userType", {
                required: "Please select a user type",
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="parent">Parent</option>
              <option value="student">Student</option>
            </select>
            {errors.userType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.userType.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              {...register("state", { required: "State is required" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">
                {errors.state.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              {...register("city", { required: "City is required" })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>
        </div>

        {/*--- Preferences Section (Corrected to match Backend Schema) ---*/}
        <div className="md:col-span-2 pt-6 border-t mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Your Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="preferredStream"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Stream <span className="text-red-500">*</span>
              </label>
              <select
                id="preferredStream"
                {...register("preferredStream", { required: "Stream is required" })}
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="Engineering"
              >
                <option value="Engineering">Engineering</option>
                <option value="Management">Management</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Law">Law</option>
                <option value="Medical">Medical</option>
                <option value="Design">Design</option>
                <option value="Humanities">Humanities</option>
              </select>
              {errors.preferredStream && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.preferredStream.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="currentGrade"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Grade / Qualification <span className="text-red-500">*</span>
              </label>
              <select
                id="currentGrade"
                {...register("currentGrade", { required: "Current Grade is required" })}
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="12th Grade"
              >
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate - 1st Year">Undergraduate - 1st Year</option>
                <option value="Undergraduate - 2nd Year">Undergraduate - 2nd Year</option>
                <option value="Undergraduate - 3rd Year">Undergraduate - 3rd Year</option>
                <option value="Undergraduate - 4th Year">Undergraduate - 4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Other">Other</option>
              </select>
              {errors.currentGrade && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentGrade.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shift"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Shift <span className="text-red-500">*</span>
              </label>
              <select
                id="shift"
                {...register("shift", { required: "Shift is required" })}
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="morning"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night college">Night college</option>
                <option value="online">Online</option>
              </select>
              {errors.shift && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shift.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="collegeType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                college Type <span className="text-red-500">*</span>
              </label>
              <select
                id="collegeType"
                {...register("collegeType", {
                  required: "college Type is required",
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue="private"
              >
                <option value="convent">Convent</option>
                <option value="private">Private</option>
                <option value="government">Government</option>
              </select>
              {errors.collegeType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.collegeType.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="interests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Interests
              </label>
              <select
                id="interests"
                {...register("interests")}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Interests</option>
                <option value="Focusing on Academics">
                  Focusing on Academics
                </option>
                <option value="Focuses on Practical Learning">
                  Focuses on Practical Learning
                </option>
                <option value="Empowering in Sports">
                  Empowering in Sports
                </option>
                <option value="Leadership Development">
                  Leadership Development
                </option>
                <option value="STEM Activities">STEM Activities</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSubmitting ? "Saving..." : "Save All Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
