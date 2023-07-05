import { useContext, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import ReviewForm from '../components/ReviewForm';
import Button from '../components/Button'
import Tooltip from '../components/Tooltip';
import './deal.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User'

type ReqInfo = {
  nonce: number
}

export default observer(() => {

  const { id }: any = useParams()
  const navigate = useNavigate()
  const app = useContext(Trustlist)
  const user = useContext(User)

  useEffect(() => {
    const loadData = async () => {
      await app.loadDealById(id)
    }
    loadData()
  }, [])

  const deal = app.listingsById.get(id)
  const memberKeys = [user.epochKey(0), user.epochKey(1), user.epochKey(2)]

  if (!user.userState) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className='deal-content'>
      {deal && (deal.epoch !== user.userState?.sync.calcCurrentEpoch()) ?
        <div style={{textAlign: 'center'}}>🚫 this deal has expired</div>
      : null}
      {deal ? 
        <>
          <div className='deal-info'>
            <div className='member-info'>  
              <div>poster id: {deal.posterId.slice(0,6)}...</div>
              {deal.posterDealClosed ?
                <>
                  <div className='checked'>✅</div>
                  <div>deal complete</div>
                </>
              :
                <>
                <div 
                  className='unchecked'
                  onClick={async () => {
                    if (memberKeys.includes(deal.posterId)) {
                      await app.dealClose(deal._id, 'poster')
                      if (deal.responderDealClosed) {
                        // +1 to responder's expected CB score
                        await user.requestReputation(
                          {[1]:1 << 23},
                          memberKeys.indexOf(deal.posterId) ?? 0,
                          deal.responderId
                        )
                        // +1 to poster's completed LP score
                        // +1 to poster's expected CB score
                        await user.requestReputation(
                          {[0]:1, [1]:1 << 23},
                          memberKeys.indexOf(deal.posterId) ?? 0,
                          ''
                        )
                      }
                      window.location.reload()
                    }
                  }}   
                >
                  <Tooltip 
                    text='only the posting member can check'
                    content='☑️'
                  />
                </div>
                <div>deal pending</div>
                </>
              }
            </div>

            <div>
              <h3>{deal.title}</h3>
              <h3>${deal.offerAmount}</h3>
            </div>

            <div className='member-info'>  
              <div>responder id: {deal.responderId.slice(0,6)}...</div>
              {deal.responderDealClosed ?
                <>
                  <div className='checked'>✅</div>
                  <div>deal complete</div>
                </>
              :
                <>
                <div 
                  className='unchecked'
                  onClick={async () => {
                    if (memberKeys.includes(deal.responderId)) {
                      await app.dealClose(deal._id, 'responder')
                      if (deal.posterDealClosed) {
                        // +1 to responder's expected CB score
                        await user.requestReputation(
                          {[1]:1 << 23},
                          memberKeys.indexOf(deal.responderId) ?? 0,
                          ''
                        )
                        // +1 to poster's completed LP score
                        // +1 to poster's expected CB score
                        await user.requestReputation(
                          {[0]:1, [1]:1 << 23},
                          memberKeys.indexOf(deal.responderId) ?? 0,
                          deal.posterId
                        )
                      }
                      window.location.reload()
                    } 
                  }}   
                >
                  <Tooltip 
                    text='only the responding member can check'
                    content='☑️'
                  />
                </div>
                <div>deal pending</div>
                </>
              }
            </div>
          </div>
      
          {deal.posterDealClosed && deal.responderDealClosed ? (
            <div className='attestation-container'>
              <ReviewForm 
                key={deal.posterId}
                dealId={deal._id}
                member='poster' 
                memberKeys={memberKeys} 
                currentMemberId={deal.posterId} 
                oppositeMemberId={deal.responderId}
                currentMemberReview={deal.posterReview}
                oppositeMemberReview={deal.responderReview}
              />
              <ReviewForm 
                key={deal.responderId}
                dealId={deal._id}
                member='responder' 
                memberKeys={memberKeys} 
                currentMemberId={deal.responderId} 
                oppositeMemberId={deal.posterId}
                currentMemberReview={deal.responderReview}
                oppositeMemberReview={deal.posterReview}
              />
            </div>
          ) : (
            <div style={{color: 'black', textAlign: 'center', paddingTop: '2rem'}}>
              both members must mark deal complete to enable reviews
            </div>
          )}  
        </>
      : 'deal not found' }         
    </div>
  )
})