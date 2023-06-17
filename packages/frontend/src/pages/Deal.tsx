import React from 'react'
import { useParams, useNavigate, Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
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
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [dealComplete, setdealComplete] = React.useState(false)
  const [sentiment, setSentiment] = React.useState(3)
  const [dealAgain, setDealAgain] = React.useState(1)
  const [reqData1, setReqData1] = React.useState<{
    [key: number]: number | string
  }>({})
  const [reqData2, setReqData2] = React.useState<{
    [key: number]: number | string
  }>({})
  const [reqInfo, setReqInfo] = React.useState<ReqInfo>({ nonce: 0 })
  const sentiments = ['hard no', 'not really', 'whatever idc', 'mostly', 'yeah def']

  React.useEffect(() => {
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
      {deal ? 
        <>
          <div style={{textAlign: 'center'}}>
            <h3>{deal.title}</h3>
            <h3>${deal.offerAmount}</h3>
            <div className='deal-info'>
              <div>
                <div>member 1: {deal.posterId.slice(0,6)}...</div>
                {memberKeys.includes(deal.posterId) ? (
                  <input 
                    type='checkbox'
                    id='complete1'
                    name='complete1'
                    className='checked'
                    onClick={async () => {
                      // won't need transition, but will error if deal's epoch has expired
                      if (
                        user.userState &&
                        user.userState.sync.calcCurrentEpoch() !==
                          (await user.userState.latestTransitionedEpoch())
                      ) {
                          throw new Error('Needs transition')
                      }
                      await user.requestReputation(
                        {[0]:'00000001', [1]:'10000000'},
                        reqInfo.nonce ?? 0
                      )
                      app.dealClose(deal._id, 'poster')
                    }}
                  />
                ) : (
                  <input 
                    type='checkbox'
                    id='complete1'
                    name='complete1'
                    style={{cursor: 'not-allowed'}}
                    onClick={(e) => e.preventDefault()}
                  />
                )}
                <label htmlFor='complete1'>mark deal as complete</label>
              </div>
              <div>
                <div>member 2: {deal.responderId.slice(0,6)}...</div>
                {memberKeys.includes(deal.responderId) ? (
                  <input
                    type='checkbox'
                    id='complete2'
                    name='complete2'
                    className='checked'
                    onClick={async () => {
                      if (
                        user.userState &&
                        user.userState.sync.calcCurrentEpoch() !==
                          (await user.userState.latestTransitionedEpoch())
                      ) {
                          throw new Error('Needs transition')
                      }
                      await user.requestReputation(
                        {[1]:'10000000'},
                        reqInfo.nonce ?? 0
                      )
                      app.dealClose(deal._id, 'responder')
                    }}
                  />
                ) : (
                  <input 
                    style={{cursor: 'not-allowed'}}
                    type='checkbox'
                    id='complete2'
                    name='complete2'
                    // onClick={(e) => e.preventDefault()}
                  />
                )}
                <label htmlFor='complete2'>mark deal as complete</label>
              </div>
            </div>
          </div>
      
          {deal.posterDealClosed && deal.responderDealClosed ? (
            <div className='attestation-container'>
              <div className="attestation-form">
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
                      // style={{backgroundColor: 'blue', color: 'white'}}
                      onClick={async () => {
                        if (
                            user.userState &&
                            user.userState.sync.calcCurrentEpoch() !==
                                (await user.userState.latestTransitionedEpoch())
                        ) {
                            throw new Error('Needs transition')
                        }
                        const index2 = 10000000 + dealAgain
                        const index3 = 10000000 + sentiment
                        await user.requestReputation(
                            {[1]:'00000001', [2]:index2, [3]:index3},
                            memberKeys.indexOf(deal.posterId) ?? 0
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
                      // style={{backgroundColor: 'blue', color: 'white'}}
                      onClick={async () => {
                          if (
                              user.userState &&
                              user.userState.sync.calcCurrentEpoch() !==
                                  (await user.userState.latestTransitionedEpoch())
                          ) {
                              throw new Error('Needs transition')
                          }
                          const index2 = 10000000 + dealAgain
                          const index3 = 10000000 + sentiment
                          await user.requestReputation(
                              {[1]:'00000001', [2]:index2, [3]:index3},
                              memberKeys.indexOf(deal.responderId) ?? 0
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