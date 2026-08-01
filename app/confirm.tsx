import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createAppointment } from "../src/services/api";

export default function Confirm() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const services = params.services ? JSON.parse(params.services as string) : [];

  const date = params.date as string;
  const time = params.time as string;
  const barberId = params.barberId as string;

  const getBarberName = (id: any) => {
    if (Number(id) === 1) return "Barão";
    if (Number(id) === 2) return "...";
    if (Number(id) === 3) return "...";
    return "Barão";
  };

  const handleConfirm = async () => {
    try {
      const userStorage = await AsyncStorage.getItem("user");
      const user = userStorage ? JSON.parse(userStorage) : null;

      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado");
        return;
      }

      const payload = {
        userId: user.id || user._id,
        services,
        barberId: Number(barberId),
        date,
        time,
      };

      await createAppointment(payload);

      Alert.alert("Sucesso", "Agendamento confirmado!");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Erro", error?.response?.data?.error || "Erro ao agendar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmação</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.text}>
            Serviço: {services.map((s: any) => s.name).join(", ")}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.text}>
            Profissional: {getBarberName(barberId)}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.text}>
            {time} - {date}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirmar Agendamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingHorizontal: 20,
    justifyContent: "space-around",
    paddingVertical: 60,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "600",
    textAlign: "center",
  },

  card: {
    marginTop: 40,
    gap: 20,
  },

  row: {
    marginLeft: 50,
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4AF37",
    marginRight: 10,
  },

  text: {
    color: "#BFBFBF",
    fontSize: 20,
  },

  button: {
    backgroundColor: "#D4AF37",
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
});
