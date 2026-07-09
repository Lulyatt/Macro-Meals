import coverImage from '../assets/cover.png'

function Home() {
  return (
    <main className="homePage">
      <section className="homeHero">
        <img src={coverImage} alt="Macro Meals cover" className="homeCover" />
        <div className="homeIntro">
          <span className="eyebrow">Eat smarter, track macros</span>
          <h1>Welcome to Macro Meals</h1>
          <p>The customizable app that helps you calculate macros and save meal plans.</p>
          <p className="homeCredit">Created by Luke Ulyatt and Joe Ulyatt</p>
        </div>
      </section>
    </main>
  )
}

export default Home