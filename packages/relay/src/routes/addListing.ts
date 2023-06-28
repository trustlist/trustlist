import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/addListing', async (req, res) => {
    try {
      const { epoch, section, category, title, amount, amountType, description, posterId, scoreString } = req.body
      await db.create('Listings', {
        epoch,
        section,
        category,
        title,
        amount,
        amountType,
        description,
        posterId,
        scoreString,
        responderId: '',
        offerAmount: '',
        dealOpened: false,
        posterDealClosed: false,
        responderDealClosed: false,
        posterAttested: false,
        responderAttested: false,
      })
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}