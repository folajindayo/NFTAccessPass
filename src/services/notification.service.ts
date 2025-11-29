/**
 * Notification Service for in-app alerts and notifications
 * Supports toast notifications, persistent alerts, and push notifications
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  timestamp: number;
}

export interface NotificationConfig {
  position: NotificationPosition;
  defaultDuration: number;
  maxNotifications: number;
  groupSimilar: boolean;
}

type NotificationSubscriber = (notifications: Notification[]) => void;

const DEFAULT_CONFIG: NotificationConfig = {
  position: 'top-right',
  defaultDuration: 5000,
  maxNotifications: 5,
  groupSimilar: true,
};

class NotificationService {
  private config: NotificationConfig;
  private notifications: Map<string, Notification> = new Map();
  private subscribers: Set<NotificationSubscriber> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notify(): void {
    const notificationArray = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    this.subscribers.forEach(subscriber => {
      subscriber(notificationArray);
    });
  }

  private scheduleRemoval(id: string, duration: number): void {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
    }

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.timers.set(id, timer);
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: NotificationSubscriber): () => void {
    this.subscribers.add(callback);
    callback(Array.from(this.notifications.values()));

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Show a notification
   */
  show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };

    // Check for similar notification if grouping is enabled
    if (this.config.groupSimilar) {
      const existing = Array.from(this.notifications.values()).find(
        n => n.type === notification.type && 
             n.title === notification.title && 
             n.message === notification.message
      );

      if (existing) {
        // Refresh existing notification
        this.timers.get(existing.id) && clearTimeout(this.timers.get(existing.id));
        const duration = notification.duration || this.config.defaultDuration;
        if (!notification.persistent) {
          this.scheduleRemoval(existing.id, duration);
        }
        return existing.id;
      }
    }

    // Remove oldest if at max
    if (this.notifications.size >= this.config.maxNotifications) {
      const oldest = Array.from(this.notifications.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      if (oldest) {
        this.dismiss(oldest.id);
      }
    }

    this.notifications.set(id, fullNotification);

    // Schedule removal if not persistent
    if (!notification.persistent) {
      const duration = notification.duration || this.config.defaultDuration;
      this.scheduleRemoval(id, duration);
    }

    this.notify();
    return id;
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.onDismiss?.();
      this.notifications.delete(id);
      
      if (this.timers.has(id)) {
        clearTimeout(this.timers.get(id));
        this.timers.delete(id);
      }

      this.notify();
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.notifications.clear();
    this.notify();
  }

  /**
   * Show success notification
   */
  success(title: string, message?: string): string {
    return this.show({ type: 'success', title, message });
  }

  /**
   * Show error notification
   */
  error(title: string, message?: string): string {
    return this.show({ type: 'error', title, message, duration: 8000 });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message?: string): string {
    return this.show({ type: 'warning', title, message });
  }

  /**
   * Show info notification
   */
  info(title: string, message?: string): string {
    return this.show({ type: 'info', title, message });
  }

  /**
   * Show transaction pending notification
   */
  transactionPending(txHash: string): string {
    return this.show({
      type: 'info',
      title: 'Transaction Pending',
      message: `Transaction ${txHash.slice(0, 10)}... submitted`,
      persistent: true,
    });
  }

  /**
   * Show transaction success notification
   */
  transactionSuccess(txHash: string): string {
    return this.show({
      type: 'success',
      title: 'Transaction Confirmed',
      message: `Transaction ${txHash.slice(0, 10)}... confirmed`,
    });
  }

  /**
   * Show transaction error notification
   */
  transactionError(error: string): string {
    return this.show({
      type: 'error',
      title: 'Transaction Failed',
      message: error,
    });
  }

  /**
   * Update notification configuration
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Get active notification count
   */
  getCount(): number {
    return this.notifications.size;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for custom instances
export { NotificationService };

export default notificationService;

