import { StyleSheet, Text, View, Button } from "react-native";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Welcome to MyOptiRoute</Text>
        <Text style={styles.subtitle}>Click developed by Ch'ng Khye Ahn</Text>

        <Button
          title="Proceed"
          onPress={() => router.push("/login")}
          color="gray"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center", // Centers content vertically within the main container
    alignItems: "center", // Centers all children horizontally
    maxWidth: 960,
    width: '100%', // Ensures the content takes up full width
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center", // Centers the text itself
    marginBottom: 16, // Adds space between the title and subtitle
  },
  subtitle: {
    fontSize: 24,
    color: "#38434D",
    textAlign: "center", // Centers the text itself
    marginBottom: 24, // Adds space between the subtitle and button
  },
});

export default Index;