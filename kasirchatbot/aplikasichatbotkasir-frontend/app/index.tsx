// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const Colors = {
//   primary: "#007AFF",
//   secondary: "#5856D6",
//   background: "#FFFFFF",
//   cardBackground: "#F2F2F7",
//   textPrimary: "#000000",
//   textSecondary: "#8E8E93",
//   incomingMessage: "#E8E8ED",
//   outgoingMessage: "#007AFF",
//   border: "#C6C6C8",
//   error: "#FF3B30",
//   success: "#34C759",
// };

// const OPENAI_API_KEY =
//   "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";
// const OPENAI_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// const BACKEND_URL = "http://10.252.108.233:3000"; // IP komputer Anda

// type MessageType = {
//   id: string;
//   text: string;
//   sender: "user" | "bot";
//   timestamp: Date;
// };

// async function queryDatabase(question: string): Promise<string | null> {
//   try {
//     const response = await fetch(`${BACKEND_URL}/api/query`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ question }),
//     });
//     const data = await response.json();
//     return data.success ? data.result : null;
//   } catch (error) {
//     console.error("Database query error:", error);
//     return null;
//   }
// }

// async function sendToAI(message: string): Promise<string> {
//   try {
//     console.log("Sending to OpenRouter:", message);
//     const response = await fetch(OPENAI_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//         "HTTP-Referer": "https://aplikasichatbot.com",
//         "X-Title": "Chatbot App",
//       },
//       body: JSON.stringify({
//         model: "google/gemini-flash-1.5-8b",
//         messages: [{ role: "user", content: message }],
//       }),
//     });

//     console.log("Response status:", response.status);
//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("API Error Response:", errorData);
//       throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
//     }
//     const data = await response.json();
//     return (
//       data.choices?.[0]?.message?.content || "Bot: Received empty response"
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     return `Maaf, terjadi kesalahan. Silakan coba lagi.`;
//   }
// }

// export default function ChatScreen() {
//   const [messages, setMessages] = useState<MessageType[]>([
//     {
//       id: "1",
//       text: "assalamualaikum I'm chatbot\nHow can I help you?",
//       sender: "bot",
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputText, setInputText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const flatListRef = useRef<FlatList>(null);

//   const handleSend = async () => {
//     if (!inputText.trim() || isLoading) return;

//     const userMessage: MessageType = {
//       id: Date.now().toString(),
//       text: inputText,
//       sender: "user",
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     const currentInput = inputText;
//     setInputText("");
//     setIsLoading(true);

//     try {
//       let botResponseText: string;
//       const lowerCaseText = currentInput.toLowerCase().trim();

//       if (
//         lowerCaseText === "hallo" ||
//         lowerCaseText === "hello" ||
//         lowerCaseText === "hi"
//       ) {
//         botResponseText = "Hallo juga! Ada yang bisa saya bantu?";
//       } else if (
//         lowerCaseText === "siapa kamu?" ||
//         lowerCaseText === "who are you?"
//       ) {
//         botResponseText =
//           "Saya adalah chatbot AI yang dibuat untuk membantu Anda.";
//       } else if (
//         lowerCaseText === "terima kasih" ||
//         lowerCaseText === "thanks"
//       ) {
//         botResponseText = "Sama-sama! Senang bisa membantu 😊";
//       } else if (
//         lowerCaseText === "dadah" ||
//         lowerCaseText === "selamat tinggal"
//       ) {
//         botResponseText = "ywdah sanah";
//       } else {
//         const dbResult = await queryDatabase(currentInput);
//         botResponseText = dbResult || (await sendToAI(currentInput));
//       }

