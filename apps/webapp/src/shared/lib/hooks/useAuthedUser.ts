import { useAppSelector } from '../../../app/store'
import { useGetUserQuery } from '../../api/user.api'

export const useAuthedUserQuery = (arg?: { populate?: boolean }) => {
  const token = useAppSelector(s => s.session.token)
  return useGetUserQuery(arg as any, { skip: !token })
}