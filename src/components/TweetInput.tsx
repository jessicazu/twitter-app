import React, { useState } from 'react'
import styles from './TweetInput.module.css'

import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'
import { storage, db, auth, provider } from '../firebase'
import { Avatar, Button, IconButton } from '@material-ui/core'
import firebase from 'firebase/app'
import AddPhotoIcon from '@material-ui/icons/AddAPhoto'

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser)
  const [tweetMsg, setTweetMsg] = useState('')
  const [tweetImage, setTweetImage] = useState<File | null>(null)

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0])
      e.target.value = '' // 何回fileを選択しても反応させるため
    }
  }
  const sendTweet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (tweetImage) {
      const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const N = 16
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('')
      const fileName = randomChar + '_' + tweetImage.name
      const uploadTweetImage = storage.ref(`images/${fileName}`).put(tweetImage)
      // storageの変化に対する後処理をonで設定できる
      uploadTweetImage.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {}, // uploadの進捗
        (err) => alert(err), // err
        // 正常終了
        async () => {
          const url = await storage
            .ref('images')
            .child(fileName)
            .getDownloadURL()
          db.collection('posts').add({
            avatar: user.photoUrl,
            image: url,
            text: tweetMsg,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            username: user.displayName,
          })
        }
      )
    } else {
      await db.collection('posts').add({
        avatar: user.photoUrl,
        image: '',
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      })
    }

    setTweetMsg('')
    setTweetImage(null)
  }

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut()
            }}
          />
          <input
            type='text'
            className={styles.tweet_input}
            placeholder={"What's happening?"}
            autoFocus
            value={tweetMsg}
            onChange={(e) => setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type='file'
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type='submit'
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  )
}

export default TweetInput
