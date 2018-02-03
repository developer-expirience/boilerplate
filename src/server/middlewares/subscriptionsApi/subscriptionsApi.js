import slugify from 'slug'
import selectn from 'selectn'
import { Router } from 'express'
import generateUuid from 'uuid/v4'
import { Subscriptions } from 'server/data/models'
import { mustLogin } from 'server/services/permissions'

const limit = 12

export default Router()

  // get single subscription
  .get('/subscription/:id', async ({params}, res) => {
    try {
      res.json(
        await Subscriptions.findOne({
          where: {id: params.id}
        })
      )
    } catch (error) {
      console.log(error)
      res.status(500).end(error)
    }
  })

  // get subscriptions by UserId
  .get('/:UserId/:page?', async (req, res) => {
    try {
      const {page, UserId} = req.params,
            where = {UserId},
            totalSubscriptions = await Subscriptions.count({where}),
            offset = page ? limit * (page -1) : 0,
            totalPages = Math.ceil(totalSubscriptions / limit),
            values = await Subscriptions.findAll({where, limit, offset})
      res.json({ values, totalPages, currentPage: page || 1 })
    }
    catch (error) {
      console.log(error);
      res.status(500).end(error)
    }
  })

  // update subscription
  .put('/:subscriptionsId', mustLogin, async ({user, body, params}, res) => {
    try {
      const UserId = user.id
      const subscription = await Subscriptions.findById(params.subscriptionsId)

      // check permissions
      if (selectn('UserId', subscription) != UserId) return res.status(401).end()
      else res.json(await subscription.update(body))

    } catch (error) {
      console.log(error)
      res.status(500).end(error)
    }
  })

  // create subscription
  .post('/', mustLogin, async ({user, body}, res) => {
    try {
      const UserId = user.id
      res.json(
        await Subscriptions.create({...body, UserId})
      )
    } catch (error) {
      console.log(error)
      res.status(500).end(error)
    }
  })