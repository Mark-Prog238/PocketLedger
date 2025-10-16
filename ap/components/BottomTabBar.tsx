import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabItem {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
}

interface BottomTabBarProps {
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
];

export const BottomTabBar = ({ activeTab, onTabPress }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-gray-900 border-t border-gray-700"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                console.log("BottomTabBar: Tab pressed:", tab.key);
                console.log("BottomTabBar: Calling onTabPress with:", tab.key);
                onTabPress(tab.key);
                console.log("BottomTabBar: onTabPress called");
              }}
              className="flex-1 items-center py-3 px-2 rounded-xl active:bg-gray-800/50"
              hitSlop={8}
            >
              <View className="items-center">
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center mb-1 ${
                    isActive
                      ? "bg-violet-600 shadow-lg shadow-violet-600/25"
                      : "bg-gray-800/50"
                  }`}
                >
                  <Ionicons
                    name={
                      isActive ? (tab.activeIcon as any) : (tab.icon as any)
                    }
                    size={24}
                    color={isActive ? "#ffffff" : "#9CA3AF"}
                  />
                </View>
                <Text
                  className={`text-xs font-medium ${
                    isActive ? "text-violet-400" : "text-gray-400"
                  }`}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
