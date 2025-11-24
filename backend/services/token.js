import jwt from 'jsonwebtoken';


export const generateAccessToken = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, secret,{expiresIn:'15m'}, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
};


export const generateRefressToken = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, secret,{expiresIn:'15d'}, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
};

export const varifyToken = (token, secret) => {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return resolve(null); // ✅ never throw, just return null
      }
      resolve(decoded); // ✅ only actual payload
    });
  });
};
