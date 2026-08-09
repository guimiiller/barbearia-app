import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  cancelAppointment,
  getAppointments,
  getServices,
} from "../src/services/api";

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    const checkMessage = async () => {
      const msg = await AsyncStorage.getItem("cancelMessage");

      if (msg) {
        alert(msg);

        await AsyncStorage.removeItem("cancelMessage");
      }
    };

    checkMessage();
  }, []);

  useEffect(() => {
    const load = async () => {
      await init();
    };

    load();
  }, []);
  const init = async () => {
    console.log("🔥 INIT CHAMOU");
    try {
      const token = await AsyncStorage.getItem("token");
      const userStorage = await AsyncStorage.getItem("user");

      console.log("🔥 TOKEN:", token);
      console.log("🔥 USER STORAGE:", userStorage);

      if (!token) {
        router.replace("/login");
        return;
      }

      if (userStorage) {
        const parsedUser = JSON.parse(userStorage);
        setUser(parsedUser);

        const [servicesData, appointmentsData] = await Promise.all([
          getServices(),
          getAppointments(parsedUser.id || parsedUser._id),
        ]);
        console.log("🔥 SERVICES API:", servicesData);

        const safeServices = Array.isArray(servicesData)
          ? servicesData
          : servicesData?.services || [];

        setServices(safeServices);
        setAppointments(appointmentsData || []);
      }
    } catch (err) {
      console.log("❌ Erro ao carregar home:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔥 SERVICES ATUALIZADO:", services);
  }, [services]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>Carregando...</Text>
      </View>
    );
  }

  const getBarberName = (id: any) => {
    if (Number(id) === 1) return "Barão";
    if (Number(id) === 2) return "...";
    if (Number(id) === 3) return "...";
    return "Barão";
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id);

      setAppointments((prev) => prev.filter((a: any) => a._id !== id));
    } catch (err) {
      console.log("Erro ao cancelar:", err);
    }
  };

  const handleReschedule = (appointment: any) => {
    router.push({
      pathname: "/schedule",
      params: {
        services: JSON.stringify(appointment.services),
        rescheduleId: appointment._id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user?.name || "Cliente"} 👋</Text>

      <Text style={styles.section}>Agendamentos</Text>

      <View style={styles.appointmentsWrapper}>
        <FlatList
          data={appointments}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }: any) => (
            <View style={styles.appointmentCard}>
              <View style={styles.headerCard}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>

              <View style={styles.servicesContainer}>
                {item.services?.map((s: any, index: number) => (
                  <Text key={index} style={styles.serviceItem}>
                    • {s.name}
                  </Text>
                ))}
              </View>

              <View style={styles.footerCard}>
                <Text style={styles.barber}>
                  {getBarberName(item.barberId)}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(item._id)}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rescheduleButton}
                  onPress={() => handleReschedule(item)}
                >
                  <Text style={styles.rescheduleText}>Reagendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      <Text style={styles.section}>Lista de serviços</Text>

      <FlatList
        data={services}
        numColumns={2}
        keyExtractor={(item: any) => item._id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }: any) => {
          const selected = selectedServices.includes(item._id);

          return (
            <TouchableOpacity
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => toggleService(item._id)}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardPrice}>R$ {item.price}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          const selectedFullServices = services.filter((s: any) =>
            selectedServices.includes(s._id),
          );

          router.push({
            pathname: "/schedule",
            params: {
              services: JSON.stringify(selectedFullServices),
            },
          });
        }}
      >
        <Text style={styles.buttonText}>Agendar Horário</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/")}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/profile")}
        >
          <Image
            source={require("../assets/images/user.png")}
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
    backgroundColor: "#0D0D0D",
    padding: 20,
    paddingBottom: 120,
    marginTop: 40,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  cancelMessage: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
  },

  section: {
    color: "#aaa",
    marginBottom: 10,
    marginTop: 10,
  },

  appointmentCard: {
    width: 200,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 15,
    marginRight: 12,
  },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  date: {
    color: "#aaa",
    fontSize: 12,
  },

  time: {
    color: "#CBA135",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#1C1C1C",
    width: "48%",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  cardSelected: {
    backgroundColor: "#D4AF37",
  },

  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
  },

  cardPrice: {
    color: "#ccc",
    marginTop: 5,
  },

  servicesContainer: {
    marginBottom: 10,
  },

  serviceItem: {
    color: "#ddd",
    fontSize: 13,
    marginBottom: 3,
  },

  footerCard: {
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 8,
  },

  barber: {
    color: "#CBA135",
    fontSize: 13,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#D4AF37",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    fontWeight: "bold",
  },

  logoutButton: {
    marginTop: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#FF4D4D",
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabItemActive: {
    width: 25,
    height: 25,
    backgroundColor: "#D4AF37",
    borderRadius: 5,
  },

  tabBar: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    backgroundColor: "#1A1A1A",
    paddingHorizontal: 25,
    paddingVertical: 12,

    borderRadius: 20,
    width: "70%",

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  iconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: "#555",
    borderRadius: 6,
    marginBottom: 4,
  },

  tabText: {
    color: "#888",
    fontSize: 12,
  },

  tabTextActive: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  icon: {
    width: 25,
    height: 25,
    tintColor: "#B0B0B0",
  },
  iconActive: {
    width: 25,
    height: 25,
    tintColor: "#D4AF37",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#D4AF37",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  cancelText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
  },

  rescheduleButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  rescheduleText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },

  appointmentsWrapper: {
    height: 250,
  },
});
