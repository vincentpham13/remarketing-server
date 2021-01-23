import jwt from 'jsonwebtoken';


const SECRET = "SUPPER_SCECRET";
export const createAccessToken = (
  user: any,
): string[] => {
  const accessToken = jwt.sign(
    user,
    SECRET,
    {
      expiresIn: "1 day"
    }
  );

  const refreshToken = jwt.sign(
    user,
    SECRET,
    {
      expiresIn: "60 days"
    }
  );

  return [accessToken, refreshToken];
};

export const createRefreshToken = (
  user: any,
): string => {
  const refreshToken = jwt.sign(
    user,
    SECRET,
    {
      expiresIn: "60 days"
    }
  );

  return refreshToken;
};

export const verifyJwtToken = (token: string): any => {
  return jwt.verify(token, SECRET);
};

export const decodeJwtToken = (token: string): any => {
  return jwt.decode(token);
};