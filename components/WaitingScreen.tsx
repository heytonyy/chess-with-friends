import { View, Text, StyleSheet } from "react-native";
import { LoadingSpinner } from "./LoadingSpinner";

interface WaitingScreenProps {
  gameCode: string;
  allowSpectators: boolean;
}

export const WaitingScreen = ({
  gameCode,
  allowSpectators,
}: WaitingScreenProps) => {
  const message = `Waiting for opponent to join...\nGame Code: ${gameCode}${
    allowSpectators ? "\n(Spectators allowed)" : ""
  }`;

  return (
    <View style={styles.content}>
      <LoadingSpinner message={message} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
});
