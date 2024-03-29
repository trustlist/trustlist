import { Express } from 'express'
import { Prover } from '@unirep/circuits'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (
    app: Express,
    prover: Prover,
    db: DB,
    synchronizer: Synchronizer
) => {
    app.get('/api/loadOffers/:id', async (req, res) => {
        try {
            const { id } = req.params
            const offers = await db.findMany('Offers', {
                where: {
                    listingId: id,
                },
            })
            console.log(offers)
            res.json(offers)
        } catch (error: any) {
            res.status(500).json({ error })
        }
    })
}
