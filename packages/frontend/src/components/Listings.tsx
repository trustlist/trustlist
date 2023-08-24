import { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import DetailModal from './DetailModal'
import Tooltip from './Tooltip'
import './listings.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
    section: string
    category: string
}

type Listing = {
    _id: string
    epoch: number | undefined
    section: string
    title: string
    amount: string
    amountType: string
    description: string
    scoreString: string
    dealOpened: boolean
    posterDealClosed: boolean
    responderDealClosed: boolean
}

export default observer(({ section, category }: Props) => {
    const app = useContext(Trustlist)
    const user = useContext(User)
    const [showDetail, setShowDetail] = useState<boolean>(false)
    const [detailData, setDetailData] = useState<any>()
    let listingClass = 'listing-item'

    useEffect(() => {
        const loadData = async () => {
            await app.loadSelectedCategory(section, category)
        }
        loadData()
    }, [section, category])

    let listings = []
    if (section === 'for sale') {
        listings = app.forSaleByCategory.get(category)
    } else if (section === 'housing') {
        listings = app.housingByCategory.get(category)
    } else if (section === 'jobs') {
        listings = app.jobsByCategory.get(category)
    } else {
        listings = app.servicesByCategory.get(category)
    }

    return (
        <div className="listings">
            {category === '' ? (
                <div className="message">choose a category...</div>
            ) : null}
            {category !== '' && (!listings || listings.length < 1) ? (
                <div className="message">no listings here yet!</div>
            ) : null}
            {listings
                ? listings
                      .slice()
                      .reverse()
                      .map((listing: Listing) => {
                          const posterScores = JSON.parse(listing.scoreString)
                          const scores = app.calcScoresFromDB(posterScores)
                          {
                              listing.epoch !=
                              user.userState?.sync.calcCurrentEpoch()
                                  ? (listingClass = 'listing-expired')
                                  : null
                          }
                          return (
                              <>
                                  <div
                                      className={listingClass}
                                      key={listing._id}
                                      onClick={() => {
                                          setDetailData(listing)
                                          setShowDetail(true)
                                      }}
                                  >
                                      <div className="thumbnail">TL</div>
                                      <div>
                                          <div className="listing-title">
                                              {listing.title.slice(0,50)}
                                          </div>
                                          {listing.posterDealClosed &&
                                          listing.responderDealClosed ? (
                                              <div style={{ display: 'flex' }}>
                                                  <div
                                                      style={{
                                                          textDecoration:
                                                              'line-through',
                                                      }}
                                                  >
                                                      ${listing.amount}
                                                  </div>
                                                  <div className="complete">
                                                      deal completed
                                                  </div>
                                              </div>
                                          ) : null}
                                          {listing.dealOpened &&
                                          !listing.posterDealClosed ? (
                                              <div style={{ display: 'flex' }}>
                                                  <div
                                                      style={{
                                                          textDecoration:
                                                              'line-through',
                                                      }}
                                                  >
                                                      ${listing.amount}
                                                  </div>
                                                  <div className="accepted">
                                                      offer accepted
                                                  </div>
                                              </div>
                                          ) : null}
                                          {!listing.dealOpened ? (
                                              <div>${listing.amount}</div>
                                          ) : null}
                                          {listingClass === 'listing-item' ? (
                                              <div className="listing-description">
                                                  {listing.description}
                                              </div>
                                          ) : (
                                              <div
                                                  style={{
                                                      marginRight: '200px',
                                                      color: 'black',
                                                  }}
                                              >
                                                  EXPIRED
                                              </div>
                                          )}
                                      </div>
                                      <div className="score-container">
                                          {scores.map((score, i) => (
                    <div className='score-item' key={i}>
                      <Tooltip 
                        text={app.scoreDescriptions[i]}
                        content=
                        {score === 9999999 ?
                          <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                          :
                          score === 0 ? '...' : score
                        }
                      />
                    </div>
                  ))}
                                      </div>
                                  </div>

                                  {showDetail && (
                                      <DetailModal
                                          listing={detailData}
                                          key={detailData._id}
                                          setShowDetail={setShowDetail}
                                      />
                                  )}
                              </>
                          )
                      })
                : null}
        </div>
    )
})
