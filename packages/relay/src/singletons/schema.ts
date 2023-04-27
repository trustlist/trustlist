import { schema } from '@unirep/core'
import { TableData } from 'anondb/node'
import { nanoid } from 'nanoid'

const _schema = [
    {
        name: 'AccountTransaction',
        primaryKey: 'signedData',
        rows: [
            ['signedData', 'String'],
            ['address', 'String'],
            ['nonce', 'Int'],
        ],
    },
    {
        name: 'AccountNonce',
        primaryKey: 'address',
        rows: [
            ['address', 'String'],
            ['nonce', 'Int'],
        ],
    },
    {
        name: 'Listings',
        primaryKey: '_id',
        rows: [
            ['epoch', 'Int'],
            ['section', 'String'],
            ['category', 'String'],
            ['title', 'String'],
            ['amount', 'String'],
            ['amountType', 'String'],
            ['description', 'String'],
            ['posterId', 'String'],
            ['pScore1', 'String'],
            ['pScore2', 'String'],
            ['pScore3', 'String'],
            ['pScore4', 'String'],
            ['responderId', 'String'],
            ['offerAmount', 'String'],
            ['dealOpened', 'Bool'],
            ['posterDealClosed', 'Bool'],
            ['responderDealClosed', 'Bool'],
        ],
    },
    {
        name: 'Offers',
        primaryKey: '_id',
        rows: [
            ['epoch', 'Int'],
            ['listingId', 'String'],
            ['offerAmount', 'String'],
            ['responderId', 'String'],
            ['rScore1', 'String'],
            ['rScore2', 'String'],
            ['rScore3', 'String'],
            ['rScore4', 'String'],
        ],
    },
]

export default _schema
    .map(
        (obj) =>
            ({
                ...obj,
                primaryKey: obj.primaryKey || '_id',
                rows: [
                    ...obj.rows,
                    {
                        name: '_id',
                        type: 'String',
                        default: () => nanoid(),
                    },
                ],
            } as TableData)
    )
    .concat(schema)
