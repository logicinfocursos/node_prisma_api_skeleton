import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()

const _API_PATH_PREFIX_ = process.env.API_PATH_PREFIX || '/api'

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.API_PORT || 3001

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})

/* Repositories */
class BaseRepository {
  constructor(entity) {
    this.entity = entity
  }

  async getAll() {
    try {
      return await prisma[this.entity].findMany()
    } catch (error) {
      console.error(`Error fetching all ${this.entity}:`, error)
      throw error
    }
  }

  async getById(id) {
    try {
      return await prisma[this.entity].findUnique({ where: { id: Number(id) } })
    } catch (error) {
      console.error(`Error fetching ${this.entity} by ID:`, error)
      throw error
    }
  }

  async create(data) {
    try {
      return await prisma[this.entity].create({ data })
    } catch (error) {
      console.error(`Error creating ${this.entity}:`, error)
      throw error
    }
  }

  async update(id, data) {
    try {
      return await prisma[this.entity].update({ where: { id: Number(id) }, data })
    } catch (error) {
      console.error(`Error updating ${this.entity}:`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      return await prisma[this.entity].delete({ where: { id: Number(id) } })
    } catch (error) {
      console.error(`Error deleting ${this.entity}:`, error)
      throw error
    }
  }
}

class CartRepository extends BaseRepository {
  constructor() {
    super('cart')
  }

  async getAll() {
    try {
      return await prisma[this.entity].findMany({
        include: {
            products: true,
        }
      })
    } catch (error) {
      console.error(`Erro ao tentar exibir os dados de ${this.entity}:`, error)
      throw error
    }
  }
}

class CategoryRepository extends BaseRepository {
    constructor() {
      super('category')
    }
  
    async getAll() {
      try {
        return await prisma[this.entity].findMany({
          include: {
            products: true,
          }
        })
      } catch (error) {
        console.error(`Erro ao tentar exibir os dados de ${this.entity}:`, error)
        throw error
      }
    }
  }

/* Services */
class sendProductToCartService {
  async sendProductToCart(req, res) {
    const { productCode, userCode, quantity, newQuantity } = req.body
    // Implementar lógica do serviço aqui
  }
}

/* Controllers */
class BaseController {
  constructor(repository) {
    this.repository = repository
  }

  async getAll(req, res) {
    try {
      const items = await this.repository.getAll()
      res.json(items)
    } catch (error) {
      res.status(500).json({ error: 'erro no servidor =getAll' })
    }
  }

  async getById(req, res) {
    const id = req.params.id

    try {
      const item = await this.repository.getById(id)
      if (item) {
        res.json(item)
      } else {
        res.status(404).json({ error: 'Not Found' })
      }
    } catch (error) {
      res.status(500).json({ error: 'erro no servidor' })
    }
  }

  async create(req, res) {
    if (req.body.id && req.body.id !== '') {
      return res.status(400).json({ error: 'ID não pode ser informado para se criar um novo registro' })
    }

    try {
      const item = await this.repository.create(req.body)
      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'erro no servidor' })
    }
  }

  async update(req, res) {
    try {
      const item = await this.repository.update(req.params.id, req.body)
      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'erro no servidor' })
    }
  }

  async delete(req, res) {
    try {
      await this.repository.delete(req.params.id)
      res.sendStatus(204)
    } catch (error) {
      res.status(500).json({ error: 'erro no servidor' })
    }
  }
}

/* Routes */
class BaseRoute {
  constructor(controller) {
    this.controller = controller
    this.router = express.Router()
    this.routes()
  }

  routes() {
    this.router.get('/', this.controller.getAll.bind(this.controller))
    this.router.get('/:id', this.controller.getById.bind(this.controller))
    this.router.post('/', this.controller.create.bind(this.controller))
    this.router.put('/:id', this.controller.update.bind(this.controller))
    this.router.delete('/:id', this.controller.delete.bind(this.controller))
  }
}

class ServiceRoute {
  constructor(service, entity) {
    this.service = service
    this.entity = entity
    this.router = express.Router()
    this.routes()
  }

  routes() {
    this.router.post('/', this.service[this.entity.path].bind(this.service))
  }
}

class AppRouter {
  constructor(app) {
    this.app = app
    this.routes()
  }

  routes() {
    for (const entity of routeList.entities) {
      if (entity.type === "repository") {
        const repository = this.getRepository(entity)
        const controller = new BaseController(repository)
        const route = new BaseRoute(controller)
        this.app.use(`/${_API_PATH_PREFIX_}/${entity.path}`, route.router)
      } else if (entity.type === "service") {
        const service = this.getService(entity)
        const route = new ServiceRoute(service, entity)
        this.app.use(`/${_API_PATH_PREFIX_}/${entity.path}`, route.router)
      }
    }
  }

  getRepository(entity) {
    if (entity.name) {
      const RepositoryClass = eval(entity.name)
      return new RepositoryClass(entity.path)
    } else {
      return new BaseRepository(entity.path)
    }
  }

  getService(entity) {
    if (entity.name) {
        const ServiceClass = eval(entity.name)
        return new ServiceClass()
    }
  }
}

const routeList = {
  entities: [
    {
      path: 'product',
      name: null,
      type: 'repository'
    },
    {
        path: 'category',
        name: 'CategoryRepository',
        type: 'repository'
      },
    {
      path: 'cart',
      name: 'CartRepository',
      type: 'repository'
    },
    {
      path: 'sendProductToCart',
      name: 'sendProductToCartService',
      type: 'service'
    }
  ]
}

new AppRouter(app)