import { Platform } from "react-native";
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <NativeTabs labelStyle={{ color: "#FFFFFF" }} tintColor="#FFFFFF">
      <NativeTabs.Trigger name="index">
        <Label selectedStyle={{ color: "#FFFFFF" }}>Notes</Label>
        {Platform.select({
          ios: <Icon sf="note.text" selectedColor="#FFFFFF" />,
          default: (
            <Icon
              src={
                <VectorIcon
                  family={Ionicons}
                  name="document-text-outline"
                  selectedColor="#FFFFFF"
                />
              }
            />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
