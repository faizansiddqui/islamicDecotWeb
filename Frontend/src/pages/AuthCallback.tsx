import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            // Extract token from hash (#)
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const access_token = params.get("access_token");

            if (!access_token) {
                console.error("No access token found in callback URL");
                navigate("/");
                return;
            }

            console.log("Extracted access token:", access_token);

            // Send token to backend for verification
            authAPI.verifyEmail(access_token)
                .then(() => {
                    console.log("Backend authenticated successfully");
                    navigate("/"); // redirect after login
                })
                .catch((err) => {
                    console.error("Verification failed:", err);
                });
        } catch (err) {
            console.error("Auth callback error:", err);
        }
    }, []);

    return <div>Verifying login...</div>;
}
