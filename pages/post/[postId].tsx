import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import React, { useState } from 'react'
import client from '../../apollo-client'
import Post from '../../components/Post'
import { GET_POSTS_BY_POST_ID } from '../../graphql/query'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { ADD_COMMENT } from '../../graphql/mutation'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import Avatar from '../../components/Avatar'
import TimeAgo from 'react-timeago'

interface Props {
  post: Post
}

type FormData = {
  comment: string
}

const PostPage = ({ post: postProps }: Props) => {
  const [post, setPost] = useState<Post>(postProps)
  const router = useRouter()
  const { data: session } = useSession()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>()
  const [addComment] = useMutation(ADD_COMMENT)

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const notification = toast.loading('Posting your comment...')
    await addComment({
      variables: {
        post_id: router.query.postId,
        username: session?.user?.name,
        text: data.comment,
      },
    })
    const { data: postData } = await client.query({
      query: GET_POSTS_BY_POST_ID,
      variables: {
        post_id: router.query.postId,
      },
    })

    setPost(postData?.getPostListByPostId)
    setValue('comment', '')
    toast.success('Comment Posted Successfully', {
      id: notification,
    })
  }
  return (
    <div className="mx-auto my-7 max-w-5xl">
      <Head>
        <title>{post.title}</title>
      </Head>
      <Post post={post} />
      <div className="-mt-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-6 pl-16">
        <p className="text-sm">
          Comment as <span className="text-red-500">{session?.user?.name}</span>
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-2"
        >
          <textarea
            {...register('comment')}
            disabled={!session}
            className="h-24 rounded-md border border-gray-200 p-2 pl-4 outline-none disabled:bg-gray-50"
            placeholder={
              session ? 'What are your thoughts?' : 'please sign in to comment'
            }
          />
          <button
            disabled={!session}
            className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
            type="submit"
          >
            Comment
          </button>
        </form>
      </div>
      <div className="-mt-5 rounded-b-md border border-t-0 border-gray-300 bg-white py-5 px-10">
        <hr className="py-2" />
        {post?.comments.map((comment) => (
          <div
            className="relative flex items-center space-x-2 space-y-5"
            key={comment.id}
          >
            <hr className="absolute top-10 left-7 z-0 h-16 border" />
            <div className="z-50">
              <Avatar seed={comment.username} />
            </div>
            <div className="flex flex-col">
              <p className="py-2 text-xs text-gray-400">
                <span className="font-semibold text-gray-600">
                  {comment.username}
                </span>{' '}
                · <TimeAgo date={comment.created_at} />
              </p>
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PostPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { data } = await client.query({
    query: GET_POSTS_BY_POST_ID,
    variables: {
      post_id: context.query.postId,
    },
  })

  const post: Post = data?.getPostListByPostId
  return {
    props: {
      post,
    },
  }
}
