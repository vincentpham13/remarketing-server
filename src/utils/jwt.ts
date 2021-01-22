import jwt from 'jsonwebtoken';


const SECRET = "SUPPER_SCECRET";
export const createJwtToken = (
  user: any,
): string => {
  const accessToken = jwt.sign(
    user,
    SECRET,
    {
      expiresIn: "60 days"
    }
  );

  // const refreshToken = jwt.sign(
  //   { user, deviceId: deviceUniqueId },
  //   AppConfig.appSecret,
  //   {
  //     expiresIn: !forMagicLink ? "60 days" : "48 hours"
  //   }
  // );

  return accessToken;
};

export const verifyJwtToken = (token: string): any => {
  return jwt.verify(token, SECRET);
};

export const decodeJwtToken = (token: string): any => {
  return jwt.decode(token);
};