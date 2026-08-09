import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAllAppointments, getSchedule } from "../src/services/api";

export default function Schedule() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rescheduleId = params.rescheduleId as string | undefined;
  const services = params.services ? JSON.parse(params.services as string) : [];

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedBarber, setSelectedBarber] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [appointments, setAppointments] = useState<any[]>([]);
  const [times, setTimes] = useState<string[]>([]);

  const barbers = [
    { id: 1, name: "Barão" },
    { id: 2, name: "..." },
    { id: 3, name: "..." },
  ];

  const generateDates = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const future = new Date();
      future.setDate(today.getDate() + i);

      const day = future
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .toUpperCase()
        .replace(".", "");

      days.push({
        fullDate: formatDate(future),
        day,
        date: future.getDate(),
      });
    }

    return days;
  };

  const dates = generateDates();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getAllAppointments();
        setAppointments(data || []);
      } catch (err) {
        console.log("Erro ao buscar agendamentos", err);
      }
    };

    loadAppointments();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await getSchedule(selectedDate);

        const horarios = data?.slots?.map((s: any) => s.time) || [];

        const uniqueSorted = [...new Set(horarios as string[])].sort();

        setTimes(uniqueSorted);
        setSelectedTime(null);
      } catch (err) {
        console.log("Erro ao carregar horários", err);
      }
    };

    if (selectedDate) {
      loadSchedule();
    }
  }, [selectedDate]);

  const availableTimes = times.filter((t) => {
    return !appointments.some((a) => {
      const date = a.date.includes("T") ? a.date.split("T")[0] : a.date;

      return (
        date === selectedDate &&
        a.time === t &&
        Number(a.barberId) === Number(selectedBarber)
      );
    });
  });

  const handleGoToConfirm = () => {
    if (!selectedTime) {
      Alert.alert("Erro", "Selecione um horário");
      return;
    }

    router.push({
      pathname: "/confirm",
      params: {
        services: JSON.stringify(services),
        date: selectedDate,
        time: selectedTime,
        barberId: selectedBarber,
        rescheduleId: rescheduleId || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamento</Text>

      <Text style={styles.section}>Escolha a data</Text>

      <View style={styles.calendar}>
        {dates.map((item) => {
          const selected = selectedDate === item.fullDate;

          return (
            <TouchableOpacity
              key={item.fullDate}
              style={[styles.dateItem, selected && styles.dateActive]}
              onPress={() => setSelectedDate(item.fullDate)}
            >
              <Text style={[styles.dateDay, selected && { color: "#000" }]}>
                {item.day}
              </Text>

              <Text style={[styles.dateNumber, selected && { color: "#000" }]}>
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.section}>Escolha seu barbeiro</Text>

      <View style={styles.barbers}>
        {barbers.map((barber) => (
          <View key={barber.id} style={styles.barberWrapper}>
            <TouchableOpacity
              onPress={() => setSelectedBarber(barber.id)}
              style={
                selectedBarber === barber.id
                  ? styles.barberActive
                  : styles.barber
              }
            />
            <Text style={styles.barberName}>{barber.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.times}>
        {availableTimes.length === 0 ? (
          <Text style={{ color: "#888" }}>Nenhum horário disponível</Text>
        ) : (
          availableTimes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.time, selectedTime === t && styles.timeActive]}
              onPress={() => setSelectedTime(t)}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime === t && { color: "#000" },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, !selectedTime && { opacity: 0.5 }]}
        disabled={!selectedTime}
        onPress={handleGoToConfirm}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 20,
    marginTop: 40,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  section: {
    color: "#fff",
    marginBottom: 10,
    marginTop: 10,
  },

  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dateItem: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  dateActive: {
    backgroundColor: "#CBA135",
  },

  dateDay: {
    color: "#aaa",
    fontSize: 10,
  },

  dateNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  barbers: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },

  barberWrapper: {
    alignItems: "center",
    marginHorizontal: 10,
  },

  barber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1A1A1A",
  },

  barberActive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#CBA135",
  },

  barberName: {
    color: "#fff",
    fontSize: 11,
    marginTop: 6,
    opacity: 0.8,
  },

  times: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  time: {
    width: "30%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
    marginBottom: 10,
    alignItems: "center",
  },

  timeActive: {
    backgroundColor: "#CBA135",
  },

  timeText: {
    color: "#fff",
  },

  button: {
    backgroundColor: "#CBA135",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
});
