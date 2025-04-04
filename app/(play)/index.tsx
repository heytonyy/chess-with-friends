import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { GameBoard } from "@/components/GameBoard";
import { CustomModal } from "@/components/CustomModal";
import { GameHeader } from "@/components/GameHeader";
import { GameOptions } from "@/components/GameOptions";
import { WaitingScreen } from "@/components/WaitingScreen";

const PlayGameScreen = () => {
  const { startNewGame, joinExistingGame, spectateGame, gameId, gameData } =
    useGame();

  // state for custom alert modal with no input field
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    buttons: [{ text: "OK", onPress: () => {} }],
  });

  // state for custom alert modal with input field
  const [inputValue, setInputValue] = useState("");
  const [isModalWithInputVisible, setIsModalWithInputVisible] = useState(false);
  const [modalWithInputConfig, setModalWithInputConfig] = useState({
    title: "",
    message: "",
    onSubmit: (value: string) => {},
  });

  const showModal = (
    title: string,
    message: string,
    buttons = [{ text: "OK", onPress: () => {} }]
  ) => {
    setModalConfig({ title, message, buttons });
    setIsModalVisible(true);
  };

  const showModalWithInput = (
    title: string,
    message: string,
    onSubmit: (value: string) => void
  ) => {
    setModalWithInputConfig({ title, message, onSubmit });
    setInputValue("");
    setIsModalWithInputVisible(true);
  };

  const handleGameCreated = (gameCode: string) => {
    showModal(
      "Game Created",
      `Game Code: ${gameCode}\nShare this with your opponent!`
    );
  };

  const handleJoinGame = () => {
    showModalWithInput("Join Game", "Enter the game code", async (gameCode: string) => {
      if (gameCode) {
        try {
          await joinExistingGame(gameCode);
        } catch (error) {
          showModal("Error", "Failed to join game");
        }
      }
    });
  };

  const handleSpectateGame = () => {
    showModalWithInput(
      "Spectate Game",
      "Enter the game code",
      async (gameCode: string) => {
        if (gameCode) {
          try {
            await spectateGame(gameCode);
          } catch (error: any) {
            showModal("Error", error.message || "Failed to spectate game");
          }
        }
      }
    );
  };

  const handlePromptSubmit = () => {
    setIsModalWithInputVisible(false);
    modalWithInputConfig.onSubmit(inputValue);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <GameHeader onError={showModal} />

        {!gameId ? (
          <GameOptions
            startNewGame={startNewGame}
            joinExistingGame={joinExistingGame}
            spectateGame={spectateGame}
            onError={showModal}
            onGameCreated={handleGameCreated}
            onJoinGame={handleJoinGame}
            onSpectateGame={handleSpectateGame}
          />
        ) : gameData?.status === "waiting" ? (
          <WaitingScreen
            gameCode={gameData.gameCode}
            allowSpectators={gameData.allowSpectators}
          />
        ) : gameData?.status === "active" ? (
          <GameBoard />
        ) : gameData?.status === "completed" ? (
          <GameBoard />
        ) : null}
      </View>

      {/* Alert modal */}
      <CustomModal
        visible={isModalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        buttons={modalConfig.buttons}
        onDismiss={() => setIsModalVisible(false)}
      />

      {/* Custom Prompt modal with input field */}
      <CustomModal
        visible={isModalWithInputVisible}
        title={modalWithInputConfig.title}
        message={modalWithInputConfig.message}
        buttons={[
          {
            text: "Cancel",
            onPress: () => setIsModalWithInputVisible(false),
            variant: "secondary",
          },
          {
            text: "OK",
            onPress: handlePromptSubmit,
          },
        ]}
        onDismiss={() => setIsModalWithInputVisible(false)}
        showInput={true}
        inputValue={inputValue}
        onChangeText={setInputValue}
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
