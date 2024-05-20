import Staking from '@/features/Staking'

function StakingPage() {
  return <Staking />
}

export default StakingPage

export async function getStaticProps() {
  return {
    props: { title: 'Staking' }
  }
}
