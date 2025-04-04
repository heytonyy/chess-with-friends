import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/config/firebase";

interface GameOptionsProps {
  startNewGame: (allowSpectators: boolean) => Promise<string>;
  joinExistingGame: (gameCode: string) => Promise<void>;
  spectateGame: (gameCode: string) => Promise<void>;
  onError: (title: string, message: string) => void;
  onGameCreated: (gameCode: string) => void;
  onJoinGame: () => void;
  onSpectateGame: () => void;
}

export const GameOptions = ({
  startNewGame,
  onError,
  onGameCreated,
  onJoinGame,
  onSpectateGame,
}: GameOptionsProps) => {
  const [allowSpectators, setAllowSpectators] = useState(false);

  const handleNewGame = async () => {
    try {
      const id = await startNewGame(allowSpectators);
      const gameRef = ref(db, `games/${id}`);
      const snapshot = await get(gameRef);
      const gameData = snapshot.val();
      onGameCreated(gameData.gameCode);
    } catch (error) {
      onError("Error", "Failed to create new game");
    }
  };

  const handleJoinGame = () => {
    onJoinGame();
  };

  const handleSpectateGame = () => {
    onSpectateGame();
  };

  return (
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
      <TouchableOpacity style={styles.button} onPress={handleSpectateGame}>
        <Text style={styles.buttonText}>Spectate Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gameOptions: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  newGameContainer: {
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
  },
  spectatorOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  spectatorText: {
    marginRight: 8,
    fontSize: 14,
  },
});
