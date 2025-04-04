import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/config/firebase";
import { FirebaseError } from "firebase/app";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";
import { CustomTextInput } from "@/components/CustomTextInput";
import { CustomButton } from "@/components/CustomButton";
import { CustomModal } from "@/components/CustomModal";
import { UserData, AlertConfig } from "@/types/types";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    buttons: [{ text: "OK", onPress: () => {} }],
  });

  const handleRegister = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const userData: UserData = {
        username,
        email,
        createdAt: serverTimestamp(),
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        eloRating: 1200,
      };

      await setDoc(doc(firestore, "users", uid), userData);

      setAlertConfig({
        title: "Success",
        message: "Account created successfully!",
        buttons: [{ text: "OK", onPress: () => router.replace("/(play)") }],
      });
      setAlertVisible(true);
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
      <Text style={styles.title}>Register</Text>

      <CustomTextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

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

      <CustomButton
        title="Register"
        onPress={handleRegister}
        disabled={loading}
      />

      <CustomButton
        title="Already have an account? Login"
        onPress={() => router.push("/login")}
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
