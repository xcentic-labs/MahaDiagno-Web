export function useIsLoggedIn(): boolean {
  if (typeof window === "undefined") return false;

  const value = localStorage.getItem("authInfo");
  console.log(value);
  if (!value) return false;


  try {
    const user = JSON.parse(value) as { authStatus?: boolean };
    return !!user.authStatus;
  } catch (error) {
    console.error("Invalid authInfo in localStorage:", error);
    return false;
  }
}
