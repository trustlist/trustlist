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
    app.post('/api/loadActivity', async (req, res) => {
        try {
            const { epochKeys } = req.body
            const deals = await db.findMany('Listings', {
                where: {
                    OR: [
                        {
                            dealOpened: true,
                            posterId: epochKeys,
                        },
                        {
                            dealOpened: true,
                            responderId: epochKeys,
                        },
                    ],
                },
            })
            const listings = await db.findMany('Listings', {
                where: {
                    posterId: epochKeys,
                },
            })
            const offers = await db.findMany('Offers', {
                where: {
                    responderId: epochKeys,
                },
            })
            res.json({ deals, listings, offers })
        } catch (error: any) {
            res.status(500).json({ error })
        }
    })
}
