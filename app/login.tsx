import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  forgotPassword,
  loginUser,
  resetPassword,
  verifyResetCode,
} from "../src/services/api";

type RecoveryStep = "email" | "code" | "password";

export default function Login() {
  const router = useRouter();

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(25)).current;

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(25)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslate = useRef(new Animated.Value(15)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [forgotVisible, setForgotVisible] = useState(false);

  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>("email");

  const [recoveryEmail, setRecoveryEmail] = useState("");

  const [recoveryCode, setRecoveryCode] = useState("");

  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [recoveryError, setRecoveryError] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(formTranslate, {
        toValue: 0,
        duration: 600,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(footerTranslate, {
        toValue: 0,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 5,
    }).start();
  };

  const isValidEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
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

  const openForgotPassword = () => {
    setRecoveryStep("email");

    setRecoveryEmail(email);

    setRecoveryCode("");

    setResetToken("");

    setNewPassword("");

    setConfirmNewPassword("");

    setRecoveryError("");

    setForgotVisible(true);
  };

  const closeForgotPassword = () => {
    if (recoveryLoading) return;

    setForgotVisible(false);

    setRecoveryStep("email");

    setRecoveryCode("");

    setResetToken("");

    setNewPassword("");

    setConfirmNewPassword("");

    setRecoveryError("");
  };

  const handleSendCode = async () => {
    setRecoveryError("");

    if (!recoveryEmail.trim()) {
      setRecoveryError("Digite seu e-mail");
      return;
    }

    if (!isValidEmail(recoveryEmail.trim())) {
      setRecoveryError("Digite um e-mail válido");
      return;
    }

    try {
      setRecoveryLoading(true);

      await forgotPassword(recoveryEmail.trim().toLowerCase());

      setRecoveryStep("code");
    } catch (err: any) {
      setRecoveryError(
        err?.response?.data?.error || "Não foi possível enviar o código",
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setRecoveryError("");

    if (recoveryCode.length !== 6) {
      setRecoveryError("Digite o código de 6 dígitos");

      return;
    }

    try {
      setRecoveryLoading(true);

      const response = await verifyResetCode(
        recoveryEmail.trim().toLowerCase(),
        recoveryCode,
      );

      setResetToken(response.resetToken);

      setRecoveryStep("password");
    } catch (err: any) {
      setRecoveryError(err?.response?.data?.error || "Código inválido");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setRecoveryError("");

    if (newPassword.length < 6) {
      setRecoveryError("A nova senha deve ter pelo menos 6 caracteres");

      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError("As senhas não coincidem");

      return;
    }

    try {
      setRecoveryLoading(true);

      await resetPassword(
        recoveryEmail.trim().toLowerCase(),
        resetToken,
        newPassword,
      );

      closeForgotPassword();

      Alert.alert(
        "Senha atualizada",
        "Sua senha foi alterada com sucesso. Agora você pode entrar com a nova senha.",
      );
    } catch (err: any) {
      setRecoveryError(
        err?.response?.data?.error || "Não foi possível atualizar sua senha",
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  const renderRecoveryModal = () => {
    return (
      <Modal
        visible={forgotVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForgotPassword}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* FECHAR */}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={closeForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            {/* HEADER */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Esqueceu a senha?</Text>

              <Text style={styles.modalSubtitle}>
                {recoveryStep === "email"
                  ? "Informe o e-mail da sua conta."
                  : recoveryStep === "code"
                    ? "Digite o código enviado para seu e-mail."
                    : "Crie uma nova senha para sua conta."}
              </Text>
            </View>

            {/* ETAPA 1 */}

            {recoveryStep === "email" && (
              <>
                <Text style={styles.modalLabel}>E-MAIL</Text>

                <TextInput
                  style={[
                    styles.modalInput,
                    recoveryError ? styles.modalInputError : null,
                  ]}
                  placeholder="seu@email.com"
                  placeholderTextColor="#666"
                  value={recoveryEmail}
                  onChangeText={(text) => {
                    setRecoveryEmail(text);
                    setRecoveryError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSendCode}
                  disabled={recoveryLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>
                    {recoveryLoading ? "Enviando..." : "Enviar código"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ETAPA 2 */}

            {recoveryStep === "code" && (
              <>
                <Text style={styles.modalLabel}>CÓDIGO</Text>

                <TextInput
                  style={[
                    styles.modalInput,
                    styles.codeInput,
                    recoveryError ? styles.modalInputError : null,
                  ]}
                  placeholder="000000"
                  placeholderTextColor="#666"
                  value={recoveryCode}
                  onChangeText={(text) => {
                    const onlyNumbers = text.replace(/\D/g, "").slice(0, 6);

                    setRecoveryCode(onlyNumbers);
                    setRecoveryError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleVerifyCode}
                  disabled={recoveryLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>
                    {recoveryLoading ? "Verificando..." : "Validar código"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setRecoveryStep("email");
                    setRecoveryCode("");
                    setRecoveryError("");
                  }}
                  disabled={recoveryLoading}
                  style={styles.modalSecondaryButton}
                >
                  <Text style={styles.modalSecondaryText}>Alterar e-mail</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ETAPA 3 */}

            {recoveryStep === "password" && (
              <>
                <Text style={styles.modalLabel}>NOVA SENHA</Text>

                <View
                  style={[
                    styles.modalPasswordContainer,
                    recoveryError ? styles.modalInputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.modalPasswordInput}
                    placeholder="Digite sua nova senha"
                    placeholderTextColor="#666"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setRecoveryError("");
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.modalEyeButton}
                  >
                    <Image
                      source={
                        showNewPassword
                          ? require("../assets/images/eye-off.png")
                          : require("../assets/images/eye.png")
                      }
                      style={styles.modalEyeIcon}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalLabel}>CONFIRMAR SENHA</Text>

                <View
                  style={[
                    styles.modalPasswordContainer,
                    recoveryError ? styles.modalInputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.modalPasswordInput}
                    placeholder="Digite novamente"
                    placeholderTextColor="#666"
                    value={confirmNewPassword}
                    onChangeText={(text) => {
                      setConfirmNewPassword(text);
                      setRecoveryError("");
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.modalEyeButton}
                  >
                    <Image
                      source={
                        showConfirmPassword
                          ? require("../assets/images/eye-off.png")
                          : require("../assets/images/eye.png")
                      }
                      style={styles.modalEyeIcon}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleResetPassword}
                  disabled={recoveryLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>
                    {recoveryLoading ? "Atualizando..." : "Atualizar senha"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ERRO */}

            {recoveryError ? (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalError}>{recoveryError}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      {/* HEADER ANIMADO */}

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [
              {
                translateY: headerTranslate,
              },
            ],
          },
        ]}
      >
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>BARÃO</Text>

          <View style={styles.brandLine} />

          <Text style={styles.brandSubtitle}>BARBEARIA</Text>
        </View>

        <Text style={styles.title}>Bem-vindo de volta.</Text>

        <Text style={styles.subtitle}>Entre na sua conta para continuar.</Text>
      </Animated.View>

      {/* FORM ANIMADO */}

      <Animated.View
        style={[
          styles.form,
          {
            opacity: formOpacity,
            transform: [
              {
                translateY: formTranslate,
              },
            ],
          },
        ]}
      >
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

            <TouchableOpacity activeOpacity={0.7} onPress={openForgotPassword}>
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

        {/* LOGIN ANIMADO */}

        <Animated.View
          style={{
            transform: [
              {
                scale: buttonScale,
              },
            ],
          }}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* FOOTER ANIMADO */}

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: footerOpacity,
            transform: [
              {
                translateY: footerTranslate,
              },
            ],
          },
        ]}
      >
        <Text style={styles.footerText}>Ainda não tem uma conta?</Text>

        <Link href="/cadastro" asChild>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.registerLink}>Criar minha conta</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>

      {/* RECUPERAÇÃO */}

      {renderRecoveryModal()}
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalContent: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#252525",
    borderRadius: 18,
    padding: 24,
  },

  modalClose: {
    position: "absolute",
    right: 15,
    top: 12,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  modalCloseText: {
    color: "#777",
    fontSize: 28,
    fontWeight: "300",
  },

  modalHeader: {
    marginBottom: 28,
    paddingRight: 30,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 8,
  },

  modalSubtitle: {
    color: "#777",
    fontSize: 13,
    lineHeight: 19,
  },

  modalLabel: {
    color: "#aaa",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 9,
    marginTop: 8,
  },

  modalInput: {
    height: 54,
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 11,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 15,
    marginBottom: 16,
  },

  modalInputError: {
    borderColor: "#ff4d4d",
  },

  codeInput: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 7,
  },

  modalButton: {
    height: 54,
    backgroundColor: "#fff",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  modalButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "800",
  },

  modalSecondaryButton: {
    alignItems: "center",
    marginTop: 18,
  },

  modalSecondaryText: {
    color: "#888",
    fontSize: 13,
  },

  modalPasswordContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 11,
    marginBottom: 16,
  },

  modalPasswordInput: {
    flex: 1,
    height: "100%",
    color: "#fff",
    paddingHorizontal: 15,
    fontSize: 14,
  },

  modalEyeButton: {
    width: 48,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  modalEyeIcon: {
    width: 19,
    height: 19,
    resizeMode: "contain",
    tintColor: "#777",
  },

  modalErrorContainer: {
    backgroundColor: "#1b1010",
    borderWidth: 1,
    borderColor: "#3a1b1b",
    borderRadius: 9,
    padding: 10,
    marginTop: 15,
  },

  modalError: {
    color: "#ff6b6b",
    fontSize: 12,
    textAlign: "center",
  },
});
