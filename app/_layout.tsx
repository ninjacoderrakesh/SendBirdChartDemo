import { Stack } from "expo-router";
import React from "react";

export default function RootLayout(): React.JSX.Element {
  return <Stack />;

  // return (
  //   <Stack>
  //     <Stack.Screen name="index" options={{ title: "Home" }} />
  //     <Stack.Screen name="chat" options={{ title: "GroupChat" }} />
  //   </Stack>
  // );
}
