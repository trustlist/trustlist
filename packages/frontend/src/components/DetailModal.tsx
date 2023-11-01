import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import {  TrustScoreKeyEnum, trustScores } from '@/data'
import { EyeOff } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import MakeOfferModal from './MakeOfferModal'
import Tooltip from '../components/Tooltip'
import Button from './Button'
import './detailModal.css'
import useTrustlist from "@/hooks/useTrustlist"
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
  const { calcScoreFromUserData, openDeal } = useTrustlist()
  const user = useContext(User)
  const ui = useContext(Interface)
  const navigate = useNavigate()
  // const [showMakeOffer, setShowMakeOffer] = useState<boolean>(false)
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
  const trustScoreKeys = Object.keys(TrustScoreKeyEnum) as (keyof typeof TrustScoreKeyEnum)[]

  const acceptOfferAlert = (newData: any) => toast.promise(async () => {
      await openDeal(newData)
      // + 1 to responder's initiated LO score
      await user.requestData({[1]: 1 << 23}, memberKeys.indexOf(listing.posterId), newData.responderId)
    }, {
    pending: "Please wait a moment while your deal is created...",
    success: { render: 
                <div className="flex space-around gap-3">
                  <div>
                    <div>Offer accepted! Your contact info will be shown to this member to enable your offline transaction.</div>
                    <div>Please complete your deal during this epoch to build your reputation.</div>
                  </div>
                  <button className="text-white font-lg border-1 border-white px-4 py-2"
                          onClick={() => navigate(`/deal/${listing._id}`)}>
                    Deal
                  </button>
                </div>,
              closeButton: false },
    error: "There was a problem creating your deal, please try again"
  });

  return (
    <div className="dark-bg">
      <div className="centered">
        <div className="modal">
          <div className="detail-content">
            {user.hasSignedUp &&
            // prevent user from making an offer on their own post
            // !memberKeys.includes(listing.posterId) &&
            // prevent new offers if one has already been accepted
            !listing.dealOpened &&
            // prevent new offers if listing epoch is expired
            listing.epoch ===
                user.userState?.sync.calcCurrentEpoch() ? (
              <>
                <button 
                  className='font-extrabold text-base border-1 border-blue px-3 py-2 mb-4'
                  style={{color: 'blue'}}
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
                {trustScoreKeys.map((key) => {
                  const matchingEntry = Object.entries(posterScores).filter(([scoreName]) => scoreName === key)[0]
                  const revealed = matchingEntry !== undefined;
                  const initiated = matchingEntry ? Number(matchingEntry[1]) >> 23 : 0
                  const value = revealed 
                    ? initiated === 0 
                      ? 'n/a' : calcScoreFromUserData(Number(matchingEntry[1]))
                    : <EyeOff size={22} strokeWidth={2}/>
                  return (
                    <div className="detail-score">
                      <div className="detail-tooltip">
                        <Tooltip
                          text={`${trustScoreInfo[key].title} : ${trustScoreInfo[key].description}`}
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
                          {value}
                        </div>
                      </div>
                    </div>
                  )  
                })}
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
                    const responderScores = JSON.parse( offer.scoreString)
                    return (
                      <div key={offer._id} className="offer">
                        <div className='flex items-center'>
                          <div className='offer-amount'>${offer.offerAmount}{' '}</div>
                          {!ui.isMobile ? 
                            <div>offering member's scores:{' '}</div>
                          : null}
                        </div>
                        {trustScoreKeys.map((key) => {
                          const matchingEntry = Object.entries(responderScores).filter(([scoreName]) => scoreName === key)[0]
                          const revealed = matchingEntry !== undefined;
                          const initiated = matchingEntry ? Number(matchingEntry[1]) >> 23 : 0
                          const value = revealed 
                            ? initiated === 0 
                              ? 'n/a' : calcScoreFromUserData(Number(matchingEntry[1]))
                            : <EyeOff size={12} strokeWidth={3}/>
                          return (
                            <div key={key} className="offer-score">
                              <div style={{ fontWeight: '300' }}>{key}:{' '}</div>
                                {value}
                            </div>
                          )
                        })}
              
                        {listing.responderId === offer.responderId ? 
                          <button className="offer-accepted">accepted</button>
                        : memberKeys.includes(listing.posterId) && !listing.dealOpened
                          ? <Button
                              style={{ backgroundColor: 'blue', color: 'white', fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginLeft: '1.5rem' }}
                              onClick={async () => {
                                try {
                                  const newData = {
                                    id: listing._id,
                                    responderId: offer.responderId,
                                    offerAmount: offer.offerAmount,
                                  }
                                console.log(newData)
                                acceptOfferAlert(newData)
                                } catch {
                                  console.error("Error while updating deal: ");
                                }
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

            <ToastContainer className='dash-toast' toastClassName='toast' bodyClassName='toast-body' position='top-center' autoClose={false} />
            <button className="close-btn" onClick={() => setShowDetail(false)}>X</button>

          </div>
        </div>
      </div>
    </div>
  )
})
