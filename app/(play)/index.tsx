import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";
import { FirebaseError } from "firebase/app";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { useGame } from "../../context/GameContext";
import Board from "../../components/Board";
import { useState } from "react";
import CustomModal from "../../components/CustomModal";

const PlayGameScreen = () => {
  const user = auth.currentUser;
  const firstInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const { startNewGame, joinExistingGame, spectateGame, gameId, gameData } =
    useGame();
  const [allowSpectators, setAllowSpectators] = useState(false);

  // State for custom alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [{ text: "OK", onPress: () => {} }],
  });

  // State for text input in custom prompts
  const [promptInputValue, setPromptInputValue] = useState("");
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptConfig, setPromptConfig] = useState({
    title: "",
    message: "",
    onSubmit: (value: string) => {},
  });

  const showAlert = (
    title: string,
    message: string,
    buttons = [{ text: "OK", onPress: () => {} }]
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const showPrompt = (
    title: string,
    message: string,
    onSubmit: (value: string) => void
  ) => {
    setPromptConfig({ title, message, onSubmit });
    setPromptInputValue("");
    setIsPromptVisible(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("../(auth)");
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof FirebaseError) {
        errorMessage = `${error.code}: ${error.message}`;
        showAlert("Firebase Error", errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
        showAlert("Error", errorMessage);
      } else {
        showAlert("Error", errorMessage);
      }
    }
  };

  const handleNewGame = async () => {
    try {
      const id = await startNewGame(allowSpectators);
      showAlert(
        "Game Created",
        `Game ID: ${id}\nShare this with your opponent!`
      );
    } catch (error) {
      showAlert("Error", "Failed to create new game");
    }
  };

  const handleJoinGame = () => {
    showPrompt("Join Game", "Enter the game ID", async (gameId: string) => {
      if (gameId) {
        try {
          await joinExistingGame(gameId);
        } catch (error) {
          showAlert("Error", "Failed to join game");
        }
      }
    });
  };

  const handleSpectateGame = () => {
    showPrompt("Spectate Game", "Enter the game ID", async (gameId: string) => {
      if (gameId) {
        try {
          await spectateGame(gameId);
        } catch (error: any) {
          showAlert("Error", error.message || "Failed to spectate game");
        }
      }
    });
  };

  const handlePromptSubmit = () => {
    setIsPromptVisible(false);
    promptConfig.onSubmit(promptInputValue);
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
            <View style={styles.newGameContainer}>
              <TouchableOpacity style={styles.button} onPress={handleNewGame}>
                <Text style={styles.buttonText}>New Game</Text>
              </TouchableOpacity>
              <View style={styles.spectatorOption}>
                <Text style={styles.spectatorText}>Allow Spectators:</Text>
                <Switch
                  value={allowSpectators}
                  onValueChange={setAllowSpectators}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={allowSpectators ? "#007AFF" : "#f4f3f4"}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleJoinGame}>
              <Text style={styles.buttonText}>Join Game</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSpectateGame}
            >
              <Text style={styles.buttonText}>Spectate Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {gameData?.status === "waiting" ? (
              <Text style={styles.waitingText}>
                Waiting for opponent to join...{"\n"}Game ID: {gameId}
                {gameData.allowSpectators && "\n(Spectators allowed)"}
              </Text>
            ) : (
              <Board />
            )}
          </View>
        )}
      </View>

      {/* Alert modal */}
      <CustomModal
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />

      {/* Custom Prompt modal with input field */}
      <CustomModal
        visible={isPromptVisible}
        title={promptConfig.title}
        message={promptConfig.message}
        buttons={[
          {
            text: "Cancel",
            onPress: () => setIsPromptVisible(false),
            style: { backgroundColor: "#999" },
          },
          {
            text: "OK",
            onPress: handlePromptSubmit,
          },
        ]}
        onDismiss={() => setIsPromptVisible(false)}
        showInput={true}
        inputValue={promptInputValue}
        onChangeText={setPromptInputValue}
      />
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
  newGameContainer: {
    alignItems: "center",
  },
  spectatorOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  spectatorText: {
    marginRight: 8,
    fontSize: 14,
  },
});
