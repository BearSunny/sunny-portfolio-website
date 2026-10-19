export interface WindowState {
  id: string;
  title: string;
  icon?: string;
  isOpen: boolean;
  isMinimized?: boolean;
}

export interface WindowComponentProps {
  onClose: () => void;
  onMinimize: () => void;
  onFocus?: () => void;
  isActive?: boolean;
}