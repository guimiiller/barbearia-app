import { useRouter } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Landing() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/background-hero.png")}
      style={styles.container}
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.logo}>Logo Barão</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/cadastro")}
          >
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 200,
  },
  buttons: {
    width: "80%",
    gap: 15,
  },
  loginButton: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  loginText: {
    color: "#000",
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#c9a227",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  registerText: {
    color: "#000",
    fontWeight: "bold",
  },
});
