import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [errorPhone, setErrorPhone] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
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
    setAcceptTerms(false);
  };

  const handleRegister = async () => {
    setErrorName("");
    setErrorEmail("");
    setErrorPassword("");
    setErrorConfirmPassword("");
    setErrorTerms("");
    setErrorGeneral("");

    let hasError = false;

    if (!name) {
      setErrorName("Digite seu nome");
      hasError = true;
    }

    if (!email) {
      setErrorEmail("Digite seu e-mail");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setErrorEmail("E-mail inválido");
      hasError = true;
    }

    if (!phone) {
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
      setErrorTerms("Aceite os termos");
      hasError = true;
    }

    if (hasError) return;

    try {
      await registerUser({ name, email, password, phone });

      clearFields();
      setShowSuccessModal(true);
    } catch (err: any) {
      console.log("ERRO COMPLETO:", err?.response?.data);
      setErrorGeneral(err?.response?.data?.error || "Erro ao cadastrar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Logo Barão</Text>

      <View style={styles.inputs}>
        <TextInput
          placeholder="Nome completo"
          placeholderTextColor="#777"
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrorName("");
          }}
        />
        {errorName ? <Text style={styles.error}>{errorName}</Text> : null}

        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#777"
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorEmail("");
          }}
        />
        {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}

        <TextInput
          placeholder="Telefone"
          placeholderTextColor="#777"
          style={styles.input}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setErrorPhone("");
          }}
        />

        {errorPhone ? <Text style={styles.error}>{errorPhone}</Text> : null}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            style={styles.inputPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                showPassword
                  ? require("../assets/images/eye-off.png")
                  : require("../assets/images/eye.png")
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirmar senha"
            placeholderTextColor="#777"
            secureTextEntry={!showConfirmPassword}
            style={styles.inputPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Image
              source={
                showConfirmPassword
                  ? require("../assets/images/eye-off.png")
                  : require("../assets/images/eye.png")
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {errorGeneral ? (
          <Text style={styles.errorCenter}>{errorGeneral}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setAcceptTerms(!acceptTerms)}
      >
        <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]} />

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎉 Sucesso</Text>
            <Text>Cadastro realizado!</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/login");
              }}
            >
              <Text style={styles.modalButtonText}>Ir para login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📄 Termos de Uso</Text>

            <Text style={{ color: "#fff", margin: 20 }}>
              Ao utilizar este aplicativo, você concorda com as seguintes
              condições:
              {"\n\n"}• Os agendamentos são de responsabilidade do usuário.
              {"\n"}• Cancelamentos devem ser feitos com antecedência.
              {"\n"}• O não comparecimento pode gerar bloqueio futuro.
              {"\n"}• Seus dados são usados apenas para funcionamento do app.
              {"\n\n"}Ao continuar, você aceita estes termos.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.footerText}>
        Já tem uma conta?{" "}
        <Link href="/login" style={styles.link}>
          Fazer login
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
    marginBottom: 30,
  },

  inputs: {
    width: "100%",
  },

  input: {
    backgroundColor: "#1C1C1C",
    padding: 16,
    borderRadius: 14,
    color: "#fff",
    marginBottom: 12,
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#D4AF37",
    marginRight: 8,
    borderRadius: 4,
  },

  checkboxActive: {
    backgroundColor: "#D4AF37",
  },

  termsText: {
    color: "#aaa",
    fontSize: 12,
    flex: 1,
  },

  link: {
    color: "#4DA6FF",
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
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: "#777",
    fontSize: 13,
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
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
    textAlign: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#1C1C1C",
    padding: 25,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },

  modalTitle: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalText: {
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },

  modalButton: {
    backgroundColor: "#D4AF37",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  modalButtonText: {
    fontWeight: "bold",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 14,
    paddingHorizontal: 10,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,

    elevation: 5,
  },

  inputPassword: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
    color: "#fff",
  },

  iconInput: {
    width: 22,
    height: 22,
    tintColor: "#aaa",
  },

  linkTerms: {
    color: "#D4AF37",
    fontWeight: "bold",
  },

  termsBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
  },

  termsContent: {
    marginTop: 10,
    color: "#fff",
    fontSize: 14,
  },
});
