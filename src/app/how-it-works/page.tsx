export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">How It Works</h1>

      {/* Betting */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">How Betting Works</h2>
        <p className="text-gray-400 leading-relaxed">
          Each market poses a question with two possible outcomes. You pick the
          side you believe in and wager your bunnies. Your bet goes into a shared
          pool with everyone else&apos;s bets. You can bet any amount as long as you
          have enough bunnies in your balance.
        </p>
      </section>

      {/* Odds */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">How Odds Work</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          The percentage shown on each option reflects how much of the total pool
          is betting on that side. It shifts in real time as more bets come in.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300">
          <p>Percentage = (bunnies on this side / total pool) &times; 100</p>
        </div>
        <p className="text-gray-400 leading-relaxed mt-4">
          For example, if 600 bunnies are on <span className="text-blue-400">Yes</span> and
          400 on <span className="text-pink-400">No</span>, the odds
          show <span className="text-blue-400">60%</span> / <span className="text-pink-400">40%</span>.
          A lower percentage means a higher potential payout if that side wins.
        </p>
      </section>

      {/* Payouts */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">How Payouts Work</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          When a market is resolved, the <strong className="text-white">entire pool</strong> is
          split among the winners proportionally based on how much they bet.
          There is no house fee &mdash; 100% of bunnies go back to winners.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 mb-4">
          <p>Your payout = (your bet / winning side total) &times; total pool</p>
        </div>

        <h3 className="text-sm font-semibold text-gray-300 mb-2">Example</h3>
        <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 space-y-1">
          <p>Total pool: <span className="text-white">1,000</span> bunnies</p>
          <p>
            <span className="text-blue-400">Yes</span> side: 600 bunnies &nbsp;|&nbsp;{" "}
            <span className="text-pink-400">No</span> side: 400 bunnies
          </p>
          <p>You bet <span className="text-white">200</span> bunnies on <span className="text-blue-400">Yes</span></p>
          <hr className="border-gray-700 my-2" />
          <p>
            <span className="text-blue-400">Yes</span> wins &rarr; your payout
            = (200 / 600) &times; 1,000 = <span className="text-green-400 font-semibold">333 bunnies</span>
          </p>
          <p className="text-gray-500">
            You wagered 200 and got back 333 &mdash; a profit of 133 bunnies.
          </p>
        </div>
      </section>

      {/* Key Rules */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3">Key Rules</h2>
        <ul className="text-gray-400 space-y-3">
          <li className="flex gap-3">
            <span className="text-blue-400 mt-0.5">&#x2022;</span>
            <span>The <strong className="text-white">market creator</strong> decides the winning outcome when the event concludes.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 mt-0.5">&#x2022;</span>
            <span>Bets are <strong className="text-white">locked after the end date</strong> &mdash; no new bets can be placed once a market expires.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 mt-0.5">&#x2022;</span>
            <span>Losing bets are <strong className="text-white">fully forfeited</strong> &mdash; the bunnies go to the winners.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 mt-0.5">&#x2022;</span>
            <span>There is <strong className="text-white">no house fee</strong> &mdash; 100% of the pool is paid out to winners.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 mt-0.5">&#x2022;</span>
            <span>You set your own bunny balance in your <strong className="text-white">profile</strong> to match your real-world bunnies.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
