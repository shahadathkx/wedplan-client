export function dashboardPath(role?: string | null) {
  if (role === "vendor" || role === "admin") {
    return `/${role}/dashboard`;
  }
  return "/customer/dashboard";
}
