import checkout from "@paypal/checkout-server-sdk";

const environment = new checkout.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET
);

const client = new checkout.core.PayPalHttpClient(environment);

// new checkout.core.LiveEnvironment(environment)


export default client;
