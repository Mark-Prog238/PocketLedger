import { useState } from "react";
import { View, Pressable, Modal, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FloatingActionButtonProps {
  onMenuPress: () => void;
  isMenuOpen: boolean;
  onNavigate: (screen: string) => void;
}

export const FloatingActionButton = ({
  onMenuPress,
  isMenuOpen,
  onNavigate,
}: FloatingActionButtonProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const insets = useSafeAreaInsets();

  const options = [
    { key: "SETTINGS", icon: "settings-outline", label: "Settings" },
    { key: "PROFILE", icon: "person-outline", label: "Profile" },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <View
        className="absolute right-4 z-50"
        style={{ bottom: insets.bottom + 100 }}
      >
        <Pressable
          onPress={() => setShowOptions(!showOptions)}
          className="w-14 h-14 bg-violet-600 rounded-full items-center justify-center shadow-lg shadow-violet-600/25"
        >
          <Ionicons
            name={showOptions ? "close" : "menu"}
            size={24}
            color="white"
          />
        </Pressable>
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable
          onPress={() => setShowOptions(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <View
            className="bg-gray-900 rounded-t-3xl p-6 border-t border-gray-700"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white font-bold text-xl">Quick Access</Text>
              <Pressable
                onPress={() => setShowOptions(false)}
                className="w-8 h-8 bg-gray-800 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="space-y-3">
              {options.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    onNavigate(option.key);
                    setShowOptions(false);
                  }}
                  className="flex-row items-center px-4 py-4 bg-gray-800 rounded-xl"
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color="#9CA3AF"
                  />
                  <Text className="text-white font-medium ml-4 text-lg">
                    {option.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#6B7280"
                    style={{ marginLeft: "auto" }}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
