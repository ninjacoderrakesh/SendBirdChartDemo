import React, { useState } from "react";

import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import SendBird, {
  GroupChannel,
  GroupChannelParams,
  SendBirdError,
  User,
} from "sendbird";

export const APP_ID = "2CAE9651-212D-42B8-BF1F-843786BC2FF0"; // Replace with your Sendbird App ID

export const sb = new SendBird({ appId: APP_ID });

export const options = {
  title: "Home",
};

export default function HomeScreen(): React.JSX.Element {
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  // const [channelUrl, setChannelUrl] = useState("");

  const connectAndCreateGroup = (): void => {
    if (!userId) {
      Alert.alert("Enter your user ID");
      return;
    }

    sb.connect(
      userId,
      async (user: User | null, error: SendBirdError | null) => {
        if (error || !user) {
          Alert.alert("Login failed");
          return;
        }

        const params: GroupChannelParams = new sb.GroupChannelParams();

        params.isPublic = false;
        params.isDistinct = false;
        params.addUserIds(["User_1", "User_2", "User_3"]);
        params.name = "Group Chat";

        sb.GroupChannel.createChannel(
          params,
          (channel: GroupChannel | null, err: SendBirdError | null) => {
            if (err || !channel) {
              Alert.alert("Channel creation failed");
              return;
            }
            console.log("channel::", channel.url);

            router.push({
              pathname: "/chat",
              params: { channelUrl: channel.url },
            });
          }
        );
      }
    );
  };

  return (
    <SafeAreaView style={{ padding: 20, margin: 20 }}>
      <TextInput
        placeholder="Enter your user ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor={"darkgray"}
      />
      <TouchableOpacity onPress={connectAndCreateGroup} style={styles.button}>
        <Text style={styles.btnText}>Join Chat</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  button: {
    backgroundColor: "gray",
    height: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
