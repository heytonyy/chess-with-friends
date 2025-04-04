import { Modal, View, Text, StyleSheet } from "react-native";
import { CustomButton } from "./CustomButton";
import { CustomTextInput } from "./CustomTextInput";

interface ButtonProps {
  text: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
}

interface CustomModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttons?: ButtonProps[];
  onDismiss?: () => void;
  showInput?: boolean;
  inputValue?: string;
  onChangeText?: (text: string) => void;
}

export const CustomModal = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK", onPress: () => {} }],
  onDismiss,
  showInput = false,
  inputValue = "",
  onChangeText,
}: CustomModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      animationType="fade"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          {showInput && onChangeText && (
            <CustomTextInput
              placeholder=""
              value={inputValue}
              onChangeText={onChangeText}
              autoCapitalize="none"
            />
          )}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <View key={index} style={[index > 0 && { marginLeft: 8 }]}>
                <CustomButton
                  title={button.text}
                  onPress={() => {
                    if (button.onPress) button.onPress();
                    if (onDismiss) onDismiss();
                  }}
                  variant={button.variant || "primary"}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 250,
    maxWidth: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
