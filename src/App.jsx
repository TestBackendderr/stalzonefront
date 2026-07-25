import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/home/index'
import AuctionPage from './pages/auction/index'
import HideoutPage from './pages/hideout/index'
import CraftsPage from './pages/crafts/index'
import ProfitableCraftsPage from './pages/profitable-crafts/index'
import AuctionDealsPage from './pages/auction-deals/index'
import AuctionStatsPage from './pages/auction-stats/index'
import AuctionValueNowPage from './pages/auction-value-now/index'
import AuctionValueNowGearPage from './pages/auction-value-now-gear/index'
import AuctionItemPage from './pages/auction-item/index'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="auction" element={<AuctionPage />} />
          <Route path="auction-deals" element={<AuctionDealsPage />} />
          <Route path="auction-value-now" element={<AuctionValueNowPage />} />
          <Route path="auction-value-now-gear" element={<AuctionValueNowGearPage />} />
          <Route path="auction/item/:itemId" element={<AuctionItemPage />} />
          <Route path="auction-stats" element={<AuctionStatsPage />} />
          <Route path="hideout" element={<HideoutPage />} />
          <Route path="crafts" element={<CraftsPage />} />
          <Route path="profitable-crafts" element={<ProfitableCraftsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
