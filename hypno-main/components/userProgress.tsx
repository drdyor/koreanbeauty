import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export const UserProgress = ({ points, hasActiveSubscription } : { points: number, hasActiveSubscription: boolean }) => {
    return (
      <div className="flex items-center justify-between gap-x-2 w-full">
        <Link href="/shop">
            <Button variant="ghost" className="text-yellow-500">
                <Image src="/points.svg" height={28} width={28} alt="points:" className="mr-2"/>
                {points}
            </Button>
        </Link>
      </div>
    );
  }
  