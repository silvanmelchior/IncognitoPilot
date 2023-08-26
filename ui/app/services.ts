function getServicesUrl() {
  let url = process.env.NEXT_PUBLIC_SERVICES_URL ?? "";
  if (url === "") {
    try {
      url = location.origin;
    } catch (e) {
      // during page build, location is not available
      url = "http://localhost";
    }
  }
  return url;
}

export const SERVICES_URL = getServicesUrl();
