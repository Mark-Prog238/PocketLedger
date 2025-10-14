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
import { commonEmojis, presetColors } from "components";
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
  const [merchant, setMerchant] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // New tag creation states
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("");
  const [newTagColor, setNewTagColor] = useState("#8B5CF6"); // Default violet
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  // Long press menu state
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [menuTag, setMenuTag] = useState<Tag | null>(null);

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

  // Create or update tag function
  const handleSaveTag = async () => {
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

      const isEditing = editingTagId !== null;
      const url = isEditing
        ? getApiUrl(`/api/tags/${editingTagId}`)
        : getApiUrl("/api/tags");

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
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
        throw new Error(
          error.error || `Failed to ${isEditing ? "update" : "create"} tag`,
        );
      }

      const savedTag = await response.json();

      if (isEditing) {
        // Update existing tag in list
        setTags(tags.map((t) => (t.id === editingTagId ? savedTag : t)));
      } else {
        // Add new tag to the list
        setTags([...tags, savedTag]);
      }

      // Reset form and close modal
      setNewTagName("");
      setNewTagIcon("");
      setNewTagColor("#8B5CF6");
      setEditingTagId(null);
      setShowTagModal(false);

      Alert.alert(
        "Success",
        `Tag ${isEditing ? "updated" : "created"} successfully!`,
      );
    } catch (error: any) {
      console.error("Error saving tag:", error);
      Alert.alert("Error", error.message || "Failed to save tag");
    }
  };

  // Edit tag handler
  const handleEditTag = (tag: Tag) => {
    if (tag.user_id === null) {
      Alert.alert("Cannot Edit", "Global tags cannot be edited");
      setShowTagMenu(false);
      return;
    }

    // Pre-fill the modal with existing tag data
    setEditingTagId(tag.id);
    setNewTagName(tag.name);
    setNewTagIcon(tag.icon || "");
    setNewTagColor(tag.color || "#8B5CF6");
    setShowTagMenu(false);
    setShowTagModal(true);
  };

  // Delete tag handler
  const handleDeleteTag = async (tag: Tag) => {
    // Prevent deleting global tags
    if (tag.user_id === null) {
      Alert.alert("Cannot Delete", "Global tags cannot be deleted");
      setShowTagMenu(false);
      return;
    }

    setShowTagMenu(false);

    Alert.alert(
      "Delete Tag",
      `Are you sure you want to delete "${tag.name}"? This will remove it from all transactions.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(getApiUrl(`/api/tags/${tag.id}`), {
                method: "DELETE",
              });

              if (!response.ok) throw new Error("Failed to delete");

              // Remove tag from list
              setTags(tags.filter((t) => t.id !== tag.id));

              // Clear selection if deleted tag was selected
              if (selectedTag === tag.id) {
                setSelectedTag(null);
              }

              Alert.alert("Success", "Tag deleted successfully");
            } catch (error) {
              console.error("Error deleting tag:", error);
              Alert.alert("Error", "Failed to delete tag");
            }
          },
        },
      ],
    );
  };

  // Quick amount buttons
  const quickAmounts = [5, 10, 20, 50, 100];

  const setQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-900"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-6"
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-6">
          <Text className="text-gray-400 text-sm">Welcome back,</Text>
          <Text className="text-white font-bold text-3xl mt-1">
            {user?.name || "User"}
          </Text>
        </View>

        {/* Transaction Type Toggle */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-800 p-1.5 rounded-2xl border border-gray-700">
            <Pressable
              onPress={() => setTransactionType("expense")}
              className={`flex-1 py-3.5 rounded-xl ${
                transactionType === "expense" ? "bg-red-500" : ""
              }`}
            >
              <Text
                className={`text-center font-bold ${
                  transactionType === "expense" ? "text-white" : "text-gray-400"
                }`}
              >
                💸 Expense
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTransactionType("income")}
              className={`flex-1 py-3.5 rounded-xl ${
                transactionType === "income" ? "bg-green-500" : ""
              }`}
            >
              <Text
                className={`text-center font-bold ${
                  transactionType === "income" ? "text-white" : "text-gray-400"
                }`}
              >
                💰 Income
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Amount Section */}
        <View className="px-6 mb-6">
          <Text className="text-gray-400 text-sm mb-3 font-medium">Amount</Text>
          <CustumInput
            label="Amount ($)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            returnKeyType="next"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Quick Amount Buttons */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                onPress={() => setQuickAmount(quickAmount)}
                className="bg-gray-800 px-5 py-2.5 rounded-xl border border-gray-700"
              >
                <Text className="text-gray-200 font-bold">${quickAmount}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Category/Tag Section */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-400 text-sm font-medium">Category</Text>
            <Pressable
              onPress={() => {
                setEditingTagId(null);
                setNewTagName("");
                setNewTagIcon("");
                setNewTagColor("#8B5CF6");
                setShowTagModal(true);
              }}
              className="bg-violet-600 px-4 py-2 rounded-xl"
            >
              <Text className="text-white text-sm font-bold">+ Create</Text>
            </Pressable>
          </View>

          {loading ? (
            <View className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <Text className="text-gray-400 text-center font-medium">
                Loading categories...
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
            >
              <View className="flex-row gap-3">
                {tags.map((tag) => {
                  const isActive = selectedTag === tag.id;
                  return (
                    <Pressable
                      key={tag.id}
                      onPress={() => setSelectedTag(tag.id)}
                      onLongPress={() => {
                        if (tag.user_id !== null) {
                          setMenuTag(tag);
                          setShowTagMenu(true);
                        }
                      }}
                      delayLongPress={500}
                      style={{
                        backgroundColor: isActive
                          ? tag.color || "#8B5CF6"
                          : "#1F2937",
                      }}
                      className={`px-6 py-4 rounded-2xl border-2 min-w-[110px] ${
                        isActive ? "border-white" : "border-gray-700"
                      }`}
                    >
                      <Text className="text-center text-3xl mb-2">
                        {tag.icon}
                      </Text>
                      <Text
                        className={`text-center text-xs font-bold ${
                          isActive ? "text-white" : "text-gray-300"
                        }`}
                        numberOfLines={1}
                      >
                        {tag.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Description & Merchant */}
        <View className="px-6 mb-6">
          <Text className="text-gray-400 text-sm mb-4 font-medium">
            Details
          </Text>
          <CustumInput
            label="Description"
            placeholder="e.g., Groceries, Coffee"
            returnKeyType="next"
            value={description}
            onChangeText={setDescription}
          />
          <View className="mt-3">
            <CustumInput
              label="Merchant (optional)"
              returnKeyType="done"
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>
        </View>

        {/* Add Button */}
        <View className="px-6 mt-4">
          <Pressable
            disabled={isSubmitting}
            className={`py-4 rounded-2xl ${
              transactionType === "expense" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isSubmitting
                ? "Adding..."
                : `Add ${transactionType === "expense" ? "Expense" : "Income"}`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Tag Options Menu Modal */}
      <Modal
        visible={showTagMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTagMenu(false)}
      >
        <Pressable
          onPress={() => setShowTagMenu(false)}
          className="flex-1 justify-center items-center bg-black/70"
        >
          <View className="bg-gray-800 rounded-3xl p-6 mx-6 w-72 border border-gray-700">
            <Text className="text-white font-bold text-xl mb-6 text-center">
              {menuTag?.icon} {menuTag?.name}
            </Text>

            <Pressable
              onPress={() => menuTag && handleEditTag(menuTag)}
              className="bg-violet-600 py-3.5 rounded-2xl mb-3"
            >
              <Text className="text-white text-center font-bold text-base">
                ✏️ Edit Tag
              </Text>
            </Pressable>

            <Pressable
              onPress={() => menuTag && handleDeleteTag(menuTag)}
              className="bg-red-600 py-3.5 rounded-2xl mb-3"
            >
              <Text className="text-white text-center font-bold text-base">
                🗑️ Delete Tag
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTagMenu(false)}
              className="bg-gray-700 py-3.5 rounded-2xl border border-gray-600"
            >
              <Text className="text-gray-200 text-center font-bold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Create/Edit Tag Modal */}
      <Modal
        visible={showTagModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTagModal(false);
          setEditingTagId(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                {editingTagId ? "✏️ Edit Category" : "✨ Create Category"}
              </Text>
              <Pressable
                onPress={() => {
                  setShowTagModal(false);
                  setEditingTagId(null);
                }}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Tag Name */}
            <CustumInput
              label="Category name"
              placeholder="e.g., Coffee, Rent"
              value={newTagName}
              onChangeText={setNewTagName}
            />

            {/* Emoji Selector */}
            <Text className="text-gray-400 text-sm mb-3 mt-4 font-medium">
              Choose Icon
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              <View className="flex-row gap-2">
                {commonEmojis.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => setNewTagIcon(emoji)}
                    className={`p-4 rounded-2xl border-2 ${
                      newTagIcon === emoji
                        ? "bg-violet-600 border-violet-400"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <Text className="text-3xl">{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <CustumInput
              label="Or type emoji"
              value={newTagIcon}
              onChangeText={setNewTagIcon}
            />

            {/* Color Selector */}
            <Text className="text-gray-400 text-sm mb-3 mt-4 font-medium">
              Choose Color
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {presetColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setNewTagColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-16 h-16 rounded-2xl ${
                    newTagColor === color
                      ? "border-4 border-white"
                      : "border-2 border-gray-700"
                  }`}
                />
              ))}
            </View>

            {/* Preview */}
            {newTagName && (
              <View className="mb-6 bg-gray-800 p-5 rounded-2xl border border-gray-700">
                <Text className="text-gray-400 text-sm mb-3 font-medium">
                  Preview
                </Text>
                <View
                  style={{ backgroundColor: newTagColor }}
                  className="px-6 py-4 rounded-2xl self-start"
                >
                  <Text className="text-center text-3xl mb-2">
                    {newTagIcon}
                  </Text>
                  <Text className="text-white font-bold text-center">
                    {newTagName}
                  </Text>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowTagModal(false);
                  setEditingTagId(null);
                }}
                className="flex-1 bg-gray-700 py-4 rounded-2xl border border-gray-600"
              >
                <Text className="text-white text-center font-bold text-base">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveTag}
                className="flex-1 bg-violet-600 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-bold text-base">
                  {editingTagId ? "Update" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
