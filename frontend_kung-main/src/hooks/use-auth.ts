import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient, LoginCredentials, User } from '@/lib/api-client'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'

export function useLogin() {
  const { login, setUser } = useAuth()
  const router = useRouter()
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // login ควร return user object ถ้าสำเร็จ
      const user = await login(credentials.phone_number, credentials.password)
      if (!user) {
        throw new Error('Login failed')
      }
      return user
    },
    onSuccess: (user) => {
      // อัพเดท state ทันที
      setUser(user)
      router.push('/ponds')
    },
  })
}

export function useLogout() {
  const { logout } = useAuth()
  const router = useRouter()
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Logout is handled by the auth provider
      // ใช้ Promise.resolve() เพื่อให้เป็น async
      return Promise.resolve(logout())
    },
    onSuccess: () => {
      router.push('/login')
    },
  })
}

export function useProfile() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User | null> => {
      return user
    },
    enabled: !!user,
  })
}