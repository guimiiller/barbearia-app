import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  Platform,
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

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

function FadeInUp({
  children,
  delay = 0,
  distance = 24,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 550,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function ScaleButton({
  children,
  style,
  onPress,
  disabled = false,
}: {
  children: ReactNode;
  style?: any;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    Animated.spring(scale, {
      toValue: 0.96,
      speed: 35,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;

    Animated.spring(scale, {
      toValue: 1,
      speed: 25,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        style,
        {
          transform: [{ scale }],
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [services, setServices] = useState<any[]>([]);

  const [appointments, setAppointments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Carregando sua experiência...",
  );

  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const [cancelledByAdmin, setCancelledByAdmin] = useState(false);

  const serviceAnimations = useRef<Record<string, Animated.Value>>({}).current;

  const getServiceAnimation = (id: string) => {
    if (!serviceAnimations[id]) {
      serviceAnimations[id] = new Animated.Value(1);
    }

    return serviceAnimations[id];
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    if (!loading) {
      setLoadingMessage("Carregando sua experiência...");
      return;
    }

    setLoadingMessage("Carregando sua experiência...");

    const timer1 = setTimeout(() => {
      setLoadingMessage("Conectando à Barão Barbearia...");
    }, 3000);

    const timer2 = setTimeout(() => {
      setLoadingMessage("Buscando serviços e agendamentos...");
    }, 7000);

    const timer3 = setTimeout(() => {
      setLoadingMessage("Estamos preparando tudo para você...");
    }, 12000);

    const timer4 = setTimeout(() => {
      setLoadingMessage("O primeiro acesso pode levar um instante...");
    }, 18000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [loading]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (!storedUser) {
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        const appointmentsData = await getAppointments(
          parsedUser.id || parsedUser._id,
        );

        // =================================================
        // VERIFICAR CANCELAMENTO FEITO PELO ADMIN
        // =================================================

        const canceledByAdmin = (appointmentsData || []).filter(
          (appointment: any) =>
            appointment.status === "cancelado" &&
            appointment.cancelledBy === "admin",
        );

        for (const appointment of canceledByAdmin) {
          const notificationKey = `cancelamento_aviso_${appointment._id}`;

          const alreadyShown = await AsyncStorage.getItem(notificationKey);

          if (alreadyShown === "true") {
            continue;
          }

          await AsyncStorage.setItem(notificationKey, "true");

          const message =
            "O administrador cancelou seu agendamento. Entre em contato com a barbearia para mais informações.";

          if (typeof window !== "undefined") {
            window.alert(message);
          } else {
            Alert.alert("Agendamento cancelado", message);
          }

          break;
        }

        // =================================================
        // ATUALIZAR CARD DA HOME
        // =================================================

        const activeAppointments = (appointmentsData || []).filter(
          (appointment: any) => appointment.status === "agendado",
        );

        setAppointments(activeAppointments);
      } catch (error) {
        console.log(
          "❌ Erro ao atualizar agendamentos automaticamente:",
          error,
        );
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");

        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      const [servicesData, appointmentsData] = await Promise.all([
        getServices(),
        getAppointments(parsedUser.id),
      ]);

      console.log("🔎 AGENDAMENTOS DO CLIENTE:", appointmentsData);

      setServices(servicesData || []);

      const canceledAppointmentsByAdmin = (appointmentsData || []).filter(
        (appointment: any) =>
          appointment.status === "cancelado" &&
          appointment.cancelledBy === "admin",
      );

      if (canceledAppointmentsByAdmin.length > 0) {
        for (const appointment of canceledAppointmentsByAdmin) {
          const notificationKey = `cancelamento_aviso_${appointment._id}`;

          const alreadyShown = await AsyncStorage.getItem(notificationKey);

          if (alreadyShown === "true") {
            continue;
          }

          // Marca como visualizado para não mostrar toda hora
          await AsyncStorage.setItem(notificationKey, "true");

          const message =
            "O administrador cancelou seu agendamento. Entre em contato com a barbearia para mais informações.";

          if (typeof window !== "undefined") {
            window.alert(message);
          } else {
            Alert.alert("Agendamento cancelado", message);
          }

          break;
        }
      }

      const activeAppointments = (appointmentsData || []).filter(
        (appointment: any) => appointment.status !== "cancelado",
      );

      setAppointments(activeAppointments);
    } catch (error) {
      console.log("❌ Erro ao carregar home:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && cancelledByAdmin) {
      Alert.alert(
        "Agendamento cancelado",
        "Seu agendamento foi cancelado pelo administrador.",
        [
          {
            text: "OK",

            onPress: () => {
              setCancelledByAdmin(false);
            },
          },
        ],
      );
    }
  }, [loading, cancelledByAdmin]);

  const toggleService = (service: any) => {
    const alreadySelected = selectedServices.some(
      (selected) => selected._id === service._id,
    );

    const animation = getServiceAnimation(service._id);

    Animated.sequence([
      Animated.spring(animation, {
        toValue: 0.94,
        speed: 40,
        bounciness: 0,
        useNativeDriver: true,
      }),

      Animated.spring(animation, {
        toValue: 1,
        speed: 25,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (alreadySelected) {
      setSelectedServices((prev) =>
        prev.filter((selected) => selected._id !== service._id),
      );

      return;
    }

    setSelectedServices((prev) => [...prev, service]);
  };

  const handleSchedule = () => {
    if (selectedServices.length === 0) {
      const message = "Escolha pelo menos um serviço antes de continuar.";

      if (typeof window !== "undefined") {
        window.alert(message);
      } else {
        Alert.alert("Selecione um serviço", message);
      }

      return;
    }

    router.push({
      pathname: "/schedule",
      params: {
        services: JSON.stringify(selectedServices),
      },
    });
  };
  const performCancel = async (appointment: any) => {
    try {
      const response = await cancelAppointment(appointment._id, "client");

      console.log("✅ CANCELAMENTO:", response);

      await loadData();

      if (response.blocked) {
        const message =
          "Seu agendamento foi cancelado com sucesso. Você atingiu o limite de 3 cancelamentos neste mês e ficará 24 horas sem poder realizar novos agendamentos.";

        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Agendamento cancelado", message);
        }

        return;
      }

      const message = "Seu agendamento foi cancelado com sucesso.";

      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Agendamento cancelado", message);
      }
    } catch (error: any) {
      console.log("❌ ERRO AO CANCELAR:", error?.response?.data || error);

      const message =
        error?.response?.data?.error ||
        "Não foi possível cancelar o agendamento.";

      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Não foi possível cancelar", message);
      }
    }
  };

  const handleCancel = (appointment: any) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja cancelar este agendamento?",
      );

      if (confirmed) {
        performCancel(appointment);
      }

      return;
    }

    Alert.alert(
      "Cancelar agendamento",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => performCancel(appointment),
        },
      ],
    );
  };

  const handleReschedule = (appointment: any) => {
    router.push({
      pathname: "/schedule",

      params: {
        rescheduleId: appointment._id,

        services: JSON.stringify(appointment.services || []),
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    return `${day} ${months[date.getMonth()]}`;
  };

  const getBarberName = (barberId: number | string) => {
    const id = Number(barberId);

    if (id === 1) return "Barão";
    if (id === 2) return "Kauan";
    if (id === 3) return "Mario";

    return "Barbeiro";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Bom dia";

    if (hour < 18) return "Boa tarde";

    return "Boa noite";
  };

  return (
    <View style={styles.container}>
      <FadeInUp delay={0} distance={15} style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>

          <Text style={styles.userName}>{user?.name || "Cliente"} 👋</Text>
        </View>

        <ScaleButton
          style={styles.profileButton}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.profileText}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </ScaleButton>
      </FadeInUp>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />

          <Text style={styles.loadingTitle}>Preparando sua experiência</Text>

          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={(_, index) => String(index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              {/* =========================================
                  HERO
              ========================================= */}

              <FadeInUp delay={80} distance={28} style={styles.hero}>
                <View style={styles.heroTop}>
                  <View style={styles.heroIcon}>
                    <Text style={styles.heroIconText}>✦</Text>
                  </View>

                  <Text style={styles.heroLabel}>BARÃO BARBER</Text>
                </View>

                <Text style={styles.heroTitle}>
                  Seu próximo{"\n"}
                  visual começa aqui.
                </Text>

                <Text style={styles.heroDescription}>
                  Escolha seus serviços e reserve seu horário em poucos
                  segundos.
                </Text>

                <ScaleButton
                  style={[
                    styles.primaryButton,
                    selectedServices.length === 0 &&
                      styles.primaryButtonDisabled,
                  ]}
                  onPress={handleSchedule}
                  disabled={selectedServices.length === 0}
                >
                  <Text style={styles.primaryButtonText}>
                    {selectedServices.length > 0
                      ? `Agendar horário (${selectedServices.length})`
                      : "Escolha um serviço"}
                  </Text>

                  <Text style={styles.primaryArrow}>→</Text>
                </ScaleButton>
              </FadeInUp>

              {/* =========================================
                  PRÓXIMO AGENDAMENTO
              ========================================= */}

              {appointments.length > 0 && (
                <FadeInUp delay={180} distance={28} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionEyebrow}>SEU HORÁRIO</Text>

                      <Text style={styles.sectionTitle}>
                        Próximo agendamento
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentCard}>
                    <View style={styles.appointmentTop}>
                      <View>
                        <Text style={styles.appointmentDateLabel}>DATA</Text>

                        <Text style={styles.appointmentDate}>
                          {formatDate(appointments[0].date)}
                        </Text>
                      </View>

                      <FadeInUp
                        delay={280}
                        distance={10}
                        style={styles.timeBadge}
                      >
                        <Text style={styles.timeBadgeText}>
                          {appointments[0].time}
                        </Text>
                      </FadeInUp>
                    </View>

                    <View style={styles.appointmentDivider} />

                    <View style={styles.appointmentInfo}>
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>SERVIÇO</Text>

                        <Text style={styles.infoValue}>
                          {appointments[0].services
                            ?.map((service: any) => service.name)
                            .join(", ") || "Serviço"}
                        </Text>
                      </View>
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>BARBEIRO</Text>

                        <Text style={styles.infoValue}>
                          {getBarberName(appointments[0].barberId)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentActions}>
                      <ScaleButton
                        style={styles.secondaryButton}
                        onPress={() => handleReschedule(appointments[0])}
                      >
                        <Text style={styles.secondaryButtonText}>
                          Reagendar
                        </Text>
                      </ScaleButton>

                      <ScaleButton
                        style={styles.cancelButton}
                        onPress={() => handleCancel(appointments[0])}
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </ScaleButton>
                    </View>
                  </View>
                </FadeInUp>
              )}

              {/* =========================================
                  OUTROS AGENDAMENTOS
              ========================================= */}

              {appointments.length > 1 && (
                <FadeInUp delay={260} distance={25} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionEyebrow}>AGENDA</Text>

                      <Text style={styles.sectionTitle}>Outros horários</Text>
                    </View>
                  </View>

                  <FlatList
                    horizontal
                    data={appointments.slice(1)}
                    keyExtractor={(item) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item, index }) => (
                      <FadeInUp delay={320 + index * 80} distance={18}>
                        <View style={styles.smallAppointmentCard}>
                          <Text style={styles.smallDate}>
                            {formatDate(item.date)}
                          </Text>

                          <Text style={styles.smallTime}>{item.time}</Text>

                          <Text style={styles.smallService} numberOfLines={1}>
                            {item.services
                              ?.map((service: any) => service.name)
                              .join(", ") || "Serviço"}
                          </Text>

                          <ScaleButton
                            style={styles.smallButton}
                            onPress={() => handleReschedule(item)}
                          >
                            <Text style={styles.smallButtonText}>
                              Reagendar
                            </Text>
                          </ScaleButton>
                        </View>
                      </FadeInUp>
                    )}
                  />
                </FadeInUp>
              )}

              {/* =========================================
                  SERVIÇOS
              ========================================= */}

              <FadeInUp delay={330} distance={28} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionEyebrow}>EXPERIÊNCIA</Text>

                    <Text style={styles.sectionTitle}>Nossos serviços</Text>
                  </View>

                  <Text style={styles.selectedCount}>
                    {selectedServices.length > 0
                      ? `${selectedServices.length} selecionado${
                          selectedServices.length > 1 ? "s" : ""
                        }`
                      : "Selecione"}
                  </Text>
                </View>

                {services.length === 0 ? (
                  <View style={styles.emptyServices}>
                    <Text style={styles.emptyServicesText}>
                      Nenhum serviço disponível.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.servicesGrid}>
                    {services.slice(0, 4).map((service, index) => {
                      const selected = selectedServices.some(
                        (item) => item._id === service._id,
                      );

                      const scale = getServiceAnimation(service._id);

                      return (
                        <FadeInUp
                          key={service._id}
                          delay={420 + index * 90}
                          distance={22}
                          style={styles.serviceCardWrapper}
                        >
                          <AnimatedTouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => toggleService(service)}
                            style={[
                              styles.serviceCard,
                              selected && styles.serviceCardSelected,
                              {
                                transform: [
                                  {
                                    scale,
                                  },
                                ],
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.serviceIcon,
                                selected && styles.serviceIconSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.serviceIconText,
                                  selected && styles.serviceIconTextSelected,
                                ]}
                              >
                                {selected ? "✓" : "✦"}
                              </Text>
                            </View>

                            <Text
                              style={[
                                styles.serviceName,
                                selected && styles.serviceNameSelected,
                              ]}
                            >
                              {service.name}
                            </Text>

                            <Text
                              style={[
                                styles.servicePrice,
                                selected && styles.servicePriceSelected,
                              ]}
                            >
                              R$ {Number(service.price).toFixed(2)}
                            </Text>

                            {selected && (
                              <FadeInUp
                                delay={0}
                                distance={6}
                                style={styles.selectedBadge}
                              >
                                <Text style={styles.selectedBadgeText}>
                                  SELECIONADO
                                </Text>
                              </FadeInUp>
                            )}
                          </AnimatedTouchableOpacity>
                        </FadeInUp>
                      );
                    })}
                  </View>
                )}

                {/* =====================================
                    BOTÃO DE CONTINUAR
                ===================================== */}

                {selectedServices.length > 0 && (
                  <FadeInUp delay={0} distance={16}>
                    <ScaleButton
                      style={styles.servicesScheduleButton}
                      onPress={handleSchedule}
                    >
                      <Text style={styles.servicesScheduleButtonText}>
                        Continuar com {selectedServices.length} serviço
                        {selectedServices.length > 1 ? "s" : ""}
                      </Text>

                      <Text style={styles.servicesScheduleArrow}>→</Text>
                    </ScaleButton>
                  </FadeInUp>
                )}
              </FadeInUp>

              {/* =========================================
                  CTA FINAL
              ========================================= */}

              <FadeInUp delay={650} distance={30} style={styles.bottomCta}>
                <Text style={styles.bottomCtaSmall}>ESTILO É DETALHE</Text>

                <Text style={styles.bottomCtaTitle}>
                  Pronto para o próximo corte?
                </Text>

                <ScaleButton
                  style={styles.bottomCtaButton}
                  onPress={handleSchedule}
                >
                  <Text style={styles.bottomCtaButtonText}>
                    Encontrar um horário
                  </Text>
                </ScaleButton>
              </FadeInUp>
            </>
          }
          renderItem={null}
        />
      )}

      {/* =================================================
          NAVBAR
      ================================================= */}

      <FadeInUp delay={450} distance={20} style={styles.tabBar}>
        <ScaleButton
          style={styles.tabItem}
          onPress={() => router.push("/home")}
        >
          <Image
            source={require("../assets/images/home.png")}
            style={styles.iconActive}
          />

          <Text style={styles.tabTextActive}>Início</Text>
        </ScaleButton>
      </FadeInUp>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: "#888",

    fontSize: 13,

    marginBottom: 3,

    letterSpacing: 0.5,
  },

  userName: {
    color: "#FFFFFF",

    fontSize: 25,

    fontWeight: "700",

    letterSpacing: -0.5,
  },

  profileButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: "#000000",

    fontSize: 17,

    fontWeight: "800",
  },

  content: {
    paddingHorizontal: 18,

    paddingBottom: 120,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 22,
  },

  loadingText: {
    color: "#8E8E8E",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  hero: {
    backgroundColor: "#171717",

    borderRadius: 24,

    padding: 24,

    marginBottom: 32,

    borderWidth: 1,

    borderColor: "#292929",

    overflow: "hidden",
  },

  heroTop: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 25,
  },

  heroIcon: {
    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,
  },

  heroIconText: {
    color: "#000000",

    fontSize: 16,
  },

  heroLabel: {
    color: "#AAAAAA",

    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 2,
  },

  heroTitle: {
    color: "#FFFFFF",

    fontSize: 32,

    lineHeight: 36,

    fontWeight: "800",

    letterSpacing: -1,

    marginBottom: 14,
  },

  heroDescription: {
    color: "#929292",

    fontSize: 14,

    lineHeight: 21,

    maxWidth: 280,

    marginBottom: 25,
  },

  primaryButton: {
    height: 54,

    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  primaryButtonText: {
    color: "#000000",

    fontSize: 15,

    fontWeight: "800",
  },

  primaryArrow: {
    color: "#000000",

    fontSize: 22,

    fontWeight: "500",
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  section: {
    marginBottom: 32,
  },

  sectionHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-end",

    marginBottom: 15,
  },

  sectionEyebrow: {
    color: "#666666",

    fontSize: 10,

    fontWeight: "800",

    letterSpacing: 1.7,

    marginBottom: 5,
  },

  sectionTitle: {
    color: "#FFFFFF",

    fontSize: 21,

    fontWeight: "700",

    letterSpacing: -0.4,
  },

  seeAll: {
    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "600",
  },

  appointmentCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 20,
  },

  appointmentTop: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  appointmentDateLabel: {
    color: "#777777",

    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 1.5,

    marginBottom: 5,
  },

  appointmentDate: {
    color: "#000000",

    fontSize: 25,

    fontWeight: "800",
  },

  timeBadge: {
    backgroundColor: "#0B0B0B",

    paddingHorizontal: 14,

    paddingVertical: 9,

    borderRadius: 12,
  },

  timeBadgeText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "800",
  },

  appointmentDivider: {
    height: 1,

    backgroundColor: "#E5E5E5",

    marginVertical: 18,
  },

  appointmentInfo: {
    flexDirection: "row",

    marginBottom: 20,
  },

  infoBlock: {
    flex: 1,
  },

  infoLabel: {
    color: "#999999",

    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 1.3,

    marginBottom: 5,
  },

  infoValue: {
    color: "#111111",

    fontSize: 14,

    fontWeight: "600",
  },

  appointmentActions: {
    flexDirection: "row",

    gap: 10,
  },

  secondaryButton: {
    flex: 1,

    height: 46,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: "#D5D5D5",

    alignItems: "center",

    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#000000",

    fontSize: 13,

    fontWeight: "700",
  },

  cancelButton: {
    flex: 1,

    height: 46,

    borderRadius: 12,

    backgroundColor: "#111111",

    alignItems: "center",

    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "700",
  },

  horizontalList: {
    gap: 12,
  },

  smallAppointmentCard: {
    width: 190,

    backgroundColor: "#171717",

    borderRadius: 18,

    padding: 18,

    borderWidth: 1,

    borderColor: "#292929",
  },

  smallDate: {
    color: "#AAAAAA",

    fontSize: 12,

    marginBottom: 7,
  },

  smallTime: {
    color: "#FFFFFF",

    fontSize: 25,

    fontWeight: "800",

    marginBottom: 7,
  },

  smallService: {
    color: "#777777",

    fontSize: 12,

    marginBottom: 18,
  },

  smallButton: {
    height: 38,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    alignItems: "center",

    justifyContent: "center",
  },

  smallButtonText: {
    color: "#000000",

    fontSize: 12,

    fontWeight: "800",
  },

  servicesGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 12,
  },

  serviceCardWrapper: {
    width: "48%",
  },

  serviceCard: {
    width: "100%",

    minHeight: 155,

    backgroundColor: "#151515",

    borderRadius: 18,

    padding: 17,

    borderWidth: 1,

    borderColor: "#292929",

    justifyContent: "space-between",
  },

  serviceCardSelected: {
    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#FFFFFF",
  },

  serviceIcon: {
    width: 35,

    height: 35,

    borderRadius: 18,

    backgroundColor: "#242424",

    alignItems: "center",

    justifyContent: "center",
  },

  serviceIconSelected: {
    backgroundColor: "#000000",
  },

  serviceIconText: {
    color: "#FFFFFF",

    fontSize: 14,
  },

  serviceIconTextSelected: {
    color: "#FFFFFF",
  },

  serviceName: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",

    marginTop: 15,
  },

  serviceNameSelected: {
    color: "#000000",
  },

  servicePrice: {
    color: "#999999",

    fontSize: 13,

    marginTop: 7,
  },

  servicePriceSelected: {
    color: "#333333",
  },

  selectedBadge: {
    position: "absolute",

    top: 10,

    right: 10,

    backgroundColor: "#000000",

    borderRadius: 20,

    minWidth: 22,

    height: 22,

    alignItems: "center",

    justifyContent: "center",
  },

  selectedBadgeText: {
    color: "#FFFFFF",

    fontSize: 8,

    paddingHorizontal: 6,

    fontWeight: "800",

    letterSpacing: 0.3,
  },

  selectedCount: {
    color: "#FFFFFF",

    fontSize: 13,

    marginTop: 4,

    fontWeight: "600",
  },

  emptyServices: {
    padding: 25,

    borderRadius: 18,

    backgroundColor: "#151515",

    alignItems: "center",
  },

  emptyServicesText: {
    color: "#777777",

    fontSize: 13,
  },

  servicesScheduleButton: {
    marginTop: 18,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    paddingVertical: 16,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  servicesScheduleButtonText: {
    color: "#000000",

    fontSize: 15,

    fontWeight: "700",
  },

  servicesScheduleArrow: {
    color: "#000000",

    fontSize: 22,

    fontWeight: "600",
  },

  bottomCta: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 24,

    marginBottom: 20,
  },

  bottomCtaSmall: {
    color: "#777777",

    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 1.7,

    marginBottom: 8,
  },

  bottomCtaTitle: {
    color: "#000000",

    fontSize: 24,

    fontWeight: "800",

    letterSpacing: -0.5,

    marginBottom: 20,
  },

  bottomCtaButton: {
    height: 48,

    backgroundColor: "#0B0B0B",

    borderRadius: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  bottomCtaButtonText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "700",
  },

  tabBar: {
    position: "absolute",

    bottom: 0,

    left: 0,

    right: 0,

    height: 78,

    backgroundColor: "#111111",

    borderTopWidth: 1,

    borderTopColor: "#252525",

    flexDirection: "row",

    justifyContent: "space-around",

    alignItems: "center",

    paddingBottom: 8,
  },

  tabItem: {
    width: 80,

    height: 55,

    alignItems: "center",

    justifyContent: "center",
  },

  icon: {
    width: 22,

    height: 22,

    resizeMode: "contain",

    opacity: 0.45,

    marginBottom: 4,
  },

  iconActive: {
    width: 22,

    height: 22,

    resizeMode: "contain",

    marginBottom: 4,
  },

  tabText: {
    color: "#666666",

    fontSize: 10,

    fontWeight: "600",
  },

  tabTextActive: {
    color: "#FFFFFF",

    fontSize: 10,

    fontWeight: "700",
  },
});
