import { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import CustumInput from "components/InputField";
import { CustomButton } from "components/GlassCard";
import { getApiUrl, API_ENDPOINTS } from "config/api";
import { useAuth } from "contexts/AuthContext";

interface Tag {
  id: number;
  user_id: number | null;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
}

export const CreateTransaction = () => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // New tag creation states
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("");
  const [newTagColor, setNewTagColor] = useState("#8B5CF6"); // Default violet

  const { user } = useAuth();

  useEffect(() => {
    const getUserTags = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const url = getApiUrl(`/api/tags/${user.id}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("failed to fetch tags");
        }
        const data = await response.json();
        setTags(data.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        Alert.alert("Error", "Failed to load tags");
      } finally {
        setLoading(false);
      }
    };

    getUserTags();
  }, [user?.id]);

  // Create custom tag function
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert("Error", "Please enter a tag name");
      return;
    }

    try {
      // Generate slug from name
      const slug = newTagName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const response = await fetch(getApiUrl("/api/tags"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: newTagName.trim(),
          slug: slug,
          color: newTagColor,
          icon: newTagIcon.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tag");
      }

      const newTag = await response.json();

      // Add new tag to the list
      setTags([...tags, newTag]);

      // Reset form and close modal
      setNewTagName("");
      setNewTagIcon("");
      setNewTagColor("#8B5CF6");
      setShowTagModal(false);

      Alert.alert("Success", "Custom tag created!");
    } catch (error: any) {
      console.error("Error creating tag:", error);
      Alert.alert("Error", error.message || "Failed to create tag");
    }
  };

  // Preset colors for quick selection
  const presetColors = [
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#10B981", // Green
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#8B4513", // Brown
    "#6B7280", // Gray
  ];

  // Common emojis for tags
  const commonEmojis = [
    "🍽️",
    "🚗",
    "🛍️",
    "🎬",
    "💡",
    "⚕️",
    "💰",
    "🏦",
    "☕",
    "🏠",
    "✈️",
    "🎮",
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="px-4 py-3 w-full"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-10">
          <Text className="text-white font-bold text-lg mb-4">
            INSERT YOUR TRANSACTION
          </Text>

          <CustumInput
            label="Enter the amount $:"
            keyboardType="decimal-pad"
            returnKeyType="next"
            value={amount}
            onChangeText={setAmount}
          />
          <CustumInput
            label="Enter the description"
            returnKeyType="done"
            value={description}
            onChangeText={setDescription}
          />

          {/* Tag selector */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300 text-xs ml-1">
                Select the tag:
              </Text>
            </View>

            {loading ? (
              <Text className="text-gray-400">Loading tags...</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {tags.map((tag) => {
                  const isActive = selectedTag === tag.id;
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => setSelectedTag(tag.id)}
                      className={`px-3 py-2 rounded-full border ${
                        isActive
                          ? "bg-violet-600 border-violet-400"
                          : "bg-gray-700/70 border-gray-600/70"
                      }`}
                    >
                      <Text
                        className={isActive ? "text-white" : "text-gray-300"}
                      >
                        {tag.icon} {tag.name}
                      </Text>
                    </Pressable>
                  );
                })}

                <Pressable
                  onPress={() => setShowTagModal(true)}
                  className={`px-3 py-2 rounded-full border bg-violet-600 border-violet-400`}
                >
                  <Text className="text-white text-xs font-semibold">
                    + New Tag
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          <CustomButton>
            <Text className="text-white font-bold text-base">
              {isSubmitting ? "ADDING..." : "ADD"}
            </Text>
          </CustomButton>
        </View>
      </ScrollView>

      {/* Create Tag Modal */}
      <Modal
        visible={showTagModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTagModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-xl">
                Create Custom Tag
              </Text>
              <Pressable onPress={() => setShowTagModal(false)}>
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Tag Name */}
            <CustumInput
              label="Tag Name"
              placeholder="e.g., Coffee, Rent, Gaming"
              value={newTagName}
              onChangeText={setNewTagName}
            />

            {/* Emoji Selector */}
            <Text className="text-gray-300 text-xs mb-2 ml-1">
              Choose Icon (optional):
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {commonEmojis.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => setNewTagIcon(emoji)}
                  className={`p-3 rounded-lg ${
                    newTagIcon === emoji ? "bg-violet-600" : "bg-gray-700/70"
                  }`}
                >
                  <Text className="text-xl">{emoji}</Text>
                </Pressable>
              ))}
              <CustumInput
                placeholder="or type emoji"
                value={newTagIcon}
                onChangeText={setNewTagIcon}
                className="flex-1 min-w-[100px]"
              />
            </View>

            {/* Color Selector */}
            <Text className="text-gray-300 text-xs mb-2 ml-1">
              Choose Color:
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {presetColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setNewTagColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-12 h-12 rounded-full ${
                    newTagColor === color ? "border-4 border-white" : ""
                  }`}
                />
              ))}
            </View>

            {/* Preview */}
            {newTagName && (
              <View className="mb-4">
                <Text className="text-gray-300 text-xs mb-2 ml-1">
                  Preview:
                </Text>
                <View
                  style={{ backgroundColor: newTagColor }}
                  className="px-4 py-2 rounded-full self-start"
                >
                  <Text className="text-white font-semibold">
                    {newTagIcon} {newTagName}
                  </Text>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowTagModal(false)}
                className="flex-1 bg-gray-700 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCreateTag}
                className="flex-1 bg-violet-600 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Create Tag
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
