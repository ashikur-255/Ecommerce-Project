import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUser, FiPackage, FiLogOut, FiEdit2, FiMail, FiPhone, 
  FiCheckCircle, FiAlertCircle, FiShield, FiSave, FiCamera, FiCalendar 
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout, setUser, clearError } from "../store/slices/authSlice";
import { authService } from "../services/api";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

// ─── VerificationStatus Component ──────────────────────────────────────
interface VerificationStatusProps {
  type: "email" | "phone";
  value: string | null;
  isVerified: boolean;
  verifyPath: string;
}

const VerificationStatus = ({ type, value, isVerified, verifyPath }: VerificationStatusProps) => {
  if (!value) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          {type === "email" ? <FiMail size={18} className="text-gray-400" /> : <FiPhone size={18} className="text-gray-400" />}
          <div>
            <p className="text-sm font-medium text-dark capitalize">{type}</p>
            <p className="text-xs text-gray-400">Not provided</p>
          </div>
        </div>
        <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">N/A</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        {type === "email" ? <FiMail size={18} className="text-gray-400" /> : <FiPhone size={18} className="text-gray-400" />}
        <div>
          <p className="text-sm font-medium text-dark capitalize">{type}</p>
          <p className="text-xs text-gray-500 truncate max-w-[150px]">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isVerified ? (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            <FiCheckCircle size={12} /> Verified
          </span>
        ) : (
          <Link to={verifyPath} className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium hover:bg-yellow-200 transition-colors">
            <FiAlertCircle size={12} /> Verify
          </Link>
        )}
      </div>
    </div>
  );
};

// ─── Main ProfilePage ──────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5085";

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;
    return `${API_URL}${avatar}`;
  };

  const avatarUrl = getAvatarUrl(avatarPreview || user?.avatar);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch { return "N/A"; }
  };

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  if (!user) {
    return (
      <main className="pt-24 min-h-screen flex items-center justify-center bg-light">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login to view and manage your profile.</p>
          <Link to="/login"><Button size="lg" className="w-full sm:w-auto">Login Now</Button></Link>
        </div>
      </main>
    );
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image (JPEG, PNG, or WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name cannot be empty."); return; }
    if (newPassword) {
      if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
      if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (newPassword) formData.append("newPassword", newPassword);
      if (avatarFile) formData.append("avatar", avatarFile);
      const response = await authService.updateProfile(formData);
      const updatedUser = response.data.data;
      dispatch(setUser(updatedUser));
      setAvatarPreview(updatedUser.avatar ?? "");
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
    navigate("/");
  };

  return (
    <main className="pt-20 min-h-screen bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-dark mb-6 sm:mb-8">My Account</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center sticky top-24">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/10" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-3xl border-4 border-primary/10">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200">
                  <FiCamera size={14} />
                </label>
                <input ref={fileInputRef} id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <p className="font-bold text-dark text-lg">{user.name}</p>
              <p className="text-sm text-gray-400 truncate">{user.email || user.phone}</p>
              {user.role === "admin" && (
                <span className="inline-block mt-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  <FiShield className="inline mr-1" size={12} /> Admin
                </span>
              )}
              <div className="mt-6 space-y-1 text-left border-t pt-4">
                <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark hover:bg-light transition-colors">
                  <FiPackage size={18} /> My Orders
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-light transition-colors">
                    <FiUser size={18} /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <FiLogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-black text-dark text-lg flex items-center gap-2"><FiEdit2 size={20} className="text-primary" /> Edit Profile</h2>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Full Name <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Email</label>
                <input value={user.email || "Not provided"} disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support for assistance.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Phone Number</label>
                <input value={user.phone || "Not provided"} disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed. Contact support for assistance.</p>
              </div>
              <hr className="border-gray-100" />
              <h3 className="font-semibold text-dark text-sm">Change Password (optional)</h3>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" minLength={6} />
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" disabled={!newPassword} />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto" loading={saving} disabled={saving}>
                <FiSave className="inline mr-2" size={18} /> Save Changes
              </Button>
            </form>

            {/* Verification Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-dark text-lg mb-4">Verification Status</h3>
              <div className="space-y-3">
                <VerificationStatus type="email" value={user.email} isVerified={user.isEmailVerified} verifyPath="/verify-email" />
                <VerificationStatus type="phone" value={user.phone} isVerified={user.isPhoneVerified} verifyPath="/verify-phone" />
              </div>
              <p className="text-xs text-gray-400 mt-4">
                <FiAlertCircle className="inline mr-1" size={12} />
                Verifying your contact information helps secure your account and enables important notifications.
              </p>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-dark text-lg mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-dark">
                    <FiCalendar className="inline mr-2 text-primary" size={14} />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">Account Type</p>
                  <p className="text-sm font-medium text-dark capitalize">
                    {user.role === "admin" ? "Administrator" : "Customer"}
                  </p>
                </div>
              </div>
              {user.email && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-dark truncate">{user.email}</p>
                </div>
              )}
              {user.phone && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-dark">{user.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}