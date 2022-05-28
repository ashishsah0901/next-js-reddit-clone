import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: `${process.env.NEXT_PUBLIC_APOLLO_CLIENT_URI}`,
  headers: {
    Authorization: `Apikey ${process.env.NEXT_PUBLIC_STEPZEN_API_KEY}`,
  },
  cache: new InMemoryCache(),
})

export default client
