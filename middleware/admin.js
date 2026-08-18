const ADMIN_EMAIL = String(
  process.env.ADMIN_EMAIL || "kumarkrishna2576@gmail.com"
)
  .trim()
  .toLowerCase();

export function isAdminEmail(email) {
  return String(email || "").trim().toLowerCase() === ADMIN_EMAIL;
}

export function requireAdmin(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json("Not allowed");
  }
  next();
}

export default requireAdmin;
