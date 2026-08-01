import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStorage = await AsyncStorage.getItem("user");

    if (userStorage) {
      const user = JSON.parse(userStorage);
      setName(user.name);
      setEmail(user.email);
    }
  };

  const handleSave = async () => {
    try {
      const userStorage = await AsyncStorage.getItem("user");
      const user = userStorage ? JSON.parse(userStorage) : null;

      // 🔥 atualiza no backend
      const updatedUser = await updateUser(user.id, {
        name,
        email,
      });

      // 🔥 salva atualizado local
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Sucesso", "Perfil atualizado!");
      router.back();
    } catch (err: any) {
      console.log("ERRO COMPLETO:", err.response?.data || err);
      Alert.alert("Erro", "Não foi possível atualizar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#1A1A1A",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
});
