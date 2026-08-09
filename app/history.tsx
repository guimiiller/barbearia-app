import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getAppointments } from "../src/services/api";

export default function History() {
  const [appointments, setAppointments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, []),
  );

  const loadAppointments = async () => {
    try {
      const userStorage = await AsyncStorage.getItem("user");
      const user = userStorage ? JSON.parse(userStorage) : null;

      const data = await getAppointments(user.id);

      setAppointments(data || []);
    } catch (err) {
      console.log("Erro ao carregar histórico:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.date}>
              {item.date} - {item.time}
            </Text>

            {item.services?.map((s: any, index: number) => (
              <Text key={index} style={styles.service}>
                • {s.name}
              </Text>
            ))}

            <Text style={styles.status}>
              {item.status === "cancelado" ? "❌ Cancelado" : "✅ Confirmado"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 60,
  },

  card: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  date: {
    color: "#D4AF37",
    fontWeight: "bold",
  },

  service: {
    color: "#fff",
    marginTop: 5,
  },

  status: {
    marginTop: 10,
    color: "#aaa",
  },
});
