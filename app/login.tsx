import { StyleSheet, Text, View } from "react-native";
import React from "react";

const LoginSceen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>LoginSceen</Text>
    </View>
  );
};

export default LoginSceen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
