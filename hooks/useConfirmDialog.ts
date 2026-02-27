import { Alert } from 'react-native';

export const useConfirmDialog = () => {
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>
  ) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          const result = onConfirm();
          if (result instanceof Promise) {
            result.catch(console.error);
          }
        }
      },
    ]);
  };
  
  return { showConfirm };
};
