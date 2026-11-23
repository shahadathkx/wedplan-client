export function getDashboardPath(role?: string | null) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "vendor":
      return "/vendor/dashboard";
    case "customer":
      return "/customer/dashboard";
    default:
      return "/";
  }
}
