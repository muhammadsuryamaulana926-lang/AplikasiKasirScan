import React from "react";
import {
  Alert,
  Clipboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface MessageTextWithLinksProps {
  text: string;
  style?: any;
  onCopy?: (text: string) => void;
}

export const MessageTextWithLinks: React.FC<MessageTextWithLinksProps> = ({
  text,
  style,
  onCopy,
}) => {
  const copyToClipboard = async (textToCopy: string) => {
    await Clipboard.setString(textToCopy);
    if (onCopy) {
      onCopy(textToCopy);
    }
  };

  const openLink = async (platform: string, value: string) => {
    let url = "";

    switch (platform) {
      case "WA":
        // WhatsApp - hapus karakter non-digit
        const phone = value.replace(/\D/g, "");
        url = `whatsapp://send?phone=${phone.startsWith("62") ? phone : "62" + phone.replace(/^0/, "")}`;
        break;
      case "IG":
        // Instagram - hapus @ jika ada
        const username = value.replace("@", "");
        url = `instagram://user?username=${username}`;
        break;
      case "EMAIL":
        url = `mailto:${value}`;
        break;
      case "FB":
        url = `fb://profile/${value}`;
        break;
      case "TG":
        // Telegram
        const tgUsername = value.replace("@", "");
        url = `tg://resolve?domain=${tgUsername}`;
        break;
      case "LINE":
        url = `line://ti/p/${value}`;
        break;
      case "X":
        // Twitter/X
        const xUsername = value.replace("@", "");
        url = `twitter://user?screen_name=${xUsername}`;
        break;
      default:
        copyToClipboard(value);
        return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback ke browser jika app tidak terinstall
        let webUrl = "";
        switch (platform) {
          case "IG":
            webUrl = `https://instagram.com/${value.replace("@", "")}`;
            break;
          case "FB":
            webUrl = `https://facebook.com/${value}`;
            break;
          case "TG":
            webUrl = `https://t.me/${value.replace("@", "")}`;
            break;
          case "X":
            webUrl = `https://x.com/${value.replace("@", "")}`;
            break;
          default:
            copyToClipboard(value);
            return;
        }
        if (webUrl) {
          await Linking.openURL(webUrl);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Tidak dapat membuka link");
      copyToClipboard(value);
    }
  };

  const parseText = () => {
    const parts: Array<{
      text: string;
      type: string;
      value?: string;
      label?: string;
      bold?: boolean;
      url?: string;
    }> = [];

    // Pattern untuk format backend: [PLATFORM:data]
    const backendPattern = /\[(WA|IG|EMAIL|FB|TG|LINE|X):([^\]]+)\]/g;
    // Pattern untuk markdown link: [text](url)
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    // Pattern untuk markdown bold: **text**
    const boldPattern = /\*\*(.+?)\*\*/g;

    let workingText = text;
    const replacements: Array<{ start: number; end: number; part: any }> = [];

    // Extract backend links
    let match;
    while ((match = backendPattern.exec(text)) !== null) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        part: {
          text: match[2],
          type: "copyable",
          value: match[2],
          label: match[1],
        },
      });
    }

    // Extract markdown links
    markdownLinkPattern.lastIndex = 0;
    while ((match = markdownLinkPattern.exec(text)) !== null) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        part: {
          text: match[1],
          type: "link",
          url: match[2],
        },
      });
    }

    // Sort replacements by position
    replacements.sort((a, b) => a.start - b.start);

    // Build parts array
    let lastIndex = 0;
    replacements.forEach((replacement) => {
      // Add normal text before this replacement
      if (replacement.start > lastIndex) {
        const normalText = text.substring(lastIndex, replacement.start);
        // Parse bold in normal text
        parseBoldText(normalText, parts);
      }

      // Add the replacement
      parts.push(replacement.part);
      lastIndex = replacement.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parseBoldText(remainingText, parts);
    }

    return parts.length > 0 ? parts : [{ text, type: "normal" }];
  };

  const parseBoldText = (text: string, parts: Array<any>) => {
    const boldPattern = /\*\*([^*]+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          type: "normal",
          bold: false,
        });
      }

      parts.push({
        text: match[1],
        type: "normal",
        bold: true,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        type: "normal",
        bold: false,
      });
    } else if (lastIndex === 0) {
      parts.push({
        text: text,
        type: "normal",
        bold: false,
      });
    }
  };

  const parts = parseText();

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.type === "normal") {
          return (
            <Text key={index} style={part.bold ? styles.boldText : undefined}>
              {part.text}
            </Text>
          );
        }

        if (part.type === "link") {
          return (
            <Text key={index}>
              <TouchableOpacity
                onPress={() => Linking.openURL(part.url || "")}
                onLongPress={() => copyToClipboard(part.url || "")}
                activeOpacity={0.7}
              >
                <Text style={[style, styles.linkText]}>{part.text}</Text>
              </TouchableOpacity>
            </Text>
          );
        }

        return (
          <Text key={index}>
            <TouchableOpacity
              onPress={() =>
                openLink(part.label || "", part.value || part.text)
              }
              onLongPress={() => copyToClipboard(part.value || part.text)}
              activeOpacity={0.7}
            >
              <Text style={[style, styles.copyableText]}>{part.text}</Text>
            </TouchableOpacity>
          </Text>
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  copyableText: {
    color: "#007AFF",
    fontWeight: "600",
    lineHeight: 20,
    top: Platform.OS === "ios" ? 10 : 5,
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
    lineHeight: 20,
    top: Platform.OS === "ios" ? 10 : 5,
  },
  boldText: {
    fontWeight: "bold",
  },
});
