import { useEffect } from 'react';

export interface PayUParams {
    key: string;
    txnid: string;
    amount: string;
    currency: string;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    surl: string;
    furl: string;
    hash: string | { v1: string; v2: string;[key: string]: unknown };
    [key: string]: string | { v1: string; v2: string;[key: string]: unknown }; // Allow additional parameters
}

interface PayUPaymentProps {
    payuUrl: string;
    params: PayUParams;
}

export default function PayUPayment({ payuUrl, params }: PayUPaymentProps) {
    useEffect(() => {

        // Validate required parameters
        if (!payuUrl) {
            console.error('Missing payuUrl');
            //   alert('Payment configuration error: Missing payment URL. Please contact support.');
            return;
        }

        if (!params) {
            console.error('Missing params');
            //   alert('Payment configuration error: Missing payment parameters. Please contact support.');
            return;
        }

        // Process hash parameter if it's an object
        let processedParams = { ...params };
        if (typeof params.hash === 'object' && params.hash !== null) {
            // Extract the v1 hash value
            processedParams = {
                ...params,
                hash: params.hash.v1 || params.hash.v2 || JSON.stringify(params.hash)
            };
        }

        // Check for required PayU parameters
        const requiredParams = ['key', 'txnid', 'amount', 'currency', 'productinfo', 'firstname', 'email', 'phone', 'surl', 'furl', 'hash'];
        const missingParams = requiredParams.filter(param => !processedParams[param]);

        if (missingParams.length > 0) {
            console.error('Missing required PayU parameters:', missingParams);
            //   alert(`Payment configuration error: Missing required parameters: ${missingParams.join(', ')}. Please contact support.`);
            return;
        }

        // Warn about test mode
        if (processedParams.key === 'gtKFFx') {
            console.warn('Using PayU test merchant key. This is for testing purposes only.');
            //   alert('You are in payment test mode. For testing, use test card details or follow PayU test payment instructions.');
        }

        // Create a form element
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payuUrl;
        form.style.display = 'none';

        // Add all parameters as hidden inputs
        Object.entries(processedParams).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            // Convert value to string if it's an object
            input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
            form.appendChild(input);
        });

        // Append form to body and submit
        document.body.appendChild(form);
        form.submit();

        // Cleanup
        return () => {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        };
    }, [payuUrl, params]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to PayU payment gateway...</p>
                <p className="text-sm text-gray-500 mt-2">If you are not redirected automatically, please wait...</p>
                <p className="text-xs text-gray-400 mt-4">Note: If you see a "Too many requests" error, please wait 60 seconds before trying again.</p>
            </div>
        </div>
    );
}