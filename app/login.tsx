import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginUser } from "../src/services/api";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async () => {
    setErrorEmail("");
    setErrorPassword("");
    setErrorGeneral("");

    let hasError = false;

    if (!email) {
      setErrorEmail("Digite seu e-mail");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setErrorEmail("E-mail inválido");
      hasError = true;
    }

    if (!password) {
      setErrorPassword("Digite sua senha");
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await loginUser({ email, password });

      console.log("🔥 LOGIN RESPONSE:", res);

      // ✅ SALVA TOKEN
      await AsyncStorage.setItem("token", res.token);

      // 🔥 SALVA USER (ESSA LINHA FALTAVA)
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      // ✅ AGORA SIM (depois de salvar)
      const checkUser = await AsyncStorage.getItem("user");
      console.log("🔥 USER SALVO AGORA:", checkUser);

      router.replace("/home");
    } catch (err: any) {
      setErrorGeneral(
        err?.response?.data?.error || "E-mail ou senha incorretos",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Logo Barão</Text>

      <View style={styles.inputs}>
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#777"
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorEmail("");
            setErrorGeneral("");
          }}
        />
        {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            style={styles.inputPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorPassword("");
            }}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                showPassword
                  ? require("../assets/images/eye-off.png") // coloque aqui
                  : require("../assets/images/eye.png") // coloque aqui
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {errorPassword ? (
          <Text style={styles.error}>{errorPassword}</Text>
        ) : null}
      </View>

      {errorGeneral ? (
        <Text style={styles.errorCenter}>{errorGeneral}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" style={styles.link}>
          Cadastre-se
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  logo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },

  inputs: {
    width: "100%",
  },

  input: {
    backgroundColor: "#1C1C1C",
    borderRadius: 14,
    color: "#fff",
    marginBottom: 5,
    padding: 16,
  },

  error: {
    color: "#FF4D4D",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },

  errorCenter: {
    color: "#FF4D4D",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#D4AF37",
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },

  buttonText: {
    fontWeight: "bold",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },

  dividerText: {
    color: "#777",
    marginHorizontal: 10,
    fontSize: 12,
  },

  socialContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 30,
  },

  socialButton: {
    backgroundColor: "#1C1C1C",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: "#777",
    fontSize: 13,
  },

  link: {
    color: "#4DA6FF",
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 14,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  inputPassword: {
    flex: 1,
    color: "#fff",
    paddingVertical: 16,
  },

  iconInput: {
    width: 22,
    height: 22,
    tintColor: "#aaa",
  },
});
