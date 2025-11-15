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

export const varifyToken = (token,secret)=>{
    try {
        return new Promise((resolve,reject)=>{
            jwt.verify(token,secret,(err,result)=>{
                if(err) reject(new Error("Invalid"));
  
                
                result.status = "ok";
                resolve(result);
            })
        })
        
    } catch (error) {

        console.error(error);
        
        
    }
}
