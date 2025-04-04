import { useEffect } from "react";
import { router } from "expo-router";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function AuthIndex() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is already authenticated, redirect to play screen
        router.replace("/(play)");
      } else {
        // If no user is authenticated, redirect to login
        router.replace("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return <LoadingSpinner message="Checking authentication..." />;
}
