import React, { useState } from "react";
import axios from "axios";

const ProfileSettings = ({ user }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(user.profilePic || "/default-avatar.png");

  const handleFileChange = (event) => {
    setProfilePic(event.target.files[0]);
    setPreview(URL.createObjectURL(event.target.files[0]));
  };

  const uploadProfilePic = async () => {
    if (!profilePic) return alert("Please select an image");

    const formData = new FormData();
    formData.append("profilePic", profilePic);
    formData.append("userId", user._id);

    try {
      const response = await axios.post("http://localhost:5000/api/users/uploadProfilePic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile picture updated!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload profile picture");
    }
  };

  return (
    <div>
      <h2>Profile Settings</h2>
      <img src={preview} alt="Profile" width={100} />
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadProfilePic}>Upload</button>
    </div>
  );
};

export default ProfileSettings;
