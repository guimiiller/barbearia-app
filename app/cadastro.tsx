import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerUser } from "../src/services/api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorTerms, setErrorTerms] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const clearFields = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setAcceptTerms(false);
  };

  const handleRegister = async () => {
    setErrorName("");
    setErrorEmail("");
    setErrorPhone("");
    setErrorPassword("");
    setErrorConfirmPassword("");
    setErrorTerms("");
    setErrorGeneral("");

    let hasError = false;

    if (!name.trim()) {
      setErrorName("Digite seu nome");
      hasError = true;
    }

    if (!email.trim()) {
      setErrorEmail("Digite seu e-mail");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setErrorEmail("E-mail inválido");
      hasError = true;
    }

    if (!phone.trim()) {
      setErrorPhone("Digite seu telefone");
      hasError = true;
    }

    if (!password) {
      setErrorPassword("Digite uma senha");
      hasError = true;
    } else if (password.length < 6) {
      setErrorPassword("Mínimo 6 caracteres");
      hasError = true;
    }

    if (!confirmPassword) {
      setErrorConfirmPassword("Confirme sua senha");
      hasError = true;
    } else if (password !== confirmPassword) {
      setErrorConfirmPassword("Senhas não coincidem");
      hasError = true;
    }

    if (!acceptTerms) {
      setErrorTerms("Aceite os termos para continuar");
      hasError = true;
    }

    if (hasError) return;

    try {
      await registerUser({
        name,
        email,
        password,
        phone,
      });

      clearFields();
      setShowSuccessModal(true);
    } catch (err: any) {
      console.log("ERRO COMPLETO:", err?.response?.data);

      setErrorGeneral(err?.response?.data?.error || "Erro ao cadastrar");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

          <Text style={styles.title}>Crie sua conta.</Text>

          <Text style={styles.subtitle}>
            Faça seu cadastro e agende seu próximo corte.
          </Text>
        </View>

        {/* FORM */}

        <View style={styles.form}>
          {/* NOME */}

          <View style={styles.field}>
            <Text style={styles.label}>NOME COMPLETO</Text>

            <TextInput
              placeholder="Seu nome"
              placeholderTextColor="#666"
              style={[styles.input, errorName ? styles.inputError : null]}
              value={name}
              autoCapitalize="words"
              onChangeText={(text) => {
                setName(text);
                setErrorName("");
                setErrorGeneral("");
              }}
            />

            {errorName ? <Text style={styles.error}>{errorName}</Text> : null}
          </View>

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

          {/* TELEFONE */}

          <View style={styles.field}>
            <Text style={styles.label}>TELEFONE</Text>

            <TextInput
              placeholder="(00) 00000-0000"
              placeholderTextColor="#666"
              style={[styles.input, errorPhone ? styles.inputError : null]}
              value={phone}
              keyboardType="phone-pad"
              onChangeText={(text) => {
                setPhone(text);
                setErrorPhone("");
                setErrorGeneral("");
              }}
            />

            {errorPhone ? <Text style={styles.error}>{errorPhone}</Text> : null}
          </View>

          {/* SENHA */}

          <View style={styles.field}>
            <Text style={styles.label}>SENHA</Text>

            <View
              style={[
                styles.passwordContainer,
                errorPassword ? styles.inputError : null,
              ]}
            >
              <TextInput
                placeholder="Mínimo 6 caracteres"
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
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
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

          {/* CONFIRMAR SENHA */}

          <View style={styles.field}>
            <Text style={styles.label}>CONFIRMAR SENHA</Text>

            <View
              style={[
                styles.passwordContainer,
                errorConfirmPassword ? styles.inputError : null,
              ]}
            >
              <TextInput
                placeholder="Digite sua senha novamente"
                placeholderTextColor="#666"
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
                value={confirmPassword}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrorConfirmPassword("");
                  setErrorGeneral("");
                }}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Image
                  source={
                    showConfirmPassword
                      ? require("../assets/images/eye-off.png")
                      : require("../assets/images/eye.png")
                  }
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {errorConfirmPassword ? (
              <Text style={styles.error}>{errorConfirmPassword}</Text>
            ) : null}
          </View>

          {/* ERRO GERAL */}

          {errorGeneral ? (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalError}>{errorGeneral}</Text>
            </View>
          ) : null}

          {/* TERMOS */}

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => {
              setAcceptTerms(!acceptTerms);
              setErrorTerms("");
            }}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, acceptTerms && styles.checkboxActive]}
            >
              {acceptTerms ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>

            <Text style={styles.termsText}>
              Aceito os{" "}
              <Text
                style={styles.linkTerms}
                onPress={() => setShowTermsModal(true)}
              >
                Termos de Uso
              </Text>
            </Text>
          </TouchableOpacity>

          {errorTerms ? <Text style={styles.error}>{errorTerms}</Text> : null}

          {/* CADASTRAR */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Criar minha conta</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>

          <Link href="/login" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.loginLink}>Fazer login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      {/* MODAL SUCESSO */}

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheck}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>Cadastro realizado</Text>

            <Text style={styles.modalText}>
              Sua conta foi criada com sucesso.
              {"\n"}
              Agora você já pode fazer login.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/login");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Ir para login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL TERMOS */}

      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.termsModalBox}>
            <Text style={styles.modalTitle}>Termos de Uso</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.termsScroll}
            >
              <Text style={styles.modalTextLeft}>
                Ao utilizar este aplicativo, você concorda com as seguintes
                condições:
                {"\n\n"}• Os agendamentos são de responsabilidade do usuário.
                {"\n\n"}• Cancelamentos devem ser feitos com antecedência.
                {"\n\n"}• O não comparecimento pode gerar bloqueio futuro.
                {"\n\n"}• Seus dados são usados apenas para funcionamento do
                aplicativo.
                {"\n\n"}
                Ao continuar, você aceita estes termos.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTermsModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  scrollContent: {
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
    marginBottom: 42,
  },

  brand: {
    alignItems: "center",
    marginBottom: 34,
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
    lineHeight: 20,
    paddingHorizontal: 15,
  },

  form: {
    width: "100%",
  },

  field: {
    marginBottom: 20,
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

  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 5,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "#141414",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkboxActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  checkmark: {
    color: "#000",
    fontSize: 14,
    fontWeight: "900",
  },

  termsText: {
    color: "#777",
    fontSize: 12,
    flex: 1,
  },

  linkTerms: {
    color: "#fff",
    fontWeight: "700",
  },

  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },

  footer: {
    alignItems: "center",
    marginTop: 30,
  },

  footerText: {
    color: "#666",
    fontSize: 13,
    marginBottom: 7,
  },

  loginLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  modalBox: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
  },

  termsModalBox: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: "78%",
  },

  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  successCheck: {
    color: "#000",
    fontSize: 28,
    fontWeight: "800",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },

  modalText: {
    color: "#888",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },

  modalTextLeft: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 22,
  },

  termsScroll: {
    marginVertical: 15,
  },

  modalButton: {
    backgroundColor: "#fff",
    height: 52,
    borderRadius: 11,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },
});
