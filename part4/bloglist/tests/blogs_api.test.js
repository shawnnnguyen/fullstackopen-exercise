const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../app')
const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
  },
]

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()

  token = jwt.sign({ username: user.username, id: user._id }, config.SECRET)

  const blogsWithUser = initialBlogs.map((blog) => ({ ...blog, user: user.id }))
  await Blog.insertMany(blogsWithUser)
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('POST /api/blogs', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Type Wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(titles.includes('Type Wars'))

    const addedBlog = blogsAtEnd.find((blog) => blog.title === 'Type Wars')
    assert.strictEqual(addedBlog.author, newBlog.author)
    assert.strictEqual(addedBlog.url, newBlog.url)
    assert.strictEqual(addedBlog.likes, newBlog.likes)
  })

  test('fails with status code 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Type Wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.error, 'token invalid')

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('succeeds with status code 204 if id is valid and token belongs to creator', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  test('fails with status code 401 if token is not provided', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
  })

  test('fails with status code 401 if token does not belong to the creator', async () => {
    const passwordHash = await bcrypt.hash('sekret', 10)
    const otherUser = new User({ username: 'otheruser', passwordHash })
    await otherUser.save()
    const otherToken = jwt.sign(
      { username: otherUser.username, id: otherUser._id },
      config.SECRET
    )

    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    const result = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.error, 'invalid user')

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length)
  })
})

describe('PUT /api/blogs/:id', () => {
  test('succeeds in updating the number of likes', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

    const blogInDb = await Blog.findById(blogToUpdate.id)
    assert.strictEqual(blogInDb.likes, blogToUpdate.likes + 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
