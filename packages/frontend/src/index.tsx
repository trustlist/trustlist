import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './pages/Header'
import MemberDashboardPage from './pages/MemberDashboard'
import Home from './pages/Home'
import List from './pages/List'
import Deal from './pages/Deal'
// import Dashboard from './pages/Dashboard'
import './index.css'
import NewListingPage from './pages/NewListing'
import NewOfferPage from './pages/NewOffer'
import ListingDetails from './pages/listings/id'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                < Route path="/" element={<Header />}>
                    <Route index element={<Home />} />
                    <Route path="dashboard" element={<MemberDashboardPage />} />
                    <Route path="listings/new" element={<NewListingPage />} />
                     <Route path="listings/:id" element={<ListingDetails/>} />
                    <Route path="listings/:id/offers/new" element={<NewOfferPage />} />
                    <Route path="list/:section/:category" element={<List />} />
                    <Route path="deal/:id" element={<Deal />} />
                    {/* <Route path="dashboard" element={<Dashboard />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
