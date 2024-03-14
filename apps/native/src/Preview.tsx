import { Button, StyleSheet, Text, View } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import "react-native-get-random-values";
import { useState } from "react";
import { Id } from "@repo/backend/convex/_generated/dataModel";

interface Props {
    componentId: Id<"components">;
    projectId: Id<"projects">;
}

export default function Preview({ componentId, projectId}: Props) {
  const [didScan, setDidScan] = useState(false);

  const getPublic = useQuery(api.node.getPublic, { projectId, componentId, environment: "dev" });


  return (
    <View style={styles.container}>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
