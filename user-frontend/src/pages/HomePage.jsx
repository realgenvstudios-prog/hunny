import Hero from '../components/Hero/Hero';
import Featured from '../components/Featured/Featured';
import PopularChoices from '../components/PopularChoices/PopularChoices';
import Refreshing from '../components/Refreshing/Refreshing';
import Testimonials from '../components/Testimonials/Testimonials';
import Footer from '../components/Footer/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Featured />
      <PopularChoices />
      <Refreshing />
      <Testimonials />
      <Footer />
    </>
  );
}
