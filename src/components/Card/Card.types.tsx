import { View } from "@novorender/api";

export type CardComponentProps = {
  projectView: View | null,
};
  
export type ShowNotificationProps = {
  description: string,
  message: string,
  type?: MessageTypeProps,
};

type MessageTypeProps = 'success' | 'info' | 'warning' | 'error';