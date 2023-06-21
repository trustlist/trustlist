import React from 'react'
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import './makeOfferModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  listingId: string;
  listingTitle: string
  setShowMakeOffer: (value: boolean) => void;
}

type ReqInfo = {
  nonce: number
}

type ProofInfo = {
  publicSignals: string[]
  proof: string[]
  valid: boolean
}

export default observer(({ listingId, listingTitle, setShowMakeOffer }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [reqInfo, setReqInfo] = React.useState<ReqInfo>({ nonce: 0 })
  const [proveData, setProveData] = React.useState<{
    [key: number]: number | string
  }>({})
  const [repProof, setRepProof] = React.useState<ProofInfo>({
      publicSignals: [],
      proof: [],
      valid: false,
  })
  const [offerAmount, setOfferAmount] = React.useState('')
  const scoreNames = ['LP', 'CB', 'TD', 'GV']
  const [rScores, setRScores] = React.useState<{
    [key: number]: number | string
  }>({})

  if (!user.userState) {
    return <div className="container">Loading...</div>
  }
  return (
    <div className='dark-bg'>
      <div className='centered'>
        <div className='nested'>
          <form>
            <div className='offer-content'>
              <div className='offer-container'>
                <div className=''>
                  <label htmlFor='offerAmount' style={{fontSize: '1rem', fontWeight: '600', paddingLeft: '1.2rem'}}>amount: $</label>
                  <input 
                    type='text' 
                    id='offerAmount' 
                    name='offerAmount' 
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className='offer-input'
                  />
                </div>

                <div className='score-grid'>
                  {scoreNames.map((name, i) => {
                    const score = String(user.provableData[i])
                    return (
                      <div key={name} className='reveal-container'>
                        { i === 3 ?
                                <div className='score-name'>{name} Score: {app.calcScore(score, true)}%</div>
                              :
                                <div className='score-name'>{name} Score: {app.calcScore(score, false)}%</div>
                              }
                        <div className='icon-container'>
                              <div
                                className='choose reveal'
                                onClick={()=> {
                                  setRScores(() => ({
                                    ...rScores,
                                    [i]: score,
                                  }))
                                  setProveData(() => ({
                                    ...proveData,
                                    [i]: score,
                                  }))
                                }}
                              >
                                <img src={require('../../public/eye_open.svg')} alt="radio waves"/>
                              </div>
                              <div
                                className='choose hide'
                                onClick={()=> {
                                  setRScores(() => ({
                                    ...rScores,
                                    [i]: 'X',
                                  }))
                                }}
                              >
                                <img src={require('../../public/eye_closed.svg')} alt="eye with slash"/>
                              </div>
                          </div> 
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className='offer-buttons'>
                <div style={{display: 'flex'}}>
                  <select
                      value={reqInfo.nonce ?? 0}
                      onChange={(event) => {
                          setReqInfo((v) => ({
                              ...v,
                              nonce: Number(event.target.value),
                          }))
                      }}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                    <p style={{ fontSize: '12px' }}>
                        submit offer with epoch key:
                    </p>
                </div>
                <p className='epoch-key'>{user.epochKey(reqInfo.nonce ?? 0)}</p>
                <div style={{display: 'flex'}}>
                  {repProof.proof.length ? (
                    <div className='proof'>
                      {repProof.valid ? '✅' : '❌'}
                    </div>
                  ) : null}            
                  <Button
                    onClick={async () => {
                      const proof = await user.proveData(
                          proveData
                      )
                      setRepProof(proof)
                    }}
                  >
                    prove trust scores
                  </Button>
                </div>
                {repProof.valid ? (
                  <input 
                    style={{marginTop: '0.5rem'}}
                    type='submit'
                    value='SUBMIT OFFER'
                    onClick={() => {
                      const epoch = user.userState?.sync.calcCurrentEpoch()
                      const responderId = user.epochKey(reqInfo.nonce ?? 0)
                      const scoreString = JSON.stringify(rScores)
                      app.submitOffer(epoch, listingId, listingTitle, responderId, offerAmount, scoreString)
                    }}
                  />
                ) : (
                  <button style={{marginTop: '0.5rem'}} className='blocked'>SUBMIT OFFER</button>
                )}
              </div>

            </div>       
          <button className='close-btn' onClick={() => setShowMakeOffer(false)}>X</button>
          </form>
        </div>
      </div>
    </div>
  )
})