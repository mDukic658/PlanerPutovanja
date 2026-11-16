import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { RouteNames } from '../constants'

export default function ZasticenaRuta({ uloge }) {
    const { isLoggedIn, authUser } = useAuth()

    if (!isLoggedIn) {
        return <Navigate to={RouteNames.LOGIN} replace />
    }

    if (uloge && !uloge.includes(authUser.uloga)) {
        return <Navigate to={RouteNames.HOME} replace />
    }

    return <Outlet />
}