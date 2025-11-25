import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                console.log("AuthCallback: Starting authentication process");
                console.log("AuthCallback: Full URL:", window.location.href);
                console.log("AuthCallback: Hash:", window.location.hash);
                console.log("AuthCallback: Search:", window.location.search);

                let access_token = null;

                // Extract token from hash (#) - the URL uses hash-based routing
                const hash = window.location.hash.substring(1);
                console.log("AuthCallback: Full hash content:", hash);

                if (hash) {
                    // Try to parse as URLSearchParams first
                    try {
                        const params = new URLSearchParams(hash);
                        access_token = params.get("access_token");
                        console.log("AuthCallback: Token from URLSearchParams:", access_token);
                    } catch (e) {
                        console.log("AuthCallback: URLSearchParams parsing failed:", e);
                    }

                    // If that doesn't work, try to extract manually
                    if (!access_token) {
                        // Handle different hash formats
                        const tokenMatch = hash.match(/[?&]access_token=([^&]*)/);
                        if (tokenMatch && tokenMatch[1]) {
                            access_token = decodeURIComponent(tokenMatch[1]);
                            console.log("AuthCallback: Token from regex match (?&):", access_token);
                        }
                    }

                    // Try another pattern if needed
                    if (!access_token) {
                        const tokenMatch2 = hash.match(/access_token=([^&]*)/);
                        if (tokenMatch2 && tokenMatch2[1]) {
                            access_token = decodeURIComponent(tokenMatch2[1]);
                            console.log("AuthCallback: Token from regex match (direct):", access_token);
                        }
                    }
                }

                // If not found in hash, check query parameters
                if (!access_token) {
                    console.log("AuthCallback: Checking query parameters");
                    const urlParams = new URLSearchParams(window.location.search);
                    access_token = urlParams.get("access_token");
                    console.log("AuthCallback: Token from query params:", access_token);
                }

                if (!access_token) {
                    console.error("AuthCallback: No access token found in callback URL");
                    console.log("AuthCallback: Full window location:", window.location);
                    navigate("/");
                    return;
                }

                console.log("AuthCallback: Found access token, proceeding with verification");
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