import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getSchedule, saveSchedule } from "../src/services/api";

export default function ScheduleAdmin() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [days, setDays] = useState<any[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const today = new Date();
    const nextDays: any[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const formatted = d.toISOString().split("T")[0];

      const day = d
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .toUpperCase()
        .replace(".", "");

      nextDays.push({
        fullDate: formatted,
        day,
        date: d.getDate(),
      });
    }

    setDays(nextDays);
    setSelectedDate(nextDays[0].fullDate);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedDate) load();
    }, [selectedDate]),
  );

  const load = async () => {
    try {
      const data = await getSchedule(selectedDate);
      setSlots(data.slots?.map((s: any) => s.time) || []);
    } catch (err) {
      console.log("Erro ao carregar horários", err);
    }
  };

  const addTime = () => {
    if (!newTime || slots.includes(newTime)) return;

    setSlots([...slots, newTime]);
    setNewTime("");
  };

  const removeTime = (time: string) => {
    setSlots(slots.filter((t) => t !== time));
  };

  const save = async () => {
    try {
      await saveSchedule({
        date: selectedDate,
        slots: slots.map((t) => ({ time: t })),
      });

      alert("Horários salvos 🔥");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controlar Horários</Text>

      {/* 🔥 CALENDÁRIO IGUAL AO CLIENTE */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={days}
        keyExtractor={(item) => item.fullDate}
        renderItem={({ item }) => {
          const selected = selectedDate === item.fullDate;

          return (
            <TouchableOpacity
              style={[styles.dateItem, selected && styles.dateActive]}
              onPress={() => setSelectedDate(item.fullDate)}
            >
              <Text style={[styles.dateDay, selected && styles.dateDayActive]}>
                {item.day}
              </Text>

              <Text
                style={[styles.dateNumber, selected && styles.dateNumberActive]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* INPUT */}
      <TextInput
        placeholder="Ex: 14:00"
        placeholderTextColor="#777"
        value={newTime}
        onChangeText={setNewTime}
        style={styles.input}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addTime}>
        <Text style={styles.btnText}>+ Adicionar horário</Text>
      </TouchableOpacity>

      {/* LISTA */}
      <FlatList
        data={slots}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slot}
            onPress={() => removeTime(item)}
          >
            <Text style={styles.slotText}>🕒 {item} (remover)</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.btnText}>Salvar</Text>
      </TouchableOpacity>

      {/* NAVBAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/schedule-admin")}>
          <Image
            source={require("../assets/images/calendar.png")}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/services-admin")}>
          <Image
            source={require("../assets/images/services.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0D0D0D",
  },

  title: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    marginTop: 60,
  },

  dateItem: {
    width: 60,
    height: 70,
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  dateActive: {
    backgroundColor: "#FFD700",
  },

  dateDay: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
  },

  dateDayActive: {
    color: "#000",
  },

  dateNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  dateNumberActive: {
    color: "#000",
  },

  input: {
    backgroundColor: "#1A1A1A",
    marginVertical: 15,
    padding: 14,
    borderRadius: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },

  addBtn: {
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  slot: {
    padding: 14,
    backgroundColor: "#1A1A1A",
    marginBottom: 10,
    borderRadius: 10,
  },

  slotText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  saveBtn: {
    backgroundColor: "#FFD700",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 70,
  },

  btnText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },

  tabBar: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    width: "70%",
  },

  icon: {
    width: 22,
    height: 22,
    tintColor: "#B0B0B0",
  },

  iconActive: {
    width: 22,
    height: 22,
    tintColor: "#D4AF37",
  },
});
