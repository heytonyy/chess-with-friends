import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { FirebaseError } from "firebase/app";
import { router } from "expo-router";
import { CustomTextInput } from "@/components/CustomTextInput";
import { CustomButton } from "@/components/CustomButton";
import { CustomModal } from "@/components/CustomModal";
import { AlertConfig } from "@/types/types";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    buttons: [{ text: "OK", onPress: () => {} }],
  });

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(play)");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: unknown) => {
    setLoading(false);
    let title = "Error";
    let message = "An unknown error occurred";

    if (error instanceof FirebaseError) {
      title = "Firebase Error";
      message = `${error.code}: ${error.message}`;
    } else if (error instanceof Error) {
      message = error.message;
    }

    setAlertConfig({
      title,
      message,
      buttons: [{ text: "OK" }],
    });
    setAlertVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <CustomTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <CustomTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <CustomButton title="Login" onPress={handleLogin} disabled={loading} />

      <CustomButton
        title="Need an account? Register"
        onPress={() => router.push("/register")}
        variant="secondary"
      />

      {/* Divider for social login */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <CustomModal
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 14,
  },
});
