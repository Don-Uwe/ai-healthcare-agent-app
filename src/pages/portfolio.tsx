import dynamic from 'next/dynamic'
const Portfolio = dynamic(() => import('@/features/Portfolio'))

function PortfolioPage() {
  return <Portfolio />
}

export default PortfolioPage
