import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "contexts/AuthContext";
import { getApiUrl } from "config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Transaction {
  id: number;
  amount_minor: number;
  direction: "income" | "expense";
  description: string;
  merchant?: string;
  occurred_at: string;
  tag_names?: string;
  tag_colors?: string;
  tag_icons?: string;
}

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();

  const fetchTransactions = async () => {
    if (!token || !user?.id) return;

    try {
      const params = new URLSearchParams();
      if (filterType !== "all") {
        params.append("type", filterType);
      }

      const response = await fetch(getApiUrl(`/api/transactions?${params}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id, token, filterType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (transaction.merchant &&
        transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const handleDeleteTransaction = async (transactionId: number) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                getApiUrl(`/api/transactions/${transactionId}`),
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!response.ok) {
                throw new Error("Failed to delete transaction");
              }

              setTransactions(
                transactions.filter((t) => t.id !== transactionId),
              );
              setShowTransactionModal(false);
              Alert.alert("Success", "Transaction deleted successfully");
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ],
    );
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => {
      return transaction.direction === "income"
        ? total + transaction.amount_minor
        : total - transaction.amount_minor;
    }, 0);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <Text className="text-gray-300 text-base font-inter">
          Transaction History
        </Text>
        <Text className="text-white font-inter-bold text-4xl mt-2">
          All Transactions
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          {filteredTransactions.length} transactions •{" "}
          {formatCurrency(getTotalAmount())}
        </Text>
      </View>

      {/* Search and Filter Bar */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1 bg-gray-800/50 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-3"
              placeholder="Search transactions..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable
            onPress={() => setShowFilters(true)}
            className="bg-violet-600 p-3 rounded-xl"
          >
            <Ionicons name="filter" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Filter Pills */}
      <View className="px-6 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {[
              { key: "all", label: "All", count: transactions.length },
              {
                key: "income",
                label: "Income",
                count: transactions.filter((t) => t.direction === "income")
                  .length,
              },
              {
                key: "expense",
                label: "Expense",
                count: transactions.filter((t) => t.direction === "expense")
                  .length,
              },
            ].map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => setFilterType(filter.key as any)}
                className={`px-4 py-2 rounded-full ${
                  filterType === filter.key ? "bg-violet-600" : "bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterType === filter.key ? "text-white" : "text-gray-300"
                  }`}
                >
                  {filter.label} ({filter.count})
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setIsAtTop(scrollY <= 50);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length > 0 ? (
          <View className="px-6 space-y-3">
            {filteredTransactions.map((transaction) => (
              <Pressable
                key={transaction.id}
                onPress={() => {
                  setSelectedTransaction(transaction);
                  setShowTransactionModal(true);
                }}
                className="bg-gray-800/50 p-4 rounded-xl border border-gray-700"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                        transaction.direction === "income"
                          ? "bg-green-600/20"
                          : "bg-red-600/20"
                      }`}
                    >
                      <Ionicons
                        name={
                          transaction.direction === "income"
                            ? "arrow-down"
                            : "arrow-up"
                        }
                        size={24}
                        color={
                          transaction.direction === "income"
                            ? "#10B981"
                            : "#EF4444"
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base">
                        {transaction.description}
                      </Text>
                      {transaction.merchant && (
                        <Text className="text-gray-400 text-sm">
                          {transaction.merchant}
                        </Text>
                      )}
                      <Text className="text-gray-500 text-xs">
                        {formatDate(transaction.occurred_at)} •{" "}
                        {formatTime(transaction.occurred_at)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-lg font-bold ${
                        transaction.direction === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.direction === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount_minor)}
                    </Text>
                    {transaction.tag_names && (
                      <Text className="text-gray-400 text-xs mt-1">
                        {transaction.tag_names.split(",")[0]}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <Ionicons name="receipt-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-lg font-medium mt-4">
              {searchQuery ? "No matching transactions" : "No transactions yet"}
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start by adding your first transaction"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal
        visible={showTransactionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTransactionModal(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            {selectedTransaction && (
              <>
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-white font-bold text-2xl">
                    Transaction Details
                  </Text>
                  <Pressable
                    onPress={() => setShowTransactionModal(false)}
                    className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
                  >
                    <Text className="text-gray-400 text-2xl">✕</Text>
                  </Pressable>
                </View>

                <View className="space-y-4">
                  <View className="bg-gray-800/50 p-4 rounded-xl">
                    <Text className="text-gray-400 text-sm mb-2">
                      Description
                    </Text>
                    <Text className="text-white text-lg font-semibold">
                      {selectedTransaction.description}
                    </Text>
                  </View>

                  {selectedTransaction.merchant && (
                    <View className="bg-gray-800/50 p-4 rounded-xl">
                      <Text className="text-gray-400 text-sm mb-2">
                        Merchant
                      </Text>
                      <Text className="text-white text-lg">
                        {selectedTransaction.merchant}
                      </Text>
                    </View>
                  )}

                  <View className="bg-gray-800/50 p-4 rounded-xl">
                    <Text className="text-gray-400 text-sm mb-2">Amount</Text>
                    <Text
                      className={`text-2xl font-bold ${
                        selectedTransaction.direction === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedTransaction.direction === "income" ? "+" : "-"}
                      {formatCurrency(selectedTransaction.amount_minor)}
                    </Text>
                  </View>

                  <View className="bg-gray-800/50 p-4 rounded-xl">
                    <Text className="text-gray-400 text-sm mb-2">
                      Date & Time
                    </Text>
                    <Text className="text-white text-lg">
                      {formatDate(selectedTransaction.occurred_at)} at{" "}
                      {formatTime(selectedTransaction.occurred_at)}
                    </Text>
                  </View>

                  {selectedTransaction.tag_names && (
                    <View className="bg-gray-800/50 p-4 rounded-xl">
                      <Text className="text-gray-400 text-sm mb-2">
                        Category
                      </Text>
                      <Text className="text-white text-lg">
                        {selectedTransaction.tag_names}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-3 mt-6">
                  <Pressable
                    onPress={() => setShowTransactionModal(false)}
                    className="flex-1 bg-gray-700 py-4 rounded-2xl border border-gray-600"
                  >
                    <Text className="text-white text-center font-bold text-base">
                      Close
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      handleDeleteTransaction(selectedTransaction.id)
                    }
                    className="flex-1 bg-red-600 py-4 rounded-2xl"
                  >
                    <Text className="text-white text-center font-bold text-base">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-gray-900 rounded-t-3xl p-6 pb-10 border-t border-gray-700">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold text-2xl">
                Filter Transactions
              </Text>
              <Pressable
                onPress={() => setShowFilters(false)}
                className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center"
              >
                <Text className="text-gray-400 text-2xl">✕</Text>
              </Pressable>
            </View>

            <View className="space-y-4">
              <Text className="text-gray-400 text-sm font-medium">
                Transaction Type
              </Text>
              {[
                { key: "all", label: "All Transactions" },
                { key: "income", label: "Income Only" },
                { key: "expense", label: "Expenses Only" },
              ].map((filter) => (
                <Pressable
                  key={filter.key}
                  onPress={() => {
                    setFilterType(filter.key as any);
                    setShowFilters(false);
                  }}
                  className={`p-4 rounded-xl ${
                    filterType === filter.key ? "bg-violet-600" : "bg-gray-800"
                  }`}
                >
                  <Text
                    className={`text-lg font-medium ${
                      filterType === filter.key ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
