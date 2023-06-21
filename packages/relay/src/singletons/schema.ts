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
            ['scoreString', 'String'],
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
            ['listingTitle', 'String'],
            ['offerAmount', 'String'],
            ['responderId', 'String'],
            ['scoreString', 'String'],
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
