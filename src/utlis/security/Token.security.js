


import jwt from "jsonwebtoken"




export const generatetoken = ({
    payload = {},
   
    signature = process.env.JWT_SECRET,
    expiresIn = "30d"  // تأكد من أنها 365 يوم كما هو مطلوب
} = {}) => {
    console.log("✅ Token Payload:", payload);
    console.log("✅ Expires In:", expiresIn);
    
    const token = jwt.sign(payload, signature, { expiresIn });
    console.log("✅ Generated Token:", token);
    
    return token;
};

export function generateCode(length = 8) {
  const chars = "0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

export const verifytoken = (token) => {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};

export const devtoken = ({
    payload = {},
   
    signature = process.env.dev_jwt,
    expiresIn = "30d"  // تأكد من أنها 365 يوم كما هو مطلوب
} = {}) => {
    console.log("✅ Token Payload:", payload);
    console.log("✅ Expires In:", expiresIn);
    
    const token = jwt.sign(payload, signature, { expiresIn });
    console.log("✅ Generated Token:", token);
    
    return token;
};


export const verifydevadmin = (token) => {
    const decoded = jwt.verify(token, process.env.dev_jwt);
    return decoded;
};



export const clienttoken = ({
    payload = {},
   
    signature = process.env.client_token,
    expiresIn = "30d"  // تأكد من أنها 365 يوم كما هو مطلوب
} = {}) => {
    console.log("✅ Token Payload:", payload);
    console.log("✅ Expires In:", expiresIn);
    
    const token = jwt.sign(payload, signature, { expiresIn });
    console.log("✅ Generated Token:", token);
    
    return token;
};

export const verifyclienttoken = (token) => {
    const decoded = jwt.verify(token, process.env.client_token);
    return decoded;
};





export const admintoken = ({
    payload = {},
   
    signature = process.env.admin_token,
    expiresIn = "30d"  // تأكد من أنها 365 يوم كما هو مطلوب
} = {}) => {
    console.log("✅ Token Payload:", payload);
    console.log("✅ Expires In:", expiresIn);
    
    const token = jwt.sign(payload, signature, { expiresIn });
    console.log("✅ Generated Token:", token);
    
    return token;
};


export const verifyadmin = (token) => {
    const decoded = jwt.verify(token, process.env.admin_token);
    return decoded;
};




const PAYMENT_APP_SECRET = process.env.PAYMENT_APP_SECRET;

// إنشاء Token لتطبيق الدفع
export const createPaymentAppToken = ({
  deviceId,
} = {}) => {

  if (!deviceId) {
    throw new Error(
      "deviceId is required"
    );
  }

  return jwt.sign(
    {
      type: "payment-app",
      deviceId,
    },
    PAYMENT_APP_SECRET,
    {
      expiresIn: "365d",
    }
  );
};


// ==========================================
// VERIFY PAYMENT APP TOKEN
// ==========================================

export const verifyPaymentAppToken = (
  token
) => {

  return jwt.verify(
    token,
    PAYMENT_APP_SECRET
  );
};