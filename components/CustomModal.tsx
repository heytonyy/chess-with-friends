import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  TextInput,
} from "react-native";

interface ButtonProps {
  text: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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

const CustomModal = ({
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

          {showInput && (
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={onChangeText}
              autoFocus
            />
          )}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index > 0 && { marginLeft: 8 },
                  button.style,
                ]}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  if (onDismiss && button.text !== "OK") onDismiss();
                }}
              >
                <Text style={[styles.buttonText, button.textStyle]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
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
    alignItems: "center",
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: 80,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CustomModal;
