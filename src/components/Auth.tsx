import React, { useState } from 'react'
import styles from './Auth.module.css'
import { useDispatch } from 'react-redux'
import { updateUserProfile } from '../features/userSlice'
import { auth, provider, storage } from '../firebase'

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Modal,
  IconButton,
  Box,
} from '@material-ui/core'

import SendIcon from '@material-ui/icons/Send'
import CameraIcon from '@material-ui/icons/Camera'
import EmailIcon from '@material-ui/icons/Email'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage:
      'url(https://images.unsplash.com/photo-1630794456822-c68667bbbb68?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2134&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: 'none',
    position: 'absolute',
    width: 400,
    borderRadius: 10,
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}))

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const Auth: React.FC = () => {
  const classes = useStyles()

  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emailToResetPassword, setEmailToResetPassword] = useState('')

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0])
      e.target.value = '' // 何回fileを選択しても反応させるため
    }
  }

  const signInWithEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password)
  }
  const signUpWithEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password)
    let url = ''
    if (avatarImage) {
      const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const N = 16
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('')
      const fileName = randomChar + '_' + avatarImage.name

      // Upload to Fire Storage
      await storage.ref(`avatars/${fileName}`).put(avatarImage)
      url = await storage.ref('avatars').child(fileName).getDownloadURL()
    }

    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    })
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    )
  }

  const signInWithGoogle = async () => {
    await auth.signInWithPopup(provider).catch((err) => alert(err.message))
  }

  const sendEmailToResetPassword = async (e: React.MouseEvent<HTMLElement>) => {
    try {
      await auth.sendPasswordResetEmail(emailToResetPassword)
      setIsModalOpen(false)
    } catch (err) {
      alert(err.message)
    }
    setEmailToResetPassword('')
  }

  return (
    <Grid container component='main' className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            {isLogin ? 'Sign in' : 'Register'}
          </Typography>
          <form className={classes.form} noValidate>
            {!isLogin && (
              <>
                <TextField
                  variant='outlined'
                  margin='normal'
                  required
                  fullWidth
                  id='username'
                  label='Username'
                  name='username'
                  autoComplete='username'
                  autoFocus
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value)
                  }}
                />
                <Box textAlign='center'>
                  <IconButton>
                    <label>
                      <AccountCircleIcon
                        fontSize='large'
                        className={
                          avatarImage
                            ? styles.login_addIconLoaded
                            : styles.login_addIcon
                        }
                      />
                      <input
                        type='file'
                        className={styles.login_hiddenIcon}
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />
            <Button
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              startIcon={<EmailIcon />}
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !username || !avatarImage || !email || password.length < 6
              }
              onClick={
                isLogin
                  ? async () =>
                      await signInWithEmail().catch((e) => alert(e.message))
                  : async () =>
                      await signUpWithEmail().catch((e) => alert(e.message))
              }
            >
              {isLogin ? 'Sign in' : 'Register'}
            </Button>
            <Grid container>
              <Grid item xs>
                <span
                  className={styles.login_reset}
                  onClick={() => setIsModalOpen(true)}
                >
                  Forgot password?
                </span>
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Create new account?' : 'Back to sign in?'}
                </span>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              onClick={signInWithGoogle}
            >
              SignIn with Google
            </Button>
          </form>
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className={classes.modal} style={getModalStyle()}>
              <TextField
                InputLabelProps={{
                  shrink: true,
                }}
                type='email'
                name='email'
                label='Reset E-mail'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmailToResetPassword(e.target.value)
                }}
              />
              <IconButton onClick={sendEmailToResetPassword}>
                <SendIcon />
              </IconButton>
            </div>
          </Modal>
        </div>
      </Grid>
    </Grid>
  )
}

export default Auth
