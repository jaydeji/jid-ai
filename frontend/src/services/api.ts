import { MyFetch } from './fetch'
import type { Chat, Models, User } from '@/types'
import { groupByProvider } from '@/helpers/api'

class Api {
  myFetch: MyFetch

  constructor() {
    this.myFetch = new MyFetch()
  }

  getUser = () => {
    //     const json = await ky.get('https://example.com', {json: {foo: true}}).json();
    // console.log(json);
    return this.myFetch.get<User>('user')
  }

  getModels = () => {
    return groupByProvider(this.myFetch.get<Models>('models'))
  }

  getChats = () => {
    return this.myFetch.get<Array<Chat>>('chats')
  }

  getChat = (chatId: string) => {
    return this.myFetch.get<Chat>('chats/' + chatId)
  }

  signIn = (body: any) => {
    return this.myFetch.post('signin', body)
  }

  signUp = (body: any) => {
    return this.myFetch.post('signup', body)
  }
}

const api = new Api()

export { api }
