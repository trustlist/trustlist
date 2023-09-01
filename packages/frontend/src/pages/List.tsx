import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import Listings from '../components/Listings'
import './deal.css'

export default observer(() => {
    const { section, category }: any = useParams()
    return (
        <div>
            <div className="list-heading">{category}</div>
            <Listings section={section} category={category} />
        </div>
    )
})
