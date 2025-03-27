import { StyleSheet, Image, View } from "react-native";
import React from "react";
import useGamePiece from "@/hooks/useGamePiece";
import { Piece as PieceType } from "@/types/types";

const Piece = (data: PieceType) => {
  const sourceImage = useGamePiece(data);

  return (
    <View style={styles.container}>
      <Image
        source={sourceImage}
        style={styles.pieceImage}
        resizeMode="contain"
      />
    </View>
  );
};

export default Piece;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pieceImage: {
    width: "80%",
    height: "80%",
  },
});
