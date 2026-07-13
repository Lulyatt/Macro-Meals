import coverImage from '../assets/cover.png'
import "./HomePage.css"

function Home() {
  return (
    <main className="homePage">
      <section className="homeHero">
        <img src={coverImage} alt="Macro Meals cover" className="homeCover" />
        <div className="homeIntro">
          <span className="eyebrow">Your Goals, Your Meals, Your Way</span>
          <h1>Welcome to Macro Meals</h1>
          <p>The customisable app that helps you calculate macros and save meal plans.</p>
          <p className="homeCredit">Created by Luke Ulyatt and Joe Ulyatt</p>
        </div>
        <a href="/register" className="getStartedBtn">Get Started</a>
      </section>
    </main>
  )
}

export default Home