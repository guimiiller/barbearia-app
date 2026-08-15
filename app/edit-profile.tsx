import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { updateUser } from "../src/services/api";

export default function EditProfile() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userStorage = await AsyncStorage.getItem("user");

      if (!userStorage) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userStorage);

      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    } catch (error) {
      console.log("❌ Erro ao carregar usuário:", error);

      Alert.alert("Erro", "Não foi possível carregar os dados do seu perfil.");
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Atenção", "Digite seu nome.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Atenção", "Digite seu telefone.");
      return;
    }

    try {
      setLoading(true);

      const userStorage = await AsyncStorage.getItem("user");

      const user = userStorage ? JSON.parse(userStorage) : null;

      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      const updatedUser = await updateUser(user.id || user._id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Tudo certo!", "Seu perfil foi atualizado com sucesso.", [
        {
          text: "Continuar",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.log("❌ ERRO AO ATUALIZAR PERFIL:", err?.response?.data || err);

      Alert.alert(
        "Não foi possível salvar",
        err?.response?.data?.error ||
          "Ocorreu um erro ao atualizar seu perfil.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    if (!name.trim()) return "U";

    return name.trim().charAt(0).toUpperCase();
  };

  if (loadingUser) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>SUA CONTA</Text>

            <Text style={styles.title}>Editar perfil</Text>
          </View>
        </View>

        {/* AVATAR */}

        <View style={styles.profilePreview}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>

          <View style={styles.profilePreviewInfo}>
            <Text style={styles.previewName}>{name || "Seu nome"}</Text>

            <Text style={styles.previewDescription}>
              Mantenha seus dados atualizados
            </Text>
          </View>
        </View>

        {/* FORM */}

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>INFORMAÇÕES PESSOAIS</Text>

          <View style={styles.field}>
            <Text style={styles.label}>NOME</Text>

            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-MAIL</Text>

            <TextInput
              style={styles.input}
              placeholder="seuemail@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>TELEFONE</Text>

            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* INFO */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Seus dados estão seguros</Text>

            <Text style={styles.infoText}>
              Essas informações são utilizadas para facilitar seus agendamentos
              e manter seu cadastro atualizado.
            </Text>
          </View>
        </View>

        {/* BUTTON */}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.buttonText}>Salvar alterações</Text>

              <Text style={styles.buttonArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: "#080808",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 36,
    marginTop: -4,
  },

  headerTextContainer: {
    flex: 1,
  },

  eyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.7,
  },

  /* PROFILE PREVIEW */

  profilePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 18,
    marginBottom: 34,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "800",
  },

  profilePreviewInfo: {
    flex: 1,
  },

  previewName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 5,
  },

  previewDescription: {
    color: "#777",
    fontSize: 12,
    lineHeight: 18,
  },

  /* FORM */

  section: {
    marginBottom: 24,
  },

  sectionEyebrow: {
    color: "#777",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 18,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    color: "#8A8A8A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  input: {
    height: 56,
    backgroundColor: "#141414",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#252525",
    color: "#FFFFFF",
    paddingHorizontal: 17,
    fontSize: 15,
  },

  /* INFO */

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#101010",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 16,
    marginBottom: 25,
  },

  infoIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 1,
  },

  infoIconText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#DCDCDC",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  infoText: {
    color: "#686868",
    fontSize: 11,
    lineHeight: 17,
  },

  /* BUTTON */

  button: {
    height: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonArrow: {
    color: "#000000",
    fontSize: 22,
    marginLeft: 12,
    marginTop: -2,
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    marginTop: 4,
  },

  cancelButtonText: {
    color: "#777777",
    fontSize: 13,
    fontWeight: "600",
  },
});
