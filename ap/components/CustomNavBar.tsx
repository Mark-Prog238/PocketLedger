import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabItem {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
}

interface CustomNavBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs: TabItem[] = [
  {
    key: "HOME",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "ADD",
    label: "Add",
    icon: "add-circle-outline",
    activeIcon: "add-circle",
  },
  {
    key: "HISTORY",
    label: "History",
    icon: "receipt-outline",
    activeIcon: "receipt",
  },
  {
    key: "ANALYTICS",
    label: "Analytics",
    icon: "analytics-outline",
    activeIcon: "analytics",
  },
  {
    key: "BUDGET",
    label: "Budget",
    icon: "wallet-outline",
    activeIcon: "wallet",
  },
  {
    key: "PROFILE",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export const CustomNavBar = ({ activeTab, onTabPress }: CustomNavBarProps) => {
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabKey: string) => {
    onTabPress(tabKey);
  };

  return (
    <View
      style={{
        backgroundColor: "#111827", // gray-900
        borderTopWidth: 1,
        borderTopColor: "#374151", // gray-700
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            minWidth: "100%",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: isActive
                    ? "rgba(139, 92, 246, 0.1)"
                    : "transparent",
                }}
                hitSlop={8}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                      backgroundColor: isActive
                        ? "#8B5CF6"
                        : "rgba(31, 41, 55, 0.5)", // violet-600 or gray-800/50
                      shadowColor: isActive ? "#8B5CF6" : "transparent",
                      shadowOpacity: isActive ? 0.25 : 0,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                    }}
                  >
                    <Ionicons
                      name={(isActive ? tab.activeIcon : tab.icon) as any}
                      size={24}
                      color={isActive ? "#ffffff" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: isActive ? "#A78BFA" : "#9CA3AF", // violet-400 or gray-400
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                  {isActive && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#8B5CF6",
                        textAlign: "center",
                        marginTop: 2,
                        opacity: 0.6,
                      }}
                    >
                      ← swipe →
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
