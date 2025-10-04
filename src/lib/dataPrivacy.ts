/**
 * Data Privacy Utilities
 * 
 * These utilities help protect sensitive user data when displaying profiles
 * and status information to other users.
 * 
 * SECURITY: While RLS policies protect data at the database level,
 * these utilities ensure the frontend respects column-level sensitivity.
 */

import { useAuth } from '@/hooks/useAuth';

/**
 * Filters out sensitive financial columns from profiles table
 * when viewing other users' profiles
 */
export function filterProfileData<T extends Record<string, any>>(
  profile: T,
  currentUserId: string | undefined,
  profileUserId: string
): T {
  // If viewing own profile, show everything
  if (currentUserId === profileUserId) {
    return profile;
  }

  // For other users, remove sensitive financial data
  const { total_earnings, total_spent, ...publicData } = profile;
  
  return publicData as T;
}

/**
 * Public user status data type - excludes sensitive fields
 */
export interface PublicUserStatus {
  user_id: string;
  creator_tier: string;
  requester_tier: string;
  bounties_completed: number;
  bounties_paid: number;
  created_at: string;
  updated_at: string;
}

/**
 * Full user status data type - includes sensitive fields
 */
export interface FullUserStatus extends PublicUserStatus {
  creator_points: number;
  requester_points: number;
  total_paid_amount: number;
}

/**
 * Filters out sensitive data from user_status table
 * when viewing other users' status
 */
export function filterUserStatusData<T extends Record<string, any>>(
  status: T,
  currentUserId: string | undefined,
  statusUserId: string
): T {
  // If viewing own status, show everything
  if (currentUserId === statusUserId) {
    return status;
  }

  // For other users, remove sensitive data (points and financial info)
  const { 
    creator_points, 
    requester_points, 
    total_paid_amount,
    ...publicData 
  } = status;
  
  return publicData as T;
}

/**
 * Type guard to check if status data includes sensitive fields
 */
export function hasFinancialData(
  status: PublicUserStatus | FullUserStatus
): status is FullUserStatus {
  return 'creator_points' in status && 
         'requester_points' in status && 
         'total_paid_amount' in status;
}

/**
 * Hook to check if current user is viewing their own data
 */
export function useIsOwnProfile(profileUserId: string | undefined): boolean {
  const { user } = useAuth();
  return user?.id === profileUserId;
}

/**
 * Gets display-safe profile data for public viewing
 * Automatically filters based on current user context
 */
export function usePublicProfileData<T extends Record<string, any>>(
  profile: T | null,
  profileUserId: string | undefined
): T | null {
  const { user } = useAuth();
  
  if (!profile || !profileUserId) return profile;
  
  return filterProfileData(profile, user?.id, profileUserId);
}

/**
 * Gets display-safe user status data for public viewing
 * Automatically filters based on current user context
 */
export function usePublicUserStatusData<T extends Record<string, any>>(
  status: T | null,
  statusUserId: string | undefined
): T | null {
  const { user } = useAuth();
  
  if (!status || !statusUserId) return status;
  
  return filterUserStatusData(status, user?.id, statusUserId);
}
