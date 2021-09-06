import React, { useEffect } from 'react'
import styles from './App.module.css'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, login, logout } from './features/userSlice'
import { auth } from './firebase'
import Feed from './components/Feed'
import Auth from './components/Auth'

const App: React.FC = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()

  useEffect(() => {
    const unSub = auth.onAuthStateChanged((authUser) => {
      // Logout
      if (!authUser) {
        dispatch(logout())
        return
      }

      // Login
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        )
      }
    })

    return () => unSub()
  }, [dispatch])

  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed></Feed>
        </div>
      ) : (
        <Auth></Auth>
      )}
    </>
  )
}

export default App
