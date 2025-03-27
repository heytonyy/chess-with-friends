import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import Board from "@/components/Board";
import CustomModal from "@/components/CustomModal";
import GameHeader from "@/components/GameHeader";
import GameOptions from "@/components/GameOptions";
import WaitingScreen from "@/components/WaitingScreen";

const PlayGameScreen = () => {
  const { startNewGame, joinExistingGame, spectateGame, gameId, gameData } =
    useGame();

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

  const handleGameCreated = (gameCode: string) => {
    showAlert(
      "Game Created",
      `Game Code: ${gameCode}\nShare this with your opponent!`
    );
  };

  const handleJoinGame = () => {
    showPrompt("Join Game", "Enter the game code", async (gameCode: string) => {
      if (gameCode) {
        try {
          await joinExistingGame(gameCode);
        } catch (error) {
          showAlert("Error", "Failed to join game");
        }
      }
    });
  };

  const handleSpectateGame = () => {
    showPrompt(
      "Spectate Game",
      "Enter the game code",
      async (gameCode: string) => {
        if (gameCode) {
          try {
            await spectateGame(gameCode);
          } catch (error: any) {
            showAlert("Error", error.message || "Failed to spectate game");
          }
        }
      }
    );
  };

  const handlePromptSubmit = () => {
    setIsPromptVisible(false);
    promptConfig.onSubmit(promptInputValue);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <GameHeader onError={showAlert} />

        {!gameId ? (
          <GameOptions
            startNewGame={startNewGame}
            joinExistingGame={joinExistingGame}
            spectateGame={spectateGame}
            onError={showAlert}
            onGameCreated={handleGameCreated}
            onJoinGame={handleJoinGame}
            onSpectateGame={handleSpectateGame}
          />
        ) : gameData?.status === "waiting" ? (
          <WaitingScreen
            gameCode={gameData.gameCode}
            allowSpectators={gameData.allowSpectators}
          />
        ) : (
          <Board />
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
});
