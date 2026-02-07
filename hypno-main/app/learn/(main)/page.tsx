import { FeedWrapper } from "@/components/feedWrapper";
import { StickyWrapper } from "@/components/stickyWrapper";
import Header from "./header";
import { UserProgress } from "@/components/userProgress";

const LearnPage = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress points={100} hasActiveSubscription={false}/>
      </StickyWrapper>
      <FeedWrapper>
        <Header title="Course" />
        <h1 className="w-full text-center h-full pt-32">Coming soon...</h1>
      </FeedWrapper>
    </div>
  );
}

export default LearnPage;
