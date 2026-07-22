const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  return blogs.reduce((favorite, blog) =>
    blog.likes > favorite.likes ? blog : favorite
  )
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  const blogCounts = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
    return counts
  }, {})

  const topAuthor = Object.keys(blogCounts).reduce((top, author) =>
    blogCounts[author] > blogCounts[top] ? author : top
  )

  return {
    author: topAuthor,
    blogs: blogCounts[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  const likesByAuthor = blogs.reduce((likes, blog) => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
    return likes
  }, {})

  const topAuthor = Object.keys(likesByAuthor).reduce((top, author) =>
    likesByAuthor[author] > likesByAuthor[top] ? author : top
  )

  return {
    author: topAuthor,
    likes: likesByAuthor[topAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
