import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import {  trustScores } from '@/data'
import { EyeOff } from 'lucide-react'
// import MakeOfferModal from './MakeOfferModal'
import Tooltip from '../components/Tooltip'
import Button from './Button'
import './detailModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'
import Interface from '../contexts/interface'

type Props = {
  listing: {
    _id: string
    epoch: number | undefined
    section: string
    title: string
    amount: string
    amountType: string
    description: string
    posterId: string
    scoreString: string
    offerAmount: string
    responderId: string
    dealOpened: boolean
    posterDealClosed: boolean
    responderDealClosed: boolean
  }
  setShowDetail: (value: boolean) => void
}

type Offer = {
  _id: string
  offerAmount: string
  responderId: string
  scoreString: string
}

export default observer(({ listing, setShowDetail }: Props) => {
  const app = useContext(Trustlist)
  const user = useContext(User)
  const ui = useContext(Interface)
  const navigate = useNavigate()
  const [showMakeOffer, setShowMakeOffer] = useState<boolean>(false)
  const trustScoreInfo = { ...trustScores }; 

  useEffect(() => {
    const loadData = async () => {
      await app.loadOffers(listing._id)
    }
    loadData()
  }, [])
  const offers = app.offersByListingId.get(listing._id)
  const memberKeys = [user.epochKey(0), user.epochKey(1)]
  const posterScores = JSON.parse(listing.scoreString)

  return (
    <div className="dark-bg">
      <div className="centered">
        <div className="modal">
          <div className="detail-content">
            {user.hasSignedUp &&
            // prevent user from making an offer on their own post
            // !memberKeys.includes(listing.posterId) &&
            // prevent new offers if one has already been accepted
            !listing.dealOpened  ? (
            // prevent new offers if listing epoch is expired
            // listing.epoch ===
            //     user.userState?.sync.calcCurrentEpoch() ? (
              <>
                <button 
                  className='font-extrabold text-base text-blue-700 border-1 border-blue px-3 py-2 mb-4'
                  onClick={() => {
                    setShowDetail(false)
                    navigate(`/offers/${listing._id}/${listing.title}`)
                  }}
                >
                  MAKE OFFER
                </button>
                {/* {showMakeOffer && <MakeOfferModal listingId={listing._id} listingTitle={listing.title} setShowMakeOffer={setShowMakeOffer}/>} */}
              </>
            ) : null}
            {memberKeys.includes(listing.posterId) ? 
                <button className='font-extrabold text-base text-red-500 border-1 border-red-500 px-3 py-2 mb-4'>MY LISTING</button>
            : null}
            {listing.epoch != user.userState?.sync.calcCurrentEpoch() ?
                <button className='font-extrabold text-base text-red-500 border-1 border-red-500 px-3 py-2 mb-4'>EXPIRED</button>
            : null}

            <div className="detail-container">
              <div className="listing-detail">
                <div className="detail-title">
                  <div>{listing.title.slice(0, 60)}</div>
                  <div>${listing.amount} / {listing.amountType}</div>
                </div>
                <div className="detail-description">{listing.description}</div>
              </div>

              <div className='pt-6'>
                {Object.entries(trustScoreInfo).map(([key, scoreInfo]) => (
                  <div className="detail-score">
                    <div className="detail-tooltip">
                      <Tooltip
                        text={`${scoreInfo.title} : ${scoreInfo.description}`}
                        content={
                          <img
                            src={require('../../public/info_icon.svg')}
                            alt="info icon"
                          />
                        }
                      />
                    </div>
                    <div className="trust-item">
                      <div>
                        {key} score:{' '}
                      </div>
                      <div style={{ fontWeight: '600' }}>
                        {posterScores[key] === 'X' ?
                          <EyeOff/>
                        : 
                          <div>{posterScores[key]}{posterScores[key]==='n/a' ? null : '%'}
                        </div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="offers-container">
              {listing.dealOpened ? 
                <div style={{ display: 'flex' }}>
                  <div style={{ textDecoration: 'line-through' }}>pending offers</div>
                  {listing.posterDealClosed && listing.responderDealClosed ?
                    <div style={{ display: 'flex' }}>
                      <div style={{ color: 'red', paddingLeft: '1rem' }}>deal completed</div>
                    </div>
                  :
                    <div style={{ color: 'green', paddingLeft: '1rem' }} >deal pending </div>
                  }
                </div>
              : 
                <div style={{ color: 'blue' }}>pending offers </div>
              }

              <div className="offer-scroll">
                {offers && offers.length > 0
                  ? offers.map((offer: Offer) => {
                    const rScores = JSON.parse( offer.scoreString)
                    const responderScores = app.calcScoresFromDB(rScores)
                    return (
                      <div key={offer._id} className="offer">
                        <div>
                          <span style={{ color: 'blue' }}>${offer.offerAmount}{' '}</span>{' '}
                          {!ui.isMobile ? 
                            <span> ---- offering member's scores:{' '}</span>
                          : null}
                        </div>
                        {responderScores.map((score, i) => (
                          <div className="offer-score">
                            <span style={{ fontWeight: '300' }}>{app.scoreNames[i]}:{' '}</span>
                            {score === 9999999 ? 
                              <EyeOff/>
                            : score === 0 ? '...' : (String(score))}
                          </div>
                        ))}

                        {listing.responderId === offer.responderId ? 
                          <button className="offer-accepted">accepted</button>
                        : memberKeys.includes(listing.posterId) && !listing.dealOpened
                          ? <Button
                              style={{ backgroundColor: 'blue', color: 'white', fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginLeft: '0.5rem' }}
                              onClick={async () => {
                                // +1 to offering member's expected LO score
                                await user.requestData(
                                  {[1]: 1 << 23},
                                  memberKeys.indexOf(listing.posterId) ?? 0,
                                  offer.responderId
                                )
                                const message = await app.dealOpen(listing._id, offer.offerAmount, offer.responderId)
                                window.alert(message)
                                navigate(`/deal/${listing._id}`)
                              }}
                            >
                              accept deal
                            </Button>
                          : null}
                      </div>
                    )
                  })
                : 'no offers yet'}
              </div>
            </div>

            <button className="close-btn" onClick={() => setShowDetail(false)}>X</button>
          </div>
        </div>
      </div>
    </div>
  )
})
