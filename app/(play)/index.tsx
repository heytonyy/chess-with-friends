import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebase";
import { FirebaseError } from "firebase/app";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { useGame } from "../context/GameContext";
import Board from "../components/Board";

const PlayGameScreen = () => {
  const user = auth.currentUser;
  const firstInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const { startNewGame, joinExistingGame, gameId, gameData } = useGame();

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

  const handleNewGame = async () => {
    try {
      const id = await startNewGame();
      Alert.alert(
        "Game Created",
        `Game ID: ${id}\nShare this with your opponent!`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create new game");
    }
  };

  const handleJoinGame = () => {
    Alert.prompt("Join Game", "Enter the game ID", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Join",
        onPress: async (gameId?: string) => {
          if (gameId) {
            try {
              await joinExistingGame(gameId);
            } catch (error) {
              Alert.alert("Error", "Failed to join game");
            }
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chess</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.profileIcon}>
            <Text style={styles.profileText}>{firstInitial}</Text>
          </TouchableOpacity>
        </View>

        {!gameId ? (
          <View style={styles.gameOptions}>
            <TouchableOpacity style={styles.button} onPress={handleNewGame}>
              <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleJoinGame}>
              <Text style={styles.buttonText}>Join Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {gameData?.status === "waiting" ? (
              <Text style={styles.waitingText}>
                Waiting for opponent to join...{"\n"}Game ID: {gameId}
              </Text>
            ) : (
              <Board />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PlayGameScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
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
  gameOptions: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  waitingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});
