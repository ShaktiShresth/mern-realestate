import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [file, setFile] = useState(undefined);
  const [fileUploadPercentage, setFileUploadPercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSucces] = useState(false);

  useEffect(() => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFileUploadError(true);
        return;
      }
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileChange = (ev) => {
    setFileUploadPercentage(0);
    setFileUploadError(false);
    const changedFile = ev.target.files[0];
    setFile(changedFile);
  };

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",

      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadPercentage(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        setFileUploadPercentage(0);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
          setFileUploadError(false);
        });
      }
    );
  };

  const handleInputChange = (ev) => {
    setFormData({ ...formData, [ev.target.id]: ev.target.value });
  };

  const handleFormSubmit = async (ev) => {
    ev.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSucces(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
        <img
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          onClick={() => fileRef.current.click()}
        />
        {fileUploadError && (
          <span className="p-3 text-sm bg-red-100 text-red-500 rounded-lg text-center">
            Could not upload image! (File must be less than 2MB)
          </span>
        )}
        {fileUploadPercentage > 0 && fileUploadPercentage < 100 && (
          <span className="p-3 text-sm bg-slate-100 text-slate-500 rounded-lg text-center">
            {` Image uploading ${fileUploadPercentage}%`}
          </span>
        )}
        {fileUploadPercentage === 100 && (
          <span className="p-3 text-sm bg-green-100 text-green-500 rounded-lg text-center">
            Image successfully uploaded!
          </span>
        )}
        <input
          type="text"
          placeholder="Username"
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleInputChange}
          defaultValue={currentUser.username}
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleInputChange}
          defaultValue={currentUser.email}
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleInputChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>
      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete Account</span>
        <span className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-lg mt-5">{error}</p>
      )}
      {updateSuccess && (
        <p className="text-green-500 bg-green-100 p-3 rounded-lg mt-5">
          User updated successfully!
        </p>
      )}
    </div>
  );
};

export default Profile;
