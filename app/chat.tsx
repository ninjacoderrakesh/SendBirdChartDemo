import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BaseMessageInstance,
  GroupChannel,
  Member,
  SendBirdError,
  UserMessage,
} from "sendbird";
import { sb } from "./index";

export const options = {
  title: "GroupChat",
};

export default function ChatScreen(): React.JSX.Element {
  const { channelUrl } = useLocalSearchParams<{ channelUrl?: string }>();
  const [channel, setChannel] = useState<GroupChannel | null>(null);
  const [messages, setMessages] = useState<BaseMessageInstance[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (!channelUrl || typeof channelUrl !== "string") {
      Alert.alert("Error", "Invalid channel URL");
      return;
    }
    sb.GroupChannel.getChannel(
      channelUrl,
      (ch: GroupChannel | null, err: SendBirdError | null) => {
        if (err || !ch) {
          Alert.alert("Error", "Channel load failed");
          return;
        }

        if (ch) {
          ch?.members.forEach((member) => {
            console.log(member.nickname, member.userId);
          });
          setMembers(ch?.members);
        }

        setChannel(ch);

        const query = ch.createPreviousMessageListQuery();
        if (query) {
          query.load(
            30,
            true,
            (msgs: BaseMessageInstance[] | null, err: SendBirdError | null) => {
              if (!err && msgs) {
                setMessages(msgs.reverse());
              }
            }
          );
        }

        const handler = new sb.ChannelHandler();

        handler.onMessageReceived = (
          ch: GroupChannel,
          msg: BaseMessageInstance
        ) => {
          setMessages((prev) => [...prev, msg]);
        };
        sb.addChannelHandler("handler-id", handler);

        return () => sb.removeChannelHandler("handler-id");
      }
    );
  }, [channelUrl]);

  const sendMessage = (): void => {
    if (!text || !channel) return;
    channel.sendUserMessage(
      text,
      (msg: BaseMessageInstance | null, err: SendBirdError | null) => {
        if (!err && msg) {
          setMessages((prev) => [...prev, msg]);
          setText("");
        }
      }
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<BaseMessageInstance>) => {
    const userMessage = item as UserMessage;

    return (
      <Text style={styles.message}>
        {userMessage?.sender?.userId ?? "Unknown"}: {userMessage.message}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>Channel: {channel?.name}</Text>
      <Text>Members:</Text>
      <FlatList
        data={members}
        renderItem={({ item }) => <Text>{item.userId}</Text>} // Display the userId of each member
        keyExtractor={(item, index) => index.toString()}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.messageId.toString()}
        renderItem={renderItem}
        // renderItem={({ item }) => (
        //   <Text style={styles.message}>
        //     {item.sender?.userId}: {item.message}
        //   </Text>
        // )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type message"
          value={text}
          onChangeText={setText}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  message: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
