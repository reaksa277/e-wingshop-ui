'use server';

export interface ExpiryAlert {
  id: string;
  productName: string;
  branchName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  quantity: number;
  status: 'pending' | 'dismissed';
}

/**
 * Get expiry alerts for the dashboard
 * @param productId - Optional product ID filter
 * @param status - Optional status filter (all, pending, dismissed)
 * @returns Array of expiry alerts
 */
export async function getExpiryAlerts(
  productId?: string,
  status: string = 'all'
): Promise<ExpiryAlert[]> {
  // Mock data - replace with actual API call
  const mockAlerts: ExpiryAlert[] = [
    {
      id: '1',
      productName: 'Fresh Milk',
      branchName: 'Main Branch',
      expiryDate: '2024-01-15',
      daysUntilExpiry: 2,
      quantity: 50,
      status: 'pending',
    },
    {
      id: '2',
      productName: 'Organic Yogurt',
      branchName: 'Downtown Branch',
      expiryDate: '2024-01-18',
      daysUntilExpiry: 5,
      quantity: 30,
      status: 'pending',
    },
    {
      id: '3',
      productName: 'Fresh Bread',
      branchName: 'Main Branch',
      expiryDate: '2024-01-14',
      daysUntilExpiry: 1,
      quantity: 20,
      status: 'dismissed',
    },
  ];

  let filtered = mockAlerts;

  if (productId) {
    filtered = filtered.filter((alert) => alert.id === productId);
  }

  if (status !== 'all') {
    filtered = filtered.filter((alert) => alert.status === status);
  }

  return filtered;
}

/**
 * Dismiss an expiry alert
 * @param alertId - Alert ID to dismiss
 * @returns Success status
 */
export async function dismissExpiryAlert(alertId: string): Promise<{ success: boolean }> {
  // Mock implementation - replace with actual API call
  console.log(`Dismissing alert ${alertId}`);

  return { success: true };
}
