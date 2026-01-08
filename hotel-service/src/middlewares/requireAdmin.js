export function requireAdmin(req, res, next) {
  // requireAuth middleware'inin req.user set etmiş olması gerekir
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  /**
   * Cognito access token içinde group bilgisi:
   * "cognito:groups": ["ADMIN", "USER"]
   */
  const groups = req.user["cognito:groups"];

  console.log(req.user["cognito:groups"]);

  // Kullanıcı hiç bir gruba ait değilse
  if (!groups || !Array.isArray(groups)) {
    return res.status(403).json({ message: "Admin privileges required" });
  }

  // ADMIN grubunda mı?
  if (!groups.includes("ADMIN")) {
    return res.status(403).json({ message: "Admin only endpoint" });
  }

  // Yetkili
  next();
}
