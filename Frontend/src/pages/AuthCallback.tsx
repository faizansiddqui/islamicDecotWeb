import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { navigateTo } from "../utils/navigation";

export default function AuthCallback() {
    const { verifyEmail } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            try {

                // Extract token from hash (#) - the URL uses hash-based routing
                const hash = window.location.hash.substring(1);

                const params = new URLSearchParams(hash);
                const access_token = params.get("access_token");


                if (!access_token) {
                    console.error("No access token found in callback URL");
                    navigateTo("/");
                    return;
                }

                // Send token to backend for verification using the context function
                await verifyEmail(access_token);
                navigateTo("/"); // redirect after login
            } catch (err) {
                console.error("Auth callback error:", err);
                navigateTo("/log"); // redirect to login page on error
            }
        };

        handleAuth();
    }, [verifyEmail]);

    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your login...</p>
        </div>
    </div>;
}