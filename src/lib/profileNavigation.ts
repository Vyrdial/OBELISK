import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/useProfile'

export function useProfileNavigation() {
  const router = useRouter()
  const { profile } = useProfile()

  const goToProfile = () => {
    if (profile?.profile_id) {
      router.push(`/profile/${profile.profile_id}`)
    } else {
      router.push('/profile')
    }
  }

  const goToEditProfile = () => {
    router.push('/profile')
  }

  const goToProfileById = (profileId: number) => {
    router.push(`/profile/${profileId}`)
  }

  return {
    goToProfile,
    goToEditProfile,
    goToProfileById,
    currentProfileId: profile?.profile_id
  }
}