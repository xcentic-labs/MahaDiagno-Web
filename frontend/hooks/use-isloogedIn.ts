import { useState, useEffect } from "react";

type User = {
  email: string;
  firstName: string;
  lastName: string;
};

// ✅ Hook to check if the user is logged in based on authStatus in localStorage
export function useIsLoggedIn(): boolean {
  if (typeof window === "undefined") return false;

  const value = localStorage.getItem("authInfo");
  if (!value) return false;


  try {
    const user = JSON.parse(value) as { authStatus?: boolean };
    console.log(user);
    return !!user.authStatus;
  } catch (error) {
    console.error("Invalid authInfo in localStorage:", error);
    return false;
  }
}

export function useGetUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const value = localStorage.getItem("authInfo");
    if (!value) return;

    try {
      const parsed = JSON.parse(value) as { userData: User };
      setUser(parsed.userData);
    } catch (error) {
      console.error("Invalid authInfo in localStorage:", error);
    }
  }, []);

  return user;
}
