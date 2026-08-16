import {
  verifyPaymentAppToken,
} from "../utlis/security/Token.security.js";

export const paymentAppAuth = (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        success: false,
        message:
          "Payment App Token مطلوب",
      });
    }

    const [type, token] =
      authHeader.split(" ");

    if (
      type !== "Bearer" ||
      !token
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authorization غير صحيح",
      });
    }

    const decoded =
      verifyPaymentAppToken(token);

    if (
      decoded.type !==
      "payment-app"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "غير مصرح لهذا التطبيق",
      });
    }

    req.paymentApp = decoded;

    next();

  } catch (error) {

    console.log(
      "Payment App Auth Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Payment App Token غير صالح أو منتهي",
    });
  }
};