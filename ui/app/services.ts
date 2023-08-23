function getServicesUrl() {
  let url = process.env.NEXT_PUBLIC_SERVICES_URL ?? "";
  if (url === "") {
    try {
      url = location.host;
    } catch (e) {
      // during page build, location is not available
      url = "localhost";
    }
  }
  return url;
}

export const SERVICES_URL = getServicesUrl();
