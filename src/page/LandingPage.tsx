import { FAQSection } from "../components/FAQSection";
import { HeroSection } from "../components/HeroSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { ScrollSection } from "../components/ScrollSection";
import { TokenCardsSection } from "../components/TokenCardsSection";

export const LandingPage = () => {
  return (
    <div className="bg-draconis-dark flex-1 w-full overflow-y-auto snap-y snap-mandatory">
      <ScrollSection className="flex-col">
        <HeroSection />
        <TokenCardsSection />
      </ScrollSection>
      <ScrollSection className="py-20">
        <HowItWorksSection />
      </ScrollSection>

      <ScrollSection className="flex-col">
        <div className="flex-1 flex items-center justify-center">
          <FAQSection />
        </div>
      </ScrollSection>
    </div>
  );
};
