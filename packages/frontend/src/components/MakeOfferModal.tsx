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
  const [rScore1, setRScore1] = React.useState('')
  const [rScore2, setRScore2] = React.useState('')
  const [rScore3, setRScore3] = React.useState('')
  const [rScore4, setRScore4] = React.useState('')
  const scoreNames = ['LP', 'CB', 'TD', 'GV']


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

                    {Array(
                    user.userState.sync.settings.sumFieldCount
                    )
                      .fill(0)
                      .map((_, i) => {
                        const score = user.provableData[i]
                        return (
                            <div key={i} className=''style={{display: 'flex', justifyContent: 'space-around'}}>
                              { i === 3 ?
                                <div className=''>{scoreNames[i]} Score: {app.calcScore(String(score), true)}%</div>
                              :
                                <div className=''>{scoreNames[i]} Score: {app.calcScore(String(score), false)}%</div>
                              }
                              {/* <div style={{display: 'flex', justifyContent: 'space-around'}}> */}
                                {/* <div> */}
                                  <div
                                    style={{cursor: 'pointer'}}
                                    onClick={()=> {
                                      if (i === 0) {
                                        setRScore1(String(score))
                                      } else if (i === 1) {
                                        setRScore2(String(score))
                                      } else if (i === 2) {
                                        setRScore3(String(score))
                                      } else {
                                        setRScore4(String(score))
                                      }
                                      console.log(String(score))
                                      setProveData(() => ({
                                        ...proveData,
                                        [0]: Number(score),
                                      }))
                                      console.log(Number(score))
                                    }}
                                  >
                                    <img src={require('../../public/starshine.svg')} alt="radio waves"/>
                                  </div>
                                  <div>reveal</div>
                                {/* </div> */}
                                {/* <div> */}
                                  <div
                                    style={{cursor: 'pointer'}}
                                    onClick={()=> {
                                      if (i === 0) {
                                        setRScore1('X')
                                      } else if (i === 1) {
                                        setRScore2('X')
                                      } else if (i === 2) {
                                        setRScore3('X')
                                      } else {
                                        setRScore4('X')
                                      }
                                    }}
                                  >
                                    <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                                  </div>
                                  <div>hide</div>
                                {/* </div> */}
                              {/* </div> */}
                            </div>
                        )
                      })
                    }

                    {/* {Array(
                      user.userState.sync.settings.sumFieldCount
                    )
                      .fill(0)
                      .map((_, i) => {
                          return (
                              <div key={i}>
                                  {i === 0 ? <label htmlFor={`score${i +1}`}>reveal LP score: </label> : null}
                                  {i === 1 ? <label htmlFor={`score${i +1}`}>reveal CB score: </label> : null}
                                  {i === 2 ? <label htmlFor={`score${i +1}`}>reveal TD score: </label> : null}
                                  {i === 3 ? <label htmlFor={`score${i +1}`}>reveal GV score: </label> : null}
                                  <input
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
                      })}                   */}
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
                <p
                  style={{
                      maxWidth: '180px',
                      wordBreak: 'break-all',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                  }}
                >
                  {user.epochKey(reqInfo.nonce ?? 0)}
                </p>
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
                      console.log(responderId)
                      app.submitOffer(epoch, listingId, listingTitle, responderId, offerAmount, rScore1, rScore2, rScore3, rScore4)
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