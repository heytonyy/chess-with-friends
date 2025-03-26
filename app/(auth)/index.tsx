import React, { useState } from "react";
import {
  View,
  TextInput,  
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import CustomModal from "../../components/CustomModal";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, firestore, WebBrowser } from "../../config/firebase";
import { FirebaseError } from "firebase/app";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";

// Register for redirect
WebBrowser.maybeCompleteAuthSession();

interface UserCredential {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
}

interface UserData {
  username: string;
  email: string | null;
  createdAt: ReturnType<typeof serverTimestamp>;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  eloRating: number;
}

// Define an interface for the alert button
interface AlertButton {
  text: string;
  onPress?: () => void;
}

// Define an interface for the alert configuration
interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    buttons: [{ text: "OK" }],
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

      await setDoc(doc(firestore, "users", uid), {
        username: username,
        email: email,
        createdAt: serverTimestamp(),
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        eloRating: 1200,
      });

      // Use platform-specific alert
      if (Platform.OS === "web") {
        setAlertConfig({
          title: "Success",
          message: "Account created successfully!",
          buttons: [{ text: "OK", onPress: () => router.replace("/(play)") }],
        });
        setAlertVisible(true);
      } else {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/(play)") },
        ]);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

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

    if (Platform.OS === "web") {
      setAlertConfig({
        title,
        message,
        buttons: [{ text: "OK" }],
      });
      setAlertVisible(true);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      {isRegistering && (
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {isRegistering ? (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsRegistering(false)}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsRegistering(true)}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              Need an account? Register
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      {/* Custom Alert for web platform */}
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
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: "#4285F4",
    fontSize: 14,
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
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: "#333",
  },
});
