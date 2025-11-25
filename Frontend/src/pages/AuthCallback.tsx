import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // ✅ Extract token only from hash (Supabase uses hash)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");

        // ✅ If no token, just skip – don’t treat as error
        if (!access_token) {
          console.log("AuthCallback: No token found, skipping...");
          return;
        }

        console.log("AuthCallback: Token found, verifying...");

        // ✅ Call backend verification
        await verifyEmail(access_token);

        // ✅ Clear hash so it doesn’t re-trigger
        window.history.replaceState({}, document.title, "/");

        // ✅ Redirect after success
        navigate("/");
      } catch (error) {
        console.error("AuthCallback Error:", error);
        navigate("/login");
      }
    };

    handleAuth();
  }, []); // ✅ Run only once

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your login...</p>
      </div>
    </div>
  );
}
