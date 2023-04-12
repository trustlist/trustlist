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

type ProofInfo = {
  publicSignals: string[]
  proof: string[]
  valid: boolean
}

export default observer(({ setShowNewListing }: Props) => {
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
  const [section, setSection] = React.useState('for sale')
  const [category, setCategory] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [amountType, setAmountType] = React.useState('one time')
  const [description, setDescription] = React.useState('')
  const [score1, setScore1] = React.useState('')
  const [score2, setScore2] = React.useState('')
  const [score3, setScore3] = React.useState('')
  const [score4, setScore4] = React.useState('')
  const posterId = '09876'

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
                                                if (i === 0) {setScore1(event.target.value)}
                                                if (i === 1) {setScore2(event.target.value)}
                                                if (i === 2) {setScore3(event.target.value)}
                                                if (i === 3) {setScore4(event.target.value)}
                                            }}
                                        />
                                    </div>
                                )
                            })}

                        {/* <label htmlFor='score1'>reveal score1</label>
                        <input 
                          type='text' 
                          id='score1' 
                          name='score1' 
                          onChange={(e) => setScore1(e.target.value)}
                          className='form-input-sm'
                        />
                        <label htmlFor='score2'>reveal score2</label>
                        <input 
                          type='text' 
                          id='score2' 
                          name='score2' 
                          onChange={(e) => setScore2(e.target.value)}
                          className='form-input-sm'
                        />
                    </div> */}
                    {/* <div className='form-flex'>
                        <label htmlFor='score3'>reveal score3</label>
                        <input 
                          type='text' 
                          id='score3' 
                          name='score3' 
                          onChange={(e) => setScore3(e.target.value)}
                          className='form-input-sm'
                        />
                        <label htmlFor='score4'>reveal score4</label>
                        <input 
                          type='text' 
                          id='score4' 
                          name='score4' 
                          onChange={(e) => setScore4(e.target.value)}
                          className='form-input-sm'
                        />
                    </div> */}
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
                      onClick={() => app.createNewListing(section, category, title, amount, amountType, description, posterId, score1, score2, score3, score4)}
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