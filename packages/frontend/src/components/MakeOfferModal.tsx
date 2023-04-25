import React from 'react'
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import './makeOfferModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  listingId: string;
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

export default observer(({ listingId, setShowMakeOffer }: Props) => {
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
  const [responderId, setResponderId] = React.useState('')
  const [rScore1, setRScore1] = React.useState('')
  const [rScore2, setRScore2] = React.useState('')
  const [rScore3, setRScore3] = React.useState('')
  const [rScore4, setRScore4] = React.useState('')

  if (!user.userState) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className='dark-bg'>
      <div className='centered'>
        <div className='nested'>
          <form>
            <div className='offer-content'>
              {/* <div>{listingId}</div> */}
              <div className='offer-container'>
                    <div className=''>
                        <label htmlFor='offerAmount' style={{fontSize: '1rem', fontWeight: '600'}}>amount: $</label>
                        <input 
                          type='text' 
                          id='offerAmount' 
                          name='offerAmount' 
                          onChange={(e) => setOfferAmount(e.target.value)}
                          className='offer-input'
                        />
                    </div>

                    {Array(
                      user.userState.sync.settings.sumFieldCount
                    )
                      .fill(0)
                      .map((_, i) => {
                          return (
                              <div key={i}>
                                  <label htmlFor={`score${i +1}`}>reveal Score {i + 1}</label>
                                  <input
                                      // style={{width: '6rem'}}
                                      className='offer-input'
                                      type='text'
                                      id={`score${i + 1}`}
                                      name={`score${i + 1}`}
                                      value={proveData[i] ?? '0'}
                                      onChange={(event) => {
                                          if (
                                              !/^\d*$/.test(
                                                  event.target.value
                                              )
                                          )
                                              return
                                          setProveData(() => ({
                                              ...proveData,
                                              [i]: event.target.value,
                                          }))
                                          if (i === 0) {setRScore1(event.target.value)}
                                          if (i === 1) {setRScore2(event.target.value)}
                                          if (i === 2) {setRScore3(event.target.value)}
                                          if (i === 3) {setRScore4(event.target.value)}
                                      }}
                                  />
                              </div>
                          )
                      })}                  
              </div>

              <div className='offer-buttons'>
                  <div>
                    <div style={{display: 'flex'}}>
                        <select
                            value={reqInfo.nonce ?? 0}
                            onChange={(event) => {
                                setReqInfo((v) => ({
                                    ...v,
                                    nonce: Number(event.target.value),
                                }))
                                setResponderId(user.epochKey(reqInfo.nonce ?? 0))
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
                        <p
                            style={{
                                maxWidth: '180px',
                                wordBreak: 'break-all',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {/* {user.epochKey(reqInfo.nonce ?? 0)} */}
                            {responderId}
                        </p>
                  </div>

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
                {repProof.proof.length ? (
                  <>
                    {repProof.valid ? '✅' : '❌'}
                  </>
                ) : null}
                {repProof.valid ? (
                  <input 
                    style={{marginTop: '1rem'}}
                    type='submit'
                    value='submit offer'
                    onClick={() => {
                      const epoch = user.userState?.sync.calcCurrentEpoch()
                      app.submitOffer(epoch, listingId, responderId, offerAmount, rScore1, rScore2, rScore3, rScore4)
                    }}
                  />
                ) : (
                    <button style={{marginTop: '1rem'}} className='blocked'>submit offer</button>
                )}
              </div>
              
              {/* <div className='offer-buttons'>
                  <Button>prove trust scores</Button>
                  <button 
                    style={{marginTop: '1rem'}}
                    type='submit'
                    onClick={() => app.submitOffer(listingId, section, responderId, offerAmount, score1, score2, score3, score4)}
                  >
                    submit offer
                  </button>
              </div> */}
            </div>

                
          <button className='close-btn' onClick={() => setShowMakeOffer(false)}>X</button>
          </form>
        </div>
      </div>
    </div>
  )
  })