import React from 'react'
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import './makeOfferModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  listingId: string;
  section: string;
  setShowMakeOffer: (value: boolean) => void;
}

type ProofInfo = {
  publicSignals: string[]
  proof: string[]
  valid: boolean
}

export default observer(({ listingId, section, setShowMakeOffer }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [proveData, setProveData] = React.useState<{
    [key: number]: number | string
  }>({})
  const [repProof, setRepProof] = React.useState<ProofInfo>({
      publicSignals: [],
      proof: [],
      valid: false,
  })
  const [offerAmount, setOfferAmount] = React.useState('')
  const [score1, setScore1] = React.useState('')
  const [score2, setScore2] = React.useState('')
  const [score3, setScore3] = React.useState('')
  const [score4, setScore4] = React.useState('')
  const responderId = '12345'

  if (!user.userState) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className='dark-bg'>
      <div className='centered'>
        <div className='nested'>
          {/* <form> */}
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
                                          if (i === 0) {setScore1(event.target.value)}
                                          if (i === 1) {setScore2(event.target.value)}
                                          if (i === 2) {setScore3(event.target.value)}
                                          if (i === 3) {setScore4(event.target.value)}
                                      }}
                                  />
                              </div>
                          )
                      })}

                    {/* <div>
                        <label htmlFor='score1'>reveal score1</label>
                        <input 
                          type='text' 
                          id='score1' 
                          name='score1' 
                          onChange={(e) => setScore1(e.target.value)}
                          className='offer-input'
                        />
                     </div>
                     <div>   
                        <label htmlFor='score2'>reveal score2</label>
                        <input 
                          type='text' 
                          id='score2' 
                          name='score2' 
                          onChange={(e) => setScore2(e.target.value)}
                          className='offer-input'
                        />
                     </div>
                     <div>   
                        <label htmlFor='score3'>reveal score3</label>
                        <input 
                          type='text' 
                          id='score3' 
                          name='score3' 
                          onChange={(e) => setScore3(e.target.value)}
                          className='offer-input'
                        />
                     </div>
                     <div>
                        <label htmlFor='score4'>reveal score4</label>
                        <input 
                          type='text' 
                          id='score4' 
                          name='score4' 
                          onChange={(e) => setScore4(e.target.value)}
                          className='offer-input'
                        />
                      </div> */}
              </div>

              <div className='offer-buttons'>
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
                    onClick={() => app.submitOffer(listingId, section, responderId, offerAmount, score1, score2, score3, score4)}
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
          {/* </form> */}
        </div>
      </div>
    </div>
  )
  })