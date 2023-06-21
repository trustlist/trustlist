import { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Button from './Button'
import './newListingModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  setShowNewListing: (value: boolean) => void;
}

type ReqInfo = {
  nonce: number
}

type ProofInfo = {
  publicSignals: string[]
  proof: string[]
  valid: boolean
}

export default observer(({ setShowNewListing }: Props) => {
  const app = useContext(Trustlist)
  const user = useContext(User)
  const [reqInfo, setReqInfo] = useState<ReqInfo>({ nonce: 0 })
  const [proveData, setProveData] = useState<{
    [key: number]: number | string
  }>({})
  const [repProof, setRepProof] = useState<ProofInfo>({
      publicSignals: [],
      proof: [],
      valid: false,
  })
  const [section, setSection] = useState('for sale')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [amountType, setAmountType] = useState('one time')
  const [description, setDescription] = useState('')
  const [pScore1, setPScore1] = useState('')
  const [pScore2, setPScore2] = useState('')
  const [pScore3, setPScore3] = useState('')
  const [pScore4, setPScore4] = useState('')
  const scoreNames = ['LP', 'CB', 'TD', 'GV']
  const [pScores, setPScores] = useState<{
    [key: number]: number | string
  }>({})

  if (!user.userState) {
    return <div className="container">Loading...</div>
  }

  return (
    <div 
      className='dark-bg'
      // onClick={() => setShowNewListing(false)}
      >
      <div className='centered'>
        <div className='modal'>
            <div className='form-content'>
              <div>
                <p style={{fontWeight: '600'}}>listing type:</p>
                {app.sections.map((section) => (
                  <div>
                    <input 
                      type='radio' 
                      id={section} 
                      name='section' 
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    />
                    <label htmlFor={section}></label>{section}<br/>
                  </div>
                ))}
              </div> 

              <div>
                <p style={{fontWeight: '600'}}>category:</p>
                {app.categoriesBySection.get(section).map((category: string) => (
                  <div style={{fontSize: '0.8rem'}}>
                    <input 
                      type='radio' 
                      id={category} 
                      name='category' 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                    <label htmlFor={category}></label>{category}<br/>
                  </div>
                ))}
              </div>

              <div className='form-flex'>
                <div className='form-container'>
                  <div className='form-flex'>
                    <label htmlFor='title'>title</label>
                    <input 
                      type='text' 
                      id='title' 
                      name='title'
                      onChange={(e) => setTitle(e.target.value)}
                      />
                  </div>
                  <div style={{display: 'flex'}}>
                    <div className='form-flex'>
                      <label htmlFor='amount'>amount</label>
                      <input 
                        type='text' 
                        id='amount' 
                        name='amount'
                        onChange={(e) => setAmount(e.target.value)} 
                        className='form-input-sm'
                      />
                    </div>
                    <div className='form-flex'>
                      <label htmlFor='amountType'>amount type</label>
                      <select id='amountType' name='amountType' onChange={(e) => setAmountType(e.target.value)}>
                        <option value='one time'>one time</option>
                        <option value='per day'>per day</option>
                        <option value='per week'>per week</option>
                        <option value='per month'>per month</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className='form-flex'>
                    <label htmlFor='description'>description</label>
                    <textarea 
                      id='description' 
                      name='description' 
                      onChange={(e) => setDescription(e.target.value)}
                      className='form-textarea'
                    />
                  </div>  
                </div>

                <div className='form-container'>
                  <div style={{display: 'flex', justifyContent: 'space-around'}}>

                  {scoreNames.map((name, i) => {
                        const score = String(user.provableData[i])
                        console.log(i, score)
                        return (
                            <div key={i} className=''>
                              { i === 3 ?
                                <div style={{fontWeight: '600'}}>{name} Score: {app.calcScore(score, true)}%</div>
                              :
                                <div style={{fontWeight: '600'}}>{name} Score: {app.calcScore(score, false)}%</div>
                              }
                              <div style={{display: 'flex', justifyContent: 'space-around'}}>
                                <div>
                                  <div
                                    className='choose reveal'
                                    onClick={()=> {
                                      setPScores(() => ({
                                        ...pScores,
                                        [i]: score,
                                      }))
                                      console.log('new', pScores[i])
                                      setProveData(() => ({
                                        ...proveData,
                                        [i]: score,
                                      }))
                                      console.log('new', proveData[i])
                                    }}
                                  >
                                    <img src={require('../../public/eye_open.svg')} alt="radio waves"/>
                                  </div>
                                </div>
                                <div>
                                  <div
                                    className='choose hide'
                                    onClick={()=> {
                                      setPScores(() => ({
                                        ...pScores,
                                        [i]: 'X',
                                      }))
                                    }}
                                  >
                                    <img src={require('../../public/eye_closed.svg')} alt="eye with slash"/>
                                  </div>
                                </div>
                              </div>
                            </div>
                        )
                      })
                    }
                  </div>
                  
                  <div>
                    <div style={{display: 'flex', padding: '1rem 0 0 0.5rem'}}>
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
                            Create listing with epoch key:
                        </p>
                    </div>
                    <p className='epoch-key'style={{maxWidth: '650px'}}>
                        {user.epochKey(reqInfo.nonce ?? 0)}
                    </p>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
                      console.log('data', proveData, 'scores', pScores)
                    }}
                  >
                    prove trust scores
                  </Button>
                  
                  {repProof.valid ? (
                    <Button
                      style={{backgroundColor: 'blue', color: 'white', marginLeft: '0.5rem'}}
                      onClick={async () => {                       
                          if (
                            user.userState &&
                            user.userState.sync.calcCurrentEpoch() !==
                              (await user.userState.latestTransitionedEpoch())
                          ) {
                              throw new Error('Needs transition')
                          }
                          await user.requestReputation(
                            {[0]:'10000000'},
                            reqInfo.nonce ?? 0
                          )
                          const epoch = user.userState?.sync.calcCurrentEpoch()
                          const posterId = user.epochKey(reqInfo.nonce)
                          await app.createNewListing(epoch, section, category, title, amount, amountType, description, posterId, pScore1, pScore2, pScore3, pScore4)
                          setShowNewListing(false)
                      }}
                    >
                      POST
                    </Button>
                  ) : (
                     <button className='blocked'>POST</button>
                  )}
                </div>
              </div>
            </div>  

          <button className='close-btn' onClick={() => setShowNewListing(false)}>X</button>
        
        </div>
      </div>
    </div>
  )
})