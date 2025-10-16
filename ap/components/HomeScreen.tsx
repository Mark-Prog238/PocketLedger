import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeAnalytics } from "./parts/HomeAnalytics";
import { CreateTransaction } from "./parts/CreateTransaction";
import { BudgetScreen } from "./parts/BudgetScreen";
import { ProfileScreen } from "./parts/ProfileScreen";
import { TransactionHistory } from "./parts/TransactionHistory";
import { AnalyticsReports } from "./parts/AnalyticsReports";
import { CustomNavBar } from "./CustomNavBar";
import { SwipeableContainer } from "./SwipeableContainer";
type MenuItem = { label: string; icon: string };
type Props = {
  menuItems?: MenuItem[];
  onSelect?: (item: string) => void;
};

// Screen content component
const ScreenContent = ({ selected }: { selected: string }) => {
  // Force re-render by using a different approach
  const screens = {
    HOME: <HomeAnalytics />,
    ADD: <CreateTransaction />,
    HISTORY: <TransactionHistory />,
    ANALYTICS: <AnalyticsReports />,
    BUDGET: <BudgetScreen />,
    PROFILE: <ProfileScreen />,
  };

  return (
    screens[selected as keyof typeof screens] || (
      <View className="flex-1">
        <Text className="text-white p-2 bg-gray-600">
          UNKNOWN SCREEN: {selected}
        </Text>
      </View>
    )
  );
};

export function HomeScreen() {
  const { logout } = useAuth();
  const menuItems = [
    "HOME",
    "ADD",
    "HISTORY",
    "ANALYTICS",
    "BUDGET",
    "SETTINGS",
    "PROFILE",
  ];
  const isIos = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";
  // const isWeb = Platform.OS === "web";
  const [selected, setSelected] = useState<string>("HOME");

  // Define the order of screens for swiping
  const screenOrder = [
    "HOME",
    "ADD",
    "HISTORY",
    "ANALYTICS",
    "BUDGET",
    "PROFILE",
  ];
  const currentIndex = screenOrder.indexOf(selected);

  const handleSelect = (item: string) => {
    setSelected(item);
    if (item === "LOGOUT") {
      logout();
    }
  };

  const handleTabPress = (tab: string) => {
    setSelected(tab);
  };

  const handleSwipeLeft = () => {
    if (currentIndex < screenOrder.length - 1) {
      setSelected(screenOrder[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setSelected(screenOrder[currentIndex - 1]);
    }
  };

  return (
    <>
      <View className="bg-gray-900 flex-1">
        {/*! If MOBILE */}
        {isIos || isAndroid ? (
          <SafeAreaView className="flex-1 w-full">
            <View className="flex-1 w-full">
              <SwipeableContainer
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                currentIndex={currentIndex}
                totalItems={screenOrder.length}
              >
                <ScreenContent selected={selected} />
              </SwipeableContainer>
            </View>

            {/* Custom Navigation Bar */}
            <CustomNavBar activeTab={selected} onTabPress={handleTabPress} />
          </SafeAreaView>
        ) : (
          <View className="h-screen w-screen bg-gray-900">
            {/* Web Header */}
            <View className="bg-gray-800 border-b border-gray-700 px-8 py-6">
              <View className="flex-row items-center justify-between max-w-7xl mx-auto">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-violet-600 rounded-2xl items-center justify-center mr-4 shadow-lg shadow-violet-600/25">
                    <Ionicons name="wallet" size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      PocketLedger
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Personal Finance Manager
                    </Text>
                  </View>
                </View>

                {/* Desktop Navigation */}
                <View className="hidden md:flex flex-row items-center space-x-2">
                  <Pressable
                    onPress={() => setSelected("HOME")}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                      selected === "HOME"
                        ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="home"
                        size={18}
                        color={selected === "HOME" ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          selected === "HOME" ? "text-white" : "text-gray-300"
                        }`}
                      >
                        Home
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelected("ADD")}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                      selected === "ADD"
                        ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="add-circle"
                        size={18}
                        color={selected === "ADD" ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          selected === "ADD" ? "text-white" : "text-gray-300"
                        }`}
                      >
                        Add
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelected("HISTORY")}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                      selected === "HISTORY"
                        ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="receipt"
                        size={18}
                        color={selected === "HISTORY" ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          selected === "HISTORY"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      >
                        History
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelected("ANALYTICS")}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                      selected === "ANALYTICS"
                        ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="analytics"
                        size={18}
                        color={selected === "ANALYTICS" ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          selected === "ANALYTICS"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      >
                        Analytics
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelected("BUDGET")}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                      selected === "BUDGET"
                        ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="wallet"
                        size={18}
                        color={selected === "BUDGET" ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          selected === "BUDGET" ? "text-white" : "text-gray-300"
                        }`}
                      >
                        Budget
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelected("PROFILE")}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                      selected === "PROFILE"
                        ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="person"
                        size={18}
                        color={selected === "PROFILE" ? "white" : "#9CA3AF"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          selected === "PROFILE"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      >
                        Profile
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Logout Button */}
                <Pressable
                  onPress={() => handleSelect("LOGOUT")}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/25"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="log-out-outline" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">Logout</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Web Content */}
            <View className="flex-1 overflow-hidden">
              <View className="h-full max-w-7xl mx-auto px-8 py-6">
                <ScreenContent selected={selected} />
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
