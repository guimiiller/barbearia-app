import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* =====================================
          IMAGEM DE FUNDO
      ===================================== */}

      <Image
        source={require("../assets/images/background-hero.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* =====================================
          OVERLAY
      ===================================== */}

      <View style={styles.overlay} />

      {/* =====================================
          CONTEÚDO
      ===================================== */}

      <View style={styles.content}>
        {/* =====================================
            MARCA
        ===================================== */}

        <View style={styles.brand}>
          <Text style={styles.brandTitle}>BARÃO</Text>

          <View style={styles.brandLine} />

          <Text style={styles.brandSubtitle}>BARBEARIA</Text>
        </View>

        {/* =====================================
            TEXTO PRINCIPAL
        ===================================== */}

        <View style={styles.heroText}>
          <View>
            <Text style={styles.title}>Seu estilo.</Text>

            <Text style={styles.titleStrong}>Seu momento.</Text>
          </View>

          <Text style={styles.description}>
            Agende seu horário e viva a experiência Barão.
          </Text>
        </View>

        {/* =====================================
            BOTÕES
        ===================================== */}

        <View style={styles.buttons}>
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },

  // =====================================================
  // BACKGROUND
  // =====================================================

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },

  // =====================================================
  // CONTEÚDO
  // =====================================================

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 75,
    paddingBottom: 45,
    zIndex: 2,
  },

  // =====================================================
  // MARCA
  // =====================================================

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

  // =====================================================
  // HERO
  // =====================================================

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
    textAlign: "center",
  },

  description: {
    color: "#cfcfcf",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 18,
    maxWidth: 290,
  },

  // =====================================================
  // BOTÕES
  // =====================================================

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