//       const botMessage: MessageType = {
//         id: (Date.now() + 1).toString(),
//         text: botResponseText,
//         sender: "bot",
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       const errorMessage: MessageType = {
//         id: (Date.now() + 2).toString(),
//         text: "Error: Please try again.",
//         sender: "bot",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, [messages]);

//   const renderMessage = ({ item }: { item: MessageType }) => (
//     <View
//       style={[
//         styles.messageRow,
//         item.sender === "user" ? styles.userRow : styles.botRow,
//       ]}
//     >
//       <View
//         style={[
//           styles.messageBubble,
//           item.sender === "user" ? styles.userBubble : styles.botBubble,
//         ]}
//       >
//         <Text
//           style={[
//             styles.messageText,
//             item.sender === "user" ? styles.userText : styles.botText,
//           ]}
//         >
//           {item.text}
//         </Text>
//         <Text style={styles.timeText}>
//           {item.timestamp.getHours().toString().padStart(2, "0")}:
//           {item.timestamp.getMinutes().toString().padStart(2, "0")}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//       <KeyboardAvoidingView
//         style={styles.container}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <View style={styles.header}>
//           <Ionicons
//             name="chatbubble-ellipses"
//             size={28}
//             color={Colors.primary}
//           />
//           <View style={styles.headerTexts}>
//             <Text style={styles.headerTitle}>Chatbot AI</Text>
//             <Text style={styles.headerStatus}>Online • OpenRouter</Text>
//           </View>
//           <TouchableOpacity style={styles.menuBtn}>
//             <Ionicons
//               name="ellipsis-horizontal"
//               size={24}
//               color={Colors.textPrimary}
//             />
//           </TouchableOpacity>
//         </View>

//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderMessage}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.chatList}
//           showsVerticalScrollIndicator={false}
//         />

//         <View style={styles.inputArea}>
//           <TouchableOpacity style={styles.plusBtn}>
//             <Ionicons name="add" size={24} color={Colors.textSecondary} />
//           </TouchableOpacity>
//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Type message..."
//               placeholderTextColor={Colors.textSecondary}
//               multiline
//               maxLength={500}
//               editable={!isLoading}
//             />
//             {inputText.length > 0 && (
//               <TouchableOpacity onPress={() => setInputText("")}>
//                 <Ionicons
//                   name="close-circle"
//                   size={18}
//                   color={Colors.textSecondary}
//                 />
//               </TouchableOpacity>
//             )}
//           </View>
//           <TouchableOpacity
//             style={[
//               styles.sendBtn,
//               (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
//             ]}
//             onPress={handleSend}
//             disabled={!inputText.trim() || isLoading}
//           >
//             <Ionicons
//               name={isLoading ? "time-outline" : "send"}
//               size={22}
//               color={
//                 !inputText.trim() || isLoading
//                   ? Colors.textSecondary
//                   : Colors.background
//               }
//             />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: Colors.background },
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     backgroundColor: Colors.cardBackground,
//   },
//   headerTexts: { marginLeft: 12, flex: 1 },
//   headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.textPrimary },
//   headerStatus: { fontSize: 13, color: Colors.success, marginTop: 2 },
//   menuBtn: { padding: 4 },
//   chatList: { paddingHorizontal: 16, paddingVertical: 8, flexGrow: 1 },
//   messageRow: { marginVertical: 6 },
//   userRow: { alignItems: "flex-end" },
//   botRow: { alignItems: "flex-start" },
//   messageBubble: {
//     maxWidth: "80%",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 20,
//   },
//   userBubble: {
//     backgroundColor: Colors.outgoingMessage,
//     borderBottomRightRadius: 4,
//   },
//   botBubble: {
//     backgroundColor: Colors.incomingMessage,
//     borderBottomLeftRadius: 4,
//   },
//   messageText: { fontSize: 16, lineHeight: 22 },
//   userText: { color: Colors.background },
//   botText: { color: Colors.textPrimary },
//   timeText: { fontSize: 11, opacity: 0.6, marginTop: 6, alignSelf: "flex-end" },
//   inputArea: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: Colors.border,
//     backgroundColor: Colors.cardBackground,
//   },
//   plusBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: Colors.background,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   inputWrapper: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.background,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     marginHorizontal: 8,
//     paddingHorizontal: 12,
//     paddingRight: 8,
//     maxHeight: 100,
//   },
//   textInput: {
//     flex: 1,
//     paddingVertical: 10,
//     fontSize: 16,
//     color: Colors.textPrimary,
//     maxHeight: 80,
//   },
//   sendBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: Colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sendBtnDisabled: { backgroundColor: Colors.border },
// });
