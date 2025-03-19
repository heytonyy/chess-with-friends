import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Index() {
  // TODO: change value to null/true/false when testing auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // TODO: comment this to toggle auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(play)" />;
  } else {
    return <Redirect href="/login" />;
  }
}
