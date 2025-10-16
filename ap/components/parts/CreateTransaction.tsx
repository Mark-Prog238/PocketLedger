import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { getApiUrl, API_ENDPOINTS } from "config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustumInput from "components/CustumInputs";

interface Tag {
  id: number;
  name: string;
  color: string;
  icon: string;
  user_id: number | null;
}

export const CreateTransaction = () => {
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense",
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("");
  const [newTagColor, setNewTagColor] = useState("#8B5CF6");

  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  // Fetch user tags
  useEffect(() => {
    const getUserTags = async () => {
      if (!token || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl(`/api/tags/${user.id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Backend returns { tags: [...] }, so we need to extract the tags array
          setTags(data.tags || []);
        } else {
          setTags([]);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    getUserTags();
  }, [token, user?.id]);

  const quickAmounts = [5, 10, 20, 50, 100];

  const setQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const saveTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    if (!token || !user?.id) return;

    try {
      const slug = newTagName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const response = await fetch(getApiUrl("/api/tags"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          name: newTagName.trim(),
          slug: slug,
          color: newTagColor,
          icon: newTagIcon.trim() || "📝",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }

      const savedTag = await response.json();
      setTags([...tags, savedTag]);

      setNewTagName("");
      setNewTagIcon("");
      setNewTagColor("#8B5CF6");
      setShowTagModal(false);

      Alert.alert("Success", "Category created successfully!");
    } catch (error: any) {
      console.error("Error saving tag:", error);
      Alert.alert("Error", error.message || "Failed to save category");
    }
  };

  const handleSubmit = async () => {
    if (!amount || !description) {
      Alert.alert("Error", "Please fill in amount and description");
      return;
    }
    setIsSubmitting(true);
    try {
      const url = getApiUrl(API_ENDPOINTS.TRANSACTIONS);

      if (!token) {
        Alert.alert("Error", "Please log in again");
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount) * 100, // Convert to cents
          direction: transactionType,
          description: description.trim(),
          tagId: selectedTag,
          occurredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create transaction");
      }

      // Reset form
      setDescription("");
      setAmount("");
      setSelectedTag(null);

      Alert.alert("Success", "Transaction added successfully!");
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      Alert.alert("Error", error.message || "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <Text className="text-gray-300 text-base font-inter">
              Add New Transaction
            </Text>
            <Text className="text-white font-inter-bold text-4xl mt-2">
              {transactionType === "expense" ? "Expense" : "Income"}
            </Text>
          </View>

          {/* Transaction Type Toggle */}
          <View className="px-6 mb-6">
            <View className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
              <View className="flex-row">
                <Pressable
                  onPress={() => setTransactionType("expense")}
                  className={`flex-1 py-4 ${
                    transactionType === "expense"
                      ? "bg-red-600"
                      : "bg-transparent"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color={
                        transactionType === "expense" ? "white" : "#9CA3AF"
                      }
                    />
                    <Text
                      className={`ml-2 font-semibold text-base ${
                        transactionType === "expense"
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    >
                      Expense
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setTransactionType("income")}
                  className={`flex-1 py-4 ${
                    transactionType === "income"
                      ? "bg-green-600"
                      : "bg-transparent"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color={transactionType === "income" ? "white" : "#9CA3AF"}
                    />
                    <Text
                      className={`ml-2 font-semibold text-base ${
                        transactionType === "income"
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    >
                      Income
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Transaction Details */}
          <View className="px-6 mb-6">
            <View className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <Text className="text-gray-200 text-lg font-semibold mb-4">
                Transaction Details
              </Text>

              <View className="space-y-4">
                <CustumInput
                  label="Description: e.g., Groceries, Coffee, Salary"
                  value={description}
                  onChangeText={setDescription}
                  style={{ backgroundColor: "#1F2937" }}
                />

                <CustumInput
                  label="Amount ($):"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  style={{ backgroundColor: "#1F2937" }}
                />

                {/* Quick Amount Buttons */}
                <View>
                  <Text className="text-gray-400 text-sm mb-3">
                    Quick amounts
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Pressable
                        key={quickAmount}
                        onPress={() => setQuickAmount(quickAmount)}
                        className="bg-gray-700 px-4 py-2 rounded-xl active:bg-gray-600"
                      >
                        <Text className="text-white font-medium">
                          ${quickAmount}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Category Selection */}
          <View className="px-6 mb-6">
            <Text className="text-gray-200 text-lg font-semibold mb-4">
              Category (Optional)
            </Text>

            {loading ? (
              <View className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <Text className="text-gray-400 text-center">
                  Loading categories...
                </Text>
              </View>
            ) : (
              <View className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                >
                  {tags && tags.length > 0 ? (
                    tags.map((tag) => {
                      const isActive = selectedTag === tag.id;
                      return (
                        <Pressable
                          key={tag.id}
                          onPress={() => setSelectedTag(tag.id)}
                          className={`mr-3 px-4 py-3 rounded-xl border-2 min-w-[100px] ${
                            isActive
                              ? "border-violet-500 bg-violet-600/20"
                              : "border-gray-600 bg-gray-700/50"
                          }`}
                        >
                          <View className="items-center">
                            <Text className="text-2xl mb-1">{tag.icon}</Text>
                            <Text
                              className={`text-xs font-medium ${
                                isActive ? "text-violet-300" : "text-gray-300"
                              }`}
                              numberOfLines={1}
                            >
                              {tag.name}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })
                  ) : (
                    <View className="flex-1 items-center justify-center py-4">
                      <Text className="text-gray-400 text-sm">
                        No categories yet
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => {
                      setNewTagName("");
                      setNewTagIcon("");
                      setNewTagColor("#8B5CF6");
                      setShowTagModal(true);
                    }}
                    className="px-4 py-3 rounded-xl border-2 border-dashed border-gray-500 min-w-[100px] items-center justify-center"
                  >
                    <Ionicons name="add" size={24} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs mt-1">Create</Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="px-6 mb-6">
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !amount || !description}
              className={`py-4 rounded-2xl ${
                isSubmitting || !amount || !description
                  ? "bg-gray-700"
                  : transactionType === "expense"
                    ? "bg-red-600"
                    : "bg-green-600"
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
      </KeyboardAvoidingView>

      {/* Create Category Modal */}
      <Modal
        visible={showTagModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTagModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-800 rounded-t-3xl p-6 border-t border-gray-700">
            <Text className="text-white font-bold text-xl mb-6 text-center">
              Create Category
            </Text>

            <CustumInput
              label="Category Name: e.g., Food, Transport"
              value={newTagName}
              onChangeText={setNewTagName}
              style={{ backgroundColor: "#1F2937" }}
            />

            <CustumInput
              label="Icon (Emoji): e.g., 🍔, 🚗"
              value={newTagIcon}
              onChangeText={setNewTagIcon}
              style={{ backgroundColor: "#1F2937" }}
            />

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setShowTagModal(false)}
                className="flex-1 bg-gray-600 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-bold">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveTag}
                className="flex-1 bg-violet-600 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-bold">Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
