const otpStore = (() => {
  const store = new Map(); // memory store

  function setOTP(email, otp) {  
    store.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    

  }

  function verifyOTP(email, otp) {
    const data = store.get(email);
    if (!data) return false;

    if (Date.now() > data.expiresAt) {
      store.delete(email);
      return false;
    }

    if (data.otp !== otp) return false;

    store.delete(email); // one time use
    return true;
  }

  return { setOTP, verifyOTP };
})();
export default otpStore;
