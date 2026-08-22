import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Landing() {
  const router = useRouter();

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(-20)).current;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(25)).current;

  const descriptionOpacity = useRef(new Animated.Value(0)).current;

  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  const buttonsTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(heroTranslateY, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(descriptionOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/background-hero.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* =====================================
            MARCA
        ===================================== */}

        <Animated.View
          style={[
            styles.brand,
            {
              opacity: brandOpacity,
              transform: [
                {
                  translateY: brandTranslateY,
                },
              ],
            },
          ]}
        >
          <Text style={styles.brandTitle}>BARÃO</Text>

          <View style={styles.brandLine} />

          <Text style={styles.brandSubtitle}>BARBEARIA</Text>
        </Animated.View>

        {/* =====================================
            TEXTO
        ===================================== */}

        <View style={styles.heroText}>
          <Animated.View
            style={{
              opacity: heroOpacity,
              transform: [
                {
                  translateY: heroTranslateY,
                },
              ],
            }}
          >
            <Text style={styles.title}>Seu estilo.</Text>

            <Text style={styles.titleStrong}>Seu momento.</Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.description,
              {
                opacity: descriptionOpacity,
              },
            ]}
          >
            Agende seu horário e viva a experiência Barão.
          </Animated.Text>
        </View>

        {/* =====================================
            BOTÕES
        ===================================== */}

        <Animated.View
          style={[
            styles.buttons,
            {
              opacity: buttonsOpacity,
              transform: [
                {
                  translateY: buttonsTranslateY,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.registerButton}
            onPress={() => router.push("/cadastro")}
          >
            <Text style={styles.registerText}>Criar minha conta</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 75,
    paddingBottom: 45,
  },

  brand: {
    alignItems: "center",
  },

  brandTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 7,
  },

  brandLine: {
    width: 38,
    height: 2,
    backgroundColor: "#fff",
    marginTop: 8,
    marginBottom: 6,
  },

  brandSubtitle: {
    color: "#aaa",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 4,
  },

  heroText: {
    alignItems: "center",
    marginTop: 120,
  },

  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "300",
    lineHeight: 44,

    textAlign: "center",
  },

  titleStrong: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 46,
  },

  description: {
    color: "#cfcfcf",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 18,
    maxWidth: 290,
  },

  buttons: {
    width: "100%",
    gap: 12,
  },

  loginButton: {
    height: 56,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  loginText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },

  registerButton: {
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  registerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
