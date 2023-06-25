import { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from "react-router-dom";
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

  const [posterDealComplete, setposterDealComplete] = useState(false)
  const [responderDealComplete, setresponderDealComplete] = useState(false)
  const [posterSubmitted, setPosterSubmitted] = useState(false)
  const [responderSubmitted, setResponderSubmitted] = useState(false)
  const [sentiment, setSentiment] = useState(3)
  const [dealAgain, setDealAgain] = useState(1)
  const [reqDataPoster, setReqDataPoster] = useState<{
    [key: number]: number | string
  }>({})
  const [reqDataRepsponder, setReqDataResponder] = useState<{
    [key: number]: number | string
  }>({})
  const sentiments = ['hard no', 'not really', 'whatever idc', 'mostly', 'yeah def']

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
        <div>🚫 this deal has expired</div>
      : null}
      {/* {deal && posterSubmitted && responderSubmitted ?
        <div style={{color: 'red'}}>this deal has been completed and attested to</div>
      : null} */}
      {deal ? 
        <>
          <div style={{textAlign: 'center'}}>
            <h3>{deal.title}</h3>
            <h3>${deal.offerAmount}</h3>
            <div className='deal-info'>
              <div>  
                <div>poster id: {deal.posterId.slice(0,6)}...</div>
                {deal.posterDealClosed ?
                  <div className='checked'>✅</div>
                :
                  <div 
                    className='unchecked'
                    onClick={async () => {
                      if (memberKeys.includes(deal.posterId)) {
                        app.dealClose(deal._id, 'poster')
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
                      }
                    }}   
                  >
                    ?
                  </div>
                }
              </div>
              <div>  
                <div>responder id: {deal.responderId.slice(0,6)}...</div>
                {deal.responderDealClosed ?
                  <div className='checked'>✅</div>
                :
                  <div 
                    className='unchecked'
                    onClick={async () => {
                      if (memberKeys.includes(deal.responderId)) {
                        app.dealClose(deal._id, 'responder')
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
                            memberKeys.indexOf(deal.posterId) ?? 0,
                            deal.posterId
                          )
                        }
                      }
                    }}   
                  >
                    ?
                  </div>
                }
              </div>
            </div>
          </div>
      
          {deal.posterDealClosed && deal.responderDealClosed ? (
            <div className='attestation-container'>
              <ReviewForm member='poster' memberKeys={memberKeys} id={deal.posterId}/>
              <ReviewForm member='responder' memberKeys={memberKeys} id={deal.responderId}/>
              {/* <div className="attestation-form">
                <div className="icon">
                    <h2>member 1 review</h2>
                    <Tooltip 
                      text="Your review of your experience with this member will become part of their trustlist reputation. Neither member will receive reputational data for this deal unless both parties sumbit their review before the epoch expires." 
                      content={<img src={require('../../public/info_icon.svg')} alt="info icon"/>}
                    />
                </div>
                <p>The member I interacted with in this deal was respectful, friendly, and easy to communicate with.</p>
                <div className='sentiments'>
                  {sentiments.map((sentiment) => (
                      <div>
                        <input 
                          type='radio' 
                          id={sentiment} 
                          name='sentiment' 
                          value={sentiment}
                          onChange={(e) => setSentiment(sentiments.indexOf(e.target.value) + 1)}
                        />
                        <label htmlFor={sentiment}></label>{sentiment}<br/>
                      </div>
                  ))}
                </div>
                <p>I would</p>
                <div style={{paddingLeft: '2rem'}}>
                  <input
                    type='radio' 
                    id='gladly' 
                    name='again' 
                    value='gladly'
                    onChange={(e) => setDealAgain(1)}
                  />
                  <label htmlFor='gladly'>GLADLY</label><br/>
                  <input
                    type='radio' 
                    id='never' 
                    name='again' 
                    value='never'
                    onChange={(e) => setDealAgain(0)}
                  />
                  <label htmlFor='gladly'>NEVER</label>
                </div>
                <p style={{paddingLeft: '5rem'}}>deal with this member again</p>
                
                <div style={{padding: '1rem'}}>
                  {memberKeys.includes(deal.posterId) ? (
                    <Button
                      onClick={async () => {
                        if (
                            user.userState &&
                            user.userState.sync.calcCurrentEpoch() !==
                                (await user.userState.latestTransitionedEpoch())
                        ) {
                            throw new Error('Needs transition')
                        }
                        const index2 = 1 << 23 + dealAgain
                        const index3 = 1 << 23 + sentiment
                        await user.requestReputation(
                            {[1]:1},
                            memberKeys.indexOf(deal.posterId) ?? 0,
                            ''
                        )
                        await user.requestReputation(
                            {[2]:index2, [3]:index3},
                            memberKeys.indexOf(deal.posterId) ?? 0,
                            deal.responderId
                        )
                        navigate(`/`)
                      }}
                    >
                      Submit
                    </Button>
                  ) : <Button style={{cursor: 'not-allowed'}}>Submit</Button>
                  }
                  
                </div>
              </div>

              <div className="attestation-form">
                <div className="icon">
                    <h2>member 2 review</h2>
                    <Tooltip 
                      text="Your review of your experience with this member will become part of their trustlist reputation. Neither member will receive reputational data for this deal unless both parties sumbit their review before the epoch expires." 
                      content={<img src={require('../../public/info_icon.svg')} alt="info icon"/>}
                    />
                </div>
                <p>The member I interacted with in this deal was respectful, friendly, and easy to communicate with.</p>
                <div className='sentiments'>
                  {sentiments.map((sentiment) => (
                      <div>
                        <input 
                          type='radio' 
                          id={sentiment} 
                          name='sentiment' 
                          value={sentiment}
                          onChange={(e) => setSentiment(sentiments.indexOf(e.target.value) + 1)}
                        />
                        <label htmlFor={sentiment}></label>{sentiment}<br/>
                      </div>
                  ))}
                </div>
                <p>I would</p>
                <div style={{paddingLeft: '2rem'}}>
                  <input
                    type='radio' 
                    id='gladly' 
                    name='again' 
                    value='gladly'
                    onChange={(e) => setDealAgain(1)}
                  />
                  <label htmlFor='gladly'>GLADLY</label><br/>
                  <input
                    type='radio' 
                    id='never' 
                    name='again' 
                    value='never'
                    onChange={(e) => setDealAgain(0)}
                  />
                  <label htmlFor='gladly'>NEVER</label>
                </div>
                <p style={{paddingLeft: '5rem'}}>deal with this member again</p>
                
                <div style={{padding: '1rem'}}>
                  {memberKeys.includes(deal.responderId) ? (
                    <Button
                      onClick={async () => {
                          if (
                              user.userState &&
                              user.userState.sync.calcCurrentEpoch() !==
                                  (await user.userState.latestTransitionedEpoch())
                          ) {
                              throw new Error('Needs transition')
                          }
                          const index2 = 1 << 23 + dealAgain
                          const index3 = 1 << 23 + sentiment
                          await user.requestReputation(
                              {[1]:1},
                              memberKeys.indexOf(deal.responderId) ?? 0,
                              ''
                          )
                          await user.requestReputation(
                              {[2]:index2, [3]:index3},
                              memberKeys.indexOf(deal.responderId) ?? 0,
                              deal.posterId
                          )
                          navigate(`/`)
                      }}
                    >
                        Submit
                    </Button>
                  ) : <Button style={{cursor: 'not-allowed'}}>Submit</Button>
                  }
                </div>
              </div> */}
            </div>
          ) : (
            <div style={{color: 'black', textAlign: 'center', paddingTop: '4rem'}}>
              both members must mark deal complete to enable attestations
            </div>
          )}  
        </>
      : 'deal not found' }         
    </div>
  )
})