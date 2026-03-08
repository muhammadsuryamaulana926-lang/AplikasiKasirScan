// // app/about.tsx
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Link } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// export default function AboutScreen() {
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Link href="/" asChild>
//           <TouchableOpacity style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="#007AFF" />
//           </TouchableOpacity>
//         </Link>
//         <Text style={styles.title}>About</Text>
//       </View>
      
//       <View style={styles.content}>
//         <Ionicons name="chatbubble-ellipses" size={64} color="#007AFF" />
//         <Text style={styles.appName}>Chatbot AI</Text>
//         <Text style={styles.version}>Version 1.0.0</Text>
        
//         <View style={styles.infoCard}>
//           <Text style={styles.infoTitle}>Powered by</Text>
//           <Text style={styles.infoText}>Google Gemini AI</Text>
//         </View>
        
//         <View style={styles.infoCard}>
//           <Text style={styles.infoTitle}>Developer</Text>
//           <Text style={styles.infoText}>Your Name</Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#C6C6C8',
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000000',
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 24,
//   },
//   appName: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#000000',
//     marginTop: 16,
//   },
//   version: {
//     fontSize: 16,
//     color: '#8E8E93',
//     marginTop: 4,
//     marginBottom: 32,
//   },
//   infoCard: {
//     backgroundColor: '#F2F2F7',
//     padding: 16,
//     borderRadius: 12,
//     width: '100%',
//     marginBottom: 12,
//   },
//   infoTitle: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 4,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#000000',
//     fontWeight: '500',
//   },
// });