import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer a Friend — Share MurmReps",
  description: "Get your unique referral link and track how many people you bring to MurmReps. Earn badges and climb the leaderboard.",
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return children;
}
