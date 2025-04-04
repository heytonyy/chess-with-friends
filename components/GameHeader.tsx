import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { FirebaseError } from "firebase/app";
import { useState } from "react";

interface GameHeaderProps {
  onError: (title: string, message: string) => void;
}

export const GameHeader = ({ onError }: GameHeaderProps) => {
  const user = auth.currentUser;
  const firstInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("../(auth)/login");
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof FirebaseError) {
        errorMessage = `${error.code}: ${error.message}`;
        onError("Firebase Error", errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
        onError("Error", errorMessage);
      } else {
        onError("Error", errorMessage);
      }
    }
  };

  const handleNavigateToPlay = () => {
    setIsMenuVisible(false);
    router.push("/(play)");
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Chess</Text>
      <TouchableOpacity
        onPress={() => setIsMenuVisible(true)}
        style={styles.profileIcon}
      >
        <Text style={styles.profileText}>{firstInitial}</Text>
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNavigateToPlay}
            >
              <Text style={styles.menuText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <Text style={styles.menuText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.disabledMenuItem]}
              disabled={true}
            >
              <Text style={[styles.menuText, styles.disabledText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#999",
  },
});
