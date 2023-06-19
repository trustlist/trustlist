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

                  {Array(
                    user.userState.sync.settings.sumFieldCount
                  )
                    .fill(0)
                    .map((_, i) => {
                        const score = user.provableData[i]
                        return (
                            <div key={i} className=''>
                              <div className=''>{scoreNames[i]} Score: {app.calcScore(String(score), false)}%</div>
                              <div style={{display: 'flex', justifyContent: 'space-around'}}>
                                <div>
                                  <div
                                    style={{cursor: 'pointer'}}
                                    onClick={()=> {
                                      if (i === 0) {
                                        setPScore1(String(score))
                                      } else if (i === 1) {
                                        setPScore2(String(score))
                                      } else if (i === 2) {
                                        setPScore3(String(score))
                                      } else {
                                        setPScore4(String(score))
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
                                </div>
                                <div>
                                  <div
                                    style={{cursor: 'pointer'}}
                                    onClick={()=> {
                                      if (i === 0) {
                                        setPScore1('X')
                                      } else if (i === 1) {
                                        setPScore2('X')
                                      } else if (i === 2) {
                                        setPScore3('X')
                                      } else {
                                        setPScore4('X')
                                      }
                                    }}
                                  >
                                    <img src={require('../../public/not_visible.svg')} alt="eye with slash"/>
                                  </div>
                                  <div>hide</div>
                                </div>
                              </div>
                            </div>
                        )
                      })
                    }
                      {/* <div className=''>
                        <div className=''>LP Score: {app.calcScore(String(user.data[1]))}%</div>
                        <div style={{display: 'flex', justifyContent: 'space-around'}}>
                          <div>
                            <div
                              style={{cursor: 'pointer'}}
                              onClick={()=> {
                                setPScore2(String(user.data[1]))
                                console.log(String(user.data[1]))
                                setProveData(() => ({
                                  ...proveData,
                                  [1]: Number(user.data[1]),
                                }))
                                console.log(Number(user.data[1]))
                              }}
                            >
                              ❎
                            </div>
                            <div>reveal</div>
                          </div>
                          <div>
                            <div
                              style={{cursor: 'pointer'}}
                              onClick={()=> {
                                setPScore2('X')
                              }}
                            >
                              🚫
                            </div>
                            <div>hide</div>
                          </div>
                        </div>
                      </div>

                      <div className=''>
                        <div className=''>LP Score: {app.calcScore(String(user.data[2]))}%</div>
                        <div style={{display: 'flex', justifyContent: 'space-around'}}>
                          <div>
                            <div
                              style={{cursor: 'pointer'}}
                              onClick={()=> {
                                setPScore3(String(user.data[2]))
                                console.log(String(user.data[2]))
                                setProveData(() => ({
                                  ...proveData,
                                  [2]: Number(user.data[2]),
                                }))
                                console.log(Number(user.data[2]))
                              }}
                            >
                              ❎
                            </div>
                            <div>reveal</div>
                          </div>
                          <div>
                            <div
                              style={{cursor: 'pointer'}}
                              onClick={()=> {
                                setPScore3('X')
                              }}
                            >
                              🚫
                            </div>
                            <div>hide</div>
                          </div>
                        </div>
                      </div>

                      <div className=''>
                        <div className=''>LP Score: {app.calcScore(String(user.data[3]))}%</div>
                        <div style={{display: 'flex', justifyContent: 'space-around'}}>
                          <div>
                            <div
                              style={{cursor: 'pointer'}}
                              onClick={()=> {
                                setPScore4(String(user.data[3]))
                                console.log(String(user.data[3]))
                                setProveData(() => ({
                                  ...proveData,
                                  [3]: Number(user.data[3]),
                                }))
                                console.log(Number(user.data[3]))
                              }}
                            >
                              ❎
                            </div>
                            <div>reveal</div>
                          </div>
                          <div>
                            <div
                              style={{cursor: 'pointer'}}
                              onClick={()=> {
                                setPScore4('X')
                              }}
                            >
                              🚫
                            </div>
                            <div>hide</div>
                          </div>
                        </div>
                      </div> */}

                    
                        {/* {Array(
                            user.userState.sync.settings.sumFieldCount
                        )
                            .fill(0)
                            .map((_, i) => {
                                return (
                                    <div key={i}>
                                        {i === 0 ? <label htmlFor={`score${i +1}`}>reveal LP score</label> : null}
                                        {i === 1 ? <label htmlFor={`score${i +1}`}>reveal CB score</label> : null}
                                        {i === 2 ? <label htmlFor={`score${i +1}`}>reveal TD score</label> : null}
                                        {i === 3 ? <label htmlFor={`score${i +1}`}>reveal GV score</label> : null}
                                        <input
                                            style={{width: '6rem'}}
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
                                                if (i === 0) {setPScore1(event.target.value)}
                                                if (i === 1) {setPScore2(event.target.value)}
                                                if (i === 2) {setPScore3(event.target.value)}
                                                if (i === 3) {setPScore4(event.target.value)}
                                            }}
                                        />
                                    </div>
                                )
                            })}                    */}
                  </div>
                  <div>
                    <div style={{display: 'flex', paddingTop: '1rem'}}>
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
                        <p
                            style={{
                                fontSize: '14px',
                                maxWidth: '650px',
                                wordBreak: 'break-all',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
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