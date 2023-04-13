import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import MakeOfferModal from './MakeOfferModal'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import './detailModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  listing: {
    _id: string;
    section: string;
    title: string;
    amount: string;
    amountType: string;
    description: string;
    score1: string;
    score2: string;
    score3: string;
    score4: string;
    responderId: string;
    offerAmount: string;
    rScore1: string;
    rScore2: string;
    rScore3: string;
    rScore4: string;
  };
  setShowDetail: (value: boolean) => void;
}

export default observer(({ listing, setShowDetail }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)
  const [showMakeOffer, setShowMakeOffer] = React.useState<boolean>(false)
  const [dealIsActive, setDealIsActive] = React.useState<boolean>(false)

  return (
    <div className='dark-bg'>
      <div className='centered'>
        <div className='modal'>
          <div className='detail-content'>
            
            <div className='action-bar'>
              <div className='action-item'>
                {user.hasSignedUp ? (
                  <>
                    <button onClick={()=> setShowMakeOffer(true)}>make an offer</button>
                      {showMakeOffer && <MakeOfferModal listingId={listing._id} section={listing.section} setShowMakeOffer={setShowMakeOffer}/>}
                  </>
                ) : (
                  <button style={{cursor: 'not-allowed'}}>make an offer</button>
                )}
              </div>
              <div className='action-item'>
                <div>⭐️</div>
                <div>favorite</div>
              </div>
              <div className='action-item'>
                <div>🚫</div>
                <div>hide</div>
              </div>
              <div className='action-item'>
                <div>🚩</div>
                <div>flag</div>
              </div>
              <div className='action-item'>
                <div>📤</div>
                <div>share</div>
              </div>
            </div>

            <div style={{display: 'flex'}}>
              <div className='detail-container'>
                <div className='detail-title'>{listing.title} - ${listing.amount} / {listing.amountType}</div>
                <div>{listing.description}</div>
              </div>
              <div className='trust-container'>
                <div className='trust-item'>
                  <div>Score 1: </div>
                  <div style={{fontWeight: '600'}}>{listing.score1}</div>
                  <Tooltip text='explain what this score represents'/>
                </div>
                <div className='trust-item'>
                  <div>Score 2: </div>
                  <div style={{fontWeight: '600'}}>{listing.score2}</div>
                  <Tooltip text='explain what this score represents'/>
                </div>
                <div className='trust-item'>
                  <div>Score 3: </div>
                  <div style={{fontWeight: '600'}}>{listing.score3}</div>
                  <Tooltip text='explain what this score represents'/>
                </div>
                <div className='trust-item'>
                  <div>Score 4: </div>
                  <div style={{fontWeight: '600'}}>{listing.score4}</div>
                  <Tooltip text='explain what this score represents'/>
                </div>
              </div>  
            </div>

            <div className='offers-container'>
              <div style={{color: 'blue'}}>pending offers</div>
              <div className='offer-scroll'>
                  {listing.responderId ? 
                    <div>
                      ${listing.offerAmount} - member: {listing.responderId.slice(0, 30)}... - scores: {listing.rScore1} / {listing.rScore2} / {listing.rScore3} / {listing.rScore4} 
                      <Link to={`deal/${listing._id}`}>
                        <button 
                          className='accept' 
                          onClick={() => {
                            app.updateDeal(listing._id, 'open')
                            setDealIsActive(true)
                          }}
                        >
                          accept deal
                        </button>
                      </Link>
                      {dealIsActive ? 
                        <>
                          <hr/>
                          <div style={{color: 'red'}}>your deal is now active!</div>
                          <div>use your dashboard to submit your attestation before the end of this epoch</div>
                          {/* <button className='close-btn' onClick={() => setDealMessageIsOpen(false)}>X</button> */}
                        </> : null}

                    </div>
                    : 'no offers yet' }
              </div>
            </div>
            
            <button className='close-btn' onClick={() => setShowDetail(false)}>X</button>
          </div>
        </div>
      </div>
    </div>
  )
})