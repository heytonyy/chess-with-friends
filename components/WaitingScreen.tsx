import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

interface WaitingScreenProps {
  gameCode: string;
  allowSpectators: boolean;
}

const WaitingScreen = ({ gameCode, allowSpectators }: WaitingScreenProps) => {
  return (
    <View style={styles.content}>
      <View>
        <ActivityIndicator size="large" />
      </View>
      <Text style={styles.waitingText}>
        Waiting for opponent to join...{"\n"}Game Code: {gameCode}
        {allowSpectators && "\n(Spectators allowed)"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  waitingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

export default WaitingScreen;
