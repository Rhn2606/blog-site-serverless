import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
	  DATABASE_URL: string
	}
}>()

app.use('/api/v1/blog/*', async (c, next) => {
  const header = c.req.header("authorization") || "";
  const token = header.split(" ")[1]
  //@ts-ignore

  const response = await verify(token, c.env.JWT_SECRET)
  if ( response.id ) {
    await next()
  } else {
    c.status(403)
    return c.json({ error : "Unauthorized"})
  }
})



app.post('/api/v1/signup', async (c) => {
const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate()) 

const body = await c.req.json();

const user = await prisma.user.create({
  data : {
    email : body.email,
    password : body.password
  }, 
})

//@ts-ignore
const token = await sign({ id: user.id } , c.env.JWT_SECRET)
 return c.json({
  jwt : token
 })
})
 

app.post('/api/v1/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
      password : body.password
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}
  //@ts-ignore
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})



app.get('/api/v1/blog/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})

app.post('/api/v1/blog', (c) => {

	return c.text('signin route')
})

app.put('/api/v1/blog', (c) => {
	return c.text('signin route')
})

export default app;
