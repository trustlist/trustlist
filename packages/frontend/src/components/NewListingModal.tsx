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

export default observer(({ setShowNewListing }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [section, setSection] = React.useState('for sale')
  const [category, setCategory] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [amount, setamount] = React.useState('')
  const [amountType, setamountType] = React.useState('one time')
  const [description, setDescription] = React.useState('')
  const [score1, setScore1] = React.useState('')
  const [score2, setScore2] = React.useState('')
  const [score3, setScore3] = React.useState('')
  const [score4, setScore4] = React.useState('')
  const [repProofInputs, setRepProofInputs] = React.useState({})
  const [repProof, setRepProof] = React.useState(null)
  const posterId = '09876'

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
                        onChange={(e) => setamount(e.target.value)} 
                        className='form-input-sm'
                      />
                    </div>
                    <div className='form-flex'>
                      <label htmlFor='amountType'>amount type</label>
                      <select id='amountType' name='amountType' onChange={(e) => setamountType(e.target.value)}>
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
                    <div className='form-flex'>
                        <label htmlFor='score1'>reveal score1</label>
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
                    </div>
                    <div className='form-flex'>
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
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'center'}}>
                  <Button>prove trust scores</Button>
                  <input 
                    type='submit'
                    value='post'
                    onClick={() => app.createNewListing(section, category, title, amount, amountType, description, posterId, score1, score2, score3, score4)}
                  />
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