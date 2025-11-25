import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                let access_token = null;

                // Extract token from hash (#) - the URL uses hash-based routing
                const hash = window.location.hash.substring(1);
                if (hash) {
                    const params = new URLSearchParams(hash);
                    access_token = params.get("access_token");
                }

                // If not found in hash, check query parameters
                if (!access_token) {
                    const urlParams = new URLSearchParams(window.location.search);
                    access_token = urlParams.get("access_token");
                }

                if (!access_token) {
                    console.error("AuthCallback: No access token found in callback URL");
                    navigate("/");
                    return;
                }

                // Send token to backend for verification using the context function
                await verifyEmail(access_token);
                console.log("AuthCallback: Verification successful, redirecting to home");
                navigate("/"); // redirect after login
            } catch (err) {
                console.error("AuthCallback: Authentication error:", err);
                navigate("/log"); // redirect to login page on error
            }
        };

        handleAuth();
    }, [verifyEmail, navigate]);

    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your login...</p>
        </div>
    </div>;
}