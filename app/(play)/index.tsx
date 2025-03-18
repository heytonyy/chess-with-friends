import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebase";
import { FirebaseError } from "firebase/app";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

import Board from "../components/Board";

const PlayGameScreen = () => {
  const user = auth.currentUser;
  const firstInitial = user?.email?.charAt(0).toUpperCase() || "U";

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        Alert.alert("Firebase Error", `${error.code}: ${error.message}`);
      } else if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Play Screen</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.profileIcon}>
            <Text style={styles.profileText}>{firstInitial}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Board />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlayGameScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // Match your app's background color
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
