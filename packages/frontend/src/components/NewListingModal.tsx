import React from 'react'
import { observer } from 'mobx-react-lite'
import Button from './Button'
import Tooltip from './Tooltip'
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
  const [section, setSection] = React.useState('for sale')
  const [category, setCategory] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [amountType, setAmountType] = React.useState('one time')
  const [description, setDescription] = React.useState('')
  const [pScore1, setPScore1] = React.useState('')
  const [pScore2, setPScore2] = React.useState('')
  const [pScore3, setPScore3] = React.useState('')
  const [pScore4, setPScore4] = React.useState('x')
  const [posterId, setPosterId] = React.useState('')

  const fieldType = (i: number) => {
    if (i < user.sumFieldCount) {
        return 'sum'
    } else if (i % 2 === user.sumFieldCount % 2) {
        return 'replace'
    } else return 'timestamp'
  }

  if (!user.userState) {
    return <div className="container">Loading...</div>
  }

  return (
    <div 
      className='dark-bg'
      // onClick={() => setshowNewListing(false)}
      >
      <div className='centered'>
        <div className='modal'>
          {/* <form > */}
            <div className='form-content'>
              <div>
                <p style={{fontWeight: '600'}}>listing type:</p>
                {app.sections.map((section) => (
                  <div>
                    <input 
                      type='radio' 
                      id='section' 
                      name='section' 
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    />
                    <label htmlFor='section'></label>{section}<br/>
                  </div>
                ))}
              </div> 

              <div>
                <p style={{fontWeight: '600'}}>category:</p>
                {app.categoriesBySection.get(section).map((category: string) => (
                  <div style={{fontSize: '0.8rem'}}>
                    <input 
                      type='radio' 
                      id='category' 
                      name='category' 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                    <label htmlFor='category'></label>{category}<br/>
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
                      <label htmlFor='amount'>reserve amount</label>
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
                  <div style={{display: 'flex'}}>
                    {/* <div className='form-flex'> */}
                        {Array(
                            user.userState.sync.settings.sumFieldCount
                        )
                            .fill(0)
                            .map((_, i) => {
                                return (
                                    <div key={i}>
                                        <label htmlFor={`score${i +1}`}>reveal Score {i + 1}</label>
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
                            })}                   
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
                                setPosterId(user.epochKey(reqInfo.nonce ?? 0))
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

                <div style={{display: 'flex', justifyContent: 'center'}}>
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
                      type='submit'
                      value='POST'
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
                          app.createNewListing(epoch, section, category, title, amount, amountType, description, posterId, pScore1, pScore2, pScore3, pScore4)
                      }}
                    />
                  ) : (
                     <button className='blocked'>POST</button>
                  )}
                </div>
              </div>
            </div>

            
          {/* </form> */}
          <button className='close-btn' onClick={() => setShowNewListing(false)}>X</button>
        </div>
      </div>
    </div>
  )
})