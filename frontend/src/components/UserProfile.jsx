import { useAuth } from "../hooks/useAuth";

const UserProfile = () => {
  const {
    user,
    logout,
    updateUserProfile,
    getUserRole,
    hasPermission,
    isAuthenticated,
  } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleUpdateProfile = () => {
    // Example of updating user profile
    updateUserProfile({
      lastSeen: new Date().toISOString(),
      preferences: { theme: "dark" },
    });
  };

  if (!isAuthenticated) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>

      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {user?.name || "Not provided"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "Not provided"}
        </p>
        <p>
          <strong>Role:</strong> {getUserRole() || "No role assigned"}
        </p>
        <p>
          <strong>Company:</strong> {user?.company?.name || "No company"}
        </p>
      </div>

      {/* Example of permission-based rendering */}
      {hasPermission("admin") && (
        <div className="mt-4 p-2 bg-blue-50 rounded">
          <p className="text-blue-800">Admin Panel Access Available</p>
        </div>
      )}

      <div className="mt-4 space-x-2">
        <button
          onClick={handleUpdateProfile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update Profile
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
