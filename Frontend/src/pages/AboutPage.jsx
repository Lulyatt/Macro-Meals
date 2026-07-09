import "./AboutPage.css";

function About() {
  return (
    <div className="page aboutPage">
      <section className="aboutHero">
        <div className="aboutHeroIntro">
          <p className="eyebrow">About Macro Meals</p>
          <h1>Smart meal planning built around your goals</h1>
          <p className="subtitle">
            Discover a cleaner, more thoughtful way to track nutrition, choose meals, and stay on target without the guesswork.
          </p>
        </div>
      </section>

      <div className="aboutContent">
        <section className="aboutSection">
          <div className="aboutSectionHeader">
            <h2>Why Macro Meals exists</h2>
            <p className="sectionIntro">
              Macro Meals was created to make achieving your nutrition goals simpler, more accessible, and more personalised.
              Whether you’re aiming to lose weight, build muscle, improve sporting performance, manage a medical condition, or simply develop healthier eating habits,
              the app helps you find meals that support your goals and dietary needs.
            </p>
          </div>

          <div className="aboutGrid">
            <article className="aboutCard">
              <h3>Find meals that fit your targets</h3>
              <p>
                The meal search feature allows you to discover meals based on the calories and macronutrients that matter to you.
                Instead of spending time manually calculating nutritional values, you can quickly find meals that align with your targets and make informed decisions.
              </p>
            </article>

            <article className="aboutCard">
              <h3>Create and save your own recipes</h3>
              <p>
                For users who prefer to cook at home or meal prep, Macro Meals also makes it easy to create and save your own meals.
                Add individual ingredients and portion sizes and the app automatically calculates the nutritional content of your recipes.
              </p>
            </article>

            <article className="aboutCard">
              <h3>Track nutrition with confidence</h3>
              <p>
                The app helps you track calories, protein, carbohydrates, fats, and other important dietary information with accuracy and ease.
              </p>
            </article>
          </div>
        </section>

        <section className="aboutSection highlightSection">
          <div className="aboutSectionHeader">
            <h2>Support for every nutritional journey</h2>
            <p className="sectionIntro">
              Nutrition needs vary greatly from person to person.
              Some users may be training for a marathon or working towards a body composition goal, while others may be managing diabetes, reducing cholesterol intake, increasing fibre consumption, or following specific dietary requirements and restrictions.
            </p>
          </div>

          <div className="featureList">
            <div className="featureItem">
              <strong>Broad support</strong>
              <span>Designed to help people with a wide range of goals, preferences, and health needs.</span>
            </div>
            <div className="featureItem">
              <strong>Community-driven inspiration</strong>
              <span>The meal database grows with user recipes and creations, making it easier to discover practical options for your lifestyle.</span>
            </div>
            <div className="featureItem">
              <strong>One place for meal planning</strong>
              <span>Combine intelligent meal search, custom meal creation, nutritional tracking, and community sharing in one seamless experience.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;