import { API_ENDPOINTS } from "config/api";
import { View, Text } from "react-native";
import { CreateTransaction } from "./CreateTransaction";
export const HomeAnalytics = () => {
  const transactions = fetch(API_ENDPOINTS.TRANSACTIONS);
  console.log(transactions);
  return (
    <View className="flex items-center justify-center">
      <CreateTransaction />
    </View>
  );
};
