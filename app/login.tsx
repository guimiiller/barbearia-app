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
      const res = await loginUser({
        email,
        password,
      });

      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      if (res.user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      setErrorGeneral(
        err?.response?.data?.error || "E-mail ou senha incorretos",
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* VOLTAR */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>BARÃO</Text>

          <View style={styles.brandLine} />

          <Text style={styles.brandSubtitle}>BARBEARIA</Text>
        </View>

        <Text style={styles.title}>Bem-vindo de volta.</Text>

        <Text style={styles.subtitle}>Entre na sua conta para continuar.</Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        {/* EMAIL */}
        <View style={styles.field}>
          <Text style={styles.label}>E-MAIL</Text>

          <TextInput
            placeholder="seu@email.com"
            placeholderTextColor="#666"
            style={[styles.input, errorEmail ? styles.inputError : null]}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => {
              setEmail(text);
              setErrorEmail("");
              setErrorGeneral("");
            }}
          />

          {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}
        </View>

        {/* SENHA */}
        <View style={styles.field}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>SENHA</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/")}
            >
              <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.passwordContainer,
              errorPassword ? styles.inputError : null,
            ]}
          >
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
              autoCapitalize="none"
              onChangeText={(text) => {
                setPassword(text);
                setErrorPassword("");
                setErrorGeneral("");
              }}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              style={styles.eyeButton}
            >
              <Image
                source={
                  showPassword
                    ? require("../assets/images/eye-off.png")
                    : require("../assets/images/eye.png")
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          {errorPassword ? (
            <Text style={styles.error}>{errorPassword}</Text>
          ) : null}
        </View>

        {/* ERRO GERAL */}
        {errorGeneral ? (
          <View style={styles.generalErrorContainer}>
            <Text style={styles.generalError}>{errorGeneral}</Text>
          </View>
        ) : null}

        {/* LOGIN */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem uma conta?</Text>

        <Link href="/cadastro" asChild>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.registerLink}>Criar minha conta</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
    paddingHorizontal: 28,
    paddingTop: 65,
    paddingBottom: 40,
  },

  backButton: {
    position: "absolute",
    top: 58,
    left: 24,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#151515",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  backIcon: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -3,
  },

  header: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 48,
  },

  brand: {
    alignItems: "center",
    marginBottom: 42,
  },

  brandTitle: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 6,
  },

  brandLine: {
    width: 30,
    height: 2,
    backgroundColor: "#fff",
    marginTop: 7,
    marginBottom: 5,
  },

  brandSubtitle: {
    color: "#888",
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 3,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },

  form: {
    width: "100%",
  },

  field: {
    marginBottom: 24,
  },

  label: {
    color: "#aaa",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 15,
  },

  inputError: {
    borderColor: "#ff4d4d",
  },

  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  forgotPassword: {
    color: "#aaa",
    fontSize: 11,
  },

  passwordContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 12,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 15,
  },

  eyeButton: {
    width: 50,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  eyeIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#888",
  },

  error: {
    color: "#ff5c5c",
    fontSize: 11,
    marginTop: 7,
    marginLeft: 3,
  },

  generalErrorContainer: {
    backgroundColor: "#1b1010",
    borderWidth: 1,
    borderColor: "#3a1b1b",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },

  generalError: {
    color: "#ff6b6b",
    fontSize: 12,
    textAlign: "center",
  },

  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  loginButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },

  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 30,
  },

  footerText: {
    color: "#666",
    fontSize: 13,
    marginBottom: 7,
  },

  registerLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
