import { useState } from "react";
import {
  View,
  Text,
  VirtualizedList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { CustomButton, GlassCard } from "./GlassCard";
import { SafeAreaView } from "react-native-safe-area-context";
import SideMenu from "./parts/SideBar";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeAnalytics } from "./parts/HomeAnalytics";
import { CreateTransaction } from "./parts/CreateTransaction";
type MenuItem = { label: string; icon: string };
type Props = {
  menuItems?: MenuItem[];
  onSelect?: (item: string) => void;
};

export function HomeScreen() {
  const { logout } = useAuth();
  const [isSelected, setIsSelected] = useState("HOME");
  const menuItems = ["HOME", "ADD", "BUDGET", "PROFILE"];
  const isIos = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";
  // const isWeb = Platform.OS === "web";
  const [selected, setSelected] = useState<string>(menuItems[0]);

  const handleSelect = (item: string) => {
    setSelected(item);
    if (item === "LOGOUT") logout();
    // no onSelect here; HomeScreen manages content locally
  };

  return (
    <>
      <View className="bg-gray-800 flex-1">
        {/*! If MOBILE */}
        {isIos || isAndroid ? (
          <SafeAreaView className="flex-1 w-full">
            <SideMenu onSelect={handleSelect} />
            <View className="flex-1 w-full px-4">
              {selected === "HOME" && <HomeAnalytics />}
              {selected === "ADD" && <CreateTransaction />}
              {selected === "BUDGET" && (
                <View className="w-full">
                  <Text className="text-white">Budget (coming soon)</Text>
                </View>
              )}
              {selected === "PROFILE" && (
                <View className="w-full">
                  <Text className="text-white">Profile (coming soon)</Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        ) : (
          <View className="h-screen w-screen">
            <CustomButton onPress={() => handleSelect("LOGOUT")}>
              <View className="flex-row items-center gap-2">
                <Ionicons name="log-out-outline" size={18} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm">Logout</Text>
              </View>
            </CustomButton>
            {selected === "HOME" && <HomeAnalytics />}
          </View>
        )}
      </View>
    </>
  );
}
