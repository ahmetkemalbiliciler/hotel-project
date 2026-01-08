import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const region = process.env.COGNITO_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

if (!region || !userPoolId) {
  throw new Error("COGNITO_REGION or COGNITO_USER_POOL_ID missing");
}

const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const client = jwksClient({
  jwksUri: `${issuer}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT VERIFY ERROR:", err.message);
        return res.status(401).json({ message: "Invalid token" });
      }

      // 🔒 EK KONTROL (ÇOK ÖNEMLİ)
      if (decoded.token_use !== "access") {
        return res.status(401).json({ message: "Not an access token" });
      }

      req.user = decoded;
      next();
    }
  );
}
